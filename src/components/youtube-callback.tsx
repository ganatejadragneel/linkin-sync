// YouTube OAuth callback handler

import React, { useEffect, useState } from 'react';
import { Loader2, Youtube, AlertCircle } from 'lucide-react';
import { youtubeAuth } from '../utils/youtube-auth';
import { Button } from './ui/button';

export function YouTubeCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          throw new Error(`Authentication failed: ${errorParam}`);
        }

        if (!code) {
          throw new Error('Authorization code not found');
        }

        // Exchange code for tokens
        await youtubeAuth.handleCallback(code);
        
        setStatus('success');
        
        // Redirect to main app after short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (err: any) {
        console.error('YouTube callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Youtube className="h-12 w-12 text-red-500 mr-3" />
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">
            Connecting to YouTube Music
          </h2>
          <p className="text-muted-foreground">
            Please wait while we complete the authentication...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Youtube className="h-12 w-12 text-red-500 mr-3" />
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white"></div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">
            Successfully Connected!
          </h2>
          <p className="text-muted-foreground mb-4">
            You're now connected to YouTube Music. Redirecting...
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Continue to App
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Youtube className="h-12 w-12 text-red-500 mr-3" />
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">
            Authentication Failed
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || 'Unable to connect to YouTube Music'}
          </p>
          <div className="space-x-2">
            <Button onClick={() => youtubeAuth.initiateAuth()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Continue Without YouTube Music
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}