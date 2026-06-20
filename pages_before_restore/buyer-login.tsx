import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function BuyerLogin() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetMobile, setResetMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState('request'); // request, verify, reset

  const handleLogin = async () => {
    const storedUser = localStorage.getItem('buyer_user');
    if (!storedUser) {
      alert('No account found. Please register first.');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.mobile === mobile && user.password === password) {
      if (user.status === 'approved') {
        user.isLoggedIn = true;
        localStorage.setItem('buyer_user', JSON.stringify(user));
        router.push('/buyer-dashboard');
      } else {
        alert('Your account is pending admin approval.');
      }
    } else {
      alert('Invalid mobile number or password.');
    }
  };

  const requestReset = () => {
    if (!resetMobile || resetMobile.length !== 10) {
      alert('Enter valid 10-digit mobile number');
      return;
    }
    const storedUser = localStorage.getItem('buyer_user');
    if (!storedUser) {
      alert('No account found with this mobile number');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.mobile === resetMobile) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      alert(`Your OTP is: ${newOtp} (Demo: In production, this would be sent via WhatsApp)`);
      setStep('verify');
    } else {
      alert('Mobile number not registered');
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setStep('reset');
      alert('OTP verified. Please enter your new password.');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const resetPassword = () => {
    if (!newPassword || newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const storedUser = localStorage.getItem('buyer_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.password = newPassword;
      localStorage.setItem('buyer_user', JSON.stringify(user));
      alert('Password reset successfully! Please login with your new password.');
      setShowReset(false);
      setStep('request');
      setResetMobile('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
    }
  };

  return React.createElement('div', { style: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    React.createElement('div', { style: { background: '#fff', borderRadius: '24px', padding: '40px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } },
      React.createElement('h2', { style: { textAlign: 'center', color: '#1a7f6e', marginBottom: '30px' } }, '🏗️ Buyer Login'),
      
      !showReset ? (
        React.createElement(React.Fragment, null,
          React.createElement('input', { type: 'tel', placeholder: 'Mobile Number (10 digits)', value: mobile, onChange: e => setMobile(e.target.value), style: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' } }),
          React.createElement('input', { type: 'password', placeholder: 'Password', value: password, onChange: e => setPassword(e.target.value), style: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' } }),
          React.createElement('button', { onClick: handleLogin, style: { width: '100%', padding: '12px', background: '#1a7f6e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '10px' } }, 'Login'),
          React.createElement('div', { style: { textAlign: 'center', marginTop: '15px' } },
            React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); setShowReset(true); }, style: { color: '#1a7f6e', fontSize: '12px' } }, 'Forgot Password?'),
            ' | ',
            React.createElement('a', { href: '/buyer-register', style: { color: '#1a7f6e', fontSize: '12px' } }, 'New User? Register')
          )
        )
      ) : step === 'request' ? (
        React.createElement(React.Fragment, null,
          React.createElement('h3', { style: { marginBottom: '15px', textAlign: 'center' } }, 'Reset Password'),
          React.createElement('input', { type: 'tel', placeholder: 'Registered Mobile Number', value: resetMobile, onChange: e => setResetMobile(e.target.value), style: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' } }),
          React.createElement('button', { onClick: requestReset, style: { width: '100%', padding: '12px', background: '#1a7f6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' } }, 'Send OTP'),
          React.createElement('button', { onClick: () => setShowReset(false), style: { width: '100%', padding: '12px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' } }, 'Back to Login')
        )
      ) : step === 'verify' ? (
        React.createElement(React.Fragment, null,
          React.createElement('h3', { style: { marginBottom: '15px', textAlign: 'center' } }, 'Verify OTP'),
          React.createElement('input', { type: 'text', placeholder: 'Enter OTP', value: otp, onChange: e => setOtp(e.target.value), style: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' } }),
          React.createElement('button', { onClick: verifyOtp, style: { width: '100%', padding: '12px', background: '#1a7f6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' } }, 'Verify OTP'),
          React.createElement('button', { onClick: () => setStep('request'), style: { width: '100%', padding: '12px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' } }, 'Back')
        )
      ) : (
        React.createElement(React.Fragment, null,
          React.createElement('h3', { style: { marginBottom: '15px', textAlign: 'center' } }, 'Set New Password'),
          React.createElement('input', { type: 'password', placeholder: 'New Password', value: newPassword, onChange: e => setNewPassword(e.target.value), style: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' } }),
          React.createElement('input', { type: 'password', placeholder: 'Confirm Password', value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), style: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' } }),
          React.createElement('button', { onClick: resetPassword, style: { width: '100%', padding: '12px', background: '#1a7f6e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' } }, 'Reset Password'),
          React.createElement('button', { onClick: () => setShowReset(false), style: { width: '100%', padding: '12px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' } }, 'Cancel')
        )
      )
    )
  );
}

