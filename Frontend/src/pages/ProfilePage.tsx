import React from 'react'
import { ArrowLeft, User, Mail, Shield, Award, Edit3 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export const ProfilePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userEmail, userFullName, userRole } = useAuthStore()

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-100px)] relative bg-[#f8fafc] overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-neo-yellow/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-neo-purple/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10 flex flex-col flex-1">
        <button
          onClick={onBack}
          className="w-fit mb-8 flex items-center gap-2 text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Profile (Updated)</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neo-coral border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] text-white text-xs font-black">
            <User size={14} /> Account Details
          </div>
        </div>

        <div className="bg-white neo-card p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-2xl bg-slate-100 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center relative group">
                <User size={64} className="text-slate-400 group-hover:text-neo-blue transition-colors" strokeWidth={2} />
                <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-neo-yellow border-2 border-slate-900 rounded-xl flex items-center justify-center hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none shadow-[2px_2px_0px_#0f172a] transition-all">
                  <Edit3 size={18} strokeWidth={3} />
                </button>
              </div>
              <span className="inline-flex px-3 py-1 bg-slate-900 text-white border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-widest">
                {userRole}
              </span>
            </div>

            {/* User Details */}
            <div className="flex-1 w-full space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 cursor-not-allowed">
                  {userFullName || 'N/A'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 cursor-not-allowed">
                  {userEmail}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} /> Password
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 cursor-not-allowed flex justify-between items-center">
                  <span>••••••••</span>
                  <button className="text-neo-blue hover:text-blue-700 text-xs uppercase tracking-widest font-black">Change</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-slate-200">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <Award size={24} className="text-emerald-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Account Status</p>
                    <p className="font-bold text-slate-900">Active</p>
                  </div>
                </div>
                <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-4 flex items-start gap-3">
                  <Shield size={24} className="text-sky-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Security</p>
                    <p className="font-bold text-slate-900">Protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
