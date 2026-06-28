import React from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
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

  // MOCK DATA
  const stats = [
    { label: 'Tổng số Câu hỏi', value: 1240, icon: FileText, color: 'text-neo-blue', bgColor: 'bg-blue-100' },
    { label: 'Ca thi đã tạo', value: 45, icon: BookOpen, color: 'text-neo-green', bgColor: 'bg-green-100' },
    { label: 'Ca thi đang diễn ra', value: 2, icon: Activity, color: 'text-neo-coral', bgColor: 'bg-red-100' },
    { label: 'Lượt tham gia', value: 3850, icon: Users, color: 'text-neo-purple', bgColor: 'bg-purple-100' },
  ]

  const activeSessions = [
    { id: 1, name: 'Kiểm tra Giữa kỳ Toán 10', pin: '883492', students: 42, timeLeft: '25:00', status: 'ACTIVE' },
    { id: 2, name: '15 phút Vật Lý 11', pin: '112093', students: 35, timeLeft: '10:30', status: 'ACTIVE' }
  ]

  const recentHistory = [
    { id: 101, name: 'Thi thử Hóa 12', date: '28/06/2026', participants: 120, avgScore: 7.5 },
    { id: 102, name: 'Kiểm tra Anh văn 10', date: '27/06/2026', participants: 45, avgScore: 8.2 },
    { id: 103, name: 'Khảo sát chất lượng Toán', date: '25/06/2026', participants: 200, avgScore: 6.8 },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Chào mừng, {userFullName || 'Thầy/Cô'}! 👋
          </h1>
          <p className="text-slate-500 font-bold text-lg">
            Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => navigate('/teacher/exam-sessions')}
          className="px-6 py-3 bg-neo-coral hover:bg-red-500 text-white text-lg neo-btn shadow-[4px_4px_0px_#0f172a]"
        >
          <PlayCircle className="w-6 h-6 mr-2" strokeWidth={2.5} />
          Mở Ca Thi Nhanh
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white neo-card p-6 flex flex-col justify-between items-start hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] transition-all cursor-default">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-4 ${stat.bgColor}`}>
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
          <div className="bg-neo-bg border-4 border-slate-900 rounded-2xl shadow-[6px_6px_0px_#0f172a] overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-neo-green animate-pulse" />
                <h2 className="text-xl font-black">Giám sát Ca thi đang diễn ra</h2>
              </div>
              <span className="neo-badge bg-neo-green text-slate-900 px-3 py-1 text-xs border-2 border-slate-900">
                {activeSessions.length} Active
              </span>
            </div>
            <div className="p-6">
              {activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {activeSessions.map(session => (
                    <div key={session.id} className="bg-white neo-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">{session.name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-neo-coral" /> {session.timeLeft} còn lại</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-neo-blue" /> {session.students} học sinh</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-2xl font-black tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border-2 border-slate-900">
                          {session.pin}
                        </div>
                        <button className="text-sm font-extrabold text-neo-blue hover:text-blue-700 hover:underline">
                          Xem chi tiết →
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
          <div className="bg-white neo-card p-6">
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
                  <tr className="border-b-4 border-slate-900 text-sm">
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Tên ca thi</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Ngày thi</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Số lượng</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map((history, idx) => (
                    <tr key={history.id} className={`border-b-2 border-slate-200 hover:bg-slate-50 transition-colors ${idx === recentHistory.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="py-4 px-4 font-extrabold text-slate-900">{history.name}</td>
                      <td className="py-4 px-4 font-bold text-slate-600">{history.date}</td>
                      <td className="py-4 px-4 font-bold text-slate-600">{history.participants}</td>
                      <td className="py-4 px-4 font-black text-neo-green">{history.avgScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-neo-yellow neo-card p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900">
              ⚡ Thao tác nhanh
            </h2>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/teacher/question-bank')}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#0f172a] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg border-2 border-slate-900 group-hover:bg-neo-green transition-colors">
                    <PlusCircle className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Thêm Câu hỏi mới</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button 
                onClick={() => navigate('/teacher/exam-sessions')}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#0f172a] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg border-2 border-slate-900 group-hover:bg-neo-blue transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Quản lý Ca thi</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button 
                onClick={() => navigate('/teacher/reports')}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#0f172a] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg border-2 border-slate-900 group-hover:bg-neo-purple transition-colors">
                    <BarChart3 className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Xuất Báo cáo</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
          </div>
          
          <div className="bg-white neo-card p-6 border-dashed border-4 border-slate-300 shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 flex flex-col items-center justify-center text-center">
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
