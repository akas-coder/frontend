import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import api from '../../services/api';
import '../../styles/Chat.css';

function ChatHome() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/chat/room/${roomId}`);
        }
    };

    const handlePrivateChat = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Verify username exists by checking backend
            const response = await api.get(`/auth/user/exists?username=${username.trim()}`);
            
            // If user exists, navigate to private chat
            navigate(`/chat/private/${username.trim()}`);
        } catch (err) {
            // User doesn't exist
            setError(`User "${username}" not found. Please check the username.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-home-wrapper">
            <Navbar />
            
            <div className="chat-home-container">
                <div className="chat-home-header">
                    <h1>Welcome to Real-Time Chat</h1>
                    <p>Choose how you want to chat</p>
                </div>

                <div className="chat-options">
                    {/* Room Chat Option */}
                    <div className="chat-option-card">
                        <div className="option-icon">🏠</div>
                        <h3>Join a Room</h3>
                        <p>Connect with multiple people in a chat room</p>
                        
                        <form onSubmit={handleJoinRoom}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    placeholder="Enter Room ID (e.g., TECH_ROOM)"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Join Room
                            </button>
                        </form>

                        <div className="popular-rooms">
                            <p style={{fontSize: '14px', color: '#666', marginTop: '15px'}}>
                                Popular rooms:
                            </p>
                            <div className="room-tags">
                                <span onClick={() => setRoomId('GENERAL')}>GENERAL</span>
                                <span onClick={() => setRoomId('TECH')}>TECH</span>
                                <span onClick={() => setRoomId('GAMING')}>GAMING</span>
                            </div>
                        </div>
                    </div>

                    {/* Private Chat Option */}
                    <div className="chat-option-card">
                        <div className="option-icon">💬</div>
                        <h3>Private Chat</h3>
                        <p>Have a one-on-one conversation</p>
                        
                        <form onSubmit={handlePrivateChat}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError(''); // Clear error on input change
                                    }}
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Checking...' : 'Start Chat'}
                            </button>
                        </form>

                        <div className="chat-info">
                            <p style={{fontSize: '12px', color: '#888', marginTop: '15px'}}>
                                💡 Enter the exact username of the person you want to chat with
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    <h3>Features</h3>
                    <div className="features-grid">
                        <div className="feature-item">
                            <span>⚡</span>
                            <p>Real-time messaging</p>
                        </div>
                        <div className="feature-item">
                            <span>🔒</span>
                            <p>Secure & Private</p>
                        </div>
                        <div className="feature-item">
                            <span>👥</span>
                            <p>Group & Private chats</p>
                        </div>
                        <div className="feature-item">
                            <span>📱</span>
                            <p>Responsive design</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatHome;