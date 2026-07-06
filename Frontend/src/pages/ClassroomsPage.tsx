import React, { useEffect, useState } from 'react'
import { Plus, Users, Hash, BookOpen } from 'lucide-react'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

interface Classroom {
  id: number
  name: string
  code: string
  teacherName: string
  memberCount: number
  unreadMessageCount?: number
}

export const ClassroomsPage: React.FC = () => {
  const { userRole } = useAuthStore()
  const navigate = useNavigate()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchClassrooms = async () => {
    try {
      const response = await apiFetch('/api/v1/classes/me')
      if (response.ok) {
        const data = await response.json()
        setClassrooms(data)
      } else {
        setError('Failed to fetch classrooms')
      }
    } catch (err) {
      setError('An error occurred connecting to the server')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClassrooms()
    
    const handleBadgeUpdate = (e: any) => {
      const { classId, unreadCount } = e.detail
      setClassrooms(prev => prev.map(c => 
        c.id === classId ? { ...c, unreadMessageCount: unreadCount } : c
      ))
    }
    
    window.addEventListener('chatBadgeUpdate', handleBadgeUpdate)
    return () => window.removeEventListener('chatBadgeUpdate', handleBadgeUpdate)
  }, [])

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return
    setIsCreating(true)
    try {
      const response = await apiFetch('/api/v1/classes', {
        method: 'POST',
        body: JSON.stringify({ name: newClassName })
      })
      if (response.ok) {
        setShowCreateModal(false)
        setNewClassName('')
        fetchClassrooms()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create classroom')
      }
    } catch (err) {
      setError('An error occurred connecting to the server')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-neo-bg bg-grid-slate-200">
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">My Classrooms</h1>
            <p className="text-slate-600 font-bold">
              {userRole === 'TEACHER' ? 'Manage your created classes' : 'Classes you have joined'}
            </p>
          </div>
          {userRole === 'TEACHER' ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-neo-blue text-white px-6 py-3 rounded-xl font-black neo-btn"
            >
              <Plus size={20} /> Create Class
            </button>
          ) : (
            <button
              onClick={() => navigate('/join-class')}
              className="flex items-center gap-2 bg-neo-green text-white px-6 py-3 rounded-xl font-black neo-btn"
            >
              <Plus size={20} /> Join Class
            </button>
          )}
        </div>

        {error && (
          <div className="bg-rose-100 border-2 border-slate-900 p-4 rounded-xl font-bold text-rose-700 mb-6 shadow-[4px_4px_0px_#0f172a]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-neo-blue rounded-full animate-spin"></div>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="bg-white border-2 border-slate-900 rounded-xl p-12 text-center shadow-[4px_4px_0px_#0f172a]">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No classrooms yet</h3>
            <p className="text-slate-500 font-bold max-w-md mx-auto">
              {userRole === 'TEACHER' 
                ? 'Create your first classroom to start assigning exams to your students.' 
                : 'Join a classroom using a 6-character code provided by your teacher.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((c) => (
              <div 
                key={c.id} 
                onClick={() => navigate(`/classes/${c.id}`)}
                className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col justify-between min-h-[220px] cursor-pointer group relative"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <BookOpen size={24} strokeWidth={2.5} />
                  </div>
                  
                  <h3 className="font-extrabold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-neo-blue transition-colors pr-8">
                    {c.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 font-bold leading-relaxed flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-black">
                      {c.teacherName.charAt(0)}
                    </span>
                    {c.teacherName}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 w-full">
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Hash size={12} /> {c.code}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                    <Users size={14} /> {c.memberCount} members
                  </div>
                </div>

                {(c.unreadMessageCount && c.unreadMessageCount > 0) ? (
                  <div className="absolute top-6 right-6 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full shadow-sm animate-bounce">
                    {c.unreadMessageCount > 99 ? '99+' : c.unreadMessageCount}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Modal Create Classroom */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_#0f172a] animate-scale-up">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Create New Classroom</h2>
              <p className="text-slate-500 font-bold text-sm mb-6">Enter a name for your new class. A unique 6-character code will be generated.</p>
              
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Advanced Physics 101"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#0f172a] transition-all mb-6"
                autoFocus
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 font-black text-slate-700 bg-slate-100 border-2 border-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim() || isCreating}
                  className="flex-1 py-3 font-black text-white bg-neo-blue border-2 border-slate-900 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex justify-center items-center h-[52px]"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
