import React, { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { apiFetch, apiFetchMultipart } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { PrintableExam } from '../components/PrintableExam'
import { 
  FolderOpen, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Download, 
  Move,
  ArrowLeft,
  X,
  PlusCircle,
  GripVertical,
  Printer
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

import { forwardRef } from 'react'

const QuestionCard = forwardRef<HTMLDivElement, any>(({ 
  q, 
  idx, 
  isMultiple, 
  meta, 
  isOverlay = false, 
  isDragging = false,
  dragListeners, 
  dragAttributes, 
  style,
  ...props
}, ref) => {
  return (
    <div 
      id={`question-${q.id}`}
      ref={ref} 
      style={style} 
      {...props}
      className={`bg-white neo-card p-5 group flex gap-4 relative ${
        isDragging 
          ? 'shadow-[16px_16px_0px_#0f172a] border-neo-blue ring-2 ring-neo-blue cursor-grabbing z-50 !transition-none' 
          : 'hover:shadow-[4px_4px_0px_#0f172a] transition-shadow duration-200'
      }`}
    >
      <div 
        {...dragAttributes} 
        {...dragListeners}
        className={`mt-1 touch-none text-slate-400 ${isDragging ? 'cursor-grabbing text-neo-blue' : 'cursor-grab hover:text-slate-800 transition-colors'}`}
      >
        <GripVertical className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h4 className="font-extrabold text-lg flex-1">
            <span className="text-neo-blue mr-2">Câu {idx + 1}:</span>
            {q.content}
          </h4>
          <span className={`text-xs font-black px-3 py-1 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] shrink-0 ${isMultiple ? 'bg-neo-yellow' : 'bg-neo-green text-white'}`}>
            {isMultiple ? 'Nhiều đáp án' : 'Một đáp án'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {(meta.options || []).map((opt: { id: number; text: string }) => {
            const isCorrect = meta.correctAnswers?.includes(opt.id)
            return (
              <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-colors ${isCorrect ? 'border-neo-green bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 ${isCorrect ? 'border-neo-green bg-neo-green text-white' : 'border-slate-300'}`}>
                  {isCorrect && <span className="text-sm font-black leading-none">✓</span>}
                </div>
                <span className={`font-bold text-sm ${isCorrect ? 'text-slate-900' : 'text-slate-600'}`}>
                  {opt.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
QuestionCard.displayName = 'QuestionCard'

const SortableQuestion = ({ q, idx, isMultiple, meta }: { q: Question, idx: number, isMultiple: boolean, meta: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: q.id })

  const style = {
    // CSS.Translate keeps sizes intact, no scaling
    transform: CSS.Translate.toString(transform),
    // Disable transition completely while dragging to prevent neo-card CSS transition from lagging the pointer tracking
    transition: isDragging ? undefined : transition,
    // Bring dragged item to front
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <QuestionCard
      q={q}
      idx={idx}
      isMultiple={isMultiple}
      meta={meta}
      isDragging={isDragging}
      dragListeners={listeners}
      dragAttributes={attributes}
      ref={setNodeRef}
      style={style}
    />
  )
}

export const QuestionBankPage: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)

  // Modal states
  const [isNewBankModalOpen, setIsNewBankModalOpen] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newBankDesc, setNewBankDesc] = useState('')
  const [newBankSubject, setNewBankSubject] = useState<number>(0)

  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false)
  const [newQContent, setNewQContent] = useState('')
  const [newQType, setNewQType] = useState('SINGLE')
  const [newQOptions, setNewQOptions] = useState([{ id: 1, text: '', isCorrect: false }])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const userId = useAuthStore(state => state.userId)

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
    loadBanks()
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

    const metadataObj = {
      options: newQOptions.map((o, idx) => ({ id: idx + 1, text: o.text })),
      correctAnswers: newQOptions.filter(o => o.isCorrect).map(o => {
        const index = newQOptions.findIndex(opt => opt.id === o.id);
        return index + 1;
      })
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Cần kéo ít nhất 5px mới kích hoạt, giúp không bị nhầm với click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Cập nhật lên backend
        if (selectedBank) {
          const updates = newItems.map((item, index) => ({
            id: item.id,
            orderIndex: index
          }))
          
          apiFetch(`/api/v1/questions/bank/${selectedBank.id}/reorder`, {
            method: 'PUT',
            body: JSON.stringify(updates)
          }).catch(err => console.error('Failed to reorder', err))
        }

        return newItems
      })
    }
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedBank) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng file vượt quá 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiFetchMultipart(`/api/v1/questions/bank/${selectedBank.id}/import`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        alert('Nhập danh sách câu hỏi thành công!')
        loadQuestions(selectedBank.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Lỗi nhập file Excel')
      }
    } catch {
      alert('Có lỗi xảy ra khi tải file')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleExportExcel = async () => {
    if (!selectedBank) return
    try {
      const res = await apiFetchMultipart(`/api/v1/questions/bank/${selectedBank.id}/export`, {
        method: 'GET'
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `questions_bank_${selectedBank.id}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Lỗi xuất file Excel')
      }
    } catch {
      alert('Có lỗi xảy ra khi xuất file')
    }
  }

  const handlePrintPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedBank ? `De_Thi_${selectedBank.title}` : 'De_Thi'
  })

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

  const getSubjectName = (subjectId: number) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Môn học ẩn'
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      {!selectedBank ? (
        // VIEW 1: BANK LIST
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-4 border-slate-900 pb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                <FolderOpen className="w-10 h-10 text-neo-purple" strokeWidth={2.5} />
                Ngân hàng Câu hỏi
              </h1>
              <p className="text-slate-500 font-bold mt-2">Quản lý và tổ chức các bộ đề thi theo từng môn học.</p>
            </div>
            <button
              onClick={() => setIsNewBankModalOpen(true)}
              className="px-6 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn flex items-center text-lg"
            >
              <Plus className="w-6 h-6 mr-2" strokeWidth={3} />
              Tạo Ngân hàng mới
            </button>
          </div>

          {banks.length === 0 ? (
            <div className="text-center py-20 border-4 border-dashed border-slate-300 rounded-2xl bg-white shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-800 mb-2">Chưa có ngân hàng nào</h3>
              <p className="text-slate-500 font-bold mb-6">Hãy tạo ngân hàng câu hỏi đầu tiên của bạn để bắt đầu soạn đề.</p>
              <button
                onClick={() => setIsNewBankModalOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Tạo ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {banks.map((bank, index) => {
                const colors = ['bg-neo-blue', 'bg-neo-green', 'bg-neo-coral', 'bg-neo-purple', 'bg-neo-yellow']
                const badgeColor = colors[index % colors.length]

                return (
                  <div key={bank.id} className="bg-white neo-card p-6 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#0f172a] transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white ${badgeColor}`}>
                          <FolderOpen className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-black px-2 py-1 bg-slate-100 border-2 border-slate-900 rounded-lg shadow-[1px_1px_0px_#0f172a]">
                          {getSubjectName(bank.subjectId)}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold mb-2 line-clamp-1">{bank.title}</h3>
                      <p className="text-sm font-bold text-slate-500 mb-6 line-clamp-2">{bank.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBank(bank)
                        loadQuestions(bank.id)
                      }}
                      className="w-full py-3 bg-slate-100 border-2 border-slate-900 rounded-xl font-black hover:bg-slate-900 hover:text-white transition-colors flex justify-center items-center gap-2 group"
                    >
                      <FileText className="w-4 h-4" />
                      Mở Ngân hàng
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        // VIEW 2: QUESTION LIST INSIDE A BANK
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 border-b-4 border-slate-900 pb-6 gap-4">
            <div>
              <button 
                onClick={() => setSelectedBank(null)}
                className="flex items-center text-slate-500 font-bold hover:text-neo-blue transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
              </button>
              <h2 className="text-3xl font-black flex items-center gap-2">
                <span className="text-neo-blue">{selectedBank.title}</span>
              </h2>
              <p className="text-slate-500 font-bold mt-1 text-sm">{selectedBank.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Import / Export / Add Controls */}
              <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 lg:flex-none px-4 py-2 bg-white text-slate-900 neo-btn text-sm flex items-center justify-center group"
                title="Nhập câu hỏi từ Excel"
              >
                <Upload className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                Import Excel
              </button>

              <button
                onClick={handleExportExcel}
                className="flex-1 lg:flex-none px-4 py-2 bg-white text-slate-900 neo-btn text-sm flex items-center justify-center group"
                title="Xuất câu hỏi ra Excel"
              >
                <Download className="w-4 h-4 mr-2 group-hover:translate-y-1 transition-transform" />
                Export Excel
              </button>

              <button
                onClick={() => handlePrintPdf()}
                className="flex-1 lg:flex-none px-4 py-2 bg-slate-900 text-white neo-btn text-sm flex items-center justify-center group"
                title="In đề thi ra PDF"
              >
                <Printer className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                In PDF
              </button>

              <button
                onClick={() => setIsNewQuestionModalOpen(true)}
                className="flex-1 lg:flex-none px-4 py-2 bg-neo-blue hover:bg-blue-600 text-white neo-btn text-sm flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-1" /> Thêm Câu hỏi
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              className="px-4 py-2 bg-slate-200 text-slate-400 neo-btn text-sm flex items-center cursor-not-allowed opacity-70"
              disabled
              title="Tính năng sẽ sớm ra mắt"
            >
              <FileText className="w-4 h-4 mr-2" /> In PDF (Coming Soon)
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext 
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {questions.map((q, index) => (
                  <SortableQuestion 
                    key={q.id} 
                    q={q} 
                    idx={index} 
                    isMultiple={q.type === 'MULTIPLE'} 
                    meta={typeof q.metadata === 'string' ? JSON.parse(q.metadata || '{}') : (q.metadata || {})}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Hidden component for printing */}
            <div className="hidden">
              <PrintableExam ref={printRef} bank={selectedBank} questions={questions} />
            </div>

            {questions.length === 0 && (
              <div className="text-center py-20 border-4 border-dashed border-slate-300 rounded-2xl bg-white shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">Chưa có câu hỏi nào</h3>
                <p className="text-slate-500 font-bold mb-6">Bắt đầu bằng cách thêm thủ công hoặc import từ file Excel.</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-colors shadow-[3px_3px_0px_#0f172a]">
                    Import Excel
                  </button>
                  <button onClick={() => setIsNewQuestionModalOpen(true)} className="px-6 py-3 bg-neo-blue text-white font-black rounded-xl hover:bg-blue-600 transition-colors shadow-[3px_3px_0px_#0f172a]">
                    Thêm thủ công
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* NEW BANK MODAL */}
      {isNewBankModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-page-enter">
          <div className="bg-white neo-card p-6 md:p-8 max-w-md w-full relative">
            <button
              onClick={() => setIsNewBankModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-100 hover:bg-neo-coral hover:text-white flex items-center justify-center font-bold transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <FolderOpen className="text-neo-purple" /> Tạo Ngân hàng
            </h3>
            <form onSubmit={handleCreateBank} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">MÔN HỌC</label>
                <select
                  value={newBankSubject}
                  onChange={e => setNewBankSubject(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] font-bold outline-none transition-all appearance-none"
                >
                  <option value={0}>-- Chọn môn học --</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">TÊN NGÂN HÀNG</label>
                <input
                  required
                  value={newBankName}
                  onChange={e => setNewBankName(e.target.value)}
                  placeholder="VD: Kiểm tra cuối kỳ Hóa..."
                  className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] font-bold outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">MÔ TẢ</label>
                <textarea
                  value={newBankDesc}
                  onChange={e => setNewBankDesc(e.target.value)}
                  placeholder="Tóm tắt về bộ đề này..."
                  className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] font-bold outline-none transition-all h-24 resize-none"
                />
              </div>
              <button type="submit" className="w-full mt-2 py-4 bg-neo-green hover:bg-neo-green-hover text-white text-lg neo-btn">Tạo mới</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW QUESTION MODAL */}
      {isNewQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-page-enter">
          <div className="bg-white neo-card p-6 md:p-8 max-w-2xl w-full relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsNewQuestionModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-100 hover:bg-neo-coral hover:text-white flex items-center justify-center font-bold transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2 shrink-0">
              <PlusCircle className="text-neo-blue" /> Thêm Câu hỏi
            </h3>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              <form id="question-form" onSubmit={handleCreateQuestion} className="flex flex-col gap-6 pb-2">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-2">NỘI DUNG CÂU HỎI</label>
                  <textarea
                    required
                    value={newQContent}
                    onChange={e => setNewQContent(e.target.value)}
                    placeholder="VD: Phương trình bậc 2 có dạng như thế nào?"
                    className="w-full px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] font-bold outline-none transition-all h-28 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-2">LOẠI CÂU HỎI</label>
                  <select
                    value={newQType}
                    onChange={e => setNewQType(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-3 text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[2px_2px_0px_#0f172a] font-bold outline-none transition-all appearance-none bg-white"
                  >
                    <option value="SINGLE">Trắc nghiệm 1 đáp án (Radio)</option>
                    <option value="MULTIPLE">Trắc nghiệm nhiều đáp án (Checkbox)</option>
                  </select>
                </div>

                <div className="border-t-4 border-slate-900 pt-6 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-black text-slate-800">CÁC ĐÁP ÁN (Tích chọn đáp án ĐÚNG)</label>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {newQOptions.filter(o => o.isCorrect).length} đúng
                    </span>
                  </div>

                  <div className="space-y-3">
                    {newQOptions.map((opt, idx) => (
                      <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${opt.isCorrect ? 'border-neo-green bg-green-50/50 shadow-[3px_3px_0px_#22c55e]' : 'border-slate-900 shadow-[3px_3px_0px_#0f172a]'}`}>
                        <input
                          type={newQType === 'SINGLE' ? 'radio' : 'checkbox'}
                          name="correct-answer"
                          checked={opt.isCorrect}
                          onChange={() => handleCorrectToggle(opt.id)}
                          className="w-6 h-6 accent-neo-green cursor-pointer shrink-0"
                        />
                        <input
                          required
                          value={opt.text}
                          onChange={e => handleOptionChange(opt.id, e.target.value)}
                          placeholder={`Nội dung đáp án ${idx + 1}`}
                          className="flex-1 px-3 py-2 text-sm bg-transparent border-b-2 border-transparent focus:border-slate-900 outline-none font-bold"
                        />
                        {newQOptions.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveOption(opt.id)} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handleAddOption} 
                    className="mt-4 px-4 py-2 border-2 border-dashed border-neo-blue text-neo-blue hover:bg-blue-50 rounded-xl font-bold text-sm flex items-center justify-center w-full transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Thêm lựa chọn
                  </button>
                </div>
              </form>
            </div>
            
            <div className="pt-6 mt-4 border-t-2 border-slate-100 shrink-0">
              <button 
                type="submit" 
                form="question-form"
                className="w-full py-4 bg-neo-blue hover:bg-blue-600 text-white text-lg neo-btn"
              >
                Lưu Câu Hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
