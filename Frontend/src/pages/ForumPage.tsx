import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowUp, ArrowDown, Paperclip, Search, Share2, Award } from 'lucide-react'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ForumPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/v1/posts')
      const data = await res.json()
      setPosts(data.content || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setIsSearching(false)
      fetchPosts()
      return
    }

    try {
      setLoading(true)
      setIsSearching(true)
      // Call Meilisearch via Backend Proxy
      const res = await apiFetch(`/api/v1/posts/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      // data from meilisearch search result hits
      setPosts(data.hits || data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (e: React.MouseEvent, postId: number, voteType: number) => {
    e.preventDefault() // prevent navigating to post detail
    e.stopPropagation() // prevent bubbling to Link
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để vote!")
      return
    }
    try {
      const res = await apiFetch(`/api/v1/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      })
      if (!res.ok) throw new Error("Vote failed")
      const updatedPost = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-900">Diễn đàn Học tập</h1>
          <button 
            onClick={() => isLoggedIn ? navigate('/forum/create') : alert('Cần đăng nhập')}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
          >
            + Viết bài mới
          </button>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="mb-6 relative group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-12 border border-slate-300 rounded-lg bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            placeholder="Tìm kiếm bài viết, tài liệu (Meilisearch)..."
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <button type="submit" className="hidden">Search</button>
        </form>

        {isSearching && (
          <div className="flex items-center gap-2 mb-4 font-bold text-neo-blue">
            <span>Kết quả tìm kiếm cho: "{searchQuery}"</span>
            <button onClick={() => { setSearchQuery(''); setIsSearching(false); fetchPosts() }} className="text-slate-400 hover:text-slate-900 underline text-sm ml-4">
              Xóa tìm kiếm
            </button>
          </div>
        )}

        {/* MOCK REDDIT UI FOR SPRINT 1 */}
        {loading ? (
          <div className="text-center text-slate-500 py-10">Đang tải bài viết...</div>
        ) : (
          posts.map(post => (
            <Link to={`/forum/${post.id}`} key={post.id} className="block group mb-3">
              <div className="bg-white border border-slate-300 rounded-md flex flex-col hover:border-slate-400 transition-colors">
                {/* Nội dung chính */}
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="text-slate-900 font-medium">u/{post.authorName}</span>
                    <span>•</span>
                    <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}</span>
                    {!isSearching && (
                      <>
                        <span>•</span>
                        <span>{post.viewsCount} lượt xem</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    {post.title}
                  </h2>
                  
                  <div className="flex gap-1.5 mb-2">
                    {post.tags && post.tags.map((tag: any, idx: number) => (
                      <span key={tag.id || idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm line-clamp-3 mb-3">
                    {post.content}
                  </p>
                  
                  <div className="flex gap-2 text-slate-800 text-sm font-semibold mt-4">
                    {/* Vote Pill */}
                    <div className="flex items-center bg-slate-100 rounded-full">
                      <button onClick={(e) => handleVote(e, post.id, 1)} className={`p-1.5 px-2 hover:bg-slate-200 rounded-l-full transition-colors flex items-center justify-center ${post.currentUserVote === 1 ? 'text-orange-500' : 'text-slate-600 hover:text-orange-500'}`}>
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <span className="px-1">{post.upvotes !== undefined ? post.upvotes - (post.downvotes || 0) : 0}</span>
                      <button onClick={(e) => handleVote(e, post.id, -1)} className={`p-1.5 px-2 hover:bg-slate-200 rounded-r-full transition-colors flex items-center justify-center ${post.currentUserVote === -1 ? 'text-blue-500' : 'text-slate-600 hover:text-blue-500'}`}>
                        <ArrowDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Comments Pill */}
                    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                    
                    {/* Award Pill */}
                    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer">
                      <Award className="w-4 h-4" />
                    </div>

                    {/* Share Pill */}
                    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + `/forum/${post.id}`); alert('Đã copy link!'); }}>
                      <Share2 className="w-4 h-4" />
                      <span>Chia sẻ</span>
                    </div>

                    {post.attachments && post.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1.5 transition-colors">
                        <Paperclip className="w-4 h-4" />
                        <span>{post.attachments.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      {/* Sidebar */}
      <div className="w-[312px] hidden lg:block space-y-4">
        <div className="bg-white border border-slate-300 rounded-md p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Về Diễn Đàn</h3>
          <p className="text-slate-600 text-sm mb-4">
            Nơi giao lưu, trao đổi kiến thức và chia sẻ tài liệu học tập của hệ thống QuizFlow.
          </p>
          <div className="flex justify-between text-slate-900 pt-4 border-t border-slate-200">
            <div className="text-center">
              <div className="text-xl font-bold">{posts.length}</div>
              <div className="text-xs text-slate-500 uppercase">Bài viết</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">--</div>
              <div className="text-xs text-slate-500 uppercase">Thành viên</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
