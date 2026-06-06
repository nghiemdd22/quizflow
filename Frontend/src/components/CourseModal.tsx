import React from 'react'
import type { Course } from '../types'

interface CourseModalProps {
  course: Course | null
  onClose: () => void
  onRegister: () => void
}

export const CourseModal: React.FC<CourseModalProps> = ({ course, onClose, onRegister }) => {
  if (!course) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fbfbf8] neo-card p-6 md:p-8 max-w-xl w-full relative text-left">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${course.iconBg} ${course.iconColor} flex items-center justify-center text-lg font-bold border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]`}>
            {course.icon}
          </div>
          <span className="text-xs font-black bg-slate-100 border border-slate-900 px-2 py-0.5 rounded">
            {course.categoryLabel}
          </span>
          <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-900 px-2 py-0.5 rounded">
            ★ {course.rating}
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 font-bold mb-4">Giảng viên phụ trách: {course.author}</p>

        <p className="text-sm text-slate-600 leading-relaxed font-semibold mb-6">
          {course.description}
        </p>

        <div className="grid grid-cols-3 gap-4 p-4 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a] mb-6 text-center">
          <div>
            <div className="text-lg font-black text-slate-800">{course.lessons}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Bài học</div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">{course.hours}h</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Thời lượng</div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">{course.students}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Học viên</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onRegister}
            className="flex-1 py-3 bg-neo-green hover:bg-[#0d9488] text-white neo-btn text-sm"
          >
            Đăng Ký Học Thử Miễn Phí
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 neo-btn text-sm"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  )
}
