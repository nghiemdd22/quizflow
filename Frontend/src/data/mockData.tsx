import type { Course } from '../types'
import { Code, Palette, BarChart, Smartphone } from 'lucide-react'

export const COURSES_DATA: Course[] = [
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
    icon: <Code size={24} />,
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
    icon: <Palette size={24} />,
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
    icon: <BarChart size={24} />,
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
    icon: <Smartphone size={24} />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    description: 'Xây dựng các ứng dụng di động đa nền tảng tuyệt đẹp cho cả iOS và Android sử dụng React Native hoặc Flutter.'
  }
]
