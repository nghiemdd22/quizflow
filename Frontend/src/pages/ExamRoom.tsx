import React, { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { apiFetch } from '../utils/api'
import type { ExamRoomResponse } from '../types'
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, LogOut, FileText } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface ExamRoomProps {
  data: ExamRoomResponse
  onLeave: () => void
}

export const ExamRoom: React.FC<ExamRoomProps> = ({ data, onLeave }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showTimeOutModal, setShowTimeOutModal] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'IDLE' | 'WAITING' | 'SCORED' | 'FAILED'>('IDLE')
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [failedMessage, setFailedMessage] = useState<string>('')

  const stompClientRef = useRef<Client | null>(null)

  // Setup WebSocket Connection & Sync
  useEffect(() => {
    const token = useAuthStore.getState().accessToken || ''

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/exam'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true)

        client.subscribe('/user/queue/exam-results', (message) => {
          try {
            const payload = JSON.parse(message.body)
            if (payload.status === 'SCORED') {
              setFinalScore(payload.score)
              setSubmitStatus('SCORED')
            } else if (payload.status === 'FAILED') {
              setFailedMessage(payload.message || 'An error occurred during grading.')
              setSubmitStatus('FAILED')
            }
          } catch (e) {
            console.error("Error parsing exam result", e)
          }
        })

        // Auto Sync when connected
        apiFetch(`/api/v1/student/sessions/${data.sessionId}/sync`)
          .then(res => res.json())
          .then(syncedAnswers => {
            const parsedAnswers: Record<number, any> = {}
            for (const key in syncedAnswers) {
              try {
                parsedAnswers[parseInt(key)] = JSON.parse(syncedAnswers[key])
              } catch (e) {
                parsedAnswers[parseInt(key)] = syncedAnswers[key]
              }
            }
            setAnswers(parsedAnswers)
          })
          .catch(err => console.error("Sync error:", err))
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message'])
        console.error('Additional details: ' + frame.body)
      },
      onWebSocketClose: () => {
        setIsConnected(false)
      }
    })

    client.activate()
    stompClientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [data.sessionId])

  const doSubmitApi = async () => {
    try {
      const response = await apiFetch(`/api/v1/student/sessions/${data.sessionId}/submit`, { method: 'POST' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setSubmitStatus('FAILED')
        setFailedMessage(errorData.error || errorData.message || 'System error during submission.')
      }
    } catch (err) {
      setSubmitStatus('FAILED')
      setFailedMessage('System error while connecting to submission server.')
    }
  }

  const handleAutoSubmit = () => {
    setSubmitStatus('WAITING')
    doSubmitApi()
    setShowTimeOutModal(true)
  }

  // Calculate Countdown Timer (Anti-cheat with performance.now())
  useEffect(() => {
    const serverEndTime = new Date(data.endTime).getTime()
    const serverTimeMs = new Date(data.serverTime).getTime()
    const initialRemainingMs = serverEndTime - serverTimeMs
    const startPerformance = performance.now()

    const interval = setInterval(() => {
      const timeElapsed = performance.now() - startPerformance
      const remainingMs = initialRemainingMs - timeElapsed

      if (remainingMs <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
        handleAutoSubmit()
      } else {
        setTimeLeft(Math.floor(remainingMs / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [data])

  const handleAnswerSelect = (questionId: number, answerData: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerData
    }))

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/submit-answer',
        body: JSON.stringify({
          sessionId: data.sessionId,
          questionId: questionId,
          answerData: answerData
        })
      })
    }
  }

  const handleToggleMultipleChoice = (questionId: number, optionId: string) => {
    const currentAns = answers[questionId] || []
    let newAns: string[]
    if (currentAns.includes(optionId)) {
      newAns = currentAns.filter((id: string) => id !== optionId)
    } else {
      newAns = [...currentAns, optionId]
    }
    handleAnswerSelect(questionId, newAns)
  }

  const handleSubmitExam = () => {
    setShowConfirmModal(true)
  }

  const confirmSubmitExam = () => {
    setShowConfirmModal(false)
    setSubmitStatus('WAITING')
    doSubmitApi()
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const currentQ = data.questions[currentQIndex]

  const getSafeOptions = (metadata: any) => {
    if (!metadata) return []
    let meta = metadata
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta) } catch (e) { }
    }

    let opts = meta.options || meta.Options || meta.choices || meta.Choices || meta.answers
    if (typeof opts === 'string') {
      try { opts = JSON.parse(opts) } catch (e) { }
    }

    if (Array.isArray(opts)) {
      return opts.map((o: any, idx: number) => {
        if (typeof o === 'string') return { id: String(idx), content: o }
        if (typeof o === 'object' && o !== null) {
          return {
            id: o.id || o.key || String(idx),
            content: o.content || o.text || o.value || JSON.stringify(o)
          }
        }
        return { id: String(idx), content: String(o) }
      })
    }

    if (typeof opts === 'object' && opts !== null) {
      return Object.keys(opts).map(k => {
        const val = opts[k]
        return {
          id: k,
          content: typeof val === 'string' ? val : (val?.content || val?.text || JSON.stringify(val))
        }
      })
    }

    return []
  }

  const currentOptions = getSafeOptions(currentQ?.metadata)

  if (submitStatus === 'WAITING' && !showTimeOutModal) {
    return (
      <div className="w-full min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-neo-yellow/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-neo-blue/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full max-w-xl bg-white neo-card p-8 md:p-12 flex flex-col items-center text-center relative z-10 shadow-[8px_8px_0px_#0f172a]">
          <div className="w-20 h-20 mb-8 border-4 border-slate-200 border-t-neo-blue rounded-full animate-spin"></div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 animate-pulse tracking-tight uppercase">
            Grading in progress...
          </h1>
          
          <div className="w-full h-4 bg-slate-100 rounded-full border-2 border-slate-900 overflow-hidden mb-4">
            <div className="h-full bg-neo-yellow w-full origin-left animate-progress-indeterminate"></div>
          </div>
          <p className="text-sm font-bold text-slate-500">Please wait a moment. The system is processing your exam.</p>
        </div>
      </div>
    )
  }

  if (submitStatus === 'SCORED' && !showTimeOutModal) {
    return (
      <div className="w-full min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-neo-green/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-neo-yellow/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full max-w-xl bg-white rounded-3xl border-4 border-neo-green p-8 md:p-12 flex flex-col items-center text-center relative z-10 shadow-[8px_8px_0px_#10b981] animate-bounce-short">
          <div className="w-24 h-24 mb-6 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-neo-green text-neo-green">
            <CheckCircle size={48} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black text-slate-600 mb-2 uppercase tracking-widest">
            YOU SCORED
          </h1>
          <div className="text-8xl font-black text-neo-green mb-8 tracking-tighter">
            {finalScore !== null ? finalScore : '-'} <span className="text-3xl text-emerald-600">points</span>
          </div>
          
          <p className="text-sm font-bold text-slate-500 mb-8 max-w-sm">
            Your exam has been graded automatically.
          </p>
          
          <button 
            onClick={onLeave}
            className="px-8 py-4 bg-neo-green hover:bg-emerald-600 text-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all font-black text-lg w-full"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  if (submitStatus === 'FAILED' && !showTimeOutModal) {
    return (
      <div className="w-full min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-xl bg-white rounded-3xl border-4 border-rose-500 p-8 md:p-12 flex flex-col items-center text-center relative z-10 shadow-[8px_8px_0px_#f43f5e]">
          <div className="w-24 h-24 mb-6 rounded-full bg-rose-100 flex items-center justify-center border-4 border-rose-500 text-rose-500">
            <AlertCircle size={48} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">
            AN ERROR OCCURRED
          </h1>
          <p className="text-base font-bold text-slate-600 mb-8">
            {failedMessage}
          </p>
          
          <button 
            onClick={onLeave}
            className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all font-black text-lg w-full"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row p-4 gap-4 relative">
      
      {/* Time Out Modal */}
      {showTimeOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white neo-card p-6 md:p-8 flex flex-col items-center text-center animate-bounce-short shadow-[8px_8px_0px_#0f172a]">
            <div className="w-20 h-20 mb-6 rounded-full bg-rose-100 flex items-center justify-center border-4 border-slate-900 text-rose-500 shadow-[4px_4px_0px_#0f172a]">
              <Clock size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Time's up!</h2>
            <p className="text-slate-600 font-bold mb-8">
              Your time has expired! The system has automatically submitted your exam.
            </p>
            <button 
              onClick={() => setShowTimeOutModal(false)}
              className="w-full py-3 bg-neo-blue hover:bg-blue-600 text-white font-black border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white neo-card p-6 md:p-8 flex flex-col items-center text-center animate-bounce-short shadow-[8px_8px_0px_#0f172a]">
            <div className="w-20 h-20 mb-6 rounded-full bg-amber-100 flex items-center justify-center border-4 border-slate-900 text-amber-500 shadow-[4px_4px_0px_#0f172a]">
              <AlertCircle size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Confirm Submission</h2>
            <p className="text-slate-600 font-bold mb-8">
              Are you sure you want to submit? This action cannot be undone and you cannot change your answers.
            </p>
            <div className="flex w-full gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
              >
                GO BACK
              </button>
              <button 
                onClick={confirmSubmitExam}
                className="flex-1 py-3 bg-neo-green hover:bg-emerald-500 text-white font-black border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT: MAIN EXAM AREA */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header Bar */}
        <div className="bg-white neo-card px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-xl text-slate-900">{data.examTitle}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1"><FileText size={14} /> {data.questions.length} Questions</span>
              {isConnected ? (
                <span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Connected to server</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600"><AlertCircle size={14} /> Disconnected (Retrying...)</span>
              )}
            </div>
          </div>
          <button onClick={onLeave} className="w-10 h-10 bg-rose-100 text-rose-600 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0f172a] flex items-center justify-center transition-all">
            <LogOut size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Question Area */}
        <div className="flex-1 bg-white neo-card flex flex-col">
          <div className="p-6 md:p-10 flex-1">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 border-2 border-slate-900 rounded-xl text-xs font-black shadow-[2px_2px_0px_#0f172a] mb-6">
              Question {currentQIndex + 1} / {data.questions.length}
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-8 leading-snug">
              {currentQ?.content}
            </h2>

            {/* Options */}
            <div className="max-w-3xl">
              {(currentQ?.type === 'SINGLE_CHOICE' || currentQ?.type === 'SINGLE') && (
                <div className="space-y-4">
                  {currentOptions.map((opt: any) => (
                    <label key={opt.id} className={`block p-4 rounded-xl border-2 border-slate-900 cursor-pointer transition-all ${answers[currentQ.id] === opt.id ? 'bg-[#d1fae5] shadow-[3px_3px_0px_#0f172a] -translate-y-[2px] -translate-x-[2px]' : 'bg-white shadow-[1px_1px_0px_#0f172a] hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
                          checked={answers[currentQ.id] === opt.id}
                          onChange={() => handleAnswerSelect(currentQ.id, opt.id)}
                          className="w-5 h-5 accent-neo-green focus:ring-neo-green border-2 border-slate-900"
                        />
                        <span className="font-bold text-slate-800 text-base">{opt.content}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {(currentQ?.type === 'MULTIPLE_CHOICE' || currentQ?.type === 'MULTIPLE') && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-amber-600 mb-2">Select multiple answers</p>
                  {currentOptions.map((opt: any) => {
                    const ansArray = Array.isArray(answers[currentQ.id])
                      ? answers[currentQ.id]
                      : (answers[currentQ.id] !== undefined && answers[currentQ.id] !== null ? [answers[currentQ.id]] : []);
                    return (
                      <label key={opt.id} className={`block p-4 rounded-xl border-2 border-slate-900 cursor-pointer transition-all ${ansArray.includes(opt.id) ? 'bg-[#fef3c7] shadow-[3px_3px_0px_#0f172a] -translate-y-[2px] -translate-x-[2px]' : 'bg-white shadow-[1px_1px_0px_#0f172a] hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={ansArray.includes(opt.id)}
                            onChange={() => handleToggleMultipleChoice(currentQ.id, opt.id)}
                            className="w-5 h-5 accent-neo-yellow rounded border-2 border-slate-900"
                          />
                          <span className="font-bold text-slate-800 text-base">{opt.content}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {(currentQ?.type === 'FILL_IN_BLANK' || currentQ?.type === 'FILL') && (
                <div className="mt-4">
                  <textarea
                    rows={4}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
                    placeholder="Enter your answer here..."
                    className="w-full p-4 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] font-bold text-slate-800 focus:outline-none focus:ring-0 focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-none transition-all"
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-[1.5rem]">
            <button
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-6 py-3 bg-white border-2 border-slate-900 rounded-xl font-black shadow-[2px_2px_0px_#0f172a] disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] hover:bg-slate-100 flex items-center gap-2 transition-all"
            >
              <ChevronLeft size={18} strokeWidth={3} /> Previous
            </button>
            <button
              onClick={() => setCurrentQIndex(prev => Math.min(data.questions.length - 1, prev + 1))}
              disabled={currentQIndex === data.questions.length - 1}
              className="px-6 py-3 bg-neo-blue text-white border-2 border-slate-900 rounded-xl font-black shadow-[2px_2px_0px_#0f172a] disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] hover:bg-blue-600 flex items-center gap-2 transition-all"
            >
              Next <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: SIDEBAR */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {/* Timer Card */}
        <div className="bg-white neo-card p-6 flex flex-col items-center justify-center">
          <Clock size={32} className="text-neo-coral mb-2" strokeWidth={2.5} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
          <div className={`text-4xl font-black tracking-tight ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Grid Map */}
        <div className="bg-white neo-card p-6 flex-1 flex flex-col">
          <h3 className="font-extrabold text-slate-900 mb-4 border-b-2 border-slate-100 pb-2">Question List</h3>

          <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[300px] md:max-h-none content-start">
            {data.questions.map((q: any, idx: number) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true)
              const isCurrent = currentQIndex === idx

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`aspect-square rounded-xl border-2 border-slate-900 font-black text-sm flex items-center justify-center transition-all ${isCurrent
                    ? 'bg-slate-900 text-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : isAnswered
                      ? 'bg-[#d1fae5] text-emerald-800 shadow-[2px_2px_0px_#0f172a] hover:bg-[#a7f3d0]'
                      : 'bg-white text-slate-600 shadow-[2px_2px_0px_#0f172a] hover:bg-slate-50'
                    }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-6 border-t-2 border-slate-100">
            <button
              onClick={handleSubmitExam}
              className="w-full py-4 bg-neo-green hover:bg-neo-green-hover text-white neo-btn flex items-center justify-center gap-2 text-lg"
            >
              <CheckCircle size={22} strokeWidth={3} />
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
