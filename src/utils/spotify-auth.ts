// Generate a random string for code verifier
export const generateRandomString = (length: number): string => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };
  
  // Generate code challenge from verifier
  export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64encode(digest);
  };
  
  // Base64 encode
  const base64encode = (input: ArrayBuffer): string => {
    const uint8Array = new Uint8Array(input);
    return btoa(Array.from(uint8Array, byte => String.fromCharCode(byte)).join(''))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };
  
  // Login function
  export const initiateSpotifyLogin = async () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
  
    // Store code verifier for later use
    localStorage.setItem('code_verifier', codeVerifier);
  
    const scope = 'user-read-private user-read-email';
    const authUrl = new URL("https://accounts.spotify.com/authorize");
  
    const params = {
      response_type: 'code',
      client_id: clientId!,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri!,
    };
  
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  };
  
  // Get token from code
  export const getAccessToken = async (code: string): Promise<any> => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const codeVerifier = localStorage.getItem('code_verifier');
  
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri!,
        code_verifier: codeVerifier!,
      }),
    });
  
    const data = await response.json();
    return data;
  };
  
  // Get user profile
  export const getUserProfile = async (accessToken: string): Promise<any> => {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  };