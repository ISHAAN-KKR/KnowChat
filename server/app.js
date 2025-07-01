const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  roomId: String,
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  messageType: { type: String, default: 'text' }, // text, image, file, emoji
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  isRead: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', MessageSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and other common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and archives are allowed'));
    }
  }
});

// User tracking
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('joinRoom', async (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);

    // Track active user
    activeUsers.set(socket.id, { roomId, lastSeen: new Date() });

    // Load previous messages
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    socket.emit('loadMessages', messages);

    // Notify room about user status
    socket.to(roomId).emit('userJoined', { roomId });
  });

  // Chat message
  socket.on('chat', async ({ roomId, sender, receiver, message, messageType = 'text' }) => {
    try {
      const newMsg = new Message({ 
        roomId, 
        sender, 
        receiver, 
        message,
        messageType,
        timestamp: new Date()
      });
      await newMsg.save();

      // Emit to all users in the room
      io.to(roomId).emit('chat', newMsg);
      
      console.log(`Message sent in room ${roomId}: ${sender} -> ${message}`);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // File message
  socket.on('fileMessage', async ({ roomId, sender, receiver, fileUrl, fileName, fileSize, messageType }) => {
    try {
      const newMsg = new Message({ 
        roomId, 
        sender, 
        receiver, 
        message: fileName,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        timestamp: new Date()
      });
      await newMsg.save();

      // Emit to all users in the room
      io.to(roomId).emit('chat', newMsg);
      
      console.log(`File sent in room ${roomId}: ${sender} -> ${fileName}`);
    } catch (error) {
      console.error('Error saving file message:', error);
      socket.emit('error', { message: 'Failed to send file' });
    }
  });

  // Typing indicators
  socket.on('typing', ({ roomId, sender }) => {
    socket.to(roomId).emit('userTyping', { sender });
  });

  socket.on('stopTyping', ({ roomId, sender }) => {
    socket.to(roomId).emit('userStoppedTyping', { sender });
  });

  // Mark messages as read
  socket.on('markAsRead', async ({ roomId, userId }) => {
    try {
      await Message.updateMany(
        { roomId, receiver: userId, isRead: false },
        { isRead: true }
      );
      socket.to(roomId).emit('messagesRead', { roomId, userId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const userData = activeUsers.get(socket.id);
    if (userData) {
      socket.to(userData.roomId).emit('userLeft', { roomId: userData.roomId });
      activeUsers.delete(socket.id);
    }
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let processedFile = req.file;

    // Compress images
    if (req.file.mimetype.startsWith('image/')) {
      const compressedPath = path.join('uploads', 'compressed-' + req.file.filename);
      
      await sharp(req.file.path)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(compressedPath);

      // Delete original and use compressed version
      fs.unlinkSync(req.file.path);
      processedFile = {
        ...req.file,
        path: compressedPath,
        filename: 'compressed-' + req.file.filename
      };
    }

    const fileUrl = `/uploads/${processedFile.filename}`;
    
    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      messageType: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

server.listen(3000, () => {
  console.log('🚀 Server listening on port 3000');
  console.log('📊 MongoDB connected');
  console.log('💬 Socket.IO ready for connections');
  console.log('📁 File upload endpoint ready at /api/upload');
});