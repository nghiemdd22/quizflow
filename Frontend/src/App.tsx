import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { LandingPage } from './pages/LandingPage'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { ExamRoom } from './pages/ExamRoom'
import type { Course, ExamRoomResponse } from './types'
import { useAuthStore } from './store/authStore'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'teacher-dashboard' | 'exam-room'>('landing')
  const [examRoomData, setExamRoomData] = useState<ExamRoomResponse | null>(null)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  
  const { isLoggedIn, userEmail, userRole, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    // Thử khôi phục phiên đăng nhập từ HttpOnly Cookie nếu chưa có Access Token trong RAM
    const initAuth = async () => {
      if (!isLoggedIn) {
        try {
          // Sử dụng đường dẫn tương đối để đi qua Vite Proxy, tự động tránh lỗi CORS
          const res = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            // Không cần include credentials nếu dùng chung domain/proxy, nhưng để chắc chắn cứ giữ cũng được. Proxy sẽ chuyển tiếp cookie.
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
          })
          if (res.ok) {
            const data = await res.json()
            setAuth(data.token, data.username, data.role, data.id)
          }
        } catch (e) {
          // Bỏ qua lỗi (chưa đăng nhập hoặc cookie hết hạn)
        }
      }
    }
    initAuth()
  }, [])

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
    setAuth(token, username, role, id)
  }

  const handleLogout = async () => {
    clearAuth()
    setCurrentView('landing')
    try {
      await fetch('/api/v1/auth/logout', { 
        method: 'POST'
      })
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  const handleCourseRegister = (course: Course) => {
    setAuth('dummy-token', 'trial@quizflow.com', 'STUDENT', 999)
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
