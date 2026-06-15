import { useAuthStore } from '../store/authStore'

/**
 * Utility function to make fetch calls with Authorization header automatically.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().accessToken
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const fetchOptions: RequestInit = {
    ...options,
    credentials: options.credentials || 'include',
    headers,
  }

  let response = await fetch(endpoint, fetchOptions)

  // Interceptor logic: Tự động làm mới token nếu bị 401
  if (response.status === 401) {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        useAuthStore.getState().setAuth(data.token, data.username, data.role, data.id)
        
        // Gắn token mới và gọi lại request ban đầu
        headers.set('Authorization', `Bearer ${data.token}`)
        response = await fetch(endpoint, fetchOptions)
      } else {
        useAuthStore.getState().clearAuth()
      }
    } catch (e) {
      useAuthStore.getState().clearAuth()
    }
  }

  return response
}

/**
 * Utility function for multipart/form-data
 */
export async function apiFetchMultipart(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().accessToken
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  // DO NOT set Content-Type, browser will automatically set it with the correct boundary for FormData

  const fetchOptions: RequestInit = {
    ...options,
    credentials: options.credentials || 'include',
    headers,
  }

  let response = await fetch(endpoint, fetchOptions)

  if (response.status === 401) {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        useAuthStore.getState().setAuth(data.token, data.username, data.role, data.id)
        
        headers.set('Authorization', `Bearer ${data.token}`)
        response = await fetch(endpoint, fetchOptions)
      } else {
        useAuthStore.getState().clearAuth()
      }
    } catch (e) {
      useAuthStore.getState().clearAuth()
    }
  }

  return response
}
