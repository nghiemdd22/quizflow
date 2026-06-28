import React, { forwardRef } from 'react'

interface Question {
  id: number
  questionBankId: number
  content: string
  type: string
  metadata: any
}

interface QuestionBank {
  id: number
  title: string
  description: string
  subjectId: number
}

interface PrintableExamProps {
  bank: QuestionBank
  questions: Question[]
}

export const PrintableExam = forwardRef<HTMLDivElement, PrintableExamProps>(({ bank, questions }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-10 font-serif" style={{ width: '100%', minHeight: '100vh' }}>
      {/* CSS dành riêng cho bản in để ẩn các nút, link, xóa shadow, v.v. */}
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 20mm; }
          body { background-color: white !important; margin: 0; padding: 0; }
        `}
      </style>

      {/* Header đề thi */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase mb-2">ĐỀ THI: {bank.title}</h1>
        {bank.description && <p className="text-sm italic text-gray-700">{bank.description}</p>}
        <div className="mt-4 flex justify-between text-sm font-semibold">
          <div>Họ và tên thí sinh: .....................................................</div>
          <div>Mã đề: .......</div>
        </div>
        <div className="mt-2 text-left text-sm font-semibold">
          Lớp / Mã sinh viên: .....................................................
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => {
          const meta = typeof q.metadata === 'string' ? JSON.parse(q.metadata || '{}') : (q.metadata || {})
          const isMultiple = q.type === 'MULTIPLE'
          const options = meta.options || []

          return (
            <div key={q.id} className="break-inside-avoid">
              <div className="font-bold text-base mb-2">
                Câu {idx + 1}: <span className="font-normal">{q.content}</span>
                {isMultiple && <span className="text-xs italic ml-1">(Chọn nhiều đáp án)</span>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 pl-4">
                {options.map((opt: { id: number; text: string }, optIdx: number) => {
                  const letter = String.fromCharCode(65 + optIdx) // A, B, C, D...
                  return (
                    <div key={opt.id} className="flex items-start gap-2">
                      <div className="w-5 h-5 border border-black flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                        <span className="text-[10px] font-bold text-transparent">{letter}</span>
                      </div>
                      <span className="text-sm"><span className="font-bold mr-1">{letter}.</span> {opt.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs italic">
        --- Hết ---
      </div>
    </div>
  )
})

PrintableExam.displayName = 'PrintableExam'
