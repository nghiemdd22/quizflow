import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowUp, ArrowDown, Paperclip, Search, Share2, Award, Shield, Info, Plus } from 'lucide-react'
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
    <div className="pt-24 pb-12 px-4 w-full max-w-6xl mx-auto flex gap-6">
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-900">Diễn đàn Học tập</h1>
          <button 
            onClick={() => isLoggedIn ? navigate('/forum/create') : alert('Cần đăng nhập')}
            className="flex items-center gap-2 bg-neo-blue text-white px-6 py-3 rounded-xl font-black neo-btn shrink-0"
          >
            <Plus size={20} strokeWidth={3} /> Viết bài mới
          </button>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="mb-6 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white neo-card text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-neo-blue transition-colors"
            placeholder="Tìm kiếm bài viết, tài liệu (Meilisearch)..."
          />
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
            <Link to={`/forum/${post.id}`} key={post.id} className="block group mb-4">
              <div className="bg-white p-6 border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer">
                {/* Nội dung chính */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-bold">
                    <span className="text-slate-900 font-bold">u/{post.authorName}</span>
                    <span>•</span>
                    <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}</span>
                    {!isSearching && (
                      <>
                        <span>•</span>
                        <span>{post.viewsCount} lượt xem</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-black text-slate-900 mb-2">
                    {post.title}
                  </h2>
                  
                  <div className="flex gap-1.5 mb-2">
                    {post.tags && post.tags.map((tag: any, idx: number) => (
                      <span key={tag.id || idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm font-medium line-clamp-3 mb-4 leading-relaxed">
                    {post.content}
                  </p>
                  
                  <div className="flex gap-2 text-slate-800 text-sm font-bold mt-4">
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
      <div className="w-[312px] hidden lg:block space-y-6">
        {/* Về diễn đàn */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-black text-slate-900 text-lg mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-neo-blue" />
            Về Diễn Đàn
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium">
            Nơi giao lưu, trao đổi kiến thức và chia sẻ tài liệu học tập. Hãy cùng nhau xây dựng cộng đồng QuizFlow vững mạnh!
          </p>
          <div className="flex justify-between text-slate-900 pt-4 border-t-2 border-dashed border-slate-100">
            <div className="text-center flex-1">
              <div className="text-2xl font-black text-neo-blue">{posts.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Bài viết</div>
            </div>
            <div className="w-[2px] bg-slate-100 mx-2"></div>
            <div className="text-center flex-1">
              <div className="text-2xl font-black text-neo-blue">120+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Thành viên</div>
            </div>
          </div>
        </div>

        {/* Nội quy */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-neo-green" />
            Nội quy Diễn Đàn
          </h3>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              Tôn trọng lẫn nhau, không dùng lời lẽ xúc phạm.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              Chia sẻ tài liệu học tập hợp lệ, có trích nguồn.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              Nghiêm cấm chia sẻ, tiết lộ đáp án trong thời gian thi.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
