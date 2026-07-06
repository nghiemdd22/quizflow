import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { 
  FileText, 
  Plus, 
  PlayCircle, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  X,
  BookOpen
} from 'lucide-react'

interface Subject {
  id: number
  name: string
  code: string
}

interface QuestionBank {
  id: number
  title: string
}

interface Exam {
  id: number
  title: string
  subjectId: number
  subjectName: string
  status: string
}

interface ExamSession {
  id: number
  title: string
  pinCode: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: string
}

interface Question {
  id: number
  content: string
  type: string
}

export const ExamSessionsPage: React.FC = () => {
  const userId = useAuthStore(state => state.userId)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [banks, setBanks] = useState<QuestionBank[]>([])

  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [sessions, setSessions] = useState<ExamSession[]>([])

  // UI state for copy PIN
  const [copiedPin, setCopiedPin] = useState<string | null>(null)

  // Modals
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false)
  const [newExamTitle, setNewExamTitle] = useState('')
  const [newExamDesc, setNewExamDesc] = useState('')
  const [newExamSubject, setNewExamSubject] = useState(0)

  const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false)
  const [selectedBankId, setSelectedBankId] = useState<number>(0)
  const [bankQuestions, setBankQuestions] = useState<Question[]>([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])

  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(45)

  const loadDependencies = React.useCallback(async () => {
    try {
      const subRes = await apiFetch('/api/v1/subjects')
      if (subRes.ok) {
        const subs = await subRes.json()
        setSubjects(subs)
        if (subs.length > 0) setNewExamSubject(subs[0].id)
      }

      const bankRes = await apiFetch(`/api/v1/question-banks/teacher/${userId}`)
      if (bankRes.ok) {
        const bnks = await bankRes.json()
        setBanks(bnks)
        if (bnks.length > 0) setSelectedBankId(bnks[0].id)
      }
    } catch {
      console.error('Lỗi tải dữ liệu cơ sở')
    }
  }, [userId])

  const loadExams = async () => {
    try {
      const res = await apiFetch('/api/v1/exams')
      if (res.ok) setExams(await res.json())
    } catch {
      console.error('Lỗi tải đề thi')
    }
  }

  const loadSessions = async (examId: number) => {
    try {
      const res = await apiFetch(`/api/v1/exams/${examId}/sessions`)
      if (res.ok) setSessions(await res.json())
    } catch {
      console.error('Lỗi tải ca thi')
    }
  }

  const loadQuestionsFromBank = async (bankId: number) => {
    try {
      const res = await apiFetch(`/api/v1/questions/bank/${bankId}`)
      if (res.ok) setBankQuestions(await res.json())
    } catch {
      console.error('Lỗi tải câu hỏi')
    }
  }

  useEffect(() => {
    loadDependencies()
    loadExams()
  }, [loadDependencies])

  useEffect(() => {
    if (isAddQuestionsModalOpen && selectedBankId) {
      loadQuestionsFromBank(selectedBankId)
    }
  }, [selectedBankId, isAddQuestionsModalOpen])

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamSubject) return alert('Vui lòng chọn môn học')
    try {
      const res = await apiFetch('/api/v1/exams', {
        method: 'POST',
        body: JSON.stringify({
          title: newExamTitle,
          description: newExamDesc,
          subjectId: newExamSubject
        })
      })
      if (res.ok) {
        setIsNewExamModalOpen(false)
        setNewExamTitle('')
        setNewExamDesc('')
        loadExams()
      } else {
        alert('Lỗi tạo đề thi')
      }
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  const handleAddQuestions = async () => {
    if (!selectedExam || selectedQuestionIds.length === 0) return alert('Chưa chọn câu hỏi')
    try {
      const res = await apiFetch(`/api/v1/exams/${selectedExam.id}/questions`, {
        method: 'POST',
        body: JSON.stringify({ questionIds: selectedQuestionIds })
      })
      if (res.ok) {
        alert('Đã thêm các câu hỏi vào đề thi!')
        setIsAddQuestionsModalOpen(false)
        setSelectedQuestionIds([])
      } else {
        const text = await res.text()
        alert(text || 'Lỗi thêm câu hỏi')
      }
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExam) return
    try {
      const res = await apiFetch(`/api/v1/exams/${selectedExam.id}/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          title: sessionTitle,
          startTime: startTime.length === 16 ? startTime + ":00" : startTime,
          endTime: endTime.length === 16 ? endTime + ":00" : endTime,
          durationMinutes
        })
      })
      if (res.ok) {
        setIsNewSessionModalOpen(false)
        loadSessions(selectedExam.id)
      } else {
        alert('Lỗi tạo ca thi')
      }
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  const toggleQuestionSelection = (id: number) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    )
  }

  const copyToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin)
    setCopiedPin(pin)
    setTimeout(() => setCopiedPin(null), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      {!selectedExam ? (
        // EXAM LIST VIEW
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                <FileText className="w-10 h-10 text-neo-blue" strokeWidth={2.5} />
                Danh sách Đề thi
              </h1>
              <p className="text-slate-500 font-bold mt-2">Nơi bạn tổng hợp các câu hỏi thành các bộ đề hoàn chỉnh.</p>
            </div>
            <button
              onClick={() => setIsNewExamModalOpen(true)}
              className="px-6 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn flex items-center text-lg"
            >
              <Plus className="w-6 h-6 mr-2" strokeWidth={3} />
              Tạo Đề thi mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white neo-card p-4 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#0f172a] transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-neo-blue">
                      <FileText className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className={`shrink-0 text-[10px] font-black px-2 py-1 border-2 border-slate-900 rounded-lg shadow-[1px_1px_0px_#0f172a] ${exam.status === 'DRAFT' ? 'bg-neo-yellow text-slate-900' : 'bg-neo-green text-white'}`}>
                      {exam.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold mb-1 line-clamp-1">{exam.title}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-4 line-clamp-1">Môn: {exam.subjectName}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedExam(exam)
                    loadSessions(exam.id)
                  }}
                  className="w-full py-2 text-sm bg-slate-100 border-2 border-slate-900 rounded-xl font-black hover:bg-slate-900 hover:text-white transition-colors flex justify-center items-center gap-2 group"
                >
                  <FileText className="w-4 h-4" />
                  Quản lý Đề thi
                </button>
              </div>
            ))}
            {exams.length === 0 && (
              <div className="col-span-full text-center py-20 border-4 border-dashed border-slate-300 rounded-2xl bg-white shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">Chưa có đề thi nào</h3>
                <p className="text-slate-500 font-bold mb-6">Tạo một đề thi mới bằng cách lấy các câu hỏi từ ngân hàng.</p>
                <button
                  onClick={() => setIsNewExamModalOpen(true)}
                  className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Tạo ngay
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        // EXAM SESSION LIST VIEW
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
              <button onClick={() => setSelectedExam(null)} className="flex items-center text-slate-500 font-bold hover:text-neo-blue transition-colors mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách đề thi
              </button>
              <h2 className="text-3xl font-black flex items-center gap-2">
                <span className="text-neo-blue">{selectedExam.title}</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button
                onClick={() => setIsAddQuestionsModalOpen(true)}
                className="flex-1 lg:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 neo-btn text-sm flex items-center justify-center font-black"
              >
                <Plus className="w-5 h-5 mr-1" /> Thêm câu hỏi
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sessions.map(session => (
              <div key={session.id} className="bg-neo-yellow border-4 border-slate-900 shadow-[8px_8px_0px_#0f172a] rounded-2xl p-6 relative overflow-hidden transition-transform hover:-translate-y-1">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-neo-green rounded-full border-4 border-slate-900 flex items-center justify-center transform rotate-12 shadow-[2px_2px_0px_#0f172a]">
                  <span className="text-white font-black text-xl mt-4 -ml-2">{session.durationMinutes}p</span>
                </div>
                
                <h3 className="text-2xl font-black mb-2 pr-12 text-slate-900">{session.title}</h3>
                
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-white/50 w-fit px-3 py-1 rounded-lg border-2 border-slate-900 mb-6">
                  <Clock className="w-4 h-4" />
                  {new Date(session.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} - {new Date(session.endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </div>

                <div className="bg-white border-4 border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center relative shadow-[4px_4px_0px_#0f172a]">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">MÃ PIN PHÒNG THI</span>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black tracking-[0.2em] text-neo-blue ml-2">{session.pinCode}</span>
                    <button 
                      onClick={() => copyToClipboard(session.pinCode)}
                      className={`p-2 rounded-lg border-2 border-slate-900 transition-colors ${copiedPin === session.pinCode ? 'bg-neo-green text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      title="Sao chép mã PIN"
                    >
                      {copiedPin === session.pinCode ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="col-span-full text-center py-20 border-4 border-dashed border-slate-300 rounded-2xl bg-white shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                <PlayCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">Đề thi này chưa có ca thi nào</h3>
                <p className="text-slate-500 font-bold mb-6">Hãy tạo một ca thi và nhận mã PIN để học sinh bắt đầu làm bài.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL TẠO ĐỀ THI */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-page-enter">
          <div className="bg-white neo-card p-6 md:p-8 max-w-md w-full relative">
            <button onClick={() => setIsNewExamModalOpen(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-100 hover:bg-neo-coral hover:text-white flex items-center justify-center font-bold transition-colors"><X className="w-4 h-4" /></button>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-900"><FileText className="text-neo-blue" /> Tạo Đề thi</h3>
            <form onSubmit={handleCreateExam} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">MÔN HỌC</label>
                <select value={newExamSubject} onChange={e => setNewExamSubject(Number(e.target.value))} className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] font-bold outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] transition-all">
                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">TIÊU ĐỀ</label>
                <input required value={newExamTitle} onChange={e => setNewExamTitle(e.target.value)} placeholder="Nhập tên đề thi..." className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] font-bold outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] transition-all" />
              </div>
              <button type="submit" className="w-full mt-2 py-4 bg-neo-green hover:bg-neo-green-hover text-white text-lg neo-btn">Tạo mới</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM CÂU HỎI VÀO ĐỀ */}
      {isAddQuestionsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-page-enter">
          <div className="bg-white neo-card p-6 md:p-8 max-w-3xl w-full relative h-[85vh] flex flex-col">
            <button onClick={() => setIsAddQuestionsModalOpen(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-100 hover:bg-neo-coral hover:text-white flex items-center justify-center font-bold transition-colors z-10"><X className="w-4 h-4" /></button>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2 shrink-0"><BookOpen className="text-neo-purple" /> Thêm câu hỏi vào đề thi</h3>
            
            <div className="mb-4 shrink-0">
              <label className="block text-xs font-black text-slate-800 mb-2">CHỌN NGÂN HÀNG NGUỒN</label>
              <select value={selectedBankId} onChange={e => setSelectedBankId(Number(e.target.value))} className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] font-bold outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] transition-all">
                <option value={0}>-- Chọn ngân hàng --</option>
                {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.title}</option>)}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto border-4 border-slate-900 rounded-xl bg-slate-50 p-4 space-y-3 custom-scrollbar">
              {bankQuestions.map(q => {
                const isSelected = selectedQuestionIds.includes(q.id)
                return (
                  <label key={q.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-neo-blue bg-blue-50 shadow-[2px_2px_0px_#3b82f6]' : 'border-slate-300 bg-white hover:border-slate-900'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuestionSelection(q.id)}
                      className="mt-1 w-5 h-5 accent-neo-blue shrink-0"
                    />
                    <span className={`text-sm font-bold ${isSelected ? 'text-neo-blue' : 'text-slate-700'}`}>{q.content}</span>
                  </label>
                )
              })}
              {bankQuestions.length === 0 && selectedBankId !== 0 && <p className="text-center text-lg font-bold text-slate-500 py-10">Ngân hàng này chưa có câu hỏi.</p>}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 pt-4 border-t-2 border-slate-100">
              <span className="font-black text-lg bg-slate-100 px-4 py-2 rounded-lg border-2 border-slate-900">
                Đã chọn: <span className="text-neo-blue">{selectedQuestionIds.length}</span> câu
              </span>
              <button onClick={handleAddQuestions} className="w-full sm:w-auto px-8 py-3 bg-neo-blue hover:bg-blue-600 text-white font-black neo-btn text-lg">
                Xác nhận Thêm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
