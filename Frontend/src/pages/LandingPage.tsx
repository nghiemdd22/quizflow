import React, { useState } from 'react'
import { Target, Clock, ShieldCheck, Zap, BarChart, Users, Server, MonitorPlay, Activity, FileCheck, Star } from 'lucide-react'
import type { Course } from '../types'

interface LandingPageProps {
  isLoggedIn?: boolean
  onOpenSignup: () => void
  onCourseRegister: (course: Course) => void // Kept to prevent breaking App.tsx
  onNavigateToJoin: () => void
  onNavigateToHistory: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ isLoggedIn, onOpenSignup, onNavigateToJoin, onNavigateToHistory }) => {
  const [showLoginToast, setShowLoginToast] = useState(false)

  const handleRequireLogin = () => {
    if (!isLoggedIn) {
      setShowLoginToast(true)
      setTimeout(() => setShowLoginToast(false), 3000)
    }
  }

  const handleNavigateToJoin = () => {
    if (!isLoggedIn) {
      handleRequireLogin()
      return
    }
    onNavigateToJoin()
  }

  const handleNavigateToHistory = () => {
    if (!isLoggedIn) {
      handleRequireLogin()
      return
    }
    onNavigateToHistory()
  }

  return (
    <>
      {showLoginToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-rose-100 border-2 border-slate-900 px-6 py-3 rounded-3xl shadow-[4px_4px_0px_#0f172a] flex items-center gap-3">
            <span className="text-rose-600 font-extrabold text-sm">Please log in to perform this action!</span>
            <button onClick={() => setShowLoginToast(false)} className="text-slate-900 font-bold hover:text-rose-800">✕</button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#d1fae5] border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] text-emerald-800 text-xs font-extrabold mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Version v2.0: Ultra-Fast Experience</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 mb-5">
            Professional <br />
            <span className="text-neo-green">Online Exam Platform</span>,<br />
            Accurate & Lightning Fast!
          </h1>

          <p className="text-base md:text-lg text-slate-600 font-bold mb-8 max-w-lg leading-relaxed">
            Advanced online exam system. Comprehensive anti-cheat protection and instant grading.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            {isLoggedIn ? (
              <a href="#why-choose-us" className="px-6 py-4 bg-neo-yellow hover:bg-yellow-400 text-slate-900 neo-btn text-base gap-2 inline-flex items-center">
                Why Choose Us <span>↓</span>
              </a>
            ) : (
              <button onClick={onOpenSignup} className="px-6 py-4 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-base gap-2">
                Start for Free <span>➔</span>
              </button>
            )}
            <a href="#features" className="px-6 py-4 bg-blue-50 hover:bg-blue-100 text-slate-900 neo-btn text-base border-blue-200">
              Explore Features
            </a>
          </div>

          <div className="flex gap-10 md:gap-14 border-t-2 border-dashed border-slate-300 pt-8 w-full max-w-md">
            <div>
              <div className="text-3xl font-extrabold">100K+</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Exams Taken</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">99.9%</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">&lt;50ms</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Latency</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative flex justify-center">
          <div className="w-full max-w-md bg-white neo-card p-6 relative z-10 hover:rotate-1 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center border-2 border-slate-900 text-rose-500 font-bold shadow-[2px_2px_0px_#0f172a]">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-lg text-slate-900">Online Exam Portal</h3>
                <p className="text-xs text-slate-500 font-bold">Join exams & view results</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleNavigateToJoin}
                className="w-full py-4 text-base bg-neo-green hover:bg-neo-green-hover text-white neo-btn flex items-center justify-center gap-2"
              >
                Join Exam Room ➔
              </button>
              
              <button
                onClick={handleNavigateToHistory}
                className="w-full py-4 text-base bg-blue-50 hover:bg-blue-100 border-2 border-slate-900 text-slate-900 neo-btn flex items-center justify-center gap-2"
              >
                <Clock size={18} /> View Exam History
              </button>
            </div>
          </div>

          <div className="absolute -top-6 -right-4 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-rose-500 z-20 animate-bounce"><ShieldCheck size={20} strokeWidth={3} /></div>
          <div className="absolute top-1/2 -right-8 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-amber-500 z-20 animate-pulse"><Zap size={18} strokeWidth={3} /></div>
          <div className="absolute -bottom-4 -right-2 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-cyan-500 z-20"><Activity size={16} strokeWidth={3} /></div>
          <div className="absolute -bottom-6 -left-6 w-11 h-11 bg-indigo-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-indigo-500 rounded-xl z-20 rotate-[-12deg]"><Server size={20} strokeWidth={3} /></div>
        </div>
      </section>

      {/* EXPLORE FEATURES SECTION */}
      <section id="features" className="w-full bg-white py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex px-4 py-1.5 bg-[#e0f2fe] border-2 border-slate-900 rounded-xl text-sky-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
            Core Features
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Cutting-Edge Testing Technology
          </h2>
          <p className="text-slate-500 font-bold mb-12 text-sm md:text-base">
            Solve scalability, speed, and cheating challenges in online testing.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white neo-card p-8 flex flex-col text-left group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl group-hover:text-neo-blue transition-colors">Strict Anti-Cheat System</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Ensures Fair Play</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Automatically detects suspicious behavior like tab switching or screen sharing. The system instantly alerts and pauses the exam to prevent cheating.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white neo-card p-8 flex flex-col text-left group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                  <Server size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl group-hover:text-neo-blue transition-colors">Seamless Experience</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Never Lose Your Work</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Built to handle thousands of students simultaneously without slowing down. Even if your internet connection drops, your answers are safely saved.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white neo-card p-8 flex flex-col text-left group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                  <BarChart size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl group-hover:text-neo-blue transition-colors">Real-time Analytics</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Intuitive Dashboard for Teachers</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Teachers can track the progress of the entire class in real time. Automatic score distribution reports render instantly after the exam.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white neo-card p-8 flex flex-col text-left group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                  <MonitorPlay size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl group-hover:text-neo-blue transition-colors">Distraction-Free Design</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Focused & User-friendly Interface</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Clean and intuitive design, helping candidates reduce psychological pressure and maximize focus during the exam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section id="why-choose-us" className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex px-4 py-1.5 bg-[#fee2e2] border-2 border-slate-900 rounded-xl text-rose-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
          Why Choose Us
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
          Why Choose Quizflow?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><ShieldCheck size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Absolute Security</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              All data connections are end-to-end encrypted. Students cannot inspect source code to find answers.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><Zap size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Built on a robust infrastructure capable of handling up to 10,000 concurrent students smoothly without bottlenecks.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><FileCheck size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">100% Accuracy</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Smart automated grading system, supporting various complex multiple-choice question types instantly.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><Users size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Easy Management</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Teachers can create question banks and manage exam sessions with just a few intuitive clicks.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="w-full bg-white py-16 md:py-24 text-center">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="inline-flex px-4 py-1.5 bg-[#fef08a] border-2 border-slate-900 rounded-xl text-yellow-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Review 1 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "Since using Quizflow, I no longer worry about students cheating. The tracking system is incredibly responsive!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">T</div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Mr. Trong</h4>
                  <p className="text-[10px] text-slate-500 font-bold">High School Math Teacher</p>
                </div>
              </div>
            </div>
            {/* Review 2 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "Exams used to crash frequently. With Quizflow, it's super smooth. You click submit and get your score instantly."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">A</div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">An Nguyen</h4>
                  <p className="text-[10px] text-slate-500 font-bold">IT Student</p>
                </div>
              </div>
            </div>
            {/* Review 3 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "Setting up a 100-question exam takes less than 5 minutes. The automatic score distribution reports save us so much time."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">L</div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Ms. Lan Anh</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Head of Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta" className="w-full bg-[#bfdbfe] py-16 md:py-24">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="bg-white neo-card p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Ready to Elevate Your Exam Quality?
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-semibold mb-8 max-w-xl mx-auto">
              Sign up for a Teacher account today to experience powerful online testing tools for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={onOpenSignup}
                className="w-full sm:w-auto px-8 py-4 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-base"
              >
                Create Teacher Account
              </button>
              <button
                onClick={handleNavigateToJoin}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 neo-btn text-base"
              >
                Student: Join Exam Room
              </button>
            </div>
            <div className="flex justify-center gap-6 text-xs text-slate-500 font-bold">
              <span>✓ No Credit Card Required</span>
              <span>✓ Free tier limits 50 candidates/session</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
