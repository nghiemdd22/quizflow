import React, { useState, useRef, useEffect } from 'react'
import { BookOpen, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NotificationDropdown } from './NotificationDropdown'

interface NavbarProps {
  isHeaderVisible: boolean
  isLoggedIn: boolean
  userEmail: string
  role: string | null
  onLogout: () => void
  onOpenLogin: () => void
  onOpenSignup: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  isHeaderVisible,
  isLoggedIn,
  userEmail,
  role,
  onLogout,
  onOpenLogin,
  onOpenSignup
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { userFullName } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-[calc(100%+20px)]'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 pt-6">
        <nav className="relative bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#0f172a] hover:shadow-[2px_2px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] transition-all px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
          {/* Logo */}
          <Link to={role === 'TEACHER' ? '/teacher-dashboard' : '/'} className="flex items-center gap-4 group transition-opacity hover:opacity-80 z-10">
            <div className="w-12 h-12 rounded-xl bg-[#ffc4b8] flex items-center justify-center">
              {location.pathname === '/' ? (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#1a3b5c] w-6 h-6"
                >
                  <motion.path
                    d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.path
                    d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  />
                </motion.svg>
              ) : (
                <BookOpen className="text-[#1a3b5c] w-6 h-6" strokeWidth={2.5} />
              )}
            </div>
            <span className="text-3xl font-black text-[#1a3b5c] tracking-tight hidden sm:block">QuizFlow</span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 font-bold text-base whitespace-nowrap">
              {role === 'ADMIN' ? (
                <>
                  <Link to="/admin" data-text="Dashboard" className={`nav-item transition-all ${location.pathname === '/admin' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Dashboard</Link>
                  <Link to="/admin/users" data-text="Người dùng" className={`nav-item transition-all ${location.pathname === '/admin/users' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Người dùng</Link>
                  <Link to="/admin/pins" data-text="Mã Đăng ký" className={`nav-item transition-all ${location.pathname === '/admin/pins' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Mã Đăng ký</Link>
                  <Link to="/admin/subjects" data-text="Môn học" className={`nav-item transition-all ${location.pathname === '/admin/subjects' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Môn học</Link>
                  <Link to="/admin/tags" data-text="Quản lý Tag" className={`nav-item transition-all ${location.pathname === '/admin/tags' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Quản lý Tag</Link>
                </>
              ) : role === 'TEACHER' ? (
                <>
                  <Link to="/teacher-dashboard" data-text="Tổng quan" className={`nav-item transition-all ${location.pathname === '/teacher-dashboard' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Tổng quan</Link>
                  <Link to="/classes" data-text="Lớp học" className={`nav-item transition-all ${location.pathname.startsWith('/classes') ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Lớp học</Link>
                  
                  {/* Quản lý Thi cử Dropdown */}
                  <div className="relative group/exams cursor-pointer flex items-center h-full">
                    <span className={`nav-item flex items-center gap-1 transition-all ${['/question-bank', '/teacher/exams', '/teacher/reports'].some(p => location.pathname.startsWith(p)) ? 'text-slate-900 font-black' : 'text-slate-500 hover:text-slate-900 hover:font-black'}`}>
                      Quản lý Thi ▾
                    </span>
                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-4 w-52 opacity-0 invisible group-hover/exams:opacity-100 group-hover/exams:visible transition-all duration-200 z-50">
                      <div className="bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a] flex flex-col p-2">
                        <Link to="/question-bank" className="px-4 py-3 hover:bg-slate-100 rounded-lg font-bold text-slate-700 hover:text-slate-900 text-sm transition-colors text-left">Ngân hàng câu hỏi</Link>
                        <Link to="/teacher/exams" className="px-4 py-3 hover:bg-slate-100 rounded-lg font-bold text-slate-700 hover:text-slate-900 text-sm transition-colors text-left">Quản lý Đề thi</Link>
                        <Link to="/teacher/reports" className="px-4 py-3 hover:bg-slate-100 rounded-lg font-bold text-slate-700 hover:text-slate-900 text-sm transition-colors text-left">Báo cáo & Lịch sử</Link>
                      </div>
                    </div>
                  </div>

                  <Link to="/forum" data-text="Diễn đàn" className={`nav-item transition-all ${location.pathname.startsWith('/forum') ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Diễn đàn</Link>
                  <Link to="/about" data-text="About" className={`nav-item transition-all ${location.pathname === '/about' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>About</Link>
                </>
              ) : role === 'STUDENT' ? (
                <>
                  <Link to="/" data-text="Home" className={`nav-item transition-all ${location.pathname === '/' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Home</Link>
                  <Link to="/classes" data-text="My Classes" className={`nav-item transition-all ${location.pathname.startsWith('/classes') ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>My Classes</Link>
                  <Link to="/exam-history" data-text="History" className={`nav-item transition-all ${location.pathname.startsWith('/exam-history') || location.pathname.startsWith('/exam-review') ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>History</Link>
                  <Link to="/forum" data-text="Diễn đàn" className={`nav-item transition-all ${location.pathname.startsWith('/forum') ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Diễn đàn</Link>
                  <Link to="/about" data-text="About" className={`nav-item transition-all ${location.pathname === '/about' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>About</Link>
                </>
              ) : (
                <>
                  <Link to="/" data-text="Home" className={`nav-item transition-all ${location.pathname === '/' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Home</Link>
                  <Link to="/forum" data-text="Diễn đàn" className={`nav-item transition-all ${location.pathname.startsWith('/forum') ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>Diễn đàn</Link>
                  <Link to="/about" data-text="About" className={`nav-item transition-all ${location.pathname === '/about' ? 'text-slate-900 font-black' : 'hover:font-black text-slate-500'}`}>About</Link>
                </>
              )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-4 z-10">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 flex items-center justify-center shadow-[3px_3px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#0f172a] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all p-0 cursor-pointer"
                  >
                    <User className="w-6 h-6 text-slate-900" strokeWidth={3} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-900 rounded-xl flex flex-col p-2 z-50 animate-pop-in origin-top-right">
                      <div className="px-3 py-2 border-b-2 border-slate-100 mb-2">
                        <p className="text-xs font-bold text-slate-500">Account</p>
                        <p className="text-sm font-black truncate text-slate-900">{userFullName || userEmail}</p>
                        <p className="text-xs font-bold truncate text-slate-500 mt-0.5">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          navigate('/profile')
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          navigate('/settings')
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          onLogout()
                        }}
                        className="text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 text-base font-bold neo-btn"
                >
                  Login
                </button>
                <button
                  onClick={onOpenSignup}
                  className="px-6 py-3 bg-neo-green hover:bg-neo-green-hover text-white text-base font-bold neo-btn"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
