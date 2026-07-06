import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { 
  Users, 
  BookOpen, 
  Activity, 
  FileText, 
  PlusCircle, 
  PlayCircle, 
  BarChart3, 
  Clock,
  ArrowRight
} from 'lucide-react'

export const TeacherDashboard: React.FC = () => {
  const { userFullName } = useAuthStore()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    totalQuestions: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalParticipants: 0,
    activeSessionsList: [] as any[],
    recentHistoryList: [] as any[]
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await apiFetch('/api/v1/dashboard/teacher')
        if (response.ok) {
          const data = await response.json()
          setStatsData(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const displayStats = [
    { label: 'Tổng số Câu hỏi', value: statsData.totalQuestions, icon: FileText, color: 'text-neo-blue', bgColor: 'bg-blue-100' },
    { label: 'Ca thi đã tạo', value: statsData.totalSessions, icon: BookOpen, color: 'text-neo-green', bgColor: 'bg-green-100' },
    { label: 'Ca thi đang diễn ra', value: statsData.activeSessions, icon: Activity, color: 'text-neo-coral', bgColor: 'bg-red-100' },
    { label: 'Lượt tham gia', value: statsData.totalParticipants, icon: Users, color: 'text-neo-purple', bgColor: 'bg-purple-100' },
  ]

  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const weekday = now.toLocaleDateString('vi-VN', { weekday: 'long' })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      {/* Date Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-baseline gap-2 text-slate-500 font-bold text-xl md:text-2xl">
          <span className="capitalize">{weekday}, ngày</span>
          <span className="text-5xl md:text-6xl text-slate-900 font-black tracking-tighter">{day}</span>
          <span>tháng</span>
          <span className="text-5xl md:text-6xl text-slate-900 font-black tracking-tighter">{month}</span>
          <span>năm</span>
          <span className="text-5xl md:text-6xl text-slate-900 font-black tracking-tighter">{year}</span>
        </div>
        <button 
          onClick={() => {}}
          className="px-6 py-3 bg-neo-green hover:bg-green-500 text-white text-lg font-bold rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center shrink-0"
        >
          <BarChart3 className="w-6 h-6 mr-2" strokeWidth={2.5} />
          Xuất excel bảng điểm
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {displayStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl border-2 border-slate-100 p-6 flex flex-col justify-between items-start shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-default">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-500 font-extrabold text-sm uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-4xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Real-time Monitoring & Recent History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Sessions */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b-2 border-slate-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-neo-green animate-pulse" />
                <h2 className="text-xl font-black text-slate-900">Giám sát Ca thi đang diễn ra</h2>
              </div>
              <span className="bg-green-100 text-green-700 font-bold px-3 py-1 text-xs rounded-full">
                {statsData.activeSessionsList?.length || 0} Active
              </span>
            </div>
            <div className="p-6">
              {statsData.activeSessionsList && statsData.activeSessionsList.length > 0 ? (
                <div className="space-y-4">
                  {statsData.activeSessionsList.map(session => (
                    <div key={session.id} className="bg-slate-50 rounded-2xl border-2 border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex-1">
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">{session.title}</h3>
                        <p className="text-sm font-bold text-slate-500 mb-2">Lớp: {session.classroomName}</p>
                        <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-neo-coral" /> {new Date(session.startTime).toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'})} - {new Date(session.endTime).toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-neo-blue" /> {session.currentParticipants} học sinh đã tham gia</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => navigate(`/teacher/exam-sessions/${session.id}/proctor`)}
                          className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          Vào Giám sát
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-bold text-lg">Hiện không có ca thi nào đang diễn ra.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-neo-purple" />
                Lịch sử gần đây
              </h2>
              <button 
                onClick={() => navigate('/teacher/reports')}
                className="text-neo-blue font-bold hover:underline flex items-center text-sm"
              >
                Xem tất cả báo cáo <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-sm">
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Tên ca thi</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Ngày thi</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Số lượng</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.recentHistoryList && statsData.recentHistoryList.length > 0 ? (
                    statsData.recentHistoryList.map((item, idx) => (
                      <tr key={item.id} className={`border-b-2 border-slate-50 hover:bg-slate-50 transition-colors ${idx === statsData.recentHistoryList.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="py-4 px-4 font-extrabold text-slate-900 group-hover:text-neo-blue transition-colors">{item.name}</td>
                        <td className="py-4 px-4 font-bold text-slate-600">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                        <td className="py-4 px-4 font-bold text-slate-600">{item.participants}</td>
                        <td className="py-4 px-4 font-black text-neo-green">{item.avgScore}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-6">
                        <p className="text-slate-500 font-bold">Chưa có lịch sử ca thi.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-sm p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900">
              ⚡ Thao tác nhanh
            </h2>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/question-bank')}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
                    <PlusCircle className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Thêm Câu hỏi mới</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button 
                onClick={() => navigate('/teacher/exams')}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Quản lý Ca thi</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button 
                onClick={() => {}}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Xuất Excel bảng điểm</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border-dashed border-2 border-slate-300 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-black text-slate-900 mb-2">Trợ giúp & Hướng dẫn</h3>
            <p className="text-sm font-bold text-slate-500 mb-4">Cần hỗ trợ về cách tạo đề thi hay quản lý lớp học?</p>
            <button className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
              Xem tài liệu
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
