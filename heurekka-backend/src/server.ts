import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Initialize tRPC
const t = initTRPC.create();

// Basic tRPC router
const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name}! Welcome to Heurekka Backend.`,
        timestamp: new Date().toISOString(),
      };
    }),
  
  health: t.procedure
    .query(() => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'heurekka-backend',
      };
    }),
});

// Export type router type signature
export type AppRouter = typeof appRouter;

// Create context for tRPC
const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

export type Context = Awaited<ReturnType<typeof createContext>>;

// Add tRPC middleware
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Basic health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'heurekka-backend',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Heurekka Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      trpc: '/trpc',
      websocket: 'ws://localhost:' + PORT,
    },
  });
});

// Create HTTP server
const server = createServer(app);

// Setup Socket.IO for WebSocket connections
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // Echo messages for testing
  socket.on('echo', (data) => {
    socket.emit('echo-response', {
      original: data,
      timestamp: new Date().toISOString(),
    });
  });
});

// Start server
server.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Heurekka Backend running on http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔧 tRPC endpoint: http://${HOST}:${PORT}/trpc`);
  console.log(`❤️ Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});