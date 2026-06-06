import React, { useState, useEffect } from 'react'

// ==========================================
// CẤU TRÚC DỮ LIỆU & KIỂU DỮ LIỆU (TYPES)
// ==========================================

interface Course {
  id: string
  title: string
  author: string
  category: 'web' | 'design' | 'data' | 'mobile'
  categoryLabel: string
  lessons: number
  hours: number
  students: string
  rating: number
  icon: string
  iconBg: string
  iconColor: string
  description: string
}

const COURSES_DATA: Course[] = [
  {
    id: 'course-1',
    title: 'Web Development Bootcamp',
    author: 'Sarah Chen',
    category: 'web',
    categoryLabel: 'Web Development',
    lessons: 48,
    hours: 24,
    students: '12.5K',
    rating: 4.9,
    icon: '</>',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    description: 'Học lập trình web từ cơ bản đến nâng cao. Làm chủ HTML, CSS, JavaScript, React và Node.js thông qua các dự án thực tế.'
  },
  {
    id: 'course-2',
    title: 'UI/UX Design Mastery',
    author: 'Mike Johnson',
    category: 'design',
    categoryLabel: 'Design',
    lessons: 36,
    hours: 18,
    students: '8.2K',
    rating: 4.8,
    icon: '❏',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    description: 'Thiết kế giao diện và trải nghiệm người dùng chuyên nghiệp. Làm chủ Figma, wireframe, thiết kế tương tác và nghiên cứu người dùng.'
  },
  {
    id: 'course-3',
    title: 'Data Science with Python',
    author: 'Emily Davis',
    category: 'data',
    categoryLabel: 'Data Science',
    lessons: 52,
    hours: 30,
    students: '15.3K',
    rating: 4.9,
    icon: '📊',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    description: 'Khám phá thế giới dữ liệu lớn. Học cách xử lý dữ liệu với Pandas, trực quan hóa với Matplotlib, và xây dựng mô hình Machine Learning.'
  },
  {
    id: 'course-4',
    title: 'Mobile App Development',
    author: 'Alex Kim',
    category: 'mobile',
    categoryLabel: 'Mobile Apps',
    lessons: 42,
    hours: 22,
    students: '9.8K',
    rating: 4.7,
    icon: '📱',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    description: 'Xây dựng các ứng dụng di động đa nền tảng tuyệt đẹp cho cả iOS và Android sử dụng React Native hoặc Flutter.'
  }
]

