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

export type SessionStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'CLOSED'

export interface StudentQuestionDTO {
  id: number
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'SINGLE' | 'MULTIPLE' | 'FILL'
  content: string
  metadata: any
}

export interface ExamRoomResponse {
  sessionId: number
  examTitle: string
  status: SessionStatus
  startTime: string
  endTime: string
  serverTime: string
  durationMinutes: number
  submissionId: number
  questions: StudentQuestionDTO[]
}

export type NotificationType = 'EXAM_CREATED' | 'DOCUMENT_UPLOADED' | 'CHEAT_DETECTED' | 'CHAT_BADGE_UPDATE'

export interface NotificationDTO {
  id: number
  title: string
  message: string
  type: NotificationType
  relatedId?: number
  isRead: boolean
  createdAt: string
}

export interface CheatEventDTO {
  detail: string
  timestamp: string
}

export interface ProctoringStudentDTO {
  studentName: string
  username: string
  startedAt: string
  cheatCount: number
  cheatEvents: CheatEventDTO[]
}

export interface ProctoringDashboardDTO {
  examTitle: string
  startTime: string
  endTime: string
  durationMinutes: number
  totalStudentsInClass: number
  studentsInProgress: number
  studentsSubmitted: number
  studentsNotStarted: number
  students: ProctoringStudentDTO[]
}