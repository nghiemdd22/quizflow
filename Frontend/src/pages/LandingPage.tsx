import React, { useState } from 'react'
import { COURSES_DATA } from '../data/mockData'
import type { Course } from '../types'
import { CourseModal } from '../components/CourseModal'
import { Target, Star, Droplets, Library, Clock, GraduationCap, CheckCircle, Users, Search, BookOpen, User } from 'lucide-react'

interface LandingPageProps {
  isLoggedIn?: boolean
  onOpenSignup: () => void
  onCourseRegister: (course: Course) => void
  onNavigateToJoin: () => void
  onNavigateToHistory: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ isLoggedIn, onOpenSignup, onCourseRegister, onNavigateToJoin, onNavigateToHistory }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'design' | 'data' | 'mobile'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
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

  const filteredCourses = COURSES_DATA.filter(course => {
    const matchesTab = activeTab === 'all' || course.category === activeTab
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <>
      {showLoginToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-rose-100 border-2 border-slate-900 px-6 py-3 rounded-xl shadow-[4px_4px_0px_#0f172a] flex items-center gap-3">
            <span className="text-rose-600 font-extrabold text-sm">Please login to perform this action!</span>
            <button onClick={() => setShowLoginToast(false)} className="text-slate-900 font-bold hover:text-rose-800">✕</button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#d1fae5] border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] text-emerald-800 text-xs font-extrabold mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>New: AI-Powered Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900 mb-6">
            Learn Anything,<br />
            <span className="text-neo-green">Anytime</span>,<br />
            Anywhere!
          </h1>

          <p className="text-lg md:text-xl text-slate-600 font-medium mb-8 max-w-lg leading-relaxed">
            Join millions of learners worldwide. Access 10,000+ courses taught by expert instructors.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <a href="#courses" className="px-6 py-4 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-base gap-2">
              Start Learning Free <span>➔</span>
            </a>
            <a href="#courses" className="px-6 py-4 bg-blue-50 hover:bg-blue-100 text-slate-900 neo-btn text-base border-blue-200">
              Browse Courses
            </a>
          </div>

          <div className="flex gap-10 md:gap-14 border-t-2 border-dashed border-slate-300 pt-8 w-full max-w-md">
            <div>
              <div className="text-3xl font-extrabold">10K+</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Courses</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">2M+</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Students</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">500+</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Instructors</div>
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
                <h3 className="font-extrabold text-lg text-slate-900">Cổng Thi Trực Tuyến</h3>
                <p className="text-xs text-slate-500 font-bold">Tham gia ca thi & tra cứu điểm</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleNavigateToJoin}
                className="w-full py-4 text-base bg-neo-green hover:bg-neo-green-hover text-white neo-btn flex items-center justify-center gap-2"
              >
                Tham gia phòng thi ➔
              </button>
              
              <button
                onClick={handleNavigateToHistory}
                className="w-full py-4 text-base bg-blue-50 hover:bg-blue-100 border-2 border-slate-900 text-slate-900 neo-btn flex items-center justify-center gap-2"
              >
                <Clock size={18} /> Xem lịch sử làm bài
              </button>
            </div>
          </div>

          <div className="absolute -top-6 -right-4 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-rose-500 z-20 animate-bounce"><Target size={20} strokeWidth={3} /></div>
          <div className="absolute top-1/2 -right-8 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-amber-500 z-20 animate-pulse"><Star size={18} strokeWidth={3} /></div>
          <div className="absolute -bottom-4 -right-2 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-cyan-500 z-20"><Droplets size={16} strokeWidth={3} /></div>
          <div className="absolute -bottom-6 -left-6 w-11 h-11 bg-indigo-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-indigo-500 rounded-xl z-20 rotate-[-12deg]"><Library size={20} strokeWidth={3} /></div>
        </div>
      </section>

      {/* EXPLORE COURSES SECTION */}
      <section id="courses" className="w-full bg-white py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex px-4 py-1.5 bg-[#e0f2fe] border-2 border-slate-900 rounded-xl text-sky-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
            Popular Courses
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Explore Top-Rated Courses
          </h2>
          <p className="text-slate-500 font-bold mb-10 text-sm md:text-base">
            Learn from industry experts and gain real-world skills
          </p>

          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {(['all', 'web', 'design', 'data', 'mobile'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0f172a] cursor-pointer ${activeTab === tab
                      ? 'bg-neo-blue text-white'
                      : 'bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  {tab === 'all' && 'All'}
                  {tab === 'web' && 'Web Dev'}
                  {tab === 'design' && 'Design'}
                  {tab === 'data' && 'Data Science'}
                  {tab === 'mobile' && 'Mobile Apps'}
                </button>
              ))}
            </div>

            <div className="w-full md:w-72 relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:ring-0 focus:border-neo-green font-bold bg-[#fdfdfd]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white neo-card neo-card-hover p-6 flex flex-col justify-between text-left group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-slate-100 border border-slate-900 rounded">
                        {course.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border-2 border-emerald-900 bg-emerald-50 text-emerald-700 text-xs font-black shadow-[1px_1px_0px_#064e3b]">
                        <Star size={12} fill="currentColor" /> {course.rating}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${course.iconBg} ${course.iconColor} flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]`}>
                        {course.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg group-hover:text-neo-blue transition-colors leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold">by {course.author}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 border-t border-slate-200 pt-4 mt-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessons} lessons</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {course.hours}h</span>
                    <span className="flex items-center gap-1"><User size={14} /> {course.students} students</span>
                  </div>

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full mt-6 py-2.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-800 neo-btn font-extrabold"
                  >
                    Quick View & Info ➔
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto py-12 px-6 border-4 border-dashed border-slate-300 rounded-3xl flex flex-col items-center">
              <Search size={48} className="text-slate-400" />
              <h3 className="font-bold text-lg mt-4 text-slate-700">No courses found</h3>
              <p className="text-xs text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
            </div>
          )}

          <div className="mt-12">
            <button
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              className="px-6 py-4 bg-blue-50 hover:bg-blue-100 border-blue-200 text-slate-900 neo-btn text-sm"
            >
              View All Courses <span>➔</span>
            </button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section id="why-choose" className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex px-4 py-1.5 bg-[#fee2e2] border-2 border-slate-900 rounded-xl text-rose-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
          Why Choose Us
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
          Everything You Need to Succeed
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><Clock size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Learn at Your Pace</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Access courses anytime, anywhere. Pause, rewind, and replay lessons as needed.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><GraduationCap size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Expert Instructors</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Learn from industry professionals with real-world, practical development experience.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><CheckCircle size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Certificates</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Earn recognized certificates to showcase your completed skills and build your portfolio.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5"><Users size={24} strokeWidth={2.5} /></div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Community Support</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Join an active community of global learners. Ask questions and share project findings.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="w-full bg-white py-16 md:py-24 text-center">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="inline-flex px-4 py-1.5 bg-[#fef08a] border-2 border-slate-900 rounded-xl text-yellow-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
            Student Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
            What Our Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Review 1 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "Quizflow helped me transition from marketing to tech. The courses are well-structured and the community is incredibly supportive!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">J</div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Jessica Wang</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Software Developer</p>
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
                  "The UI/UX course was exactly what I needed. I landed my dream job just 3 months after completing it! The Figma practices are awesome."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">D</div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">David Miller</h4>
                  <p className="text-[10px] text-slate-500 font-bold">UX Designer</p>
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
                  "Best investment I've made in my career. The Python course gave me practical skills I use every day at work. High definition videos!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">M</div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Maria Garcia</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Data Analyst</p>
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
              Ready to Start Learning?
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-semibold mb-8 max-w-xl mx-auto">
              Join over 2 million students and start your learning journey today. First 7 days are completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={onOpenSignup}
                className="w-full sm:w-auto px-8 py-4 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-base"
              >
                Start Free Trial
              </button>
              <a
                href="#courses"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 neo-btn text-base"
              >
                View Pricing
              </a>
            </div>
            <div className="flex justify-center gap-6 text-xs text-slate-500 font-bold">
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <CourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onRegister={() => {
          if (selectedCourse) onCourseRegister(selectedCourse)
          setSelectedCourse(null)
        }}
      />
    </>
  )
}
