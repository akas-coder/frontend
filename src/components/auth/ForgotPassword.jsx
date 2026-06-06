import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/Auth.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.requestOtp(email);
            setSuccess(response.message);
            setStep(2);
        } catch (err) {
            setError(err.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.verifyOtp(email, otp);
            setSuccess(response.message);
            setStep(3);
        } catch (err) {
            setError(err.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.resetPassword(email, otp, newPassword);
            setSuccess(response.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.error || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                <p className="auth-subtitle">
                    {step === 1 && 'Enter your email to receive OTP'}
                    {step === 2 && 'Enter the OTP sent to your email'}
                    {step === 3 && 'Create a new password'}
                </p>

                {/* Step Progress Indicator */}
                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your registered email"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="info-message">
                            <p>📧 OTP has been sent to <strong>{email}</strong></p>
                            <p style={{fontSize: '12px', marginTop: '5px'}}>Check your inbox and spam folder</p>
                        </div>
                        
                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                style={{textAlign: 'center', fontSize: '20px', letterSpacing: '5px'}}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => setStep(1)}
                            style={{marginTop: '10px'}}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {/* Step 3: Enter New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Enter new password (min 6 characters)"
                            />
                            <small style={{color: '#666', fontSize: '12px'}}>
                                Password must be at least 6 characters long
                            </small>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="auth-link">
                    <Link to="/login">← Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;