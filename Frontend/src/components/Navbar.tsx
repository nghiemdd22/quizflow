import React, { useState, useRef, useEffect } from 'react'
import { BookOpen, User } from 'lucide-react'

interface NavbarProps {
  isHeaderVisible: boolean
  isLoggedIn: boolean
  userEmail: string
  role: string | null
  onLogout: () => void
  onOpenLogin: () => void
  onOpenSignup: () => void
  currentView: 'landing' | 'teacher-dashboard'
  setCurrentView: (view: 'landing' | 'teacher-dashboard') => void
}

export const Navbar: React.FC<NavbarProps> = ({
  isHeaderVisible,
  isLoggedIn,
  userEmail,
  role,
  onLogout,
  onOpenLogin,
  onOpenSignup,
  currentView,
  setCurrentView
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        <nav className="bg-white neo-card neo-header-hover px-6 py-4 flex items-center justify-between">
          {/* Logo Quizflow */}
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('landing'); }} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-neo-coral flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_#0f172a] transition-all">
              <BookOpen className="text-white w-5 h-5" strokeWidth={3} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Quizflow</span>
          </a>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            {currentView === 'landing' ? (
              <>
                <a href="#courses" className="hover:text-neo-green transition-colors">Courses</a>
                <a href="#why-choose" className="hover:text-neo-blue transition-colors">Teachers</a>
                <a href="#cta" className="hover:text-neo-purple transition-colors">Pricing</a>
                <a href="#footer" className="hover:text-neo-coral transition-colors">About</a>
              </>
            ) : (
              <>
                <a href="#" className="text-neo-blue font-black border-b-2 border-neo-blue">Bảng điều khiển</a>
                <a href="#" className="hover:text-neo-green transition-colors text-slate-500">Học sinh & Lớp</a>
                <a href="#" className="hover:text-neo-purple transition-colors text-slate-500">Thống kê chung</a>
                <a href="#" className="hover:text-neo-coral transition-colors text-slate-500">Trợ giúp</a>
              </>
            )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {role === 'TEACHER' && currentView === 'landing' && (
                  <button
                    onClick={() => setCurrentView('teacher-dashboard')}
                    className="px-4 py-2 text-xs neo-btn bg-blue-100 hover:bg-blue-200 text-blue-800"
                  >
                    Teacher Dashboard
                  </button>
                )}
                {role === 'TEACHER' && currentView === 'teacher-dashboard' && (
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="px-4 py-2 text-xs neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    Home
                  </button>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#0f172a] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all p-0"
                  >
                    <User className="w-5 h-5 text-slate-900" strokeWidth={3} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] rounded-xl flex flex-col p-2 z-50">
                      <div className="px-3 py-2 border-b-2 border-slate-100 mb-2">
                        <p className="text-xs font-bold text-slate-500">Tài khoản</p>
                        <p className="text-sm font-black truncate">{userEmail}</p>
                      </div>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-left px-3 py-2 text-sm font-bold hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Hồ sơ cá nhân
                      </button>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-left px-3 py-2 text-sm font-bold hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cài đặt
                      </button>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false)
                          onLogout()
                        }}
                        className="text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 text-sm neo-btn"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={onOpenSignup}
                  className="px-5 py-2.5 bg-neo-green hover:bg-neo-green-hover text-white text-sm neo-btn"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
