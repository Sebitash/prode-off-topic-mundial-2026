import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="#FAFAF5" stroke="#1F2937" strokeWidth="1" />
          <path
            d="M16 1 C 22 6, 24 12, 23 19 C 17 22, 9 22, 4 18 C 4 11, 8 4, 16 1 Z"
            fill="#E2233B"
          />
          <path
            d="M31 14 C 26 11, 19 12, 14 17 C 12 23, 14 29, 19 31 C 26 28, 31 22, 31 14 Z"
            fill="#0B5FA4"
          />
          <path
            d="M3 19 C 8 23, 15 24, 21 21 C 23 25, 22 29, 19 31 C 12 31, 5 27, 2 21 Z"
            fill="#0E9F6E"
          />
          <circle cx="16" cy="16" r="15" fill="none" stroke="#1F2937" strokeWidth="1" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
