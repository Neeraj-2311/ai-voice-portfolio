import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const runtime = 'edge';
export const alt = `${site.name} portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'linear-gradient(135deg, #0a0a0a 0%, #141414 60%, rgba(99, 102, 241, 0.18) 100%)',
          color: '#f5f5f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#10b981',
            }}
          />
          <span
            style={{
              fontSize: 28,
              color: '#b5b5b5',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            Building production voice agents · {site.location}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 100,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 500,
              color: '#b5b5b5',
              marginTop: 24,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Voice AI &amp; full-stack engineer.
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 500,
              color: '#b5b5b5',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Agentic systems for enterprise.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: '#a3a3a3',
            fontSize: 24,
          }}
        >
          <span>{site.url.replace(/^https?:\/\//, '')}</span>
          <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 20,
                background: 'rgba(10, 10, 12, 0.55)',
                color: '#c7d2fe',
                border: '1px solid rgba(129, 140, 248, 0.55)',
                padding: '8px 16px',
                borderRadius: 999,
                fontWeight: 500,
              }}
            >
              Hire · Mentorship · Speaking
            </span>
          </span>
        </div>
      </div>
    ),
    size,
  );
}
