/**
 * Utility function to make fetch calls with Authorization header automatically.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

// We can handle global 401/403 here if needed, but for now just return response
  return response
}

/**
 * Utility function for multipart/form-data
 */
export async function apiFetchMultipart(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  // DO NOT set Content-Type, browser will automatically set it with the correct boundary for FormData

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  return response
}
