// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as trpcExpress from '@trpc/server/adapters/express';

// Import our router and services
import { appRouter } from './routers';
import { searchEngine } from './services/searchEngine';
import { getCacheService } from './services/cache.service';
import { getWhatsAppService } from './services/whatsapp.service';
// SECURITY: Import security middleware
import { getCORSOptions, securityHeaders, createRateLimiter } from './middleware/security';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app
const app = express();

// SECURITY: Enhanced CORS and security configuration
const corsOptions = getCORSOptions();

// Middleware stack with security enhancements
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false // Keep disabled for tRPC compatibility
}));

// SECURITY: Apply security headers middleware
app.use(securityHeaders);

// SECURITY: Global rate limiting
app.use(createRateLimiter(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes globally

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));

// SECURITY: Limit payload size to prevent DoS
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Reduced from 10mb

// Export the router type for frontend
export type AppRouter = typeof appRouter;

// Create context for tRPC
const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize services
async function initializeServices() {
  try {
    console.log('🔧 Initializing services...');
    
    // Initialize search engine
    await searchEngine.initialize();
    
    // Initialize cache service
    const cacheService = getCacheService();
    await cacheService.warmupCache();
    
    // Initialize WhatsApp service (health check)
    const whatsappService = getWhatsAppService();
    const whatsappHealth = await whatsappService.healthCheck();
    console.log(`📱 WhatsApp service: ${whatsappHealth.status}`);
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Add tRPC middleware
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Enhanced health endpoint
app.get('/health', async (req, res) => {
  try {
    // Check service health
    const cacheService = getCacheService();
    const whatsappService = getWhatsAppService();
    
    const [cacheHealth, searchHealth, whatsappHealth] = await Promise.all([
      cacheService.healthCheck(),
      searchEngine.healthCheck(),
      whatsappService.healthCheck()
    ]);

    const overallStatus = cacheHealth.status === 'healthy' && searchHealth.status === 'healthy' 
      ? 'healthy' 
      : 'degraded';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: 'heurekka-backend',
      version: '1.0.0',
      services: {
        cache: cacheHealth,
        search: searchHealth,
        whatsapp: whatsappHealth
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service health check failed'
    });
  }
});

// Root endpoint with enhanced information
app.get('/', (req, res) => {
  res.json({
    message: 'Heurekka Backend API',
    version: '1.0.0',
    description: 'Long-term rental marketplace backend with tRPC, WebSocket, and search capabilities',
    features: [
      'homepage-landing',
      'property-search',
      'search-suggestions',
      'analytics-tracking',
      'caching-layer'
    ],
    endpoints: {
      health: '/health',
      trpc: '/trpc',
      websocket: `ws://${HOST}:${PORT}`,
      docs: '/docs' // For future API documentation
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint (basic)
app.get('/docs', (req, res) => {
  res.json({
    title: 'Heurekka Backend API Documentation',
    version: '1.0.0',
    description: 'tRPC-based API for the Heurekka rental marketplace platform',
    procedures: {
      'homepage.getFeaturedProperties': {
        method: 'query',
        description: 'Get featured properties for homepage display',
        input: { limit: 'number', location: 'optional location object' }
      },
      'homepage.searchProperties': {
        method: 'query',
        description: 'Search properties with filters and pagination',
        input: { query: 'string', location: 'location object', filters: 'object', page: 'number', limit: 'number' }
      },
      'homepage.getSearchSuggestions': {
        method: 'query',
        description: 'Get autocomplete suggestions for search',
        input: { query: 'string', location: 'optional location object', limit: 'number' }
      },
      'homepage.getHomepageData': {
        method: 'query',
        description: 'Get combined homepage data (featured properties, popular searches, etc.)',
        input: { location: 'optional location object' }
      },
      'homepage.trackEvent': {
        method: 'mutation',
        description: 'Track analytics events',
        input: { name: 'string', properties: 'object', sessionId: 'string' }
      }
    },
    examples: {
      usage: 'Connect using tRPC client at /trpc endpoint',
      websocket: 'Connect to WebSocket for real-time updates'
    }
  });
});

// Create HTTP server
const server = createServer(app);

// Setup Socket.IO for WebSocket connections
const io = new SocketIOServer(server, {
  cors: corsOptions
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`📱 Client disconnected: ${socket.id}, reason: ${reason}`);
  });
  
  // Join room for real-time property updates
  socket.on('join-property-updates', (data) => {
    const { filters, location } = data;
    const roomName = `property-updates-${JSON.stringify({ filters, location })}`;
    socket.join(roomName);
    console.log(`📱 Client ${socket.id} joined room: ${roomName}`);
  });
  
  // Leave property updates room
  socket.on('leave-property-updates', (data) => {
    const { filters, location } = data;
    const roomName = `property-updates-${JSON.stringify({ filters, location })}`;
    socket.leave(roomName);
    console.log(`📱 Client ${socket.id} left room: ${roomName}`);
  });
  
  // Echo messages for testing
  socket.on('echo', (data) => {
    socket.emit('echo-response', {
      original: data,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Ping-pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// Start server
async function startServer() {
  try {
    // Initialize all services first
    await initializeServices();
    
    // Start the HTTP server
    server.listen(Number(PORT), HOST, () => {
      console.log('🚀 Heurekka Backend Server Started');
      console.log(`📍 Server: http://${HOST}:${PORT}`);
      console.log(`📡 WebSocket: ws://${HOST}:${PORT}`);
      console.log(`🔧 tRPC API: http://${HOST}:${PORT}/trpc`);
      console.log(`❤️ Health: http://${HOST}:${PORT}/health`);
      console.log(`📚 Docs: http://${HOST}:${PORT}/docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏠 Features: homepage-landing, property-search, analytics`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  // Close WebSocket server
  io.close(() => {
    console.log('📡 WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(async () => {
    console.log('🚀 HTTP server closed');
    
    // Close service connections
    try {
      const cacheService = getCacheService();
      await cacheService.disconnect();
      console.log('🗄️ Cache service disconnected');
    } catch (error) {
      console.error('Error disconnecting cache service:', error);
    }
    
    console.log('👋 Server shutdown complete');
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('⏰ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();