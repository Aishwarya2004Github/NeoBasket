require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const aiRouter = require('./routes/ai.routes');
const prisma = require('./config/prisma');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.AI_CORS_ORIGIN || 'http://localhost:5173', credentials: true } });

app.use(cors({ origin: process.env.AI_CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/', (req,res)=>res.json({success:true,service:'NeoBasket AI Engine',version:'1.0.0'}));
app.get('/health', async(req,res)=>res.json({success:true,status:'running',features:['shopping-copilot','cheapest-basket','recommendations','smart-refill','recipes','healthy-basket','substitution','fridge-vision','dynamic-pricing','demand-forecast','inventory-intelligence','expiry-intelligence','eta','admin-command-center','live-rider-socket'],openAIEnabled:Boolean(process.env.OPENAI_API_KEY)}));
app.use('/api/ai', aiRouter);

io.on('connection', socket => {
  socket.on('rider:location', payload => {
    if (!payload?.orderId) return;
    io.to(`order:${payload.orderId}`).emit('rider:location', payload);
  });
  socket.on('order:join', orderId => { if(orderId) socket.join(`order:${orderId}`); });
});

const PORT = Number(process.env.AI_PORT || 8002);
server.listen(PORT, async()=>{
  console.log(`🤖 NeoBasket AI Engine running on http://localhost:${PORT}`);
  try { await prisma.$connect(); console.log('🗄️ AI Engine connected to existing PostgreSQL database'); }
  catch(e) { console.error('Database connection failed:', e.message); }
});

process.on('SIGINT', async()=>{ await prisma.$disconnect(); server.close(()=>process.exit(0)); });
