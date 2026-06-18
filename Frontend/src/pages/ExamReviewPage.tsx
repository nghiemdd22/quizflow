import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, FileText, Calendar, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'

interface QuestionReview {
  questionId: number
  type: string
  content: string
  metadata: any
  studentAnswer: any
  isCorrect: boolean
  scoreAchieved: number
}

interface ExamReview {
  submissionId: number
  examTitle: string
  subjectName: string
  score: number
  startedAt: string
  submittedAt: string
  status: string
  questions: QuestionReview[]
}

export const ExamReviewPage: React.FC = () => {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState<ExamReview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await apiFetch(`/api/v1/student/sessions/history/${submissionId}`)
        if (!response.ok) {
          throw new Error('Failed to load exam review')
        }
        const data = await response.json()
        setReview(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReview()
  }, [submissionId])

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

  const getSafeOptions = (metadata: any) => {
    if (!metadata) return []
    let meta = metadata
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta) } catch (e) { }
    }

    let opts = meta.options || meta.Options || meta.choices || meta.Choices || meta.answers
    if (typeof opts === 'string') {
      try { opts = JSON.parse(opts) } catch (e) { }
    }

    if (Array.isArray(opts)) {
      return opts.map((o: any, idx: number) => {
        if (typeof o === 'string') return { id: String(idx), content: o }
        if (typeof o === 'object' && o !== null) {
          return {
            id: o.id || o.key || String(idx),
            content: o.content || o.text || o.value || JSON.stringify(o)
          }
        }
        return { id: String(idx), content: String(o) }
      })
    }

    if (typeof opts === 'object' && opts !== null) {
      return Object.keys(opts).map(k => {
        const val = opts[k]
        return {
          id: k,
          content: typeof val === 'string' ? val : (val?.content || val?.text || JSON.stringify(val))
        }
      })
    }

    return []
  }

  const renderQuestionReview = (q: QuestionReview, index: number) => {
    const options = getSafeOptions(q.metadata)
    let rawAns = q.studentAnswer
    if (rawAns && typeof rawAns === 'object' && !Array.isArray(rawAns)) {
      rawAns = rawAns.selected !== undefined ? rawAns.selected : rawAns.answer !== undefined ? rawAns.answer : rawAns
    }

    let studentAnsArray: string[] = []
    if (Array.isArray(rawAns)) {
      studentAnsArray = rawAns.map(String)
    } else if (typeof rawAns === 'string') {
      try {
        const parsed = JSON.parse(rawAns)
        if (Array.isArray(parsed)) studentAnsArray = parsed.map(String)
        else studentAnsArray = [String(rawAns)]
      } catch (e) {
        studentAnsArray = [String(rawAns)]
      }
    } else if (rawAns != null) {
      studentAnsArray = [String(rawAns)]
    }

    // Try to extract correct answer
    let correctAnswers: string[] = []
    let meta = q.metadata
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta) } catch (e) {}
    }
    if (meta && (meta.correctAnswer !== undefined || meta.correctAnswers !== undefined || meta.CorrectAnswer !== undefined)) {
      let correct = meta.correctAnswer || meta.correctAnswers || meta.CorrectAnswer
      if (Array.isArray(correct)) {
        correctAnswers = correct.map(String)
      } else if (typeof correct === 'string') {
        try {
          const parsed = JSON.parse(correct)
          if (Array.isArray(parsed)) correctAnswers = parsed.map(String)
          else correctAnswers = [String(correct)]
        } catch (e) {
          correctAnswers = [String(correct)]
        }
      } else {
        correctAnswers = [String(correct)]
      }
    }

    const isCorrect = q.isCorrect === true
    const cardBorderColor = isCorrect ? 'border-neo-green' : 'border-rose-500'
    const cardBgColor = isCorrect ? 'bg-emerald-50' : 'bg-rose-50'
    const StatusIcon = isCorrect ? CheckCircle2 : XCircle
    const statusTextColor = isCorrect ? 'text-neo-green' : 'text-rose-500'

    return (
      <div key={q.questionId} className={`w-full bg-white neo-card border-4 ${cardBorderColor} p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 pointer-events-none ${cardBgColor}`}></div>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm ${isCorrect ? 'bg-neo-green' : 'bg-rose-500'} shadow-[2px_2px_0px_#0f172a]`}>
              {index + 1}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{q.type.replace('_', ' ')}</p>
              <h4 className="text-base font-extrabold text-slate-900">Score: {q.scoreAchieved != null ? q.scoreAchieved : 0} pts</h4>
            </div>
          </div>
          <div className={`flex flex-col items-center ${statusTextColor}`}>
            <StatusIcon size={28} strokeWidth={3} />
            <span className="text-[10px] font-black mt-1">{isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
          </div>
        </div>

        <div className="text-base font-bold text-slate-800 bg-slate-50 p-4 rounded-xl border-2 border-slate-200 shadow-inner">
          {q.content}
        </div>

        {/* Options / Answer rendering */}
        <div className="flex flex-col gap-3">
          {(q.type === 'SINGLE' || q.type === 'MULTIPLE' || q.type === 'TRUE_FALSE') ? (
            options.map((opt: any) => {
              const isSelected = studentAnsArray.includes(String(opt.id)) || studentAnsArray.includes(String(opt.content))
              const isActualCorrect = correctAnswers.includes(String(opt.id)) || correctAnswers.includes(String(opt.content))
              
              let optBorder = 'border-slate-200'
              let optBg = 'bg-white'
              let optText = 'text-slate-600'
              let indicator = null

              if (isSelected && isActualCorrect) {
                optBorder = 'border-neo-green'
                optBg = 'bg-emerald-100'
                optText = 'text-emerald-900 font-bold'
                indicator = <CheckCircle2 size={20} className="text-neo-green" />
              } else if (isSelected && !isActualCorrect) {
                optBorder = 'border-rose-500'
                optBg = 'bg-rose-100'
                optText = 'text-rose-900 font-bold'
                indicator = <XCircle size={20} className="text-rose-500" />
              } else if (!isSelected && isActualCorrect) {
                optBorder = 'border-neo-green border-dashed'
                optBg = 'bg-emerald-50'
                optText = 'text-emerald-800 font-bold'
                indicator = <CheckCircle2 size={20} className="text-emerald-500" />
              }

              return (
                <div key={opt.id} className={`flex items-center justify-between p-3 rounded-xl border-2 ${optBorder} ${optBg} transition-all`}>
                  <span className={`text-sm ${optText}`}>{opt.content}</span>
                  {indicator}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl border-2 border-slate-900 bg-slate-100 text-slate-800 font-bold text-sm">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Your Answer:</span>
                {studentAnsArray.length > 0 ? studentAnsArray.join(', ') : <span className="italic text-slate-400">No answer provided</span>}
              </div>
              {correctAnswers.length > 0 && !isCorrect && (
                <div className="p-3 rounded-xl border-2 border-neo-green bg-emerald-50 text-emerald-900 font-bold text-sm">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-600 block mb-1">Correct Answer:</span>
                  {correctAnswers.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-neo-blue rounded-full animate-spin mb-6"></div>
        <p className="font-bold text-slate-500 text-lg">Loading review data...</p>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="w-full min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white neo-card border-4 border-rose-500 p-8 md:p-12 flex flex-col items-center text-center">
          <XCircle size={48} className="text-rose-500 mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-4">Error Loading Review</h1>
          <p className="text-slate-600 font-bold mb-8">{error || "Unknown error"}</p>
          <button 
            onClick={() => navigate('/exam-history')}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow-[4px_4px_0px_#0f172a] transition-all"
          >
            GO BACK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/exam-history')}
          className="w-fit mb-6 flex items-center gap-2 text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back to History
        </button>

        {/* Header Card */}
        <div className="bg-white neo-card p-5 md:p-8 mb-6 border-4 border-slate-900 shadow-[6px_6px_0px_#0f172a] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-slate-100 rotate-12 pointer-events-none">
            <Target size={160} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
              <div className="inline-block px-2 py-1 bg-neo-yellow text-slate-900 border-2 border-slate-900 rounded-lg text-[10px] font-black shadow-[2px_2px_0px_#0f172a] mb-3 uppercase">
                {review.subjectName}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">
                {review.examTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border-2 border-slate-200">
                  <Calendar size={14} /> Submitted: {formatDate(review.submittedAt)}
                </span>
              </div>
            </div>
            
            <div className="bg-neo-purple text-white p-4 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] text-center min-w-[120px]">
              <p className="text-[10px] font-black text-purple-200 mb-0.5 tracking-widest">FINAL SCORE</p>
              <div className="text-4xl font-black flex items-baseline justify-center gap-1">
                {review.score != null ? review.score : '-'}
                <span className="text-lg text-purple-200">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2">
            <FileText size={24} className="text-neo-blue" />
            Detailed Review
          </h2>
          
          {review.questions && review.questions.length > 0 ? (
            (() => {
              const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
              const paginatedQuestions = review.questions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
              const totalPages = Math.ceil(review.questions.length / ITEMS_PER_PAGE)

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedQuestions.map((q, index) => renderQuestionReview(q, startIndex + index))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center items-center gap-4">
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
              )
            })()
          ) : (
            <div className="bg-white neo-card p-10 text-center font-bold text-slate-500">
              No detailed questions available for this exam.
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate('/exam-history')}
            className="px-8 py-3 bg-neo-blue hover:bg-blue-600 text-white border-2 border-slate-900 rounded-xl font-black text-base shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
          >
            FINISH REVIEW
          </button>
        </div>
      </div>
    </div>
  )
}
