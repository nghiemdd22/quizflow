import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { BookOpen, Plus, Edit2, Trash2, X } from 'lucide-react'

interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
}

export const AdminSubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  
  // Form state
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchSubjects = async () => {
    try {
      const res = await apiFetch('/api/v1/subjects')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data)
      }
    } catch (e) {
      console.error("Failed to fetch subjects", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const openCreateModal = () => {
    setEditingSubject(null)
    setCode('')
    setName('')
    setDescription('')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setCode(subject.code)
    setName(subject.name)
    setDescription(subject.description || '')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này không? Các dữ liệu liên quan có thể bị ảnh hưởng.')) {
      return
    }
    try {
      const res = await apiFetch(`/api/v1/subjects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSubjects(subjects.filter(s => s.id !== id))
      } else {
        const data = await res.json()
        alert('Lỗi: ' + (data.error || 'Không thể xóa'))
      }
    } catch (e) {
      console.error("Failed to delete subject", e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    const payload = { code, name, description }
    
    try {
      if (editingSubject) {
        // Update
        const res = await apiFetch(`/api/v1/subjects/${editingSubject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const updated = await res.json()
          setSubjects(subjects.map(s => s.id === updated.id ? updated : s))
          setIsModalOpen(false)
        } else {
          const data = await res.json()
          setErrorMsg(data.error || 'Lỗi cập nhật')
        }
      } else {
        // Create
        const res = await apiFetch('/api/v1/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const created = await res.json()
          setSubjects([...subjects, created])
          setIsModalOpen(false)
        } else {
          const data = await res.json()
          setErrorMsg(data.error || 'Lỗi tạo mới')
        }
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ')
    }
  }

  if (loading) return <div className="p-8 text-center font-bold">Đang tải danh sách...</div>

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Quản lý Môn học</h1>
          <p className="text-slate-500 font-bold">Thêm, sửa, xóa danh mục môn học của hệ thống</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="neo-btn bg-neo-blue text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Môn Học</span>
        </button>
      </div>

      <div className="neo-card bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b-2 border-slate-900">
              <tr>
                <th className="p-4 font-black text-slate-900">Mã Môn</th>
                <th className="p-4 font-black text-slate-900">Tên Môn Học</th>
                <th className="p-4 font-black text-slate-900 hidden sm:table-cell">Mô tả</th>
                <th className="p-4 font-black text-slate-900 w-32 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                    Chưa có môn học nào.
                  </td>
                </tr>
              ) : (
                subjects.map(subject => (
                  <tr key={subject.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-neo-blue">{subject.code}</td>
                    <td className="p-4 font-bold text-slate-900">{subject.name}</td>
                    <td className="p-4 text-slate-600 hidden sm:table-cell">{subject.description}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(subject)}
                          className="p-2 rounded-lg bg-neo-yellow/20 text-neo-yellow hover:bg-neo-yellow hover:text-white transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(subject.id)}
                          className="p-2 rounded-lg bg-neo-coral/20 text-neo-coral hover:bg-neo-coral hover:text-white transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start pt-24 justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden neo-card animate-slide-up relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b-2 border-slate-900 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-neo-blue" />
                {editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {errorMsg && (
                <div className="mb-4 p-4 bg-neo-coral/10 text-neo-coral border-2 border-neo-coral rounded-xl font-bold">
                  {errorMsg}
                </div>
              )}
              
              <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-1">Mã môn học *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full neo-input"
                    placeholder="VD: IT3180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-1">Tên môn học *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full neo-input"
                    placeholder="VD: Nhập môn Công nghệ phần mềm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-1">Mô tả chi tiết</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full neo-input resize-none"
                    rows={4}
                    placeholder="Mô tả về môn học (tùy chọn)"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t-2 border-slate-900 flex gap-4 shrink-0 bg-slate-50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 neo-btn bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                form="subject-form"
                className="flex-1 neo-btn bg-neo-blue text-white py-3 rounded-xl font-bold hover:opacity-90"
              >
                {editingSubject ? 'Lưu Thay Đổi' : 'Thêm Môn Học'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
