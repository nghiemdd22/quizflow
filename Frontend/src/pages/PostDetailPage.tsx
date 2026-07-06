import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUp, ArrowDown, CheckCircle, Download } from 'lucide-react'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function PostDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const { isLoggedIn, userId } = useAuthStore()

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}`)
      const data = await res.json()
      setPost(data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/comments`)
      const data = await res.json()
      setComments(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await apiFetch(`/api/v1/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment })
      })
      setNewComment('')
      fetchComments()
    } catch (e) {
      console.error(e)
    }
  }

  const handleVote = async (commentId: number, type: 'up' | 'down') => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để vote!")
      return
    }
    const voteType = type === 'up' ? 1 : -1
    try {
      await apiFetch(`/api/v1/comments/${commentId}/vote?type=${voteType}`, { method: 'POST' })
      fetchComments()
    } catch (e) {
      console.error(e)
    }
  }

  const handleAccept = async (commentId: number) => {
    try {
      await apiFetch(`/api/v1/comments/${commentId}/accept`, { method: 'PATCH' })
      fetchComments()
    } catch (e) {
      console.error(e)
    }
  }

  if (!post) return <div className="p-8 text-center font-bold">Đang tải...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* NỘI DUNG BÀI VIẾT */}
      <div className="bg-white border-4 border-slate-900 rounded-2xl shadow-[8px_8px_0px_#0f172a] p-6 lg:p-8">
        <h1 className="text-3xl font-black text-slate-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6">
          <span className="text-neo-blue">u/{post.authorName}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}</span>
          <span>•</span>
          <span>{post.viewsCount} lượt xem</span>
        </div>
        
        <div className="flex gap-2 mb-6">
          {post.tags?.map((tag: any) => (
            <span key={tag.id} className="px-3 py-1 bg-neo-yellow/20 text-neo-yellow-dark border-2 border-neo-yellow rounded-md font-bold">
              {tag.name}
            </span>
          ))}
        </div>

        <div className="prose max-w-none text-slate-800 font-medium whitespace-pre-wrap mb-8">
          {post.content}
        </div>

        {post.attachments?.length > 0 && (
          <div className="mt-8 border-t-4 border-slate-900 pt-6">
            <h3 className="font-black text-slate-900 mb-4">Tài liệu đính kèm</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {post.attachments.map((file: any) => (
                <a 
                  key={file.id} 
                  href={file.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-slate-900 rounded-xl hover:bg-neo-green/10 hover:border-neo-green transition-all group"
                >
                  <div className="w-10 h-10 bg-white border-2 border-slate-900 rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0f172a] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
                    <Download className="w-5 h-5 text-neo-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{file.fileName}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">{file.fileType}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KHU VỰC BÌNH LUẬN */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-6">{comments.length} Bình luận</h2>
        
        {isLoggedIn ? (
          <form onSubmit={handleAddComment} className="mb-10">
            <textarea 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={4}
              className="w-full p-4 border-4 border-slate-900 rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-neo-blue/50 transition-all mb-4"
              placeholder="Viết câu trả lời của bạn..."
            />
            <button 
              type="submit" 
              className="px-8 py-3 bg-neo-blue text-white font-black rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
            >
              Gửi bình luận
            </button>
          </form>
        ) : (
          <div className="bg-slate-100 border-4 border-slate-300 rounded-xl p-6 text-center mb-10 font-bold text-slate-500">
            Vui lòng đăng nhập để bình luận.
          </div>
        )}

        <div className="space-y-6">
          {comments.map(comment => (
            <div 
              key={comment.id} 
              className={`flex bg-white border-4 border-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_#0f172a] transition-all ${comment.isAccepted ? 'border-neo-green bg-neo-green/5' : ''}`}
            >
              {/* Vote Column */}
              <div className="w-16 sm:w-20 bg-slate-50 border-r-4 border-slate-900 p-2 sm:p-4 flex flex-col items-center gap-2">
                <button 
                  onClick={() => handleVote(comment.id, 'up')} 
                  className={`p-1 rounded transition-colors ${comment.currentUserVote === 1 ? 'text-neo-red font-black' : 'text-slate-400 hover:text-neo-red'}`}
                >
                  <ArrowUp className="w-8 h-8" />
                </button>
                <span className="font-black text-lg text-slate-900">{comment.upvoteCount - comment.downvoteCount}</span>
                <button 
                  onClick={() => handleVote(comment.id, 'down')} 
                  className={`p-1 rounded transition-colors ${comment.currentUserVote === -1 ? 'text-neo-blue font-black' : 'text-slate-400 hover:text-neo-blue'}`}
                >
                  <ArrowDown className="w-8 h-8" />
                </button>

                {comment.isAccepted && (
                  <div className="mt-4 text-neo-green" title="Câu trả lời hay nhất">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-black text-slate-900">u/{comment.authorName}</span>
                    <span className="text-slate-400 font-bold">•</span>
                    <span className="text-slate-500 font-bold">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
                  </div>
                  
                  {isLoggedIn && post.authorId === userId && (
                    <button 
                      onClick={() => handleAccept(comment.id)}
                      className={`text-sm font-black px-4 py-2 rounded-lg border-2 border-slate-900 transition-all ${comment.isAccepted ? 'bg-neo-green text-slate-900 shadow-[2px_2px_0px_#0f172a]' : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 shadow-[2px_2px_0px_#0f172a]'}`}
                    >
                      {comment.isAccepted ? 'Đã duyệt' : 'Duyệt'}
                    </button>
                  )}
                </div>
                <div className="prose max-w-none text-slate-800 font-medium whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
