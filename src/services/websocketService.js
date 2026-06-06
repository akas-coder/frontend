import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../utils/constants';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = {};
        this.currentUser = null;
    }

    connect(onConnected, onError) {
        this.currentUser = localStorage.getItem('username');
        const socket = new SockJS(WS_URL);
        
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            onConnect: () => {
                this.connected = true;
                console.log('WebSocket Connected as user:', this.currentUser);
                if (onConnected) onConnected();
            },
            onStompError: (frame) => {
                console.error('STOMP error: ' + frame.headers['message']);
                console.error('Details: ' + frame.body);
                this.connected = false;
                if (onError) onError(frame);
            },
            onWebSocketError: (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;
                if (onError) onError(error);
            },
            onDisconnect: () => {
                this.connected = false;
                console.log('WebSocket Disconnected');
            }
        });

        this.stompClient.activate();
    }

    disconnect() {
        if (this.stompClient) {
            Object.keys(this.subscriptions).forEach(key => {
                if (this.subscriptions[key]) {
                    this.subscriptions[key].unsubscribe();
                }
            });
            this.subscriptions = {};
            
            this.stompClient.deactivate();
            this.connected = false;
            console.log('WebSocket Disconnected');
        }
    }

    subscribeToRoom(roomId, callback) {
        if (this.stompClient && this.connected) {
            const subscription = this.stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
                try {
                    const messageData = JSON.parse(message.body);
                    callback(messageData);
                } catch (error) {
                    console.error('Error parsing room message:', error);
                }
            });
            
            this.subscriptions[`room-${roomId}`] = subscription;
            return subscription;
        }
        return null;
    }

    subscribeToPrivateMessages(callback) {
        if (this.stompClient && this.connected) {
            const currentUser = localStorage.getItem('username');
            const destination = `/user/${currentUser}/queue/messages`;
            
            console.log('Subscribing to private messages:', destination);
            
            const subscription = this.stompClient.subscribe(destination, (message) => {
                try {
                    console.log('Raw message received:', message);
                    const messageData = JSON.parse(message.body);
                    console.log('Parsed message data:', messageData);
                    callback(messageData);
                } catch (error) {
                    console.error('Error parsing private message:', error);
                }
            });
            
            this.subscriptions['private'] = subscription;
            console.log('Successfully subscribed to:', destination);
            return subscription;
        }
        return null;
    }

    sendToRoom(roomId, senderUsername, content, imageUrl = null) {
        if (this.stompClient && this.connected) {
            this.stompClient.publish({
                destination: '/app/chat.sendToRoom',
                body: JSON.stringify({
                    roomId: roomId,
                    senderUsername: senderUsername,
                    content: content,
                    imageUrl: imageUrl,
                    isImage: !!imageUrl,
                    messageType: imageUrl ? 'IMAGE' : 'ROOM'
                })
            });
        } else {
            console.error('WebSocket not connected');
        }
    }

    sendToUser(senderUsername, recipientUsername, content, imageUrl = null) {
        if (this.stompClient && this.connected) {
            console.log('Sending private message:', {
                from: senderUsername,
                to: recipientUsername,
                content: content,
                imageUrl: imageUrl
            });
            
            this.stompClient.publish({
                destination: '/app/chat.sendToUser',
                body: JSON.stringify({
                    senderUsername: senderUsername,
                    recipientUsername: recipientUsername,
                    content: content,
                    imageUrl: imageUrl,
                    isImage: !!imageUrl,
                    messageType: imageUrl ? 'IMAGE' : 'PRIVATE'
                })
            });
        } else {
            console.error('WebSocket not connected');
        }
    }

    // NEW: Send typing indicator
    sendTypingIndicator(roomId, username, isTyping) {
        if (this.stompClient && this.connected) {
            this.stompClient.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({
                    roomId: roomId,
                    senderUsername: username,
                    isTyping: isTyping
                })
            });
        }
    }

    joinRoom(roomId, username) {
        if (this.stompClient && this.connected) {
            this.stompClient.publish({
                destination: `/app/chat.joinRoom/${roomId}`,
                body: JSON.stringify({
                    senderUsername: username
                })
            });
        }
    }

    leaveRoom(roomId, username) {
        if (this.stompClient && this.connected) {
            this.stompClient.publish({
                destination: `/app/chat.leaveRoom/${roomId}`,
                body: JSON.stringify({
                    senderUsername: username
                })
            });
        }
    }

    unsubscribeFromRoom(roomId) {
        const key = `room-${roomId}`;
        if (this.subscriptions[key]) {
            this.subscriptions[key].unsubscribe();
            delete this.subscriptions[key];
        }
    }

    unsubscribeFromPrivateMessages() {
        if (this.subscriptions['private']) {
            this.subscriptions['private'].unsubscribe();
            delete this.subscriptions['private'];
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketService();