import React, { useState } from 'react'
import { ArrowLeft, Settings, Bell, Shield, Moon, MonitorSmartphone } from 'lucide-react'

export const SettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(true)

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-100px)] relative bg-[#f8fafc] overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neo-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neo-green/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10 flex flex-col flex-1">
        <button
          onClick={onBack}
          className="w-fit mb-8 flex items-center gap-2 text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] text-white text-xs font-black">
            <Settings size={14} /> Preferences
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white neo-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-neo-yellow text-slate-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                <Bell size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-900 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">Push Notifications</p>
                  <p className="text-xs font-bold text-slate-500">Receive alerts for upcoming exams and results</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-14 h-8 rounded-full border-2 border-slate-900 transition-colors relative shadow-[2px_2px_0px_#0f172a] ${notifications ? 'bg-neo-green' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-900 rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-900 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">Sound Effects</p>
                  <p className="text-xs font-bold text-slate-500">Play sounds during exam interactions</p>
                </div>
                <button 
                  onClick={() => setSound(!sound)}
                  className={`w-14 h-8 rounded-full border-2 border-slate-900 transition-colors relative shadow-[2px_2px_0px_#0f172a] ${sound ? 'bg-neo-blue' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-900 rounded-full transition-all ${sound ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white neo-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-neo-purple text-white border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                <MonitorSmartphone size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Appearance</h2>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900">Dark Mode</p>
                  <p className="text-xs font-bold text-slate-500">Toggle dark theme (Coming soon)</p>
                </div>
              </div>
              <button 
                disabled
                className="w-14 h-8 rounded-full border-2 border-slate-300 bg-slate-100 relative cursor-not-allowed opacity-50"
              >
                <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-300 rounded-full left-1"></div>
              </button>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white neo-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-neo-coral text-white border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Privacy & Security</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-[2px_2px_0px_#0f172a] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-bold text-slate-900 flex justify-between items-center">
                Privacy Policy
                <ArrowLeft size={16} className="rotate-135" />
              </button>
              <button className="w-full text-left p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-[2px_2px_0px_#0f172a] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-bold text-slate-900 flex justify-between items-center">
                Terms of Service
                <ArrowLeft size={16} className="rotate-135" />
              </button>
              <button className="w-full text-left p-4 bg-rose-50 border-2 border-rose-200 rounded-xl hover:border-red-600 hover:shadow-[2px_2px_0px_#dc2626] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-bold text-red-600 mt-4 flex justify-between items-center">
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
