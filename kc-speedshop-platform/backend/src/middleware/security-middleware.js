const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting configuration
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
                message: 'Too many requests from this IP, please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
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
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.x.ai", "https://api.rapidapi.com"],
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
    xContentTypeOptions: true,
    xXssProtection: true
});

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// API-specific rate limiters
const apiLimiter = createRateLimiter(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const diagnosticLimiter = createRateLimiter(60 * 1000, 10); // 10 requests per minute

// Security middleware setup
const setupSecurityMiddleware = (app) => {
    // Basic security headers
    app.use(securityHeaders);
    
    // CORS
    app.use(cors(corsOptions));
    
    // General API rate limiting
    app.use('/api/', apiLimiter);
    
    // Specific rate limiting for sensitive endpoints
    app.use('/api/auth/', authLimiter);
    app.use('/api/diagnostics/', diagnosticLimiter);
    
    // Additional security middleware
    app.use((req, res, next) => {
        // Remove server information
        res.removeHeader('X-Powered-By');
        
        // Add custom security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        next();
    });
    
    // Error handling for security-related errors
    app.use((err, req, res, next) => {
        if (err.type === 'entity.too.large') {
            return res.status(413).json({
                error: 'Payload too large',
                message: 'Request body exceeds maximum allowed size'
            });
        }
        
        if (err.type === 'entity.parse.failed') {
            return res.status(400).json({
                error: 'Invalid JSON',
                message: 'Request body contains invalid JSON'
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
    diagnosticLimiter
};