export interface Course {
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
