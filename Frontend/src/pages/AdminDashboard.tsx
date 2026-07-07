import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { Users, GraduationCap, Server, Target, BookOpen } from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/v1/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error("Failed to fetch admin stats", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-8 text-center font-bold">Đang tải dữ liệu...</div>
  if (!stats) return <div className="p-8 text-center text-red-500 font-bold">Lỗi tải dữ liệu</div>

  const cards = [
    { title: 'Học sinh', value: stats.totalStudents, icon: Users, color: 'bg-neo-blue' },
    { title: 'Giáo viên', value: stats.totalTeachers, icon: GraduationCap, color: 'bg-neo-green' },
    { title: 'Ngân hàng câu hỏi', value: stats.totalQuestionBanks, icon: BookOpen, color: 'bg-neo-purple' },
    { title: 'Ca thi đã tổ chức', value: stats.totalSessions, icon: Target, color: 'bg-neo-coral' },
    { title: 'Ca thi đang diễn ra', value: stats.activeSessions, icon: Server, color: 'bg-neo-yellow text-slate-900' },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 font-bold">Tổng quan hệ thống QuizFlow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const textColor = c.color.includes('text-slate-900') ? 'text-slate-900' : 'text-white'
          return (
            <div key={i} className={`neo-card p-6 ${c.color} flex flex-col justify-between`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-extrabold ${textColor}`}>{c.title}</h3>
                <div className={`w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center`}>
                  <c.icon className={`w-6 h-6 ${textColor}`} />
                </div>
              </div>
              <p className={`text-5xl font-black ${textColor}`}>{c.value.toLocaleString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
