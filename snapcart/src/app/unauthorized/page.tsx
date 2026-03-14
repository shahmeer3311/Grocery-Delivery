"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Unauthorized: React.FC = () => {
  const router = useRouter()

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 720, width: '100%', textAlign: 'center', borderRadius: 12, padding: '3rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', background: 'white' }}>
        <div style={{ fontSize: 64, lineHeight: 1 }}>{'🔒'}</div>
        <h1 style={{ fontSize: 28, margin: '0.5rem 0 0' }}>Access Denied</h1>
        <p style={{ color: '#555', marginTop: 12 }}>You don't have permission to view this page. If you think this is a mistake, contact your administrator.</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent',
              border: '1px solid #ddd',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: '#111827',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 8,
              textDecoration: 'none'
            }}
          >
            Go Home
          </Link>
        </div>

        <p style={{ color: '#888', marginTop: 18, fontSize: 13 }}>Need help? <a href="mailto:admin@example.com" style={{ color: '#111827', textDecoration: 'underline' }}>Contact support</a></p>
      </div>
    </div>
  )
}

export default Unauthorized
