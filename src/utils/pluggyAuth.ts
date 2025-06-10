
interface PluggyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class PluggyAuth {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    // These would typically come from environment variables
    this.clientId = import.meta.env.VITE_PLUGGY_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '';
  }

  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PluggyAuthResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const pluggyAuth = new PluggyAuth();
