// src/components/callback.tsx
import { useEffect, useState } from 'react';
import { getAccessToken, getUserProfile } from '../utils/spotify-auth';

export function Callback() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get access token
        const tokenResponse = await getAccessToken(code);
        if (!tokenResponse.access_token) {
          throw new Error('No access token received');
        }

        // Store tokens
        localStorage.setItem('access_token', tokenResponse.access_token);
        if (tokenResponse.refresh_token) {
          localStorage.setItem('refresh_token', tokenResponse.refresh_token);
        }
        
        // Get user profile
        const userProfile = await getUserProfile(tokenResponse.access_token);
        if (userProfile) {
          localStorage.setItem('user_profile', JSON.stringify(userProfile));
        }

        setStatus('success');
        
        // Redirect back to home page
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);

      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, []);

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {status === 'loading' ? 'Authenticating...' : 'Login Successful!'}
        </h2>
        <p className="text-muted-foreground">
          {status === 'loading' 
            ? 'Please wait while we complete the authentication process...'
            : 'Redirecting you back to the application...'}
        </p>
      </div>
    </div>
  );
}