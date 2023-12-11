'use client'
import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

export default function layout({ children }) {
	return <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}>
        {children}
    </GoogleOAuthProvider>
}
