
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface PluggyAPIResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    message: string;
  };
}

export async function getPluggyToken(
  clientId: string, 
  clientSecret: string, 
  sandbox: boolean = true
): Promise<PluggyAPIResult<{ apiKey: string }>> {
  const baseUrl = sandbox 
    ? 'https://api.sandbox.pluggy.ai' 
    : 'https://api.pluggy.ai';
  
  console.log(`Getting Pluggy token with client ID: ${clientId.substring(0, 8)}... (sandbox: ${sandbox})`);
  
  try {
    const response = await fetch(`${baseUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pluggy auth error: ${response.status} ${response.statusText} ${errorText}`);
      return {
        success: false,
        error: {
          status: response.status,
          message: errorText
        }
      };
    }

    const data = await response.json();
    console.log('Successfully obtained Pluggy API key');
    
    return {
      success: true,
      data: { apiKey: data.apiKey }
    };
  } catch (error) {
    console.error('Network error during Pluggy authentication:', error);
    return {
      success: false,
      error: {
        status: 0,
        message: `Network error: ${error.message}`
      }
    };
  }
}

export async function callPluggyAPI(
  endpoint: string, 
  method: string = 'GET', 
  apiKey: string, 
  body?: any,
  sandbox: boolean = true
): Promise<PluggyAPIResult> {
  const baseUrl = sandbox 
    ? 'https://api.sandbox.pluggy.ai' 
    : 'https://api.pluggy.ai';
  
  console.log(`Calling Pluggy API: ${method} ${endpoint}`);
  
  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pluggy API error: ${response.status} ${response.statusText} ${errorText}`);
      return {
        success: false,
        error: {
          status: response.status,
          message: errorText
        }
      };
    }

    const data = await response.json();
    console.log(`Pluggy API call successful: ${method} ${endpoint}`);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error(`Network error calling Pluggy API: ${method} ${endpoint}`, error);
    return {
      success: false,
      error: {
        status: 0,
        message: `Network error: ${error.message}`
      }
    };
  }
}
