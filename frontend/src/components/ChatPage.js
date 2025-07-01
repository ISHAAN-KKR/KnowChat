import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";
import "../App.css";
import { 
  Send, 
  LogOut, 
  User, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Circle,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import SocketIOClient from "socket.io-client";

const ChatPage = () => {
  const { username, receiver } = useParams();
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef(null);

  const roomId = [username, receiver].sort().join("_");

  useEffect(() => {
    const newSocket = SocketIOClient("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.emit("joinRoom", roomId);

    newSocket.on("loadMessages", (msgs) => {
      setChats(msgs);
    });

    newSocket.on("chat", (chatMessage) => {
      setChats((prevChats) => [...prevChats, chatMessage]);
      setIsTyping(false);
    });

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setIsTyping(true);
      socket.emit("chat", { roomId, sender: username, receiver, message });
      setMessage("");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <main>
      <Header />
      
      <Link to="/" className="logout-link">
        <LogOut size={16} />
        LOGOUT
      </Link>

      {/* Chat Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '80px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
            position: 'relative'
          }}>
            {receiver?.charAt(0).toUpperCase()}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isConnected ? '#4ade80' : '#ef4444',
              border: '2px solid white'
            }} />
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} />
              {receiver}
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              margin: 0, 
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {isConnected ? (
                <>
                  <CheckCircle size={12} />
                  Online
                </>
              ) : (
                <>
                  <Circle size={12} />
                  Offline
                </>
              )}
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem'
        }}>
          <TrendingUp size={16} />
          Business Chat
        </div>
      </div>

      <div className="chat-container">
        {chats.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <Lightbulb size={48} style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Start Your Business Conversation</h3>
            <p>Share ideas, discuss strategies, and build connections!</p>
          </div>
        ) : (
          chats.map((chat, index) => (
            <div
              key={index}
              className={chat.sender === username ? "my-chat" : "notmy-chat"}
            >
              <div style={{ position: 'relative' }}>
                <p>
                  <span className="user" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    marginBottom: '8px'
                  }}>
                    <MessageSquare size={14} />
                    {chat.sender === username
                      ? `You (${username})`
                      : `${chat.sender}`}
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '3px',
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginLeft: 'auto'
                    }}>
                      <Clock size={10} />
                      {formatTime(chat.timestamp)}
                    </span>
                  </span>
                  <span className="msg">{chat.message}</span>
                </p>
                
                {/* Message status indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '5px',
                  right: chat.sender === username ? '10px' : 'auto',
                  left: chat.sender !== username ? '10px' : 'auto',
                  opacity: 0.6
                }}>
                  <CheckCircle size={12} color={chat.sender === username ? 'white' : '#667eea'} />
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="notmy-chat">
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem 1.5rem',
              borderRadius: '20px 20px 20px 5px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#667eea',
                  animation: 'typing 1.4s infinite ease-in-out'
                }} />
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#667eea',
                  animation: 'typing 1.4s infinite ease-in-out 0.2s'
                }} />
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#667eea',
                  animation: 'typing 1.4s infinite ease-in-out 0.4s'
                }} />
              </div>
              <span style={{ color: '#718096', fontSize: '0.8rem' }}>
                {receiver} is typing...
              </span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      <div className="chatbox-container">
        <div className="chatbox">
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', flex: 1 }}>
              <MessageSquare 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '15px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#718096',
                  zIndex: 1
                }} 
              />
              <input
                type="text"
                placeholder="Type your business message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ paddingLeft: '50px' }}
                disabled={!isConnected}
              />
              {!isConnected && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Circle size={12} />
                  Disconnected
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={!message.trim() || !isConnected}
              style={{
                opacity: (!message.trim() || !isConnected) ? 0.5 : 1,
                cursor: (!message.trim() || !isConnected) ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Business Elements */}
      <div style={{ 
        position: 'fixed', 
        bottom: '120px', 
        right: '20px', 
        opacity: 0.1, 
        zIndex: 1 
      }}>
        <Lightbulb size={40} color="white" className="icon-bounce" />
      </div>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
  );
};

export default ChatPage;