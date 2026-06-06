// import { useState } from 'react';
// import { formatTime } from '../../utils/helpers';
// import authService from '../../services/authService';
// import { deleteMessage } from '../../services/api';
// import '../../styles/Chat.css';

// function MessageItem({ message, onDelete }) {
//     const currentUser = authService.getCurrentUser();
//     const isOwnMessage = message.senderUsername === currentUser;
//     const isSystemMessage = message.messageType === 'JOIN' || message.messageType === 'LEAVE';
//     const isImageMessage = message.isImage || message.messageType === 'IMAGE';
//     const [showOptions, setShowOptions] = useState(false);
//     const [deleting, setDeleting] = useState(false);

//     const handleDelete = async () => {
//         if (window.confirm('Are you sure you want to delete this message?')) {
//             setDeleting(true);
//             try {
//                 await deleteMessage(message.id, currentUser);
//                 if (onDelete) onDelete(message.id);
//             } catch (error) {
//                 alert('Failed to delete message');
//                 setDeleting(false);
//             }
//         }
//     };

//     if (isSystemMessage) {
//         return (
//             <div className="system-message">
//                 <span>{message.content}</span>
//             </div>
//         );
//     }

//     if (message.isDeleted) {
//         return (
//             <div className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
//                 <div className="message-bubble deleted-message">
//                     <div className="message-content">
//                         <em>🗑️ This message was deleted</em>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div 
//             className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
//             onMouseEnter={() => isOwnMessage && setShowOptions(true)}
//             onMouseLeave={() => setShowOptions(false)}
//         >
//             <div className="message-bubble">
//                 {!isOwnMessage && (
//                     <div className="message-sender">{message.senderUsername}</div>
//                 )}
                
//                 {isImageMessage && message.imageUrl ? (
//                     <div className="message-image-container">
//                         <img 
//                             src={`http://localhost:8080${message.imageUrl}`} 
//                             alt="Shared image" 
//                             className="message-image"
//                             onClick={() => window.open(`http://localhost:8080${message.imageUrl}`, '_blank')}
//                         />
//                         {message.content && (
//                             <div className="message-content">{message.content}</div>
//                         )}
//                     </div>
//                 ) : (
//                     <div className="message-content">{message.content}</div>
//                 )}
                
//                 <div className="message-footer">
//                     <span className="message-time">{formatTime(message.timestamp)}</span>
//                     {isOwnMessage && (
//                         <span className="message-status">
//                             {message.isRead ? '✓✓' : message.isDelivered ? '✓' : '○'}
//                         </span>
//                     )}
//                 </div>

//                 {/* Delete option for own messages */}
//                 {isOwnMessage && showOptions && (
//                     <div className="message-options">
//                         <button 
//                             onClick={handleDelete} 
//                             disabled={deleting}
//                             className="btn-delete-message"
//                             title="Delete message"
//                         >
//                             🗑️
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default MessageItem;

import { useState } from 'react';
import { formatTime } from '../../utils/helpers';
import authService from '../../services/authService';
import { deleteMessage } from '../../services/api';
import '../../styles/Chat.css';

function MessageItem({ message, onDelete }) {
    const currentUser = authService.getCurrentUser();
    const isOwnMessage = message.senderUsername === currentUser;
    const isSystemMessage =
        message.messageType === 'JOIN' || message.messageType === 'LEAVE';

    // ✅ FIX: Image detection based ONLY on imageUrl
    const isImageMessage = Boolean(message.imageUrl);

    const [showOptions, setShowOptions] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            setDeleting(true);
            try {
                await deleteMessage(message.id, currentUser);
                if (onDelete) onDelete(message.id);
            } catch (error) {
                alert('Failed to delete message');
                setDeleting(false);
            }
        }
    };

    if (isSystemMessage) {
        return (
            <div className="system-message">
                <span>{message.content}</span>
            </div>
        );
    }

    if (message.isDeleted) {
        return (
            <div
                className={`message-item ${
                    isOwnMessage ? 'own-message' : 'other-message'
                }`}
            >
                <div className="message-bubble deleted-message">
                    <div className="message-content">
                        <em>🗑️ This message was deleted</em>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`message-item ${
                isOwnMessage ? 'own-message' : 'other-message'
            }`}
            onMouseEnter={() => isOwnMessage && setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
        >
            <div className="message-bubble">
                {!isOwnMessage && (
                    <div className="message-sender">
                        {message.senderUsername}
                    </div>
                )}

                {/* ✅ FIXED IMAGE RENDERING */}
                {isImageMessage ? (
                    <div className="message-image-container">
                        <img
                            src={`http://localhost:8080${message.imageUrl}`}
                            alt="Shared"
                            className="message-image"
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                                window.open(
                                    `http://localhost:8080${message.imageUrl}`,
                                    '_blank'
                                )
                            }
                        />

                        {message.content && (
                            <div className="message-content">
                                {message.content}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="message-content">
                        {message.content}
                    </div>
                )}

                <div className="message-footer">
                    <span className="message-time">
                        {formatTime(message.timestamp)}
                    </span>

                    {isOwnMessage && (
                        <span className="message-status">
                            {message.isRead
                                ? '✓✓'
                                : message.isDelivered
                                ? '✓'
                                : '○'}
                        </span>
                    )}
                </div>

                {isOwnMessage && showOptions && (
                    <div className="message-options">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn-delete-message"
                            title="Delete message"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessageItem;
