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
  description: string
  subjectId: number
}

interface Question {
  id: number
  questionBankId: number
  content: string
  type: string
  metadata: any
}

export const TeacherDashboard: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Modal states
  const [isNewBankModalOpen, setIsNewBankModalOpen] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newBankDesc, setNewBankDesc] = useState('')
  const [newBankSubject, setNewBankSubject] = useState<number>(0)

  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false)
  const [newQContent, setNewQContent] = useState('')
  const [newQType, setNewQType] = useState('SINGLE')
  const [newQOptions, setNewQOptions] = useState([{ id: 1, text: '', isCorrect: false }])

  const userId = Number(localStorage.getItem('userId'))

  const loadBanks = React.useCallback(async () => {
    try {
      const res = await apiFetch(`/api/v1/question-banks/teacher/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setBanks(data)
      }
    } catch {
      console.error('Error loading banks')
    }
  }, [userId])

  const loadSubjects = React.useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/subjects')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data)
        if (data.length > 0) setNewBankSubject(data[0].id)
      }
    } catch {
      console.error('Error loading subjects')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBanks()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubjects()
  }, [loadBanks, loadSubjects])

  const loadQuestions = async (bankId: number) => {
    try {
      const res = await apiFetch(`/api/v1/questions/bank/${bankId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
    } catch {
      console.error('Error loading questions')
    }
  }

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBankSubject) return alert('Vui lòng chọn môn học')

    try {
      const res = await apiFetch('/api/v1/question-banks', {
        method: 'POST',
        body: JSON.stringify({
          title: newBankName,
          description: newBankDesc,
          subjectId: newBankSubject
        })
      })
      if (res.ok) {
        alert('Tạo Ngân hàng câu hỏi thành công!')
        setIsNewBankModalOpen(false)
        setNewBankName('')
        setNewBankDesc('')
        loadBanks()
      } else {
        const data = await res.json()
        alert(data.error || 'Lỗi tạo ngân hàng')
      }
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBank) return

    // Build metadata
    const metadataObj = {
      options: newQOptions.map(o => ({ id: o.id, text: o.text })),
      correctAnswers: newQOptions.filter(o => o.isCorrect).map(o => o.id)
    }

    try {
      const res = await apiFetch('/api/v1/questions', {
        method: 'POST',
        body: JSON.stringify({
          questionBankId: selectedBank.id,
          content: newQContent,
          type: newQType,
          metadata: metadataObj
        })
      })
      if (res.ok) {
        alert('Thêm câu hỏi thành công!')
        setIsNewQuestionModalOpen(false)
        setNewQContent('')
        setNewQOptions([{ id: 1, text: '', isCorrect: false }])
        loadQuestions(selectedBank.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Lỗi thêm câu hỏi')
      }
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  const handleOptionChange = (id: number, text: string) => {
    setNewQOptions(opts => opts.map(o => o.id === id ? { ...o, text } : o))
  }

  const handleCorrectToggle = (id: number) => {
    if (newQType === 'SINGLE') {
      setNewQOptions(opts => opts.map(o => ({ ...o, isCorrect: o.id === id })))
    } else {
      setNewQOptions(opts => opts.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o))
    }
  }

  const handleAddOption = () => {
    setNewQOptions(opts => [...opts, { id: Date.now(), text: '', isCorrect: false }])
  }

  const handleRemoveOption = (id: number) => {
    setNewQOptions(opts => opts.filter(o => o.id !== id))
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 text-left">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Teacher Dashboard</h1>
          <p className="text-sm text-slate-600 font-bold">Quản lý Ngân hàng câu hỏi & Đề thi</p>
        </div>
        {selectedBank && (
          <button
            onClick={() => setSelectedBank(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 neo-btn text-xs"
          >
            ← Quay lại danh sách
          </button>
        )}
      </div>

      {!selectedBank ? (
        // BANK LIST VIEW
        <div>
          <div className="flex justify-between items-center mb-6 border-b-4 border-slate-900 pb-4">
            <h2 className="text-2xl font-black">Ngân hàng câu hỏi của tôi</h2>
            <button
              onClick={() => setIsNewBankModalOpen(true)}
              className="px-4 py-2 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-sm"
            >
              + Tạo Ngân hàng mới
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {banks.map(bank => (
              <div key={bank.id} className="bg-white neo-card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold mb-2">{bank.title}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-4">{bank.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBank(bank)
                    loadQuestions(bank.id)
                  }}
                  className="w-full py-2 bg-neo-blue hover:bg-blue-600 text-white neo-btn text-xs mt-4"
                >
                  Quản lý Câu hỏi
                </button>
              </div>
            ))}
            {banks.length === 0 && (
              <div className="col-span-3 text-center py-10 bg-slate-50 border-4 border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 font-bold">Bạn chưa tạo ngân hàng câu hỏi nào.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // QUESTION LIST VIEW
        <div>
          <div className="flex justify-between items-center mb-6 border-b-4 border-slate-900 pb-4">
            <div>
              <h2 className="text-2xl font-black">Ngân hàng: {selectedBank.title}</h2>
              <p className="text-xs font-bold text-slate-500">{selectedBank.description}</p>
            </div>
            <button
              onClick={() => setIsNewQuestionModalOpen(true)}
              className="px-4 py-2 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-sm"
            >
              + Thêm Câu hỏi
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => {
              const meta = typeof q.metadata === 'string' ? JSON.parse(q.metadata || '{}') : (q.metadata || {})
              return (
                <div key={q.id} className="bg-white neo-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-extrabold text-sm">Câu {idx + 1}: {q.content}</h4>
                    <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-1 border border-slate-900 rounded">
                      {q.type}
                    </span>
                  </div>
                  <ul className="text-xs font-semibold text-slate-600 mt-2 space-y-1">
                    {(meta.options || []).map((opt: { id: number; text: string }) => (
                      <li key={opt.id} className="flex items-center gap-2">
                        <span>{meta.correctAnswers?.includes(opt.id) ? '✅' : '⬜'}</span>
                        {opt.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {questions.length === 0 && (
              <div className="text-center py-10 bg-slate-50 border-4 border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 font-bold">Ngân hàng này chưa có câu hỏi nào.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW BANK MODAL */}
      {isNewBankModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfbf8] neo-card p-6 md:p-8 max-w-md w-full relative">
            <button
              onClick={() => setIsNewBankModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold"
            >✕</button>
            <h3 className="text-xl font-black mb-6">Tạo Ngân hàng câu hỏi</h3>
            <form onSubmit={handleCreateBank} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">MÔN HỌC</label>
                <select
                  value={newBankSubject}
                  onChange={e => setNewBankSubject(Number(e.target.value))}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] font-bold"
                >
                  <option value={0}>-- Chọn môn học --</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">TÊN NGÂN HÀNG</label>
                <input
                  required
                  value={newBankName}
                  onChange={e => setNewBankName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">MÔ TẢ</label>
                <textarea
                  value={newBankDesc}
                  onChange={e => setNewBankDesc(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] font-bold h-24"
                />
              </div>
              <button type="submit" className="w-full mt-2 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn">Tạo mới</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW QUESTION MODAL */}
      {isNewQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfbf8] neo-card p-6 md:p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewQuestionModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold"
            >✕</button>
            <h3 className="text-xl font-black mb-6">Thêm Câu hỏi mới</h3>
            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">NỘI DUNG CÂU HỎI</label>
                <textarea
                  required
                  value={newQContent}
                  onChange={e => setNewQContent(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] font-bold h-24"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">LOẠI CÂU HỎI</label>
                  <select
                    value={newQType}
                    onChange={e => setNewQType(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] font-bold"
                  >
                    <option value="SINGLE">Trắc nghiệm 1 đáp án</option>
                    <option value="MULTIPLE">Trắc nghiệm nhiều đáp án</option>
                  </select>
                </div>
              </div>

              <div className="border-t-2 border-slate-200 mt-2 pt-4">
                <label className="block text-xs font-black text-slate-800 mb-2">ĐÁP ÁN (Tích chọn đáp án đúng)</label>
                {newQOptions.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2 mb-2">
                    <input
                      type={newQType === 'SINGLE' ? 'radio' : 'checkbox'}
                      name="correct-answer"
                      checked={opt.isCorrect}
                      onChange={() => handleCorrectToggle(opt.id)}
                      className="w-5 h-5 accent-neo-green cursor-pointer"
                    />
                    <input
                      required
                      value={opt.text}
                      onChange={e => handleOptionChange(opt.id, e.target.value)}
                      placeholder={`Đáp án ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 text-sm border-2 border-slate-900 rounded shadow-[1px_1px_0px_#0f172a] font-bold"
                    />
                    {newQOptions.length > 1 && (
                      <button type="button" onClick={() => handleRemoveOption(opt.id)} className="text-red-500 font-bold px-2">X</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddOption} className="text-xs font-bold text-neo-blue mt-2">+ Thêm lựa chọn</button>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn">Lưu câu hỏi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
