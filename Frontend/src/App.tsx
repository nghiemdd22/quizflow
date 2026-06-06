import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { LandingPage } from './pages/LandingPage'
import { TeacherDashboard } from './pages/TeacherDashboard'
import type { Course } from './types'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'teacher-dashboard'>('landing')
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else {
        setIsHeaderVisible(true)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleLoginSuccess = (token: string, username: string, role: string, id: number) => {
    setIsLoggedIn(true)
    setUserEmail(username)
    setUserRole(role)
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('userId', id.toString())
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail('')
    setUserRole(null)
    setCurrentView('landing')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
  }

  const handleCourseRegister = (course: Course) => {
    setIsLoggedIn(true)
    setUserEmail('trial@learnhub.com')
    alert(`Đăng ký học thử khóa "${course.title}" thành công!`)
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-slate-900 font-sans selection:bg-neo-green selection:text-white pt-28">
      <Navbar
        isHeaderVisible={isHeaderVisible}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        role={userRole}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthOpen(true)}
        onOpenSignup={() => setIsAuthOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {currentView === 'landing' ? (
        <LandingPage
          onOpenSignup={() => setIsAuthOpen(true)}
          onCourseRegister={handleCourseRegister}
        />
      ) : (
        <TeacherDashboard />
      )}

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

export default App
