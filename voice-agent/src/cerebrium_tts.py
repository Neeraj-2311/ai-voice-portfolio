"""Custom LiveKit Agents TTS plugin that streams from this Cerebrium service.

Drop this file into your agent project and wire it into the AgentSession:

    from livekit_plugin import CerebriumTTS

    session = AgentSession(
        tts=CerebriumTTS(
            ws_url="wss://api.cortex.cerebrium.ai/v4/<project>/livekit-cerebrium-tts/v1/tts/stream",
            token=os.environ["CEREBRIUM_JWT"],
            speaker_reference_url="https://example.com/neeraj_10s.wav",
        ),
        ...
    )

It targets livekit-agents 1.5.x: per synthesized sentence LiveKit calls
``synthesize()``; we open a WebSocket, send the text (+ the reference clip URL),
and push the streamed PCM into LiveKit's AudioEmitter as it arrives.
"""

from __future__ import annotations

import json

import websockets
from livekit.agents import tts, utils
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions

SAMPLE_RATE = 24_000

# extra_headers (<=13) -> additional_headers (>=14).
_HEADER_KW = (
    "additional_headers"
    if tuple(int(p) for p in websockets.__version__.split(".")[:2]) >= (14, 0)
    else "extra_headers"
)


class CerebriumTTS(tts.TTS):
    def __init__(
        self,
        *,
        ws_url: str,
        token: str | None = None,
        speaker_reference_url: str | None = None,
        sample_rate: int = SAMPLE_RATE,
    ) -> None:
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False, aligned_transcript=False),
            sample_rate=sample_rate,
            num_channels=1,
        )
        self._ws_url = ws_url
        self._token = token
        self._speaker_reference_url = speaker_reference_url

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> _ChunkedStream:
        return _ChunkedStream(tts=self, input_text=text, conn_options=conn_options)


class _ChunkedStream(tts.ChunkedStream):
    def __init__(
        self, *, tts: CerebriumTTS, input_text: str, conn_options: APIConnectOptions
    ):
        super().__init__(tts=tts, input_text=input_text, conn_options=conn_options)
        self._tts: CerebriumTTS = tts
        self._text = input_text

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        output_emitter.initialize(
            request_id=utils.shortuuid(),
            sample_rate=self._tts.sample_rate,
            num_channels=1,
            mime_type="audio/pcm",  # raw PCM s16le; LiveKit frames it
        )

        kwargs: dict = {"max_size": None}
        if self._tts._token:
            kwargs[_HEADER_KW] = [("Authorization", f"Bearer {self._tts._token}")]

        async with websockets.connect(self._tts._ws_url, **kwargs) as ws:
            frame: dict = {"text_chunk": self._text}
            if self._tts._speaker_reference_url:
                frame["speaker_reference_url"] = self._tts._speaker_reference_url
            await ws.send(json.dumps(frame))
            await ws.send(json.dumps({"eos": True}))

            try:
                async for message in ws:
                    if isinstance(message, (bytes, bytearray)):
                        output_emitter.push(bytes(message))
                    else:
                        event = json.loads(message)
                        if event.get("type") == "error":
                            raise RuntimeError(
                                event.get("message", "tts service error")
                            )
                        if event.get("type") == "done":  # end of stream
                            break
                        # {"type": "flushed"} marks the end of the utterance.
            except websockets.ConnectionClosed:
                pass  # server closed after sending everything

        output_emitter.flush()
