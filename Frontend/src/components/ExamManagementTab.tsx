import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

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

export const ExamManagementTab: React.FC<{ subjects: Subject[], banks: QuestionBank[] }> = ({ subjects, banks }) => {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [sessions, setSessions] = useState<ExamSession[]>([])

  // Modals
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false)
  const [newExamTitle, setNewExamTitle] = useState('')
  const [newExamDesc, setNewExamDesc] = useState('')
  const [newExamSubject, setNewExamSubject] = useState(subjects[0]?.id || 0)

  const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false)
  const [selectedBankId, setSelectedBankId] = useState<number>(banks[0]?.id || 0)
  const [bankQuestions, setBankQuestions] = useState<Question[]>([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])

  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(45)

  /**
   * Gọi API lấy toàn bộ danh sách đề thi của giáo viên hiện tại
   */
  const loadExams = async () => {
    try {
      const res = await apiFetch('/api/v1/exams')
      if (res.ok) setExams(await res.json())
    } catch {
      console.error('Lỗi tải đề thi')
    }
  }

  /**
   * Gọi API lấy danh sách ca thi tương ứng với một đề thi được chọn
   */
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
    loadExams()
  }, [])

  useEffect(() => {
    if (isAddQuestionsModalOpen && selectedBankId) {
      loadQuestionsFromBank(selectedBankId)
    }
  }, [selectedBankId, isAddQuestionsModalOpen])

  /**
   * Xử lý submit form Tạo Đề thi mới
   */
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
        alert('Tạo đề thi thành công!')
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

  /**
   * Xử lý gửi mảng ID các câu hỏi được tích chọn lên server để gắn vào đề thi
   */
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

  /**
   * Xử lý submit form Mở Ca thi
   * Sẽ nhận lại mã PIN ngẫu nhiên từ server
   */
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
        const data = await res.json()
        alert(`Tạo ca thi thành công!\nMÃ PIN PHÒNG THI LÀ: ${data.pinCode}`)
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

  return (
    <div>
      {!selectedExam ? (
        // EXAM LIST VIEW
        <div>
          <div className="flex justify-between items-center mb-6 border-b-4 border-slate-900 pb-4">
            <h2 className="text-2xl font-black">Danh sách Đề thi</h2>
            <button
              onClick={() => setIsNewExamModalOpen(true)}
              className="px-4 py-2 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-sm"
            >
              + Tạo Đề thi mới
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white neo-card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold mb-2">{exam.title}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-2">Môn: {exam.subjectName}</p>
                  <span className={`text-[10px] font-black px-2 py-1 border border-slate-900 rounded ${exam.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {exam.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedExam(exam)
                    loadSessions(exam.id)
                  }}
                  className="w-full py-2 bg-neo-blue hover:bg-blue-600 text-white neo-btn text-xs mt-4"
                >
                  Quản lý Ca thi
                </button>
              </div>
            ))}
            {exams.length === 0 && (
              <div className="col-span-3 text-center py-10 bg-slate-50 border-4 border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 font-bold">Chưa có đề thi nào.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // EXAM SESSION LIST VIEW
        <div>
          <div className="flex justify-between items-center mb-6 border-b-4 border-slate-900 pb-4">
            <div>
              <h2 className="text-2xl font-black">Đề thi: {selectedExam.title}</h2>
              <button onClick={() => setSelectedExam(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 mt-1">← Quay lại danh sách đề thi</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddQuestionsModalOpen(true)}
                className="px-4 py-2 bg-neo-blue hover:bg-blue-600 text-white neo-btn text-sm"
              >
                + Thêm câu hỏi
              </button>
              <button
                onClick={() => setIsNewSessionModalOpen(true)}
                className="px-4 py-2 bg-neo-purple hover:bg-purple-600 text-white neo-btn text-sm"
              >
                + Mở Ca thi (Tạo PIN)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sessions.map(session => (
              <div key={session.id} className="bg-[#fdf0d5] border-4 border-slate-900 shadow-[8px_8px_0px_#0f172a] rounded-xl p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-neo-green rounded-full border-4 border-slate-900 flex items-center justify-center transform rotate-12">
                  <span className="text-white font-black text-2xl mt-8 -ml-4">{session.durationMinutes}p</span>
                </div>
                <h3 className="text-2xl font-black mb-1 pr-16">{session.title}</h3>
                <p className="text-sm font-bold text-slate-600 mb-4">
                  {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                </p>
                <div className="mt-4 inline-block bg-white border-2 border-slate-900 rounded-xl px-4 py-2">
                  <span className="text-xs font-black text-slate-500 block mb-1">MÃ PIN PHÒNG THI:</span>
                  <span className="text-4xl font-black tracking-widest text-neo-blue">{session.pinCode}</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="col-span-2 text-center py-10 bg-slate-50 border-4 border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 font-bold">Đề thi này chưa mở ca thi nào.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TẠO ĐỀ THI */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neo-bg neo-card p-6 md:p-8 max-w-md w-full relative">
            <button onClick={() => setIsNewExamModalOpen(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold">✕</button>
            <h3 className="text-xl font-black mb-6">Tạo Đề thi</h3>
            <form onSubmit={handleCreateExam} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">MÔN HỌC</label>
                <select value={newExamSubject} onChange={e => setNewExamSubject(Number(e.target.value))} className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold">
                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">TIÊU ĐỀ</label>
                <input required value={newExamTitle} onChange={e => setNewExamTitle(e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold" />
              </div>
              <button type="submit" className="w-full mt-2 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn">Tạo mới</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM CÂU HỎI VÀO ĐỀ */}
      {isAddQuestionsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neo-bg neo-card p-6 md:p-8 max-w-3xl w-full relative h-[80vh] flex flex-col">
            <button onClick={() => setIsAddQuestionsModalOpen(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold">✕</button>
            <h3 className="text-xl font-black mb-4">Thêm câu hỏi vào đề thi</h3>
            <div className="mb-4">
              <label className="block text-xs font-black text-slate-800 mb-1">CHỌN NGÂN HÀNG NGUỒN</label>
              <select value={selectedBankId} onChange={e => setSelectedBankId(Number(e.target.value))} className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold">
                {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.title}</option>)}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto border-2 border-slate-900 rounded-xl bg-white p-4 space-y-2">
              {bankQuestions.map(q => (
                <label key={q.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(q.id)}
                    onChange={() => toggleQuestionSelection(q.id)}
                    className="mt-1 w-4 h-4 accent-neo-blue"
                  />
                  <span className="text-sm font-bold">{q.content}</span>
                </label>
              ))}
              {bankQuestions.length === 0 && <p className="text-center text-sm font-bold text-slate-500 py-4">Ngân hàng này không có câu hỏi.</p>}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold text-sm">Đã chọn: {selectedQuestionIds.length} câu</span>
              <button onClick={handleAddQuestions} className="px-6 py-3 bg-neo-blue hover:bg-blue-600 text-white neo-btn">
                Thêm vào đề thi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO CA THI */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neo-bg neo-card p-6 md:p-8 max-w-md w-full relative">
            <button onClick={() => setIsNewSessionModalOpen(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold">✕</button>
            <h3 className="text-xl font-black mb-6">Mở Ca thi mới</h3>
            <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">TÊN CA THI</label>
                <input required value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} placeholder="Ví dụ: Thi cuối kỳ K66" className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">BẮT ĐẦU</label>
                  <input required type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-2 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">KẾT THÚC</label>
                  <input required type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-2 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">THỜI GIAN LÀM BÀI (PHÚT)</label>
                <input required type="number" min={1} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold" />
              </div>
              <button type="submit" className="w-full mt-2 py-3 bg-neo-purple hover:bg-purple-600 text-white neo-btn">Khởi tạo Ca thi (Sinh PIN)</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
