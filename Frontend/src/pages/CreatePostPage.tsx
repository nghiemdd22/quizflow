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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border-4 border-slate-900 rounded-2xl p-8 shadow-[8px_8px_0px_#0f172a]">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Viết bài mới</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold text-slate-700 mb-2">Tiêu đề bài viết</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 border-4 border-slate-900 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-neo-yellow/50 transition-all"
              placeholder="VD: Xin tài liệu ôn tập Giải tích 1"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">Thẻ phân loại (Chọn ít nhất 1)</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 border-2 border-slate-900 rounded-lg font-bold transition-all ${selectedTags.includes(tag.id) ? 'bg-neo-blue text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">Nội dung</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="w-full p-4 border-4 border-slate-900 rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-neo-yellow/50 transition-all resize-y"
              placeholder="Nhập nội dung bài viết..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">Đính kèm tài liệu</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-neo-blue hover:text-neo-blue transition-all cursor-pointer"
            >
              <Upload className="w-10 h-10 mb-2" />
              <p className="font-bold">Kéo thả file vào đây hoặc bấm để tải lên</p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-100 border-2 border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-5 h-5 text-neo-purple" />
                      <span className="font-bold text-sm truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="p-1 hover:bg-red-100 text-red-500 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t-4 border-slate-900 mt-8">
            <button 
              type="button" 
              onClick={() => navigate('/forum')}
              className="px-6 py-3 bg-white font-bold rounded-xl border-4 border-slate-900 hover:bg-slate-100 transition-all"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 bg-neo-green text-slate-900 font-black rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
