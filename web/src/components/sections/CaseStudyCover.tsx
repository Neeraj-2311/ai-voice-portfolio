/**
 * Programmatic SVG cover art per case study. Each motif hints at the
 * project's domain without resorting to literal product screenshots.
 * Restrained, accent-driven, single line weight so the section keeps
 * a coherent visual language.
 *
 *   enterprise-voice-ai      layered horizontal waveform + node dots
 *   goreach                  document line stack + cursor caret
 *   sheets-voice-automation  small grid + flow arrow + handset glyph
 *   talk-to-my-portfolio     microphone + radiating sound waves + listening agent node
 *
 * The covers are pure SVG, no JS animation. The CaseStudies wrapper
 * scales them subtly on hover for a "card responds" feel.
 */

interface CoverProps {
  slug: string;
}

export function CaseStudyCover({ slug }: CoverProps) {
  switch (slug) {
    case 'enterprise-voice-ai':
      return <VoiceAICover />;
    case 'goreach':
      return <GoReachCover />;
    case 'sheets-voice-automation':
      return <SheetsCover />;
    case 'talk-to-my-portfolio':
      return <TalkToPortfolioCover />;
    default:
      return <GenericCover />;
  }
}

function ViewportWrap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function VoiceAICover() {
  // Three concentric horizontal waveforms, brightest at the center axis.
  // Each "bar" is a vertical line of varying height; tighter density in
  // the center, sparser at the edges.
  const bars: { x: number; h: number; alpha: number }[] = [];
  for (let i = 0; i < 60; i++) {
    const u = i / 59;
    const x = 16 + u * (320 - 32);
    const center = 0.5;
    const dist = Math.abs(u - center);
    const env = Math.max(0, 1 - dist * 1.5); // envelope: peak in middle
    const v = 0.4 + 0.6 * Math.abs(Math.sin(i * 0.45 + 1.1) + 0.4 * Math.cos(i * 0.21));
    const h = 8 + env * 64 * v;
    const alpha = 0.25 + env * 0.55;
    bars.push({ x, h, alpha });
  }
  return (
    <ViewportWrap>
      {/* faint horizontal axis */}
      <line
        x1="16"
        y1="90"
        x2="304"
        y2="90"
        stroke="var(--accent)"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      {bars.map((b, i) => (
        <line
          key={i}
          x1={b.x}
          y1={90 - b.h / 2}
          x2={b.x}
          y2={90 + b.h / 2}
          stroke="var(--accent)"
          strokeOpacity={b.alpha}
          strokeWidth="2"
          strokeLinecap="round"
          className="cover-anim origin-center"
          style={{
            transformBox: 'fill-box',
            animation: 'cover-bar-pulse 1.4s ease-in-out infinite',
            animationDelay: `${(i * 0.05) % 0.9}s`,
          }}
        />
      ))}
      {/* node dots evoking endpoints / participants */}
      {[40, 160, 280].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={90}
          r="3.2"
          fill="var(--accent)"
          fillOpacity="0.9"
        />
      ))}
    </ViewportWrap>
  );
}

function GoReachCover() {
  // A stack of document lines of varying widths, with a blinking-style
  // accent cursor at the end of the last line. Suggests generative
  // writing without resorting to a screenshot.
  const lines = [
    { y: 38, w: 220 },
    { y: 60, w: 248 },
    { y: 82, w: 196 },
    { y: 104, w: 232 },
    { y: 126, w: 168 },
  ];
  const cursor = { x: 168 + 16, y: 126 };
  return (
    <ViewportWrap>
      {lines.map((l, i) => (
        <rect
          key={i}
          x="40"
          y={l.y - 4}
          width={l.w}
          height="8"
          rx="4"
          fill="var(--text-secondary)"
          fillOpacity={i === lines.length - 1 ? 0.4 : 0.18}
        />
      ))}
      {/* cursor caret */}
      <rect
        x={cursor.x}
        y={cursor.y - 10}
        width="3"
        height="20"
        rx="1.5"
        fill="var(--accent)"
        className="cover-anim"
        style={{
          animation: 'cover-cursor-blink 0.95s steps(2, end) infinite',
        }}
      />
      {/* subtle accent underline at the top hinting "agent stream" */}
      <line
        x1="40"
        y1="20"
        x2="120"
        y2="20"
        stroke="var(--accent)"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </ViewportWrap>
  );
}

