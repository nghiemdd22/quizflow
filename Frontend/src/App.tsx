import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { LandingPage } from './pages/LandingPage'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { ExamRoom } from './pages/ExamRoom'
import type { Course, ExamRoomResponse } from './types'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'teacher-dashboard' | 'exam-room'>('landing')
  const [examRoomData, setExamRoomData] = useState<ExamRoomResponse | null>(null)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('username') || '')
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('role'))

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
    localStorage.setItem('username', username)
    localStorage.setItem('userId', id.toString())
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail('')
    setUserRole(null)
    setCurrentView('landing')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
  }

  const handleCourseRegister = (course: Course) => {
    setIsLoggedIn(true)
    setUserEmail('trial@quizflow.com')
    alert(`Đăng ký học thử khóa "${course.title}" thành công!`)
  }

  return (
    <div className={`min-h-screen bg-neo-bg text-slate-900 font-sans selection:bg-neo-green selection:text-white ${currentView === 'exam-room' ? 'pt-0' : 'pt-28'} flex flex-col transition-colors duration-300`}>
      {currentView !== 'exam-room' && (
        <Navbar
          isHeaderVisible={isHeaderVisible}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          role={userRole}
          onLogout={handleLogout}
          onOpenLogin={() => { setAuthMode('login'); setIsAuthOpen(true) }}
          onOpenSignup={() => { setAuthMode('signup'); setIsAuthOpen(true) }}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}

      <main className="flex-1 w-full flex flex-col">
        {currentView === 'landing' ? (
          <LandingPage
            isLoggedIn={isLoggedIn}
            onOpenSignup={() => { setAuthMode('signup'); setIsAuthOpen(true) }}
            onCourseRegister={handleCourseRegister}
            onJoinExamSuccess={(data) => {
              setExamRoomData(data);
              setCurrentView('exam-room');
            }}
          />
        ) : currentView === 'teacher-dashboard' ? (
          <TeacherDashboard />
        ) : (
          examRoomData && <ExamRoom data={examRoomData} onLeave={() => setCurrentView('landing')} />
        )}
      </main>

      {currentView !== 'exam-room' && <Footer />}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authMode}
      />
    </div>
  )
}

export default App
