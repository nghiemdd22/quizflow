import React, { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (token: string, username: string, fullName: string, role: string, id: number) => void
  initialMode?: 'login' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [identityCard, setIdentityCard] = useState('')
  const [isTeacher, setIsTeacher] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthMode(initialMode)
      setError('')
      setSuccess('')
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (authMode === 'login') {
      if (!email || !password) return setError('Vui lòng điền đầy đủ thông tin!')
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        })
        const data = await res.json()
        if (res.ok) {
          // Pass full data back
          onLoginSuccess(data.token, data.username, data.fullName || data.username, data.role, data.id)
          setEmail('')
          setPassword('')
          onClose()
        } else {
          setError(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác!')
        }
      } catch {
        setError('Có lỗi xảy ra khi kết nối server')
      }
    } else {
      if (!email || !password || !fullName || !phone || !identityCard) return setError('Vui lòng điền đầy đủ thông tin!')
      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: email,
            password,
            fullName,
            phone,
            identityCard,
            inviteCode: isTeacher ? inviteCode : null
          })
        })
        
        if (res.ok) {
          setSuccess('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
          setAuthMode('login')
          // Xóa form đăng ký để không kẹt data cũ
          setFullName('')
          setPhone('')
          setIdentityCard('')
          setInviteCode('')
          setIsTeacher(false)
        } else {
          const data = await res.json()
          setError(data.error || 'Đăng ký thất bại!')
        }
      } catch {
        setError('Có lỗi xảy ra khi kết nối server')
      }
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-neo-bg neo-card p-6 md:p-8 max-w-md w-full relative animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black text-slate-900 mb-6 text-left">
          {authMode === 'login' ? 'Đăng Nhập QuizFlow' : 'Đăng Ký Tài Khoản'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-neo-coral text-neo-coral font-bold text-sm rounded-r-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border-l-4 border-neo-green text-green-700 font-bold text-sm rounded-r-md">
            {success}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">EMAIL ADDRESS (USERNAME)</label>
            <input
              type="text"
              required
              minLength={3}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
            />
          </div>

          {authMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    required
                    placeholder="0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">IDENTITY CARD (CCCD)</label>
                  <input
                    type="text"
                    required
                    placeholder="012345678910"
                    value={identityCard}
                    onChange={(e) => setIdentityCard(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
            />
          </div>

          {authMode === 'signup' && (
            <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-xl shadow-[2px_2px_0px_#0f172a] mt-2">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={isTeacher}
                  onChange={(e) => setIsTeacher(e.target.checked)}
                  className="w-4 h-4 text-neo-green border-2 border-slate-900 rounded cursor-pointer"
                />
                <span className="text-sm font-black text-slate-800">Đăng ký dành cho Giáo viên</span>
              </label>
              {isTeacher && (
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">MÃ LỜI MỜI (INVITE CODE)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã do trường cung cấp"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-sm"
          >
            {authMode === 'login' ? 'Xác Nhận Đăng Nhập' : 'Tạo Tài Khoản Free'}
          </button>

          <p className="text-xs text-slate-500 font-bold text-center mt-3">
            {authMode === 'login' ? 'Chưa có tài khoản QuizFlow?' : 'Đã có tài khoản?'}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
                setError('')
                setSuccess('')
              }}
              className="text-neo-blue underline hover:text-blue-700 font-black cursor-pointer"
            >
              {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ở đây'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
