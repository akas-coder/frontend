import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ChatHome from './components/chat/ChatHome';
import RoomChat from './components/chat/RoomChat';
import PrivateChat from './components/chat/PrivateChat';
import ProtectedRoute from './components/common/ProtectedRoute';
import './styles/App.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route 
                    path="/chat" 
                    element={
                        <ProtectedRoute>
                            <ChatHome />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/chat/room/:roomId" 
                    element={
                        <ProtectedRoute>
                            <RoomChat />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/chat/private/:username" 
                    element={
                        <ProtectedRoute>
                            <PrivateChat />
                        </ProtectedRoute>
                    } 
                />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;