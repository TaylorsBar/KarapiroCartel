const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting configuration with environment variables
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(windowMs / 1000),
                limit: max,
                windowMs: windowMs
            });
        }
    });
};

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            connectSrc: ["'self'", "https://api.supabase.co", "wss:", "ws:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xFrameOptions: { action: 'deny' },
    xXssProtection: true
});

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 86400 // 24 hours
};

// API-specific rate limiters using environment variables
const apiLimiter = createRateLimiter(
    (process.env.RATE_LIMIT_API_WINDOW || 1) * 60 * 1000, // Convert minutes to milliseconds
    parseInt(process.env.RATE_LIMIT_API || 10)
);

const authLimiter = createRateLimiter(
    (process.env.RATE_LIMIT_AUTH_WINDOW || 15) * 60 * 1000, // Convert minutes to milliseconds
    parseInt(process.env.RATE_LIMIT_AUTH || 5)
);

const diagnosticLimiter = createRateLimiter(
    (process.env.RATE_LIMIT_DIAGNOSTIC_WINDOW || 5) * 60 * 1000, // Convert minutes to milliseconds
    parseInt(process.env.RATE_LIMIT_DIAGNOSTIC || 3)
);

// General API rate limiter
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 15 minutes, 100 requests

// Security middleware setup
const setupSecurityMiddleware = (app) => {
    // Apply security headers
    app.use(securityHeaders);
    
    // Apply CORS
    app.use(cors(corsOptions));
    
    // Apply general rate limiting to all routes
    app.use(generalLimiter);
    
    // Apply specific rate limiting to authentication routes
    app.use('/api/auth', authLimiter);
    app.use('/api/login', authLimiter);
    app.use('/api/register', authLimiter);
    app.use('/api/forgot-password', authLimiter);
    app.use('/api/reset-password', authLimiter);
    
    // Apply specific rate limiting to diagnostic routes
    app.use('/api/diagnostics', diagnosticLimiter);
    app.use('/api/ml', diagnosticLimiter);
    app.use('/api/predict', diagnosticLimiter);
    
    // Apply API rate limiting to other API routes
    app.use('/api', apiLimiter);
    
    // Additional security middleware
    app.use((req, res, next) => {
        // Remove server information
        res.removeHeader('X-Powered-By');
        
        // Add custom security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Add request ID for tracing
        req.requestId = req.headers['x-request-id'] || 
                       req.headers['x-correlation-id'] || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        res.setHeader('X-Request-ID', req.requestId);
        
        next();
    });
    
    // Error handling for security-related errors
    app.use((err, req, res, next) => {
        if (err.type === 'entity.too.large') {
            return res.status(413).json({
                error: 'File too large',
                maxSize: process.env.UPLOAD_MAX_SIZE || '10MB'
            });
        }
        
        if (err.type === 'entity.parse.failed') {
            return res.status(400).json({
                error: 'Invalid JSON payload'
            });
        }
        
        next(err);
    });
};

module.exports = {
    setupSecurityMiddleware,
    createRateLimiter,
    apiLimiter,
    authLimiter,
    diagnosticLimiter,
    generalLimiter,
    securityHeaders,
    corsOptions
};