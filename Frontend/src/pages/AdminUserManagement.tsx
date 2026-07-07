import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { Lock, Unlock, Search } from 'lucide-react'

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/v1/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggle = async (userId: number) => {
    try {
      const res = await apiFetch(`/api/v1/admin/users/${userId}/toggle`, { method: 'POST' })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, active: !u.active } : u))
      } else {
        const msg = await res.text()
        alert(msg)
      }
    } catch (e) {
      alert('Lỗi hệ thống!')
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  if (loading) return <div className="p-8 text-center font-bold">Đang tải...</div>

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-page-enter">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Quản lý Người dùng</h1>
          <p className="text-slate-500 font-bold">Tìm kiếm và khóa/mở khóa tài khoản</p>
        </div>
      </div>

      <div className="bg-white neo-card p-6">
        <div className="flex items-center mb-6 relative">
          <Search className="absolute left-4 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo username, họ tên..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-neo-blue outline-none font-bold transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">ID</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Username</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Họ và Tên</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Vai trò</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Trạng thái</th>
                <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.id} className="border-b-2 border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">#{u.id}</td>
                  <td className="p-4 font-bold text-slate-900">{u.username}</td>
                  <td className="p-4 font-bold text-slate-700">{u.fullName}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-neo-purple text-white' : u.role === 'TEACHER' ? 'bg-neo-blue text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.active ? (
                      <span className="text-neo-green font-bold flex items-center gap-1"><Unlock className="w-4 h-4"/> Active</span>
                    ) : (
                      <span className="text-neo-coral font-bold flex items-center gap-1"><Lock className="w-4 h-4"/> Banned</span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleToggle(u.id)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all neo-btn ${u.active ? 'bg-neo-coral hover:bg-red-500 text-white' : 'bg-neo-green hover:bg-green-500 text-white'}`}
                      >
                        {u.active ? 'Ban' : 'Unban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">Không tìm thấy người dùng nào.</td>
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
