import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Clock, Search, Calendar, ChevronRight, Activity, Target, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react'
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
  onReviewExam: (submissionId: number) => void
}

export const ExamHistoryPage: React.FC<ExamHistoryPageProps> = ({ onBack, onReviewExam }) => {
  const [history, setHistory] = useState<ExamHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiFetch('/api/v1/student/sessions/history')
        if (!response.ok) {
          throw new Error('Failed to load exam history')
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
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border-2 border-amber-300 rounded-xl text-xs font-black"><AlertCircle size={14}/> IN PROGRESS</span>
      case 'GRADING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-700 border-2 border-sky-300 rounded-xl text-xs font-black"><Activity size={14}/> GRADING</span>
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-xl text-xs font-black"><CheckCircle2 size={14}/> COMPLETED</span>
      case 'ABANDONED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 border-2 border-rose-300 rounded-xl text-xs font-black"><Target size={14}/> ABANDONED</span>
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
    const avg = completed.length > 0 
      ? completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length 
      : 0
    
    return {
      total: history.length,
      completed: completed.length,
      avgScore: avg.toFixed(1)
    }
  }, [history])

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery])

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredHistory, currentPage])

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <button 
        onClick={onBack}
        className="w-fit mb-8 flex items-center gap-2 text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
      >
        <ArrowLeft size={16} strokeWidth={3} /> Back to Home
      </button>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Exam History</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dbeafe] border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] text-blue-800 text-xs font-black">
            <Activity size={14} /> Academic Profile
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white neo-card p-4 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] transition-all cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center shrink-0 group-hover:bg-neo-blue group-hover:text-white transition-colors">
              <Target size={24} />
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider group-hover:text-neo-blue transition-colors">Total Exams</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-neo-blue transition-colors">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-white neo-card p-4 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] transition-all cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center shrink-0 group-hover:bg-neo-blue group-hover:text-white transition-colors">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider group-hover:text-neo-blue transition-colors">Completed</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-neo-blue transition-colors">{stats.completed}</h3>
            </div>
          </div>
          <div className="bg-white neo-card p-4 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] transition-all cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center shrink-0 group-hover:bg-neo-blue group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider group-hover:text-neo-blue transition-colors">Average Score</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-neo-blue transition-colors">{stats.avgScore}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      {!isLoading && !error && history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex bg-white neo-card p-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === 'COMPLETED' ? 'bg-neo-green text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === 'IN_PROGRESS' ? 'bg-neo-yellow text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              In Progress
            </button>
          </div>
          
          <div className="flex-1 relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by subject or exam title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white neo-card text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-neo-blue transition-colors"
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white neo-card border-dashed border-4 border-slate-300">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-neo-blue rounded-full animate-spin mb-6"></div>
          <p className="font-bold text-slate-500 text-lg">Syncing data...</p>
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
          <h3 className="font-black text-2xl text-slate-700 mb-2">No Exams Taken Yet</h3>
          <p className="text-slate-500 font-bold max-w-md text-center">You haven't participated in any exams. Ask your teacher for a PIN to start your learning journey!</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white neo-card border-dashed border-4 border-slate-300">
          <Search size={48} className="text-slate-300 mb-4" />
          <h3 className="font-bold text-xl text-slate-700 mb-2">No Results Found</h3>
          <p className="text-sm text-slate-500 font-medium">Try changing your search keywords or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedHistory.map((exam) => (
              <div 
                key={exam.id}
                onClick={() => onReviewExam(exam.id)}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-900 hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                  <Activity size={24} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.subjectName}</p>
                      {getStatusBadge(exam.status)}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-neo-blue transition-colors line-clamp-1 mb-1">
                      {exam.examTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <span>Started: <span className="text-slate-700">{formatDate(exam.startedAt)}</span></span>
                      {exam.submittedAt && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">Submitted: <span className="text-slate-700">{formatDate(exam.submittedAt)}</span></span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 md:border-l-2 md:border-slate-200 md:pl-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-[10px] font-black text-slate-400 mb-0.5 tracking-widest">SCORE</p>
                      <div className="text-2xl font-black text-slate-900 flex items-baseline justify-center gap-1 group-hover:text-neo-purple transition-colors">
                        {exam.score != null ? exam.score : '-'}
                        <span className="text-xs font-bold text-slate-400">/ 10</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-200 group-hover:border-slate-900 group-hover:bg-neo-yellow flex items-center justify-center transition-all shrink-0">
                      <ChevronRight size={16} strokeWidth={3} className="text-slate-400 group-hover:text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 shadow-[2px_2px_0px_#0f172a] transition-all"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <span className="font-bold text-sm text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 shadow-[2px_2px_0px_#0f172a] transition-all"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
