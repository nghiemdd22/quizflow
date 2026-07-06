import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowUp, ArrowDown, Paperclip, Search } from 'lucide-react'
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

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating to post detail
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để vote!")
      return
    }
    // TODO: Gọi API vote ở Sprint 2
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-900">Diễn đàn Học tập</h1>
          <button 
            onClick={() => isLoggedIn ? navigate('/forum/create') : alert('Cần đăng nhập')}
            className="px-6 py-3 bg-neo-purple text-white font-bold rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0f172a] transition-all"
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
            className="w-full p-4 pl-12 border-4 border-slate-900 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-neo-blue/50 shadow-[4px_4px_0px_#0f172a] transition-all"
            placeholder="Tìm kiếm bài viết, tài liệu (Meilisearch Siêu Tốc)..."
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-neo-blue transition-colors" />
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
          <div className="text-center font-bold py-10">Đang tải bài viết...</div>
        ) : (
          posts.map(post => (
            <Link to={`/forum/${post.id}`} key={post.id} className="block group">
              <div className="bg-white border-4 border-slate-900 rounded-xl flex overflow-hidden shadow-[4px_4px_0px_#0f172a] group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[8px_8px_0px_#0f172a] transition-all">
                {/* Cột Vote bên trái */}
                <div className="w-16 bg-slate-50 border-r-4 border-slate-900 p-2 flex flex-col items-center gap-1">
                  <button onClick={(e) => handleVote(e)} className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-neo-red transition-colors">
                    <ArrowUp className="w-6 h-6" />
                  </button>
                  <span className="font-black text-slate-900">
                    {/* Hỗ trợ dữ liệu từ Meilisearch (nó trả về JSON) hoặc DB */}
                    {post.upvotes !== undefined ? post.upvotes - (post.downvotes || 0) : 0}
                  </span>
                  <button onClick={(e) => handleVote(e)} className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-neo-blue transition-colors">
                    <ArrowDown className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Nội dung chính */}
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                    <span className="text-slate-900">u/{post.authorName}</span>
                    <span>•</span>
                    <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}</span>
                    {!isSearching && (
                      <>
                        <span>•</span>
                        <span>{post.viewsCount} lượt xem</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-black text-slate-900 mb-2 group-hover:text-neo-blue transition-colors">
                    {post.title}
                  </h2>
                  
                  <div className="flex gap-2 mb-3">
                    {post.tags && post.tags.map((tag: any, idx: number) => (
                      <span key={tag.id || idx} className="px-2 py-0.5 bg-neo-yellow/20 text-neo-yellow-dark border-2 border-neo-yellow rounded-md text-xs font-bold">
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-600 font-medium line-clamp-2 mb-4">
                    {post.content}
                  </p>
                  
                  <div className="flex gap-4 text-slate-500 font-bold text-sm">
                    <div className="flex items-center gap-1 hover:text-neo-purple">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || 0} bình luận</span>
                    </div>
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-neo-green">
                        <Paperclip className="w-4 h-4" />
                        <span>{post.attachments.length} tài liệu đính kèm</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      {/* Sidebar giả lập cho Sprint 4 */}
      <div className="w-80 hidden lg:block space-y-6">
        <div className="bg-neo-blue border-4 border-slate-900 rounded-xl p-6 shadow-[4px_4px_0px_#0f172a]">
          <h3 className="font-black text-xl text-white mb-2">Về Diễn Đàn</h3>
          <p className="text-white/90 font-medium mb-4">
            Nơi giao lưu, trao đổi kiến thức và chia sẻ tài liệu học tập của hệ thống QuizFlow.
          </p>
          <div className="flex justify-between text-white font-bold border-t-2 border-white/20 pt-4">
            <div className="text-center">
              <div className="text-2xl">{posts.length}</div>
              <div className="text-xs uppercase">Bài viết</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">--</div>
              <div className="text-xs uppercase">Thành viên</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
