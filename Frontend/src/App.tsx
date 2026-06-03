import { useState, useEffect } from 'react';
import './App.css';

interface ExamSession {
  id: string;
  title: string;
  pin: string;
  creator: string;
  duration: number; // in minutes
  startTime: string;
  status: 'active' | 'upcoming';
  questionCount: number;
}

function App() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [pinInput, setPinInput] = useState('');
  const [cheatAlert, setCheatAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming'>('all');

  // Sample data simulating DB response
  const [sessions] = useState<ExamSession[]>([
    {
      id: 'session-101',
      title: 'Kiểm tra Giữa kỳ - Kiến trúc Phần mềm (SE-HUST)',
      pin: '882931',
      creator: 'TS. Nguyễn Văn A',
      duration: 45,
      startTime: '10:30',
      status: 'active',
      questionCount: 30
    },
    {
      id: 'session-102',
      title: 'Quiz 2 - Lập trình Hướng đối tượng (OOP)',
      pin: '154823',
      creator: 'ThS. Trần Thị B',
      duration: 15,
      startTime: '11:15',
      status: 'active',
      questionCount: 10
    },
    {
      id: 'session-103',
      title: 'Khảo sát Cuối khóa - DevOps & Cloud Computing',
      pin: '908125',
      creator: 'Hội đồng Khảo thí',
      duration: 60,
      startTime: 'Chiều nay 14:00',
      status: 'upcoming',
      questionCount: 50
    }
  ]);

  // Simulate WebSocket / real-time updates for Online Students
  const [onlineCount, setOnlineCount] = useState(148);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate students logging in/out
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
      
      // Simulate async submit queue processing (RabbitMQ spikes)
      if (Math.random() > 0.7) {
        setQueueCount(Math.floor(Math.random() * 5));
        setTimeout(() => setQueueCount(0), 1500); // Queue clears quickly (high-performance worker)
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Simulating Proctoring Detection (Page Visibility API demo)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && role === 'student') {
        setCheatAlert('⚠️ Phát hiện hành vi chuyển tab / thoát trình duyệt! Sự kiện đã được ghi lại và gửi tới Giáo viên.');
        // Auto clear alarm after 6s
        setTimeout(() => setCheatAlert(null), 6000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [role]);

  const handleJoinSession = (pinCode: string) => {
    if (!pinCode || pinCode.length < 6) {
      alert('Vui lòng nhập mã PIN hợp lệ gồm 6 chữ số!');
      return;
    }
    alert(`Đang kết nối WebSocket đến phòng thi [PIN: ${pinCode}]...`);
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true;
    return session.status === activeTab;
  });

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header / Navbar */}
      <header className="navbar glass-panel">
        <div className="logo-container">
          <div className="logo-icon">Q</div>
          <div className="logo-text text-gradient">Quizflow</div>
        </div>
        <div className="nav-actions">
          <span className={`badge-role ${role === 'teacher' ? 'badge-teacher' : 'badge-student'}`}>
            Chế độ: {role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={() => setRole(prev => prev === 'student' ? 'teacher' : 'student')}
          >
            Đổi vai trò
          </button>
        </div>
      </header>

      {/* Cheat Alert Toast Simulating Page Visibility & WebSocket alerts */}
      {cheatAlert && (
        <div className="proctor-alert">
          <div className="proctor-pulse"></div>
          <div>{cheatAlert}</div>
        </div>
      )}

      {/* Hero Welcome banner */}
      <section className="hero-section glass-panel">
        <div className="hero-glow"></div>
        <h1 className="hero-title animate-slide-up">
          Hệ Thống Thi Trực Tuyến <span className="text-gradient">Real-Time</span>
        </h1>
        <p className="hero-subtitle">
          Nền tảng kiểm tra trực tuyến chịu tải cao, hỗ trợ chấm điểm bất đồng bộ qua hàng đợi thông điệp và tích hợp cơ chế giám sát gian lận thông minh.
        </p>
        
        {role === 'student' && (
          <div className="join-box">
            <input 
              type="text" 
              placeholder="Nhập mã PIN 6 chữ số..." 
              className="pin-input"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            />
            <button className="btn btn-primary" onClick={() => handleJoinSession(pinInput)}>
              Vào phòng thi ⚡
            </button>
          </div>
        )}
      </section>

      {/* Infrastructure Observability Mock (Stats Board) */}
      <section className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon primary">📊</div>
          <div className="stat-info">
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Tổng ca thi khả dụng</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon success">🟢</div>
          <div className="stat-info">
            <div className="stat-value">
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div className="stat-label">Ca thi đang mở</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon warning">👥</div>
          <div className="stat-info">
            <div className="stat-value">{onlineCount}</div>
            <div className="stat-label">Học sinh online (WebSocket)</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon danger">📥</div>
          <div className="stat-info">
            <div className="stat-value">{queueCount} msg</div>
            <div className="stat-label">Hàng đợi RabbitMQ</div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Exam Rooms */}
      <section className="exam-rooms-section">
        <div className="section-header">
          <div className="section-title">
            <span>📅 Ca thi hôm nay</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn btn-secondary ${activeTab === 'all' ? 'btn-primary' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setActiveTab('all')}
            >
              Tất cả
            </button>
            <button 
              className={`btn btn-secondary ${activeTab === 'active' ? 'btn-primary' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setActiveTab('active')}
            >
              Đang diễn ra
            </button>
            <button 
              className={`btn btn-secondary ${activeTab === 'upcoming' ? 'btn-primary' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setActiveTab('upcoming')}
            >
              Sắp diễn ra
            </button>
          </div>
        </div>

        <div className="sessions-grid">
          {filteredSessions.map(session => (
            <div key={session.id} className="session-card glass-panel glass-card">
              <div className="session-header-card">
                <span className={`status-indicator ${session.status === 'active' ? 'status-active' : 'status-upcoming'}`}>
                  {session.status === 'active' ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}
                </span>
                <span className="pin-badge">PIN: {session.pin}</span>
              </div>
              
              <h3 className="session-title-text">{session.title}</h3>
              
              <div className="session-details">
                <div className="detail-item">
                  <span>👤 Giảng viên:</span>
                  <strong>{session.creator}</strong>
                </div>
                <div className="detail-item">
                  <span>⏱️ Thời lượng:</span>
                  <strong>{session.duration} phút</strong>
                </div>
                <div className="detail-item">
                  <span>📝 Số lượng:</span>
                  <strong>{session.questionCount} câu hỏi</strong>
                </div>
                {session.status === 'active' && (
                  <div className="detail-item" style={{ color: 'hsl(var(--success))' }}>
                    <span>🕒 Trạng thái phòng:</span>
                    <strong>Đang nhận bài làm</strong>
                  </div>
                )}
              </div>

              <div className="session-actions">
                {role === 'student' ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleJoinSession(session.pin)}
                    disabled={session.status !== 'active'}
                    style={session.status !== 'active' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {session.status === 'active' ? 'Bắt đầu làm bài ✏️' : 'Chưa đến giờ thi'}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={() => alert('Đang xem danh sách thí sinh...')}>
                      Thí sinh 👥
                    </button>
                    <button className="btn btn-primary" onClick={() => alert('Đang mở màn hình giám thị proctoring...')}>
                      Giám sát 👁️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Quizflow Platform - Thiết kế chịu tải cao & Giám sát thông minh.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Được phát triển với Java Spring Boot + React + MySQL + Redis + RabbitMQ + Docker.
        </p>
        <div className="footer-links">
          <a href="#github">Source Code</a>
          <a href="#docs">Tài liệu API</a>
          <a href="#monitor">Hạ tầng Grafana</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
