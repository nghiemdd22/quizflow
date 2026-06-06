import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="w-full bg-white py-16 text-left border-b-8 border-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
        {/* Col 1: Brand Info */}
        <div className="sm:col-span-2 lg:col-span-2 flex flex-col items-start gap-4">
          <a href="#" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neo-coral flex items-center justify-center border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]">
              <span className="text-white text-xs">📖</span>
            </div>
            <span className="text-xl font-black">LearnHub</span>
          </a>
          <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-sm">
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
        <div className="col-span-1">
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
        <div className="col-span-1">
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
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
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
  )
}