function App() {
  // ==========================================
  // LOGIC & STATE QUẢN LÝ TƯƠNG TÁC (REACT STATES)
  // ==========================================
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'design' | 'data' | 'mobile'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  // Auth state
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [identityCard, setIdentityCard] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // Scroll state
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false) // cuộn xuống -> ẩn
      } else {
        setIsHeaderVisible(true) // cuộn lên -> hiện
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // State thanh tiến trình giả lập trên Hero Card (tự động tăng động)
  const [progressPercent, setProgressPercent] = useState(65)
  const [isStudying, setIsStudying] = useState(true)

  // Giả lập tăng tiến trình khi đang bật chế độ học
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isStudying) {
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) return 30 // Reset lại khi đầy
          return prev + 1
        })
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isStudying])

  // Lọc khóa học dựa theo Danh mục (activeTab) và Tìm kiếm (searchQuery)
  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesCategory = activeTab === 'all' || course.category === activeTab
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Hàm gọi API đăng nhập/đăng ký
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (authMode === 'login') {
      if (!email || !password) return alert('Vui lòng điền đầy đủ thông tin!')
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        })
        const data = await res.json()
        if (res.ok) {
          setIsLoggedIn(true)
          setUserEmail(data.username || email)
          setIsAuthOpen(false)
          setEmail('')
          setPassword('')
        } else {
          alert(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác!')
        }
      } catch {
        alert('Có lỗi xảy ra khi kết nối server')
      }
    } else {
      if (!email || !password || !fullName || !phone || !identityCard) return alert('Vui lòng điền đầy đủ thông tin!')
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
            role: 'STUDENT'
          })
        })
        
        if (res.ok) {
          alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
          setAuthMode('login')
        } else {
          const data = await res.json()
          alert(data.error || 'Đăng ký thất bại!')
        }
      } catch {
        alert('Có lỗi xảy ra khi kết nối server')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-slate-900 font-sans selection:bg-neo-green selection:text-white pt-28">
      {/* ==========================================
          NAVBAR SECTION
          ========================================== */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 pt-6">
        <nav className="bg-white neo-card px-6 py-4 flex items-center justify-between">
          {/* Logo LearnHub */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-neo-coral flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_#0f172a] transition-all">
              <span className="text-white text-lg font-bold">📖</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">LearnHub</span>
          </a>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            <a href="#courses" className="hover:text-neo-green transition-colors">Courses</a>
            <a href="#why-choose" className="hover:text-neo-blue transition-colors">Teachers</a>
            <a href="#cta" className="hover:text-neo-purple transition-colors">Pricing</a>
            <a href="#footer" className="hover:text-neo-coral transition-colors">About</a>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-slate-100 border-2 border-slate-900 px-2 py-1 rounded-md font-bold">
                  {userEmail}
                </span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="px-4 py-2 text-xs neo-btn bg-red-100 hover:bg-red-200 text-red-700"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                  className="font-bold text-sm hover:text-neo-green transition-colors cursor-pointer px-2 py-1"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                  className="px-5 py-2.5 bg-neo-green hover:bg-neo-green-hover text-white text-sm neo-btn"
                >
                  Start Free
                </button>
              </>
            )}
          </div>
        </nav>
        </div>
      </div>

      {/* ==========================================
          HERO SECTION
          ========================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center">
        {/* Hero Left Info */}
        <div className="md:col-span-7 flex flex-col items-start text-left">
          {/* Badge 'New: AI-Powered Learning' */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#d1fae5] border-2 border-slate-900 rounded-full shadow-[2px_2px_0px_#0f172a] text-emerald-800 text-xs font-extrabold mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>New: AI-Powered Learning</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900 mb-6">
            Learn Anything,<br />
            <span className="text-neo-green">Anytime</span>,<br />
            Anywhere!
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 font-medium mb-8 max-w-lg leading-relaxed">
            Join millions of learners worldwide. Access 10,000+ courses taught by expert instructors.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href="#courses"
              className="px-6 py-4 bg-neo-green hover:bg-[#0d9488] text-white neo-btn text-base gap-2"
            >
              Start Learning Free <span>➔</span>
            </a>
            <a
              href="#courses"
              className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-900 neo-btn text-base"
            >
              Browse Courses
            </a>
          </div>

          {/* Quick Stats Grid */}
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

        {/* Hero Right Widget (Interactive UI Showcase) */}
        <div className="md:col-span-5 relative flex justify-center">
          {/* Main Progress Widget Card */}
          <div className="w-full max-w-md bg-white neo-card p-6 relative z-10 hover:rotate-1 transition-transform duration-300">
            {/* Header info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-slate-900 text-2xl font-bold shadow-[2px_2px_0px_#0f172a]">
                💻
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-base text-slate-900">Web Development</h3>
                <p className="text-xs text-slate-500 font-bold">12 lessons • 4h 30m</p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Progress</span>
                <span className="font-mono text-neo-green">{progressPercent}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-neo-green border-r border-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Continue button (Interactive toggler for simulation) */}
            <button
              onClick={() => setIsStudying(!isStudying)}
              className={`w-full py-3.5 text-sm neo-btn text-white ${
                isStudying ? 'bg-[#047857]' : 'bg-[#0f172a]'
              }`}
            >
              {isStudying ? '⏸ Pause Simulation' : '▶ Continue Learning'}
            </button>
          </div>

          {/* Floating Sticker 1: Target Icon (Top-right) */}
          <div className="absolute -top-6 -right-4 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-xl z-20 animate-bounce">
            🎯
          </div>
          {/* Floating Sticker 2: Star Icon (Right-middle) */}
          <div className="absolute top-1/2 -right-8 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-lg z-20 animate-pulse">
            ⭐
          </div>
          {/* Floating Sticker 3: Water drops (Bottom-right) */}
          <div className="absolute -bottom-4 -right-2 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-sm z-20">
            💧
          </div>
          {/* Floating Sticker 4: Layers Icon (Bottom-left) */}
          <div className="absolute -bottom-6 -left-6 w-11 h-11 bg-indigo-100 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-lg rounded-xl z-20 rotate-[-12deg]">
            🥞
          </div>
        </div>
      </section>

      {/* ==========================================
          EXPLORE COURSES SECTION (FILTERABLE & SEARCHABLE)
          ========================================== */}
      <section id="courses" className="w-full bg-white border-t-4 border-b-4 border-slate-900 py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          {/* Section Header */}
          <div className="inline-flex px-4 py-1.5 bg-[#e0f2fe] border-2 border-slate-900 rounded-full text-sky-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
            Popular Courses
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Explore Top-Rated Courses
          </h2>
          <p className="text-slate-500 font-bold mb-10 text-sm md:text-base">
            Learn from industry experts and gain real-world skills
          </p>

          {/* Filtering Tabs & Search Input Group */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3">
              {(['all', 'web', 'design', 'data', 'mobile'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0f172a] cursor-pointer ${
                    activeTab === tab
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

            {/* Dynamic Search Box */}
            <div className="w-full md:w-72 relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:ring-0 focus:border-neo-green font-bold bg-[#fdfdfd]"
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

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white neo-card neo-card-hover p-6 flex flex-col justify-between text-left group"
                >
                  <div>
                    {/* Badge / Category and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-slate-100 border border-slate-900 rounded">
                        {course.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-emerald-900 bg-emerald-50 text-emerald-700 text-xs font-black">
                        ⭐ {course.rating}
                      </div>
                    </div>

                    {/* Course Card Header */}
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

                  {/* Course Specs Stats */}
                  <div className="flex items-center gap-5 border-t border-slate-200 pt-4 mt-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">📖 {course.lessons} lessons</span>
                    <span className="flex items-center gap-1">⏰ {course.hours}h</span>
                    <span className="flex items-center gap-1">👤 {course.students} students</span>
                  </div>

                  {/* Action button inside card */}
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
            <div className="max-w-md mx-auto py-12 px-6 border-4 border-dashed border-slate-300 rounded-2xl">
              <span className="text-4xl">🔍</span>
              <h3 className="font-bold text-lg mt-4 text-slate-700">No courses found</h3>
              <p className="text-xs text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
            </div>
          )}

          {/* View All Button */}
          <div className="mt-12">
            <button
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              className="px-6 py-4 bg-sky-100 hover:bg-sky-200 text-sky-900 neo-btn text-sm"
            >
              View All Courses <span>➔</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          WHY CHOOSE US SECTION
          ========================================== */}
      <section id="why-choose" className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* Category Badge */}
        <div className="inline-flex px-4 py-1.5 bg-[#fee2e2] border-2 border-slate-900 rounded-full text-rose-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
          Why Choose Us
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
          Everything You Need to Succeed
        </h2>

        {/* Feature Cards Grid (4 columns) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Learn at Your Pace */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5">
              ⏰
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Learn at Your Pace</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Access courses anytime, anywhere. Pause, rewind, and replay lessons as needed.
            </p>
          </div>

          {/* Card 2: Expert Instructors */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5">
              🎓
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Expert Instructors</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Learn from industry professionals with real-world, practical development experience.
            </p>
          </div>

          {/* Card 3: Certificates */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5">
              ✔
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Certificates</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Earn recognized certificates to showcase your completed skills and build your portfolio.
            </p>
          </div>

          {/* Card 4: Community Support */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl font-bold border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] mb-5">
              👥
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">Community Support</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Join an active community of global learners. Ask questions and share project findings.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          TESTIMONIALS SECTION
          ========================================== */}
      <section className="w-full bg-[#fbfbf8] border-t-4 border-slate-900 py-16 md:py-24 text-center">
        <div className="w-full max-w-7xl mx-auto px-4">
          {/* Badge */}
          <div className="inline-flex px-4 py-1.5 bg-[#fef08a] border-2 border-slate-900 rounded-full text-yellow-800 text-xs font-extrabold mb-4 shadow-[2px_2px_0px_#0f172a]">
            Student Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
            What Our Students Say
          </h2>

          {/* Testimonial Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Review 1 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 font-bold mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "LearnHub helped me transition from marketing to tech. The courses are well-structured and the community is incredibly supportive!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">
                  J
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Jessica Wang</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Software Developer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 font-bold mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "The UI/UX course was exactly what I needed. I landed my dream job just 3 months after completing it! The Figma practices are awesome."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">
                  D
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">David Miller</h4>
                  <p className="text-[10px] text-slate-500 font-bold">UX Designer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-6 neo-card text-left flex flex-col justify-between">
              <div>
                <div className="text-amber-500 font-bold mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  "Best investment I've made in my career. The Python course gave me practical skills I use every day at work. High definition videos!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-slate-900 text-sm font-bold shadow-[1px_1px_0px_#0f172a]">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Maria Garcia</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Data Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          CTA SECTION (NEO-BRUTALISM BOX CARD)
          ========================================== */}
      <section id="cta" className="w-full bg-[#bfdbfe] border-t-4 border-b-4 border-slate-900 py-16 md:py-24">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="bg-white neo-card p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Ready to Start Learning?
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-semibold mb-8 max-w-xl mx-auto">
              Join over 2 million students and start your learning journey today. First 7 days are completely free!
            </p>

            {/* Sign up form & Button inputs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
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

            {/* Sub-features text */}
            <div className="flex justify-center gap-6 text-xs text-slate-500 font-bold">
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER SECTION
          ========================================== */}
      <footer id="footer" className="w-full bg-white py-16 text-left border-b-8 border-slate-900">
        <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <a href="#" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neo-coral flex items-center justify-center border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                <span className="text-white text-xs">📖</span>
              </div>
              <span className="text-xl font-black">LearnHub</span>
            </a>
            <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs">
              Empowering millions of learners worldwide with quality education accessible to everyone.
            </p>
            {/* Social Icons (mock anchors) */}
            <div className="flex gap-3 mt-2">
              {['𝕏', 'ⓕ', '📷', '📹'].map((socialIcon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center border-2 border-slate-900 text-sm font-extrabold shadow-[1.5px_1.5px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#0f172a] transition-all"
                >
                  {socialIcon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Courses links */}
          <div className="md:col-span-2.5">
            <h4 className="font-extrabold text-sm text-slate-900 mb-4 uppercase tracking-wider">Courses</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 font-bold">
              <li><a href="#" className="hover:text-neo-blue transition-colors">Web Development</a></li>
              <li><a href="#" className="hover:text-neo-blue transition-colors">Design</a></li>
              <li><a href="#" className="hover:text-neo-blue transition-colors">Data Science</a></li>
              <li><a href="#" className="hover:text-neo-blue transition-colors">Mobile Apps</a></li>
              <li><a href="#" className="hover:text-neo-blue transition-colors">Marketing</a></li>
            </ul>
          </div>

          {/* Col 3: Company links */}
          <div className="md:col-span-2.5">
            <h4 className="font-extrabold text-sm text-slate-900 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 font-bold">
              <li><a href="#" className="hover:text-neo-purple transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-neo-purple transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-neo-purple transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-neo-purple transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-neo-purple transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Col 4: Support links */}
          <div className="md:col-span-3">
            <h4 className="font-extrabold text-sm text-slate-900 mb-4 uppercase tracking-wider">Support</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 font-bold">
              <li><a href="#" className="hover:text-neo-coral transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-neo-coral transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-neo-coral transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-neo-coral transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom copyright lines */}
        <div className="w-full max-w-7xl mx-auto px-4 border-t-2 border-slate-100 pt-8 mt-10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-slate-400 gap-4">
          <p>© 2026 LearnHub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Cookies</a>
          </div>
        </div>
      </footer>

      {/* ==========================================
          MODALS INTERACTIVE BEHAVIORS (POPUP JS LOGIC)
          ========================================== */}

      {/* 1. AUTH MODAL (LOGIN / SIGNUP) */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfbf8] neo-card p-6 md:p-8 max-w-md w-full relative">
            {/* Close button */}
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Heading Title */}
            <h3 className="text-2xl font-black text-slate-900 mb-6 text-left">
              {authMode === 'login' ? 'Đăng Nhập LearnHub' : 'Đăng Ký Tài Khoản'}
            </h3>

            {/* Form */}
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
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
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
                      className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
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
                        className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
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
                        className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
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
                  className="w-full px-4 py-2 text-sm border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] focus:outline-none focus:border-neo-green font-bold bg-white"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-sm"
              >
                {authMode === 'login' ? 'Xác Nhận Đăng Nhập' : 'Tạo Tài Khoản Free'}
              </button>

              {/* Toggle modal auth mode */}
              <p className="text-xs text-slate-500 font-bold text-center mt-3">
                {authMode === 'login' ? 'Chưa có tài khoản LearnHub?' : 'Đã có tài khoản?'}{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-neo-blue underline hover:text-blue-700 font-black cursor-pointer"
                >
                  {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ở đây'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* 2. COURSE QUICK VIEW MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfbf8] neo-card p-6 md:p-8 max-w-xl w-full relative text-left">
            {/* Close button */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Course icon & Category */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${selectedCourse.iconBg} ${selectedCourse.iconColor} flex items-center justify-center text-lg font-bold border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]`}>
                {selectedCourse.icon}
              </div>
              <span className="text-xs font-black bg-slate-100 border border-slate-900 px-2 py-0.5 rounded">
                {selectedCourse.categoryLabel}
              </span>
              <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-900 px-2 py-0.5 rounded">
                ★ {selectedCourse.rating}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-snug">
              {selectedCourse.title}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4">Giảng viên phụ trách: {selectedCourse.author}</p>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed font-semibold mb-6">
              {selectedCourse.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] mb-6 text-center">
              <div>
                <div className="text-lg font-black text-slate-800">{selectedCourse.lessons}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Bài học</div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-800">{selectedCourse.hours}h</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Thời lượng</div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-800">{selectedCourse.students}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Học viên</div>
              </div>
            </div>

            {/* CTA action */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedCourse(null)
                  setIsLoggedIn(true)
                  setUserEmail('trial@learnhub.com')
                  alert(`Đăng ký học thử khóa "${selectedCourse.title}" thành công!`)
                }}
                className="flex-1 py-3 bg-neo-green hover:bg-[#0d9488] text-white neo-btn text-sm"
              >
                Đăng Ký Học Thử Miễn Phí
              </button>
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 neo-btn text-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
