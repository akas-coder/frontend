// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import websocketService from '../../services/websocketService';
// import authService from '../../services/authService';
// import { getChatHistory, getUserLastSeen, uploadImage } from '../../services/api';
// import Navbar from '../common/Navbar';
// import MessageItem from './MessageItem';
// import Loading from '../common/Loading';
// import '../../styles/Chat.css';

// function PrivateChat() {
//     const { username } = useParams();
//     const navigate = useNavigate();
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [connected, setConnected] = useState(false);
//     const [connecting, setConnecting] = useState(true);
//     const [lastSeen, setLastSeen] = useState(null);
//     const [isOnline, setIsOnline] = useState(false);
//     const [loadingHistory, setLoadingHistory] = useState(true);
//     const [uploading, setUploading] = useState(false);
//     const messagesEndRef = useRef(null);
//     const fileInputRef = useRef(null);
//     const currentUser = authService.getCurrentUser();

//     // Auto scroll to bottom
//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     // Load chat history
//     useEffect(() => {
//         const loadHistory = async () => {
//             try {
//                 const history = await getChatHistory('private', currentUser, username);
//                 setMessages(history);
//             } catch (error) {
//                 console.error('Failed to load chat history:', error);
//             } finally {
//                 setLoadingHistory(false);
//             }
//         };

//         loadHistory();
//     }, [currentUser, username]);

//     // Load last seen
//     useEffect(() => {
//         const loadLastSeen = async () => {
//             try {
//                 const data = await getUserLastSeen(username);
//                 setIsOnline(data.isOnline);
//                 setLastSeen(data.lastSeen);
//             } catch (error) {
//                 console.error('Failed to load last seen:', error);
//             }
//         };

//         loadLastSeen();
//         const interval = setInterval(loadLastSeen, 30000); // Update every 30 seconds
//         return () => clearInterval(interval);
//     }, [username]);

//     useEffect(() => {
//         // Don't allow chatting with yourself
//         if (username === currentUser) {
//             alert('You cannot chat with yourself!');
//             navigate('/chat');
//             return;
//         }

//         let subscription = null;

//         // Connect to WebSocket
//         websocketService.connect(
//             () => {
//                 console.log('Connected for private chat with:', username);
//                 setConnected(true);
//                 setConnecting(false);

//                 // Subscribe to private messages
//                 subscription = websocketService.subscribeToPrivateMessages((message) => {
//                     console.log('Received private message:', message);
                    
//                     // Only show messages from/to this conversation
//                     if (
//                         (message.senderUsername === username && message.recipientUsername === currentUser) ||
//                         (message.senderUsername === currentUser && message.recipientUsername === username)
//                     ) {
//                         setMessages(prev => {
//                             // Prevent duplicate messages
//                             const isDuplicate = prev.some(
//                                 m => m.id && m.id === message.id
//                             );
                            
//                             if (isDuplicate) {
//                                 return prev;
//                             }
                            
//                             return [...prev, message];
//                         });
//                     }
//                 });
//             },
//             (error) => {
//                 console.error('Connection error:', error);
//                 setConnecting(false);
//                 alert('Failed to connect to chat server');
//             }
//         );

//         // Cleanup on unmount
//         return () => {
//             if (subscription) {
//                 subscription.unsubscribe();
//             }
//             if (connected) {
//                 websocketService.disconnect();
//             }
//         };
//     }, [username, currentUser, navigate, connected]);

//     const handleSendMessage = (e) => {
//         e.preventDefault();
        
//         if (newMessage.trim() && connected) {
//             console.log('Sending message to:', username);
//             websocketService.sendToUser(currentUser, username, newMessage);
//             setNewMessage('');
//         }
//     };

//     const handleImageUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         // Validate file type
//         if (!file.type.startsWith('image/')) {
//             alert('Please select an image file');
//             return;
//         }

//         // Validate file size (5MB)
//         if (file.size > 5 * 1024 * 1024) {
//             alert('Image size must be less than 5MB');
//             return;
//         }

//         setUploading(true);
//         try {
//             const result = await uploadImage(file);
//             console.log('Image uploaded:', result);
            
//             // Send image message
//             websocketService.sendToUser(
//                 currentUser, 
//                 username, 
//                 newMessage || '📷 Image', 
//                 result.url
//             );
//             setNewMessage('');
//         } catch (error) {
//             alert('Failed to upload image: ' + (error.error || 'Unknown error'));
//         } finally {
//             setUploading(false);
//             fileInputRef.current.value = '';
//         }
//     };

//     const handleDeleteMessage = (messageId) => {
//         setMessages(prev => prev.map(msg => 
//             msg.id === messageId ? { ...msg, isDeleted: true } : msg
//         ));
//     };

//     const handleBack = () => {
//         navigate('/chat');
//     };

//     const formatLastSeen = (lastSeenDate) => {
//         if (!lastSeenDate) return '';
        
//         const now = new Date();
//         const lastSeenTime = new Date(lastSeenDate);
//         const diffMs = now - lastSeenTime;
//         const diffMins = Math.floor(diffMs / 60000);
//         const diffHours = Math.floor(diffMs / 3600000);
//         const diffDays = Math.floor(diffMs / 86400000);

//         if (diffMins < 1) return 'just now';
//         if (diffMins < 60) return `${diffMins} minutes ago`;
//         if (diffHours < 24) return `${diffHours} hours ago`;
//         if (diffDays < 7) return `${diffDays} days ago`;
//         return lastSeenTime.toLocaleDateString();
//     };

//     if (connecting || loadingHistory) {
//         return <Loading message="Loading chat..." />;
//     }

//     return (
//         <div className="chat-wrapper">
//             <Navbar />
            
//             <div className="chat-container">
//                 {/* Chat Header */}
//                 <div className="chat-header">
//                     <div className="chat-header-info">
//                         <button className="btn-back" onClick={handleBack}>
//                             ← Back
//                         </button>
//                         <div>
//                             <h3>💬 {username}</h3>
//                             <p className="chat-status">
//                                 {isOnline ? (
//                                     <><span className="status-dot online"></span> Online</>
//                                 ) : (
//                                     <span>Last seen: {formatLastSeen(lastSeen)}</span>
//                                 )}
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Messages Area */}
//                 <div className="messages-container">
//                     {messages.length === 0 ? (
//                         <div className="empty-chat">
//                             <p>No messages yet. Say hello to {username}! 👋</p>
//                         </div>
//                     ) : (
//                         messages.map((message, index) => (
//                             <MessageItem 
//                                 key={message.id || `${message.senderUsername}-${index}-${message.timestamp}`} 
//                                 message={message}
//                                 onDelete={handleDeleteMessage}
//                             />
//                         ))
//                     )}
//                     <div ref={messagesEndRef} />
//                 </div>

//                 {/* Message Input */}
//                 <div className="message-input-container">
//                     <input
//                         type="file"
//                         ref={fileInputRef}
//                         onChange={handleImageUpload}
//                         accept="image/*"
//                         style={{ display: 'none' }}
//                     />
                    
//                     <button 
//                         onClick={() => fileInputRef.current.click()}
//                         disabled={!connected || uploading}
//                         className="btn-attachment"
//                         title="Attach image"
//                     >
//                         {uploading ? '⏳' : '📎'}
//                     </button>

//                     <form onSubmit={handleSendMessage} className="message-input-form">
//                         <input
//                             type="text"
//                             value={newMessage}
//                             onChange={(e) => setNewMessage(e.target.value)}
//                             placeholder={connected ? `Message ${username}...` : "Connecting..."}
//                             disabled={!connected}
//                             className="message-input"
//                         />
//                         <button 
//                             type="submit" 
//                             disabled={!connected || (!newMessage.trim() && !uploading)}
//                             className="btn-send"
//                         >
//                             Send 📤
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default PrivateChat;
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import websocketService from '../../services/websocketService';
import authService from '../../services/authService';
import { getChatHistory, getUserLastSeen, uploadImage } from '../../services/api';
import Navbar from '../common/Navbar';
import MessageItem from './MessageItem';
import Loading from '../common/Loading';
import '../../styles/Chat.css';

