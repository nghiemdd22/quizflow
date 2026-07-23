import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'

interface Tag {
  id: number
  name: string
}

export const AdminTagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [isAdding, setIsAdding] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const fetchTags = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/v1/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      } else {
        setError('Không thể lấy danh sách Tag')
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleAdd = async () => {
    if (!newTagName.trim()) return
    try {
      const res = await apiFetch(`/api/v1/admin/tags?name=${encodeURIComponent(newTagName.trim())}`, {
        method: 'POST'
      })
      if (res.ok) {
        setSuccess('Thêm Tag thành công')
        setNewTagName('')
        setIsAdding(false)
        fetchTags()
      } else {
        const err = await res.json()
        setError(err.error || 'Lỗi khi thêm Tag')
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ')
    }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleEditSave = async (id: number) => {
    if (!editName.trim()) return
    try {
      const res = await apiFetch(`/api/v1/admin/tags/${id}?name=${encodeURIComponent(editName.trim())}`, {
        method: 'PUT'
      })
      if (res.ok) {
        setSuccess('Cập nhật Tag thành công')
        setEditingId(null)
        fetchTags()
      } else {
        const err = await res.json()
        setError(err.error || 'Lỗi khi cập nhật Tag')
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ')
    }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Tag này không? Tất cả bài viết sử dụng Tag này sẽ bị gỡ Tag.')) return
    try {
      const res = await apiFetch(`/api/v1/admin/tags/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSuccess('Đã xóa Tag thành công')
        fetchTags()
      } else {
        const err = await res.json()
        setError(err.error || 'Lỗi khi xóa Tag')
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ')
    }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Quản lý Tag</h1>
          <p className="text-slate-500 font-bold">Thêm, sửa, xóa các Tag dùng cho Diễn đàn</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setNewTagName('') }}
          className="neo-btn bg-neo-green hover:bg-neo-green-hover text-white px-6 py-3 font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm Tag mới
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold rounded-xl">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 text-green-700 font-bold rounded-xl">{success}</div>}

      <div className="neo-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-50">
                <th className="p-4 font-black text-slate-900">ID</th>
                <th className="p-4 font-black text-slate-900">Tên Tag</th>
                <th className="p-4 font-black text-slate-900 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr className="border-b-2 border-slate-100 bg-blue-50/50 animate-pop-in">
                  <td className="p-4 font-bold text-slate-500">Mới</td>
                  <td className="p-4">
                    <input 
                      autoFocus
                      type="text" 
                      value={newTagName}
                      onChange={e => setNewTagName(e.target.value)}
                      placeholder="Nhập tên Tag mới..."
                      className="neo-input w-full py-2 px-3"
                      onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={handleAdd} className="p-2 bg-neo-green text-white rounded-lg hover:brightness-110 active:scale-95 transition-all" title="Lưu">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:brightness-95 active:scale-95 transition-all" title="Hủy">
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center font-bold text-slate-500 animate-pulse">Đang tải danh sách Tag...</td>
                </tr>
              ) : tags.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center font-bold text-slate-500">Chưa có Tag nào. Bấm nút Thêm Tag mới để tạo!</td>
                </tr>
              ) : (
                tags.map(tag => (
                  <tr key={tag.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-500">#{tag.id}</td>
                    <td className="p-4">
                      {editingId === tag.id ? (
                        <input 
                          autoFocus
                          type="text" 
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="neo-input w-full py-2 px-3"
                          onKeyDown={e => e.key === 'Enter' && handleEditSave(tag.id)}
                        />
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e0e7ff] text-[#4338ca] border-2 border-[#4338ca] rounded-lg font-bold text-sm shadow-[2px_2px_0px_#4338ca]">
                          {tag.name}
                        </div>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      {editingId === tag.id ? (
                        <>
                          <button onClick={() => handleEditSave(tag.id)} className="p-2 bg-neo-green text-white rounded-lg hover:brightness-110 active:scale-95 transition-all" title="Lưu">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:brightness-95 active:scale-95 transition-all" title="Hủy">
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setEditingId(tag.id); setEditName(tag.name) }} 
                            className="p-2 bg-neo-yellow text-slate-900 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0px_#0f172a]" 
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleDelete(tag.id)} 
                            className="p-2 bg-neo-coral text-white rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0px_#0f172a]" 
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
