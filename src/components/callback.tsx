import { useEffect, useState } from 'react';
import { getAccessToken, getUserProfile } from '../utils/spotify-auth';

export function Callback() {
  const [userInfo, setUserInfo] = useState<{ display_name?: string; email?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          const tokenResponse = await getAccessToken(code);
          localStorage.setItem('access_token', tokenResponse.access_token);
          
          const userProfile = await getUserProfile(tokenResponse.access_token);
          setUserInfo(userProfile);
        }
      } catch (err) {
        setError('Failed to get user information');
        console.error(err);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-lg text-destructive">Error: {error}</h2>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-primary mb-4">Welcome, {userInfo.display_name}!</h2>
        <p className="text-muted-foreground">Email: {userInfo.email}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Continue to App
        </button>
      </div>
    </div>
  );
}