function PrivateChat() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [lastSeen, setLastSeen] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUser = authService.getCurrentUser();

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
                const history = await getChatHistory('private', currentUser, username);
                setMessages(history);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        loadHistory();
    }, [currentUser, username]);

    // Load last seen
    useEffect(() => {
        const loadLastSeen = async () => {
            try {
                const data = await getUserLastSeen(username);
                setIsOnline(data.isOnline);
                setLastSeen(data.lastSeen);
            } catch (error) {
                console.error('Failed to load last seen:', error);
            }
        };

        loadLastSeen();
        const interval = setInterval(loadLastSeen, 30000);
        return () => clearInterval(interval);
    }, [username]);

    // WebSocket connection
    useEffect(() => {
        if (username === currentUser) {
            alert('You cannot chat with yourself!');
            navigate('/chat');
            return;
        }

        let subscription = null;

        websocketService.connect(
            () => {
                setConnected(true);
                setConnecting(false);

                subscription = websocketService.subscribeToPrivateMessages((message) => {
                    console.log('Incoming private message:', message);

                    if (
                        (message.senderUsername === username &&
                            message.recipientUsername === currentUser) ||
                        (message.senderUsername === currentUser &&
                            message.recipientUsername === username)
                    ) {
                        setMessages((prev) => {
                            const isDuplicate = prev.some(
                                (m) => m.id && message.id && m.id === message.id
                            );

                            if (isDuplicate) return prev;

                            // ✅ Force image consistency
                            if (message.imageUrl) {
                                message.isImage = true;
                            }

                            return [...prev, message];
                        });
                    }
                });
            },
            (error) => {
                console.error('Connection error:', error);
                setConnecting(false);
                alert('Failed to connect to chat server');
            }
        );

        return () => {
            if (subscription) subscription.unsubscribe();
            websocketService.disconnect();
        };
    }, [username, currentUser, navigate]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (newMessage.trim() && connected) {
            websocketService.sendToUser(currentUser, username, newMessage);
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
            console.log('Image uploaded:', result);

            websocketService.sendToUser(
                currentUser,
                username,
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
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId ? { ...msg, isDeleted: true } : msg
            )
        );
    };

    const handleBack = () => {
        navigate('/chat');
    };

    const formatLastSeen = (lastSeenDate) => {
        if (!lastSeenDate) return '';

        const now = new Date();
        const lastSeenTime = new Date(lastSeenDate);
        const diffMs = now - lastSeenTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return lastSeenTime.toLocaleDateString();
    };

    if (connecting || loadingHistory) {
        return <Loading message="Loading chat..." />;
    }

    return (
        <div className="chat-wrapper">
            <Navbar />

            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-info">
                        <button className="btn-back" onClick={handleBack}>
                            ← Back
                        </button>
                        <div>
                            <h3>💬 {username}</h3>
                            <p className="chat-status">
                                {isOnline ? (
                                    <>
                                        <span className="status-dot online"></span> Online
                                    </>
                                ) : (
                                    <span>Last seen: {formatLastSeen(lastSeen)}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="messages-container">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <p>No messages yet. Say hello to {username}! 👋</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <MessageItem
                                key={
                                    message.id ||
                                    `${message.senderUsername}-${index}-${message.timestamp}`
                                }
                                message={message}
                                onDelete={handleDeleteMessage}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

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
                            placeholder={
                                connected
                                    ? `Message ${username}...`
                                    : 'Connecting...'
                            }
                            disabled={!connected}
                            className="message-input"
                        />

                        <button
                            type="submit"
                            disabled={!connected || (!newMessage.trim() && !uploading)}
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

export default PrivateChat;
