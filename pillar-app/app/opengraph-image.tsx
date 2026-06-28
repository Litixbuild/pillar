import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoPath = path.join(process.cwd(), 'public/images/pillarlogoblack.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoWidth = 560;
  const logoHeight = Math.round((logoWidth * 496) / 683);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F3EE',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${logoBase64}`}
          width={logoWidth}
          height={logoHeight}
        />
      </div>
    ),
    { ...size }
  );
}
