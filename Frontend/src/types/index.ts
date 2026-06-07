import React from 'react';

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
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  description: string
}
