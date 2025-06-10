
interface AuthResponse {
  apiKey: string;
}

class PluggyAuth {
  private apiKey: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  async getApiKey(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      console.log('Token refresh in progress, waiting...');
      return this.refreshPromise;
    }

    if (!this.apiKey || this.isTokenExpired()) {
      return this.refreshToken();
    }

    return this.apiKey;
  }

  private isTokenExpired(): boolean {
    // Simple check - in a real implementation you might decode the JWT token
    // For now, we'll rely on API error responses to trigger refresh
    return false;
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    console.log('Token expired or missing, refreshing...');
    this.isRefreshing = true;
    
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.apiKey = newToken;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        clientId: '9874a45e-3a75-425e-a451-26b3d99c7dc2',
        clientSecret: '9c93ac24-0829-4822-8320-c946070f8c49'
      })
    };

    const response = await fetch('https://api.pluggy.ai/auth', options);
    const data: AuthResponse = await response.json();
    
    console.log('New auth token received:', data);
    return data.apiKey;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const apiKey = await this.getApiKey();
    
    const authenticatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-API-KEY': apiKey
      }
    };

    const response = await fetch(url, authenticatedOptions);

    // If we get a 403 error (API_KEY_MISSING_OR_INVALID), refresh token and retry
    if (response.status === 403) {
      console.log('API key invalid, refreshing and retrying...');
      this.apiKey = null; // Force refresh
      const newApiKey = await this.getApiKey();
      
      const retryOptions = {
        ...options,
        headers: {
          ...options.headers,
          'X-API-KEY': newApiKey
        }
      };

      return fetch(url, retryOptions);
    }

    return response;
  }
}

export const pluggyAuth = new PluggyAuth();
