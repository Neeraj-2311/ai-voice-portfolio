"""In-process Kokoro-82M TTS plugin (open-weight, Apache-2.0, CPU, ~free).

Kokoro is a tiny 82M-param TTS that runs faster-than-realtime on CPU, so the
agent carries its own voice with no GPU, no API key, and no separate service to
host. Voices are preset (not a clone). Model weights (~330 MB) download from
Hugging Face on first use and are cached locally after that.

The KPipeline is a PROCESS-LEVEL singleton (per language): loaded once and shared
across every session, so only the first call in a worker pays the load cost.
Call ``preload()`` from the worker prewarm so even that first call is warm.

It plugs into livekit-agents like any other TTS: per sentence LiveKit calls
``synthesize()``; we run Kokoro in a worker thread (it's a blocking torch model)
and push the resulting PCM into the AudioEmitter.

Voices (lang_code 'a' = American English): am_michael, am_adam, am_onyx,
am_fenrir (male); af_heart, af_bella, af_nicole (female). 'b' = British English.
"""

from __future__ import annotations

import asyncio
import logging
import threading
import warnings

import numpy as np
from livekit.agents import tts, utils
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions

logger = logging.getLogger("kokoro-tts")

# Cosmetic: silence the harmless torch notices Kokoro emits while building its
# model (LSTM dropout note + weight_norm deprecation). Not errors.
warnings.filterwarnings("ignore", message=r".*dropout option adds dropout.*")
warnings.filterwarnings("ignore", message=r".*weight_norm.*is deprecated.*")

SAMPLE_RATE = 24_000  # Kokoro outputs 24 kHz mono
_REPO_ID = "hexgrad/Kokoro-82M"

# Process-level: one KPipeline per language, shared by all sessions. KPipeline is
# not thread-safe, so all generation is serialized through one lock.
_PIPELINES: dict[str, object] = {}
_PIPELINES_LOCK = threading.Lock()
_GEN_LOCK = threading.Lock()


def _get_pipeline(lang_code: str):
    pipe = _PIPELINES.get(lang_code)
    if pipe is None:
        with _PIPELINES_LOCK:
            pipe = _PIPELINES.get(lang_code)
            if pipe is None:
                from kokoro import KPipeline  # heavy import; defer to first use

                logger.info("kokoro.loading lang=%s", lang_code)
                pipe = KPipeline(lang_code=lang_code, repo_id=_REPO_ID)
                _PIPELINES[lang_code] = pipe
                logger.info("kokoro.loaded lang=%s", lang_code)
    return pipe


def preload(voice: str = "am_michael", lang_code: str = "a") -> None:
    """Blocking: load the model and run one tiny synthesis to JIT the graph.
    Call from the worker prewarm so the first real turn is already warm."""
    pipe = _get_pipeline(lang_code)
    with _GEN_LOCK:
        for _ in pipe("Ready.", voice=voice):
            pass


class KokoroTTS(tts.TTS):
    def __init__(
        self,
        *,
        voice: str = "am_michael",
        lang_code: str = "a",
        speed: float = 1.0,
        sample_rate: int = SAMPLE_RATE,
    ) -> None:
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False, aligned_transcript=False),
            sample_rate=sample_rate,
            num_channels=1,
        )
        self._voice = voice
        self._lang_code = lang_code
        self._speed = speed

    async def warmup(self) -> None:
        await asyncio.to_thread(preload, self._voice, self._lang_code)

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> _KokoroStream:
        return _KokoroStream(tts=self, input_text=text, conn_options=conn_options)


class _KokoroStream(tts.ChunkedStream):
    def __init__(
        self, *, tts: KokoroTTS, input_text: str, conn_options: APIConnectOptions
    ):
        super().__init__(tts=tts, input_text=input_text, conn_options=conn_options)
        self._tts: KokoroTTS = tts
        self._text = input_text

    def _generate_pcm(self) -> list[bytes]:
        pipe = _get_pipeline(self._tts._lang_code)
        out: list[bytes] = []
        with _GEN_LOCK:
            for _, _, audio in pipe(
                self._text, voice=self._tts._voice, speed=self._tts._speed
            ):
                arr = (
                    audio.detach().cpu().numpy()
                    if hasattr(audio, "detach")
                    else np.asarray(audio)
                )
                arr = np.clip(arr.astype(np.float32), -1.0, 1.0)
                out.append((arr * 32767.0).astype("<i2").tobytes())
        return out

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        output_emitter.initialize(
            request_id=utils.shortuuid(),
            sample_rate=self._tts.sample_rate,
            num_channels=1,
            mime_type="audio/pcm",  # raw PCM s16le; LiveKit frames it
        )
        # Blocking torch inference -> off the event loop.
        chunks = await asyncio.to_thread(self._generate_pcm)
        for pcm in chunks:
            output_emitter.push(pcm)
        output_emitter.flush()
