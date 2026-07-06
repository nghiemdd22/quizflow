import React from 'react'
import { BookOpen, ShieldCheck, Zap, Mail, Phone, MapPin, Code, Users, MessageSquare, Globe } from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neo-bg pt-32 pb-20 px-4 font-inter">
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-neo-yellow border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a] text-slate-900 font-extrabold mb-8 rotate-[-2deg] hover:rotate-0 transition-transform">
          <BookOpen size={20} strokeWidth={2.5} />
          <span>About Quizflow Platform</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          Redefining Online <br className="hidden md:block" />
          <span className="text-neo-coral underline decoration-8 underline-offset-8">Assessments.</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
          Quizflow is a next-generation platform designed to handle thousands of concurrent exams with zero latency, strict anti-cheat protection, and a seamless neo-brutalism experience.
        </p>
      </section>

      {/* Core Values / Mission */}
      <section className="w-full max-w-5xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-sky-100 text-sky-900 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-black mb-4">Our Mission</h2>
            <p className="text-sky-700 font-bold leading-relaxed text-base">
              To empower educators and institutions with a reliable, ultra-fast, and secure testing environment that guarantees fair play and eliminates the stress of technical failures during exams.
            </p>
          </div>
          <div className="grid grid-rows-2 gap-6">
            <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">High Performance</h3>
                <p className="text-slate-600 font-bold mt-1 text-sm">Built to handle massive scale.</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Fair & Secure</h3>
                <p className="text-slate-600 font-bold mt-1 text-sm">Advanced anti-cheat measures.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="w-full max-w-4xl mx-auto mb-16 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8">Built for Both Sides of Education</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          {/* Teacher Role */}
          <div className="bg-[#fff7ed] neo-card p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Teachers</h3>
            <p className="text-slate-700 font-bold leading-relaxed text-sm">
              Educators have full control to <span className="text-orange-600 font-black">create, manage, and schedule exams</span>. Monitor student progress in real-time, view detailed analytics, and trust that the anti-cheat system maintains academic integrity.
            </p>
          </div>
          
          {/* Student Role */}
          <div className="bg-[#f0fdf4] neo-card p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Students</h3>
            <p className="text-slate-700 font-bold leading-relaxed text-sm">
              Students get a distraction-free, ultra-fast interface to <span className="text-neo-green font-black">take exams and view results</span>. Just enter a PIN to join a room, submit answers seamlessly, and instantly review your detailed performance history.
            </p>
          </div>
        </div>
      </section>

      {/* Beyond Just Testing Section */}
      <section className="w-full max-w-5xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">More Than Just Exams</h2>
          <p className="text-slate-500 font-bold">A complete ecosystem for collaborative learning and resource sharing.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 shrink-0">
              <Users size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Classroom Hubs</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Students can easily join classes via invite codes. Once inside, teachers can upload study materials, and students can access them anytime to prepare for upcoming tests.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-5 shrink-0">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Real-time Class Chat</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Stay connected with your peers and educators. Every classroom features a real-time chat for instant Q&A, important announcements, and group discussions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 shrink-0">
              <Globe size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Knowledge Forum</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              A vibrant public community where users across the platform can create posts, share study guides, discuss solutions, and upvote the most helpful resources.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="bg-white neo-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-neo-coral/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Get in Touch</h2>
            <p className="text-slate-500 font-bold text-sm">Have questions or want to partner with us? Reach out!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-900 hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                  <Mail size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                  <a href="mailto:hello@quizflow.com" className="text-base font-bold text-slate-900 hover:text-neo-blue transition-colors">hello@quizflow.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-900 hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                  <Phone size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="text-base font-bold text-slate-900">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-900 hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                  <MapPin size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Office</p>
                  <p className="text-base font-bold text-slate-900">123 Tech Boulevard,<br />Innovation City</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-900 hover:shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                  <Code size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Open Source</p>
                  <a href="#" className="text-base font-bold text-slate-900 hover:text-neo-blue transition-colors">github.com/quizflow</a>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  )
}
