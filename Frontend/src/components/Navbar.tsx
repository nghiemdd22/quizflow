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
  currentView: 'landing' | 'teacher-dashboard' | 'exam-room' | 'join-exam' | 'exam-history' | 'exam-review'
  setCurrentView: (view: 'landing' | 'teacher-dashboard' | 'exam-room' | 'join-exam' | 'exam-history' | 'exam-review') => void
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
        <nav className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#0f172a] hover:shadow-[2px_2px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] transition-all px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
          {/* Logo LearnHub */}
          <a href="#" onClick={(e) => { 
            e.preventDefault(); 
            if (role === 'TEACHER') {
              setCurrentView('teacher-dashboard');
            } else {
              setCurrentView('landing'); 
            }
          }} className="flex items-center gap-4 group transition-opacity hover:opacity-80">
            <div className="w-12 h-12 rounded-xl bg-[#ffc4b8] border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
              <BookOpen className="text-[#1a3b5c] w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-black text-[#1a3b5c] tracking-tight">LearnHub</span>
          </a>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-10 font-bold text-base">
            {role === 'TEACHER' ? (
              <>
                <a href="#" className="text-neo-blue font-black border-b-2 border-neo-blue">Dashboard</a>
                <a href="#" className="hover:text-neo-green transition-colors text-slate-500">Students & Classes</a>
                <a href="#" className="hover:text-neo-purple transition-colors text-slate-500">Analytics</a>
                <a href="#" className="hover:text-neo-coral transition-colors text-slate-500">Help</a>
              </>
            ) : role === 'STUDENT' ? (
              <>
                <button onClick={() => setCurrentView('landing')} className={`transition-all cursor-pointer ${currentView === 'landing' ? 'text-slate-900 font-black' : 'hover:font-black'}`}>Home</button>
                <button onClick={() => setCurrentView('join-exam')} className={`transition-all cursor-pointer ${currentView === 'join-exam' ? 'text-slate-900 font-black' : 'hover:font-black'}`}>Join Exam</button>
                <button onClick={() => setCurrentView('exam-history')} className={`transition-all cursor-pointer ${currentView === 'exam-history' || currentView === 'exam-review' ? 'text-slate-900 font-black' : 'hover:font-black'}`}>History</button>
                <button onClick={() => { setCurrentView('landing'); setTimeout(() => document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="transition-all cursor-pointer hover:font-black">About</button>
              </>
            ) : (
              <>
                <a href="#courses" className="hover:text-neo-green transition-colors">Courses</a>
                <a href="#why-choose" className="hover:text-neo-blue transition-colors">Teachers</a>
                <a href="#cta" className="hover:text-neo-purple transition-colors">Pricing</a>
                <a href="#why-choose-us" className="hover:text-neo-coral transition-colors">About</a>
              </>
            )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 flex items-center justify-center shadow-[3px_3px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#0f172a] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all p-0"
                  >
                    <User className="w-6 h-6 text-slate-900" strokeWidth={3} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] rounded-xl flex flex-col p-2 z-50">
                      <div className="px-3 py-2 border-b-2 border-slate-100 mb-2">
                        <p className="text-xs font-bold text-slate-500">Account</p>
                        <p className="text-sm font-black truncate">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-left px-3 py-2 text-sm font-bold hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-left px-3 py-2 text-sm font-bold hover:bg-slate-100 rounded-xl transition-colors"
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
