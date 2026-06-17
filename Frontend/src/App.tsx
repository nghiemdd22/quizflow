import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { LandingPage } from './pages/LandingPage'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { JoinExamPage } from './pages/JoinExamPage'
import { ExamRoom } from './pages/ExamRoom'
import { ExamHistoryPage } from './pages/ExamHistoryPage'
import { ExamReviewPage } from './pages/ExamReviewPage'
import { AboutPage } from './pages/AboutPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import type { Course, ExamRoomResponse } from './types'
import { useAuthStore } from './store/authStore'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'teacher-dashboard' | 'join-exam' | 'exam-room' | 'exam-history' | 'exam-review' | 'about' | 'profile' | 'settings'>('landing')
  const [examRoomData, setExamRoomData] = useState<ExamRoomResponse | null>(null)
  const [reviewSubmissionId, setReviewSubmissionId] = useState<number | null>(null)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isInitializing, setIsInitializing] = useState(true)

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
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
          })
          if (res.ok) {
            const data = await res.json()
            setAuth(data.token, data.username, data.fullName || data.username, data.role, data.id)
            if (data.role === 'TEACHER') {
              setCurrentView('teacher-dashboard')
            }
          }
        } catch (e) {
          // Bỏ qua lỗi (chưa đăng nhập hoặc cookie hết hạn)
        }
      }
      setIsInitializing(false)
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

  const handleLoginSuccess = (token: string, username: string, fullName: string, role: string, id: number) => {
    setAuth(token, username, fullName || username, role, id)
    if (role === 'TEACHER') {
      setCurrentView('teacher-dashboard')
    } else {
      setCurrentView('landing')
    }
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
    setAuth('dummy-token', 'trial@quizflow.com', 'Trial User', 'STUDENT', 999)
    alert(`Đăng ký học thử khóa "${course.title}" thành công!`)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-neo-bg flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4 animate-bounce">
          <div className="w-16 h-16 rounded-[14px] bg-[#ffc4b8] flex items-center justify-center">
            <BookOpen className="text-[#1a3b5c] w-8 h-8" strokeWidth={2} />
          </div>
          <span className="text-5xl font-bold text-[#1a3b5c] tracking-tight">QuizFlow</span>
        </div>
        <div className="text-sm font-bold text-slate-500 tracking-widest uppercase animate-pulse">Đang kết nối...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-neo-bg text-slate-900 font-sans selection:bg-neo-purple selection:text-white ${currentView === 'exam-room' ? 'pt-0' : 'pt-28'} flex flex-col transition-colors duration-300`}>
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
        <div key={currentView} className="animate-page-enter flex-1 flex flex-col">
          {currentView === 'landing' ? (
            <LandingPage
              isLoggedIn={isLoggedIn}
              onOpenSignup={() => { setAuthMode('signup'); setIsAuthOpen(true) }}
              onCourseRegister={handleCourseRegister}
              onNavigateToJoin={() => setCurrentView('join-exam')}
              onNavigateToHistory={() => setCurrentView('exam-history')}
            />
          ) : currentView === 'teacher-dashboard' ? (
            <TeacherDashboard />
          ) : currentView === 'join-exam' ? (
            <JoinExamPage
              onBack={() => setCurrentView('landing')}
              onJoinSuccess={(data) => {
                setExamRoomData(data)
                setCurrentView('exam-room')
              }}
            />
          ) : currentView === 'exam-history' ? (
            <ExamHistoryPage 
              onBack={() => setCurrentView('landing')} 
              onReviewExam={(id) => {
                setReviewSubmissionId(id);
                setCurrentView('exam-review');
              }}
            />
          ) : currentView === 'exam-review' && reviewSubmissionId != null ? (
            <ExamReviewPage 
              submissionId={reviewSubmissionId} 
              onBack={() => setCurrentView('exam-history')} 
            />
          ) : currentView === 'about' ? (
            <AboutPage />
          ) : currentView === 'profile' ? (
            <ProfilePage onBack={() => setCurrentView('landing')} />
          ) : currentView === 'settings' ? (
            <SettingsPage onBack={() => setCurrentView('landing')} />
          ) : (
            examRoomData && <ExamRoom data={examRoomData} onLeave={() => setCurrentView('landing')} />
          )}
        </div>
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
