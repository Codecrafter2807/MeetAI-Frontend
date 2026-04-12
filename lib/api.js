export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  let token = null;
  let activeWorkspace = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
    activeWorkspace = localStorage.getItem('activeWorkspaceSlug');
  }

  const defaultOptions = {
    headers: {
      ...(!options.body || !(options.body instanceof FormData) 
        ? { 'Content-Type': 'application/json' } 
        : {}),
      ...(token ? { 'Authorization': `Token ${token}` } : {}),
      ...(activeWorkspace ? { 'X-Workspace-Slug': activeWorkspace } : {}),
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/')) {
        const currentToken = localStorage.getItem('token');
        const headerToken = finalOptions.headers?.['Authorization']?.replace('Token ', '');
        
        // Only logout if the token that failed is actually the one we are currently using.
        // If they differ, it means a new token was generated (new login) and we should stay logged in.
        if (currentToken && headerToken === currentToken) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      const errorBody = await response.text();
      throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    // Handle empty responses (like 204 No Content or empty 201)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error(`Network error when fetching ${url}. Please check if the backend is running at ${API_URL}`);
    }
    throw error;
  }
}
