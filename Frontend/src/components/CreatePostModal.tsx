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
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="bg-white border border-slate-300 rounded-lg p-6 lg:p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Viết bài mới</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium text-slate-700 mb-1.5 text-sm">Tiêu đề bài viết</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="VD: Xin tài liệu ôn tập Giải tích 1"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-2 text-sm">Thẻ phân loại (Chọn ít nhất 1)</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 border rounded-full text-xs font-medium transition-colors ${selectedTags.includes(tag.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5 text-sm">Nội dung</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="w-full p-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-y bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="Nhập nội dung bài viết..."
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5 text-sm">Đính kèm tài liệu</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 rounded-md p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer bg-slate-50"
            >
              <Upload className="w-8 h-8 mb-2 opacity-50" />
              <p className="font-medium text-sm">Kéo thả file vào đây hoặc bấm để tải lên</p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-sm truncate max-w-xs text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-red-500 rounded transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
            <button 
              type="button" 
              onClick={() => navigate('/forum')}
              className="px-5 py-2 font-medium rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
