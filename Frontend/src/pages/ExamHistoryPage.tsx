import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Clock, Search, Calendar, ChevronRight, Activity, Target, CheckCircle2, AlertCircle } from 'lucide-react'
import { apiFetch } from '../utils/api'

interface ExamHistory {
  id: number
  examTitle: string
  subjectName: string
  score: number | null
  startedAt: string
  submittedAt: string | null
  status: string
}

interface ExamHistoryPageProps {
  onBack: () => void
}

export const ExamHistoryPage: React.FC<ExamHistoryPageProps> = ({ onBack }) => {
  const [history, setHistory] = useState<ExamHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiFetch('/api/v1/student/history')
        if (!response.ok) {
          throw new Error('Không thể tải lịch sử bài thi')
        }
        const data = await response.json()
        setHistory(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--:--'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border-2 border-amber-300 rounded-xl text-xs font-black"><AlertCircle size={14}/> ĐANG LÀM</span>
      case 'GRADING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-700 border-2 border-sky-300 rounded-xl text-xs font-black"><Activity size={14}/> ĐANG CHẤM</span>
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-xl text-xs font-black"><CheckCircle2 size={14}/> HOÀN THÀNH</span>
      case 'ABANDONED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 border-2 border-rose-300 rounded-xl text-xs font-black"><Target size={14}/> BỎ THI</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border-2 border-slate-300 rounded-xl text-xs font-black">{status}</span>
    }
  }

  const filteredHistory = useMemo(() => {
    return history.filter(exam => {
      const matchesSearch = exam.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (filter === 'ALL') return matchesSearch
      if (filter === 'COMPLETED') return matchesSearch && exam.status === 'COMPLETED'
      if (filter === 'IN_PROGRESS') return matchesSearch && (exam.status === 'IN_PROGRESS' || exam.status === 'GRADING')
      
      return matchesSearch
    })
  }, [history, filter, searchQuery])

  const stats = useMemo(() => {
    const completed = history.filter(e => e.status === 'COMPLETED')
    const avgScore = completed.length > 0 
      ? completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length 
      : 0
    
    return {
      total: history.length,
      completed: completed.length,
      avgScore: avgScore.toFixed(1)
    }
  }, [history])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </button>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dbeafe] border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] text-blue-800 text-xs font-black mb-4">
            <Activity size={14} /> Hồ sơ học tập
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Lịch sử làm bài</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-neo-blue text-white neo-card p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shrink-0">
              <Target size={32} />
            </div>
            <div>
              <p className="text-blue-100 font-bold mb-1">Tổng bài thi</p>
              <h3 className="text-4xl font-black">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-neo-green text-white neo-card p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-green-100 font-bold mb-1">Đã hoàn thành</p>
              <h3 className="text-4xl font-black">{stats.completed}</h3>
            </div>
          </div>
          <div className="bg-neo-purple text-white neo-card p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shrink-0">
              <Activity size={32} />
            </div>
            <div>
              <p className="text-purple-100 font-bold mb-1">Điểm trung bình</p>
              <h3 className="text-4xl font-black">{stats.avgScore}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      {!isLoading && !error && history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="flex bg-white neo-card p-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'COMPLETED' ? 'bg-neo-green text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Hoàn thành
            </button>
            <button 
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'IN_PROGRESS' ? 'bg-neo-yellow text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Đang làm
            </button>
          </div>
          
          <div className="flex-1 relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm môn học hoặc tên bài thi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white neo-card text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-neo-blue transition-colors"
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white neo-card border-dashed border-4 border-slate-300">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-neo-blue rounded-full animate-spin mb-6"></div>
          <p className="font-bold text-slate-500 text-lg">Đang đồng bộ dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="w-full p-8 bg-rose-50 border-4 border-rose-200 rounded-3xl text-rose-600 font-bold text-center text-lg shadow-[4px_4px_0px_#fecdd3]">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white neo-card border-dashed border-4 border-slate-300">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Search size={48} className="text-slate-300" />
          </div>
          <h3 className="font-black text-2xl text-slate-700 mb-2">Chưa có bài thi nào</h3>
          <p className="text-slate-500 font-bold max-w-md text-center">Bạn chưa tham gia bất kỳ bài thi nào. Hãy xin mã PIN từ giáo viên để bắt đầu hành trình học tập nhé!</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white neo-card border-dashed border-4 border-slate-300">
          <Search size={48} className="text-slate-300 mb-4" />
          <h3 className="font-bold text-xl text-slate-700 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-sm text-slate-500 font-medium">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredHistory.map((exam) => (
            <div key={exam.id} className="bg-white neo-card neo-card-hover p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black uppercase px-3 py-1.5 bg-slate-100 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a]">
                    {exam.subjectName}
                  </span>
                  {getStatusBadge(exam.status)}
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 group-hover:text-neo-blue transition-colors">
                  {exam.examTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border-2 border-slate-100 w-fit">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    Bắt đầu: <span className="text-slate-700">{formatDate(exam.startedAt)}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Nộp bài: <span className="text-slate-700">{formatDate(exam.submittedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 md:border-l-2 md:border-slate-100 md:pl-8">
                <div className="text-center min-w-[80px]">
                  <p className="text-xs font-black text-slate-400 mb-1 tracking-widest">ĐIỂM SỐ</p>
                  <div className="text-4xl font-black text-neo-purple flex items-baseline justify-center gap-1">
                    {exam.score != null ? exam.score : '-'}
                    <span className="text-sm font-bold text-slate-400">/ 10</span>
                  </div>
                </div>
                <button className="w-14 h-14 rounded-3xl bg-white hover:bg-neo-yellow border-2 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all">
                  <ChevronRight size={24} strokeWidth={3} className="text-slate-900" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
