require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const { initDb, MessageThread } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', apiRoutes);

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinThread', (threadId) => {
    socket.join(threadId);
    console.log(`User ${socket.id} joined thread ${threadId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { threadId, sender, text, time } = data;
      const thread = await MessageThread.findOne({ threadId });
      if (thread) {
        thread.messages.push({ sender, text, time });
        const otherParticipant = thread.participants?.find(p => p !== sender);
        if (otherParticipant) {
          if (!thread.unreadCount) thread.unreadCount = {};
          thread.unreadCount[otherParticipant] = (thread.unreadCount[otherParticipant] || 0) + 1;
          thread.markModified('unreadCount');
        }
        await thread.save();
      }
      
      // Broadcast the message so all clients update their UI
      io.emit('receiveMessage', data);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize database then start server
initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});
