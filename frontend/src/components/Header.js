import React from 'react';
import { MessageCircle, Zap, TrendingUp } from 'lucide-react';
import '../App.css';

const Header = () => {
  return (
    <div className='head'>
      <div className="icon-container" style={{ position: 'relative' }}>
        <div 
          className="icon glass-effect" 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <MessageCircle size={28} />
        </div>
        <TrendingUp 
          size={16} 
          style={{ 
            position: 'absolute', 
            top: '-5px', 
            right: '-5px', 
            color: '#4facfe',
            animation: 'bounce 2s infinite'
          }} 
        />
      </div>
      <h1 className="gradient-text">
        <Zap size={20} style={{ display: 'inline', marginRight: '8px', color: '#f5576c' }} />
        KnowChat
      </h1>
    </div>  
  );
};

export default Header;