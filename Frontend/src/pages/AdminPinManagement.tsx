import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { KeyRound, Plus, Ban, CheckCircle2 } from 'lucide-react'

export const AdminPinManagement: React.FC = () => {
  const [pins, setPins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchPins = async () => {
    try {
      const res = await apiFetch('/api/v1/admin/pins')
      if (res.ok) {
        const data = await res.json()
        setPins(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPins()
  }, [])

  const handleCreate = async () => {
    try {
      setCreating(true)
      const res = await apiFetch('/api/v1/admin/pins', { method: 'POST' })
      if (res.ok) {
        const newPin = await res.json()
        setPins([newPin, ...pins])
      }
    } catch (e) {
      alert("Lỗi tạo mã PIN")
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (pinId: number) => {
    try {
      const res = await apiFetch(`/api/v1/admin/pins/${pinId}/toggle`, { method: 'POST' })
      if (res.ok) {
        setPins(pins.map(p => p.id === pinId ? { ...p, active: !p.active } : p))
      } else {
        const msg = await res.text()
        alert(msg)
      }
    } catch (e) {
      alert("Lỗi hệ thống")
    }
  }

  const filteredPins = pins.filter(p => 
    !search || 
    (p.usedByUsername && p.usedByUsername.toLowerCase().includes(search.toLowerCase())) ||
    p.pinCode.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPins.length / itemsPerPage)
  const paginatedPins = filteredPins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  if (loading) return <div className="p-8 text-center font-bold">Đang tải...</div>

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Quản lý Mã Đăng ký (PIN)</h1>
          <p className="text-slate-500 font-bold">Tạo mã mời giáo viên mới vào hệ thống</p>
        </div>
        <button 
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 bg-neo-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black neo-btn disabled:opacity-50"
        >
          <Plus strokeWidth={3} className="w-5 h-5"/> {creating ? 'Đang tạo...' : 'Tạo Mã PIN Mới'}
        </button>
      </div>

      <div className="bg-white neo-card p-6">
        <div className="flex items-center mb-6 relative max-w-md">
          <input 
            type="text" 
            placeholder="Tìm kiếm mã PIN hoặc người dùng..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-neo-blue outline-none font-bold transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Mã PIN</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Trạng thái</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Hiệu lực</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Ngày tạo</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Người dùng (Nếu đã dùng)</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPins.map(p => (
                <tr key={p.id} className="border-b-2 border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-black text-neo-purple text-lg tracking-widest">{p.pinCode}</td>
                  <td className="p-4">
                    {p.used ? (
                      <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Đã sử dụng</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-max"><KeyRound className="w-3 h-3"/> Chưa dùng</span>
                    )}
                  </td>
                  <td className="p-4">
                    {!p.used && (
                      p.active ? (
                        <span className="text-neo-green font-bold">Kích hoạt</span>
                      ) : (
                        <span className="text-neo-coral font-bold">Vô hiệu hóa</span>
                      )
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {p.usedByUsername || '-'}
                  </td>
                  <td className="p-4">
                    {!p.used && (
                      <button 
                        onClick={() => handleToggle(p.id)}
                        className={`px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1 neo-btn ${p.active ? 'bg-neo-coral hover:bg-red-500 text-white' : 'bg-neo-green hover:bg-green-500 text-white'}`}
                      >
                        <Ban className="w-3 h-3"/> {p.active ? 'Hủy' : 'Mở lại'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedPins.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">Không tìm thấy mã PIN nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 font-bold text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
            >
              Trang trước
            </button>
            <span className="font-bold text-slate-500 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 font-bold text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
