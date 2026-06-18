import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, userRole } = useAuthStore()
  const location = useLocation()

  if (!isLoggedIn) {
    // Redirect them to the / page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // If they are logged in but don't have the right role, send to home
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