function SheetsCover() {
  // A 5-column x 4-row grid, a few cells highlighted, an arrow leading to
  // a handset glyph on the right. Communicates "spreadsheet drives voice".
  const cols = 5;
  const rows = 4;
  const cellW = 22;
  const cellH = 22;
  const gridX = 38;
  const gridY = 44;
  const cells: { x: number; y: number; r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: gridX + c * cellW, y: gridY + r * cellH, r, c });
    }
  }
  // Initial static highlights so the cover does not read as a flat grid
  // when the card is not hovered. The animation overrides these on hover,
  // sweeping the accent fill from cell to cell across the grid.
  const seedHighlighted = new Set(['1,0', '2,1', '3,0', '0,2', '4,3']);
  return (
    <ViewportWrap>
      {cells.map((cell, i) => {
        const hot = seedHighlighted.has(`${cell.c},${cell.r}`);
        return (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={cellW - 4}
            height={cellH - 4}
            rx="2"
            fill={hot ? 'var(--accent)' : 'var(--text-secondary)'}
            fillOpacity={hot ? 0.75 : 0.2}
            className="cover-anim"
            style={{
              animation: 'cover-cell-flow 2s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        );
      })}
      {/* arrow (pulses on hover) */}
      <g
        className="cover-anim"
        style={{ animation: 'cover-arrow-pulse 1.2s ease-in-out infinite' }}
      >
        <line
          x1={gridX + cols * cellW - 4}
          y1="90"
          x2="252"
          y2="90"
          stroke="var(--accent)"
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polyline
          points="246,82 256,90 246,98"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* handset glyph (rings on hover) */}
      <g transform="translate(262 70)">
        <g
          className="cover-anim origin-center"
          style={{
            transformBox: 'fill-box',
            animation: 'cover-handset-shake 1.4s ease-in-out infinite',
          }}
        >
          <g
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M2 6 L2 16 a4 4 0 0 0 4 4 L8 20 a2 2 0 0 0 2 -2 L10 14 a2 2 0 0 0 -1.4 -1.9 L6.5 11 a12 12 0 0 1 0 -2 L8.6 8 a2 2 0 0 0 1.4 -1.9 L10 2 a2 2 0 0 0 -2 -2 L6 0 a4 4 0 0 0 -4 4 L2 6 z" />
          </g>
        </g>
      </g>
    </ViewportWrap>
  );
}

function TalkToPortfolioCover() {
  // Microphone on the left (you talk), radiating sound waves through the
  // middle (voice travels), agent node on the right holding a mini
  // waveform (portfolio hears and responds). Reads as "talk to the
  // portfolio and it listens" rather than a generic interface diagram.
  const waveOriginX = 92;
  const waveCy = 90;
  const agentCx = 250;
  const agentCy = 90;
  const innerBars = [
    { dx: -14, h: 10 },
    { dx: -7, h: 18 },
    { dx: 0, h: 24 },
    { dx: 7, h: 16 },
    { dx: 14, h: 10 },
  ];

  return (
    <ViewportWrap>
      {/* microphone */}
      <g
        transform="translate(54 90)"
        stroke="var(--accent)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="-9" y="-26" width="18" height="32" rx="9" />
        <path d="M -16 -4 A 16 16 0 0 0 16 -4" />
        <line x1="0" y1="12" x2="0" y2="24" />
        <line x1="-8" y1="24" x2="8" y2="24" />
      </g>

      {/* radiating sound waves opening to the right */}
      {[24, 40, 56, 72].map((r, i) => (
        <path
          key={i}
          d={`M ${waveOriginX} ${waveCy - r} A ${r} ${r} 0 0 1 ${waveOriginX} ${waveCy + r}`}
          stroke="var(--accent)"
          strokeOpacity={0.55 - i * 0.1}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="cover-anim"
          style={{
            animation: 'cover-wave-emit 1.8s ease-in-out infinite',
            animationDelay: `${i * 0.22}s`,
          }}
        />
      ))}

      {/* listening agent node on the right with internal mini waveform */}
      <g transform={`translate(${agentCx} ${agentCy})`}>
        <circle
          r="36"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />
        <circle
          r="28"
          fill="var(--accent)"
          fillOpacity="0.08"
        />
        {innerBars.map((b, i) => (
          <line
            key={i}
            x1={b.dx}
            y1={-b.h / 2}
            x2={b.dx}
            y2={b.h / 2}
            stroke="var(--accent)"
            strokeOpacity="0.9"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="cover-anim origin-center"
            style={{
              transformBox: 'fill-box',
              animation: 'cover-bar-pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.11}s`,
            }}
          />
        ))}
      </g>
    </ViewportWrap>
  );
}

function GenericCover() {
  return (
    <ViewportWrap>
      <rect
        x="20"
        y="60"
        width="280"
        height="60"
        rx="4"
        fill="var(--accent)"
        fillOpacity="0.12"
      />
    </ViewportWrap>
  );
}
