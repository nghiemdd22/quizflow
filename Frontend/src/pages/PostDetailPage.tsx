import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUp, ArrowDown, CheckCircle, Download, MessageSquare, Share2, Award } from 'lucide-react'
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
      alert("Bạn cần đăng nhập để vote bình luận!")
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

  const handlePostVote = async (voteType: number) => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để vote bài viết!")
      return
    }
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      })
      if (!res.ok) throw new Error("Vote failed")
      const updatedPost = await res.json()
      setPost(updatedPost)
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
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Post Content */}
        <div className="p-6 lg:p-8 flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">{post.title}</h1>

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <span className="text-blue-600 font-medium">u/{post.authorName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}</span>
            <span>•</span>
            <span>{post.viewsCount} lượt xem</span>
          </div>

        <div className="flex gap-2 mb-6">
          {post.tags?.map((tag: any) => (
            <span key={tag.id} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {tag.name}
            </span>
          ))}
        </div>

        <div className="prose max-w-none text-slate-800 text-sm whitespace-pre-wrap mb-8">
          {post.content}
        </div>

        {post.attachments?.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Tài liệu đính kèm</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {post.attachments.map((file: any) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors group"
                >
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-700 truncate">{file.fileName}</p>
                    <p className="text-xs text-slate-500 uppercase">{file.fileType}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
          <div className="flex gap-2 text-slate-800 text-sm font-semibold mt-6 pt-4 border-t border-slate-100">
            {/* Vote Pill */}
            <div className="flex items-center bg-slate-100 rounded-full">
              <button onClick={() => handlePostVote(1)} className={`p-1.5 px-3 hover:bg-slate-200 rounded-l-full transition-colors flex items-center justify-center ${post.currentUserVote === 1 ? 'text-orange-500' : 'text-slate-600 hover:text-orange-500'}`}>
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="px-2">{post.upvotes !== undefined ? post.upvotes - (post.downvotes || 0) : 0}</span>
              <button onClick={() => handlePostVote(-1)} className={`p-1.5 px-3 hover:bg-slate-200 rounded-r-full transition-colors flex items-center justify-center ${post.currentUserVote === -1 ? 'text-blue-500' : 'text-slate-600 hover:text-blue-500'}`}>
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-1.5 transition-colors cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </div>
            
            {/* Award Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-1.5 transition-colors cursor-pointer">
              <Award className="w-4 h-4" />
            </div>

            {/* Share Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-1.5 transition-colors cursor-pointer" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Đã copy link!'); }}>
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC BÌNH LUẬN */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{comments.length} Bình luận</h2>

        {isLoggedIn ? (
          <form onSubmit={handleAddComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all mb-3 bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="Viết câu trả lời của bạn..."
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full text-sm hover:bg-blue-700 transition-colors"
            >
              Gửi bình luận
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center mb-8 text-sm text-slate-500">
            Vui lòng đăng nhập để bình luận.
          </div>
        )}

        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className={`flex border border-slate-200 rounded-md overflow-hidden transition-all ${comment.isAccepted ? 'bg-green-50 border-green-200' : 'bg-white hover:border-slate-300'}`}
            >
              {/* Content Column */}
              <div className="flex-1 p-4 relative flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-slate-900">u/{comment.authorName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
                  </div>

                  {isLoggedIn && post.authorId === userId && (
                    <button
                      onClick={() => handleAccept(comment.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${comment.isAccepted ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                      {comment.isAccepted ? 'Đã duyệt' : 'Duyệt'}
                    </button>
                  )}
                </div>
                <div className="prose max-w-none text-slate-800 text-sm whitespace-pre-wrap mb-4">
                  {comment.content}
                </div>
                
                <div className="flex gap-2 text-slate-800 text-sm font-semibold mt-auto pt-2">
                  {/* Vote Pill */}
                  <div className="flex items-center bg-slate-100 rounded-full">
                    <button onClick={() => handleVote(comment.id, 'up')} className={`p-1.5 px-3 hover:bg-slate-200 rounded-l-full transition-colors flex items-center justify-center ${comment.currentUserVote === 1 ? 'text-orange-500' : 'text-slate-600 hover:text-orange-500'}`}>
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="px-2">{comment.upvoteCount - comment.downvoteCount}</span>
                    <button onClick={() => handleVote(comment.id, 'down')} className={`p-1.5 px-3 hover:bg-slate-200 rounded-r-full transition-colors flex items-center justify-center ${comment.currentUserVote === -1 ? 'text-blue-500' : 'text-slate-600 hover:text-blue-500'}`}>
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {comment.isAccepted && (
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1.5 border border-green-200" title="Câu trả lời hay nhất">
                      <CheckCircle className="w-4 h-4" />
                      <span>Câu trả lời hay nhất</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
