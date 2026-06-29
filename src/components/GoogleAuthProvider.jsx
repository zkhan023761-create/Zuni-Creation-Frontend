'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

/**
 * Thin client wrapper so GoogleOAuthProvider can live in the
 * Server-Component layout without causing "use client" conflicts.
 * Mounting it once at the root prevents the
 * "google.accounts.id.initialize() called multiple times" warning.
 */
export default function GoogleAuthProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      {children}
    </GoogleOAuthProvider>
  );
}
