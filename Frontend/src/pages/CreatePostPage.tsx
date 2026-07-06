import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { apiFetch, apiFetchMultipart } from '../utils/api'

export function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch('/api/v1/tags')
      .then(res => res.json())
      .then(data => setAvailableTags(data))
      .catch(console.error)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...droppedFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files)
      setFiles(prev => [...prev, ...selected])
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const toggleTag = (id: number) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || selectedTags.length === 0) {
      alert("Vui lòng nhập đủ Tiêu đề, Nội dung và chọn ít nhất 1 Thẻ")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      selectedTags.forEach(id => formData.append('tagIds', id.toString()))
      files.forEach(file => formData.append('files', file))

      // Upload with multipart
      const res = await apiFetchMultipart('/api/v1/posts', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error("Lỗi đăng bài")
      
      const data = await res.json()
      navigate(`/forum/${data.id}`)
    } catch (e) {
      console.error(e)
      alert("Có lỗi xảy ra khi đăng bài")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-24 pb-12 px-4 w-full max-w-4xl mx-auto">
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 lg:p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Viết bài mới</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-sm">Tiêu đề bài viết</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-neo-blue transition-colors bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="VD: Xin tài liệu ôn tập Giải tích 1"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-2 text-sm">Thẻ phân loại (Chọn ít nhất 1)</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 border-2 rounded-full text-xs font-bold transition-all ${selectedTags.includes(tag.id) ? 'bg-neo-blue border-neo-blue text-white shadow-md -translate-y-0.5' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 hover:text-slate-700'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-sm">Nội dung</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="w-full p-3 border-2 border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-neo-blue transition-colors resize-y bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="Nhập nội dung chi tiết của bài viết..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-sm">Đính kèm tài liệu</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-neo-blue hover:text-neo-blue transition-colors cursor-pointer bg-slate-50 group"
            >
              <Upload className="w-8 h-8 mb-2 text-slate-300 group-hover:text-neo-blue transition-colors" />
              <p className="font-bold text-sm text-slate-700 group-hover:text-neo-blue transition-colors">Kéo thả file vào đây hoặc bấm để tải lên</p>
              <p className="font-medium text-xs text-slate-400 mt-1">Hỗ trợ PDF, DOCX, ZIP, hình ảnh (tối đa 10MB)</p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border-2 border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate text-slate-700">{file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors ml-2 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t-2 border-dashed border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={() => navigate('/forum')}
              className="px-5 py-2 font-bold rounded-full border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-neo-blue text-white font-black rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
            >
              {isSubmitting ? 'Đang tải lên...' : 'Đăng bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
