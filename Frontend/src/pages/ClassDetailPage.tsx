import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Plus, Users, Hash, FileText, Download, Upload, File as FileIcon, Image as ImageIcon } from 'lucide-react'
import { apiFetch, apiFetchMultipart } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/Navbar'
import { ClassChatBox } from '../components/ClassChatBox'

interface ExamSession {
  id: number
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: string
}

interface Exam {
  id: number
  title: string
}

interface ClassDocument {
  id: number
  fileName: string
  fileUrl: string
  format: string
  sizeBytes: number
  uploadedAt: string
  uploaderName: string
}

interface ClassroomDetail {
  id: number
  name: string
  code: string
  teacherName: string
  memberCount: number
  unreadMessageCount?: number
}

export const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const { userRole } = useAuthStore()

  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null)
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [documents, setDocuments] = useState<ClassDocument[]>([])

  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [selectedExamId, setSelectedExamId] = useState<number>(0)

  const [sessionPage, setSessionPage] = useState(1)
  const sessionsPerPage = 4

  useEffect(() => {
    loadClassroom()
    loadSessions()
    loadDocuments()
    if (userRole === 'TEACHER') {
      loadExams()
    }
  }, [classId])

  const loadClassroom = async () => {
    try {
      const res = await apiFetch('/api/v1/classes/me')
      if (res.ok) {
        const classes: ClassroomDetail[] = await res.json()
        const current = classes.find(c => c.id === Number(classId))
        if (current) setClassroom(current)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadSessions = async () => {
    try {
      const res = await apiFetch(`/api/v1/classes/${classId}/sessions`)
      if (res.ok) {
        setSessions(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadDocuments = async () => {
    try {
      const res = await apiFetch(`/api/v1/classes/${classId}/documents`)
      if (res.ok) {
        setDocuments(await res.json())
      }
    } catch (e) {
      console.error('Failed to load documents', e)
    }
  }

  const loadExams = async () => {
    try {
      const res = await apiFetch('/api/v1/exams')
      if (res.ok) {
        const data = await res.json()
        setExams(data)
        if (data.length > 0) setSelectedExamId(data[0].id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExamId) return alert('Vui lòng chọn đề thi')
    try {
      const res = await apiFetch(`/api/v1/exams/${selectedExamId}/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          title: sessionTitle,
          classId: Number(classId),
          startTime: startTime.length === 16 ? startTime + ":00" : startTime,
          endTime: endTime.length === 16 ? endTime + ":00" : endTime,
          durationMinutes
        })
      })
      if (res.ok) {
        setIsNewSessionModalOpen(false)
        loadSessions()
        alert('Tạo ca thi thành công!')
      } else {
        alert('Lỗi tạo ca thi')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  const handleJoinExam = async (sessionId: number) => {
    try {
      const response = await apiFetch(`/api/v1/student/sessions/${sessionId}/join`, {
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'Lỗi vào phòng thi')
        return
      }
      const data = await response.json()
      navigate('/exam-room', { state: { examRoomData: data } })
    } catch (err) {
      alert('Lỗi kết nối máy chủ')
    }
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return alert('Vui lòng chọn file')

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)

      const res = await apiFetchMultipart(`/api/v1/classes/${classId}/documents`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setIsUploadModalOpen(false)
        setUploadFile(null)
        loadDocuments()
        alert('Tải lên thành công!')
      } else {
        alert('Lỗi tải lên tài liệu')
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi tải lên')
    } finally {
      setIsUploading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (format: string) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(format?.toLowerCase())) return <ImageIcon size={24} className="text-neo-blue" />
    if (['pdf'].includes(format?.toLowerCase())) return <FileText size={24} className="text-neo-red" />
    return <FileIcon size={24} className="text-slate-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-neo-yellow text-slate-900 border-slate-900'
      case 'ACTIVE': return 'bg-neo-green text-white border-slate-900'
      case 'COMPLETED': return 'bg-slate-200 text-slate-500 border-slate-400'
      default: return 'bg-white'
    }
  }

  if (!classroom) {
    return <div className="p-8 text-center font-bold">Đang tải thông tin lớp học...</div>
  }

  return (
    <div className="min-h-screen bg-neo-bg bg-grid-slate-200">
      <div className="pt-8 pb-12 px-4 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/classes')}
          className="flex items-center gap-2 mb-6 font-bold text-slate-600 hover:text-neo-blue transition-colors"
        >
          <ArrowLeft size={20} /> Quay lại danh sách lớp
        </button>

        {/* Header Lớp học */}
        <div className="bg-neo-purple text-white rounded-2xl p-8 border-4 border-slate-900 shadow-[8px_8px_0px_#0f172a] mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight mb-4">{classroom.name}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-purple-100 font-bold">
                <Users size={20} /> {classroom.memberCount} thành viên
              </div>
              <div className="flex items-center gap-2 text-purple-100 font-bold">
                <Hash size={20} /> Mã lớp: <span className="bg-white/20 px-2 py-1 rounded text-white">{classroom.code}</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <FileText size={200} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Danh sách kỳ thi (60-70%) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Danh sách Kỳ Thi</h2>
              {userRole === 'TEACHER' && (
                <button
                  onClick={() => setIsNewSessionModalOpen(true)}
                  className="flex items-center gap-2 bg-neo-blue text-white px-5 py-2.5 rounded-xl font-black neo-btn"
                >
                  <Plus size={20} /> Tạo Ca Thi
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="bg-white border-2 border-slate-900 rounded-xl p-12 text-center shadow-[4px_4px_0px_#0f172a]">
                <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có kỳ thi nào</h3>
                <p className="text-slate-500 font-bold">
                  {userRole === 'TEACHER' ? 'Hãy tạo ca thi đầu tiên cho lớp học này.' : 'Vui lòng chờ giáo viên giao bài kiểm tra.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice((sessionPage - 1) * sessionsPerPage, sessionPage * sessionsPerPage).map(session => (
                  <div key={session.id} className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-black text-slate-900">{session.title}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border-2 ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-500 flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {session.durationMinutes} phút</span>
                        <span>Bắt đầu: {new Date(session.startTime).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {userRole === 'STUDENT' && (session.status === 'ACTIVE' || session.status === 'UPCOMING') && (
                      <button
                        onClick={() => handleJoinExam(session.id)}
                        className="bg-neo-green text-white font-black px-6 py-2 rounded-xl neo-btn"
                      >
                        Vào thi
                      </button>
                    )}
                    {userRole === 'TEACHER' && (
                      <div className="flex gap-2">
                        {(session.status === 'ACTIVE' || session.status === 'UPCOMING') && (
                          <button 
                            onClick={() => navigate(`/teacher/exam-sessions/${session.id}/proctor`)}
                            className="bg-neo-yellow text-slate-900 font-black px-4 py-2 rounded-xl border-2 border-slate-900 hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0f172a]"
                          >
                            Giám sát
                          </button>
                        )}
                        <button className="bg-slate-100 text-slate-700 font-black px-4 py-2 rounded-xl border-2 border-slate-900 hover:bg-slate-200 transition-colors shadow-[2px_2px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0f172a]">
                          Xem KQ
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {sessions.length > sessionsPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                      disabled={sessionPage === 1}
                      className="px-4 py-2 border-2 border-slate-900 rounded-xl font-black disabled:opacity-50 disabled:bg-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-[2px_2px_0px_#0f172a] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                    >
                      Trang trước
                    </button>
                    <span className="font-black text-slate-700">
                      Trang {sessionPage} / {Math.ceil(sessions.length / sessionsPerPage)}
                    </span>
                    <button
                      onClick={() => setSessionPage(p => Math.min(Math.ceil(sessions.length / sessionsPerPage), p + 1))}
                      disabled={sessionPage >= Math.ceil(sessions.length / sessionsPerPage)}
                      className="px-4 py-2 border-2 border-slate-900 rounded-xl font-black disabled:opacity-50 disabled:bg-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-[2px_2px_0px_#0f172a] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Danh sách Tài liệu */}
            <div className="flex justify-between items-center mt-12 mb-6">
              <h2 className="text-2xl font-black text-slate-900">Tài Liệu Lớp Học</h2>
              {userRole === 'TEACHER' && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 bg-neo-yellow text-slate-900 px-5 py-2.5 rounded-xl font-black neo-btn"
                >
                  <Upload size={20} /> Tải tài liệu
                </button>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="bg-white border-2 border-slate-900 rounded-xl p-12 text-center shadow-[4px_4px_0px_#0f172a]">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có tài liệu nào</h3>
                <p className="text-slate-500 font-bold">
                  {userRole === 'TEACHER' ? 'Hãy tải lên tài liệu học tập cho lớp.' : 'Lớp học hiện chưa có tài liệu.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_#0f172a] flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-xl border-2 border-slate-900">
                      {getFileIcon(doc.format)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</h3>
                      <div className="text-xs font-bold text-slate-500 mt-1 flex flex-col gap-1">
                        <span>{formatBytes(doc.sizeBytes)} • {doc.format?.toUpperCase()}</span>
                        <span>Bởi {doc.uploaderName} • {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-neo-blue text-white p-2 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0f172a] transition-all"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Chatbox (30-40%) */}
          <div className="lg:col-span-1">
            <ClassChatBox classId={Number(classId)} unreadCount={classroom.unreadMessageCount || 0} />
          </div>
        </div>

        {/* Modal Tạo Ca Thi (Giáo viên) */}
        {isNewSessionModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_#0f172a] animate-scale-up max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Tạo Ca Thi Mới</h2>
              
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Đề thi</label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold focus:outline-none focus:bg-white"
                  >
                    <option value={0} disabled>-- Chọn đề thi --</option>
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên ca thi</label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold focus:outline-none focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Kết thúc</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold focus:outline-none focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewSessionModalOpen(false)}
                    className="flex-1 py-3 font-black text-slate-700 bg-slate-100 border-2 border-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 font-black text-white bg-neo-blue border-2 border-slate-900 rounded-xl hover:bg-blue-600 transition-colors neo-btn"
                  >
                    Tạo mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Tải Lên Tài Liệu (Giáo viên) */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_#0f172a] animate-scale-up">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Tải Lên Tài Liệu</h2>
              
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chọn File (PDF, Hình ảnh, DOCX...)</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-slate-900 file:text-sm file:font-black file:bg-neo-yellow file:text-slate-900 hover:file:bg-yellow-400"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false)
                      setUploadFile(null)
                    }}
                    className="flex-1 py-3 font-black text-slate-700 bg-slate-100 border-2 border-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="flex-1 py-3 font-black text-white bg-neo-green border-2 border-slate-900 rounded-xl hover:bg-green-600 transition-colors neo-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? 'Đang tải...' : <><Upload size={20} /> Tải lên</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
