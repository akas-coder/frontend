import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import websocketService from '../../services/websocketService';
import authService from '../../services/authService';
import { getChatHistory, uploadImage } from '../../services/api';
import Navbar from '../common/Navbar';
import MessageItem from './MessageItem';
import Loading from '../common/Loading';
import '../../styles/Chat.css';

function RoomChat() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUser = authService.getCurrentUser();

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await getChatHistory('room', roomId);
                setMessages(history);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        loadHistory();
    }, [roomId]);

    useEffect(() => {
        // Connect to WebSocket
        websocketService.connect(
            () => {
                console.log('Connected to room:', roomId);
                setConnected(true);
                setConnecting(false);

                // Subscribe to room messages
                websocketService.subscribeToRoom(roomId, (message) => {
                    setMessages(prev => [...prev, message]);
                });

                // Send join notification
                websocketService.joinRoom(roomId, currentUser);
            },
            (error) => {
                console.error('Connection error:', error);
                setConnecting(false);
                alert('Failed to connect to chat server');
            }
        );

        // Cleanup on unmount
        return () => {
            if (connected) {
                websocketService.leaveRoom(roomId, currentUser);
                websocketService.unsubscribeFromRoom(roomId);
                websocketService.disconnect();
            }
        };
    }, [roomId, currentUser]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        
        if (newMessage.trim() && connected) {
            websocketService.sendToRoom(roomId, currentUser, newMessage);
            setNewMessage('');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImage(file);
            websocketService.sendToRoom(
                roomId, 
                currentUser, 
                newMessage || '📷 Image', 
                result.url
            );
            setNewMessage('');
        } catch (error) {
            alert('Failed to upload image: ' + (error.error || 'Unknown error'));
        } finally {
            setUploading(false);
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteMessage = (messageId) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, isDeleted: true } : msg
        ));
    };

    const handleLeaveRoom = () => {
        websocketService.leaveRoom(roomId, currentUser);
        navigate('/chat');
    };

    if (connecting || loadingHistory) {
        return <Loading message="Loading room..." />;
    }

    return (
        <div className="chat-wrapper">
            <Navbar />
            
            <div className="chat-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <button className="btn-back" onClick={handleLeaveRoom}>
                            ← Back
                        </button>
                        <div>
                            <h3>🏠 {roomId}</h3>
                            <p className="chat-status">
                                {connected ? (
                                    <><span className="status-dot online"></span> Connected</>
                                ) : (
                                    <><span className="status-dot offline"></span> Disconnected</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="messages-container">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <p>No messages yet. Start the conversation! 👋</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <MessageItem 
                                key={message.id || index} 
                                message={message}
                                onDelete={handleDeleteMessage}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="message-input-container">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={!connected || uploading}
                        className="btn-attachment"
                        title="Attach image"
                    >
                        {uploading ? '⏳' : '📎'}
                    </button>

                    <form onSubmit={handleSendMessage} className="message-input-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={connected ? "Type a message..." : "Connecting..."}
                            disabled={!connected}
                            className="message-input"
                        />
                        <button 
                            type="submit" 
                            disabled={!connected || !newMessage.trim()}
                            className="btn-send"
                        >
                            Send 📤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RoomChat;