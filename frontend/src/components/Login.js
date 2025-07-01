import React, { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { User, Users, LogIn, Briefcase, Target, Rocket } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState("");
  const [receiver, setReceiver] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username.trim() === "" || receiver.trim() === "") {
      alert("Please enter both usernames!");
      return;
    }

    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      localStorage.setItem("username", username);
      navigate(`/chat/${username}/${receiver}`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main>
      <Header />
      
      {/* Floating Business Icons */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.1, zIndex: 1 }}>
        <Briefcase size={60} color="white" className="icon-bounce" />
      </div>
      <div style={{ position: 'absolute', top: '30%', right: '15%', opacity: 0.1, zIndex: 1 }}>
        <Target size={80} color="white" style={{ animationDelay: '1s' }} className="icon-bounce" />
      </div>
      <div style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.1, zIndex: 1 }}>
        <Rocket size={50} color="white" style={{ animationDelay: '2s' }} className="icon-bounce" />
      </div>

      <div className="form-container">
        <form onSubmit={handleLogin} className="login-form">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              <Users size={28} style={{ color: '#667eea' }} />
              Connect & Collaborate
            </div>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>
              Start meaningful business conversations
            </p>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <User 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#718096' 
              }} 
            />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: '50px' }}
              required
            />
          </div>

          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <Users 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#718096' 
              }} 
            />
            <input
              type="text"
              placeholder="Enter receiver username"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              style={{ paddingLeft: '50px' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-link"
            disabled={isLoading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? (
              <>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} />
                Connecting...
              </>
            ) : (
              <>
                <LogIn size={20} />
                START CHATTING
              </>
            )}
          </button>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem', 
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#667eea',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              <Rocket size={16} />
              Empowering entrepreneurial connections
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
};

export default Login;