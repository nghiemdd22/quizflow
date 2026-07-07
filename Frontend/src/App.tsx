import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PageWrapper } from './components/PageWrapper'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BookOpen } from 'lucide-react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { LandingPage } from './pages/LandingPage'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { ClassroomsPage } from './pages/ClassroomsPage'
import { ClassDetailPage } from './pages/ClassDetailPage'
import { QuestionBankPage } from './pages/QuestionBankPage'
import { ExamSessionsPage } from './pages/ExamSessionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { JoinExamPage } from './pages/JoinExamPage'
import { ExamRoom } from './pages/ExamRoom'
import { ExamHistoryPage } from './pages/ExamHistoryPage'
import { ExamReviewPage } from './pages/ExamReviewPage'
import { ProctoringPage } from './pages/ProctoringPage'
import { AboutPage } from './pages/AboutPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { ForumPage } from './pages/ForumPage'
import { CreatePostPage } from './pages/CreatePostPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminUserManagement } from './pages/AdminUserManagement'
import { AdminPinManagement } from './pages/AdminPinManagement'
import type { Course } from './types'
import { useAuthStore } from './store/authStore'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isExamRoom = location.pathname === '/exam-room'

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
            if (data.role === 'TEACHER' && location.pathname === '/') {
              navigate('/teacher-dashboard', { replace: true })
            }
          }
        } catch (_) {
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
    // Check if there's a redirect target from ProtectedRoute
    const origin = location.state?.from?.pathname || (role === 'TEACHER' ? '/teacher-dashboard' : '/')
    navigate(origin, { replace: true })
  }

  const handleLogout = async () => {
    clearAuth()
    navigate('/', { replace: true })
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST'
      })
    } catch (_) {
      console.error('Logout failed')
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
    <div className={`min-h-screen bg-neo-bg text-slate-900 font-sans selection:bg-neo-purple selection:text-white ${isExamRoom ? 'pt-0' : 'pt-28'} flex flex-col transition-colors duration-300`}>
      {!isExamRoom && (
        <Navbar
          isHeaderVisible={isHeaderVisible}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          role={userRole}
          onLogout={handleLogout}
          onOpenLogin={() => { setAuthMode('login'); setIsAuthOpen(true) }}
          onOpenSignup={() => { setAuthMode('signup'); setIsAuthOpen(true) }}
        />
      )}

      <main className="flex-1 w-full flex flex-col">
        <div className="animate-page-enter flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><LandingPage isLoggedIn={isLoggedIn} onOpenLogin={() => { setAuthMode('login'); setIsAuthOpen(true) }} onOpenSignup={() => { setAuthMode('signup'); setIsAuthOpen(true) }} onCourseRegister={handleCourseRegister} /></PageWrapper>} />
              
              {/* Student Routes */}
              <Route path="/join-class" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageWrapper><JoinExamPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/exam-room" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageWrapper><ExamRoom /></PageWrapper></ProtectedRoute>} />
              <Route path="/exam-history" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageWrapper><ExamHistoryPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/exam-review/:submissionId" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageWrapper><ExamReviewPage /></PageWrapper></ProtectedRoute>} />
              
              {/* Teacher Routes */}
              <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><TeacherDashboard /></PageWrapper></ProtectedRoute>} />
              <Route 
                path="/classes" 
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'STUDENT']}>
                    <PageWrapper><ClassroomsPage /></PageWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/classes/:classId" 
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'STUDENT']}>
                    <PageWrapper><ClassDetailPage /></PageWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route path="/question-bank" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><QuestionBankPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/question-bank/:bankId" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><QuestionBankPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/teacher/exams" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><ExamSessionsPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/teacher/exams/:examId" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><ExamSessionsPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/teacher/reports" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><ReportsPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/teacher/reports/:sessionId" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><ReportsPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/teacher/exam-sessions/:sessionId/proctor" element={<ProtectedRoute allowedRoles={['TEACHER']}><PageWrapper><ProctoringPage /></PageWrapper></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageWrapper><AdminUserManagement /></PageWrapper></ProtectedRoute>} />
              <Route path="/admin/pins" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageWrapper><AdminPinManagement /></PageWrapper></ProtectedRoute>} />

              {/* Common Routes */}
              <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
              <Route path="/profile" element={<ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><PageWrapper><SettingsPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/forum" element={<PageWrapper><ForumPage /></PageWrapper>} />
              <Route path="/forum/create" element={<ProtectedRoute><PageWrapper><CreatePostPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/forum/:id" element={<PageWrapper><PostDetailPage /></PageWrapper>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>

      {!isExamRoom && <Footer />}

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
