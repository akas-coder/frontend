import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/App.css';

function Navbar() {
    const navigate = useNavigate();
    const username = authService.getCurrentUser();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h2>💬 Chat App</h2>
            </div>
            <div className="navbar-user">
                <span className="username">👤 {username}</span>
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;