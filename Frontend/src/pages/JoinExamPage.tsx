import React, { useState, useRef, useEffect } from 'react'
import { Target, ArrowLeft, ShieldCheck, Clock, MonitorPlay, Zap, QrCode, History, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'

export const JoinExamPage: React.FC = () => {
  const navigate = useNavigate()
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handlePinChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value.toUpperCase()
    setPin(newPin)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      const fullPin = pin.join('')
      if (fullPin.length === 6) {
        handleJoinClass()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)

    if (pastedData) {
      const newPin = [...pin]
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i]
      }
      setPin(newPin)

      const nextFocusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextFocusIndex]?.focus()
    }
  }

  const handleJoinClass = async () => {
    const fullPin = pin.join('')
    if (fullPin.length < 6) {
      setError("Please enter a 6-character Code!")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiFetch('/api/v1/classes/join', {
        method: 'POST',
        body: JSON.stringify({ code: fullPin })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Error joining classroom')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      // Redirect to classes page (we'll create this soon)
      navigate('/classes', { state: { newClass: data } })
    } catch (err) {
      console.error('Join class error:', err)
      setError('An error occurred connecting to the server')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex-1 max-w-4xl mx-auto p-4 flex flex-col justify-center min-h-[calc(100vh-100px)] relative">
      {/* Nền trang trí floating */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neo-yellow/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-neo-purple/10 rounded-full blur-3xl pointer-events-none"></div>

      <button
        onClick={() => navigate('/')}
        className="w-fit mb-6 flex items-center gap-2 text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all self-start z-10"
      >
        <ArrowLeft size={16} strokeWidth={3} /> Back to Home
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch z-10">

        {/* Left Column: Instructions & Info */}
        <div className="flex-1 bg-neo-purple text-white neo-card p-5 lg:p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-black tracking-tight mb-2">Ready to Start?</h1>
            <p className="text-purple-100 font-medium mb-6 text-xs max-w-[90%]">
              Ensure a stable internet connection and mentally prepare yourself.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Strict Anti-Cheat</h3>
                  <p className="text-purple-100 text-xs mt-0.5">Multi-layer anti-cheat system.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Auto-Sync</h3>
                  <p className="text-purple-100 text-xs mt-0.5">Automatically saves answers if disconnected.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Instant Results</h3>
                  <p className="text-purple-100 text-xs mt-0.5">Get your score the moment you finish.</p>
                </div>
              </div>
            </div>

            {/* Tính năng phụ: Nội quy phòng thi */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm font-bold text-neo-yellow mb-2">
                <Info size={16} /> Important Notes
              </div>
              <ul className="text-xs text-purple-100 list-disc list-inside space-y-1">
                <li>Classes provide exclusive access to tests and materials.</li>
                <li>You only need to join the class once.</li>
                <li>Double-check the Code provided by your teacher.</li>
              </ul>
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-10">
            <MonitorPlay size={160} />
          </div>
        </div>

        {/* Right Column: Code Input Form */}
        <div className="flex-[1.2] bg-white neo-card p-5 lg:p-8 flex flex-col justify-center relative">

          {/* Nút Scan QR trang trí */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="absolute top-6 right-6 p-2 rounded-xl border-2 border-slate-900 bg-slate-50 hover:bg-neo-blue hover:text-white transition-colors shadow-[2px_2px_0px_#0f172a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] group"
            title="Scan QR Code"
          >
            <QrCode size={20} className="text-slate-700 group-hover:text-white transition-colors" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center border-2 border-slate-900 text-rose-500 shadow-[3px_3px_0px_#0f172a] mb-4">
              <Target size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Enter Class Code</h2>
            <p className="text-xs font-bold text-slate-500">6-character Code provided by your teacher</p>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-600 font-bold text-xs text-center animate-bounce-short">
              {error}
            </div>
          )}

          {showQR && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3 text-sm font-bold text-blue-700">
              <QrCode size={24} className="text-blue-500" />
              <span>QR code scanning via camera is under development...</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black bg-[#fdfdfd] border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none focus:border-neo-blue transition-all uppercase"
                />
              ))}
            </div>

            <button
              onClick={handleJoinClass}
              disabled={isLoading || pin.join('').length < 6}
              className="w-full py-3 text-base font-black bg-neo-green hover:bg-neo-green-hover text-white neo-btn disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#0f172a] disabled:cursor-not-allowed group flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Join Now <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} /></>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-[-5px]">
              * Tip: You can press <kbd className="px-1.5 py-0.5 border border-slate-300 rounded bg-slate-100 text-slate-500">Enter</kbd> to join quickly
            </p>
          </div>

          {/* Lịch sử tham gia gần đây (Trang trí) */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-4">
              <History size={16} /> Recent Codes
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPin(['P', 'H', 'Y', '1', '0', '1'])} className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-neo-blue hover:text-neo-blue transition-colors">
                PHY101
              </button>
              <button onClick={() => setPin(['M', 'A', 'T', 'H', '9', '9'])} className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-neo-blue hover:text-neo-blue transition-colors">
                MATH99
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
