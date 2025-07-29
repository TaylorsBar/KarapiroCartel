# 🚀 KC Speedshop Platform Setup Guide

## Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd kc-speedshop-platform

# Run the automated setup
npm run setup:dev
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit with your actual values
nano .env  # or use your preferred editor
```

### 3. Start Development
```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:frontend    # React app on http://localhost:5173
npm run dev:backend     # Node.js API on http://localhost:3000
npm run dev:ml          # ML service on http://localhost:8000
```

## 🔧 Environment Configuration

### Required Variables (Development)
```bash
# === GLOBAL ENV ===
NODE_ENV=development
PORT=3000

# === FRONTEND ===
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# === BACKEND ===
DATABASE_URL=postgresql://user:password@localhost:5432/kc_speedshop
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SUPABASE_SERVICE_KEY=your_supabase_admin_key
SUPABASE_URL=https://your-supabase-project.supabase.co

# === EXTERNAL API KEYS ===
RAPIDAPI_KEY=your-rapidapi-key
XAI_API_KEY=your-xai-api-key
```

### Production Variables
Additional variables required for production:
```bash
# === BLOCKCHAIN (Hedera) ===
HEDERA_OPERATOR_ID=your_hedera_account_id
HEDERA_OPERATOR_KEY=your_hedera_private_key

# === INFRASTRUCTURE ===
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-southeast-2

# === SECURITY ===
CORS_ORIGIN=https://your-production-frontend.domain
SENTRY_DSN=your-sentry-dsn
```

## 📊 Rate Limiting Configuration

The platform uses granular rate limiting:

```bash
# Authentication endpoints (login, register, etc.)
RATE_LIMIT_AUTH=5                    # 5 attempts
RATE_LIMIT_AUTH_WINDOW=15            # per 15 minutes

# General API endpoints
RATE_LIMIT_API=10                    # 10 requests
RATE_LIMIT_API_WINDOW=1              # per minute

# ML/Diagnostic endpoints
RATE_LIMIT_DIAGNOSTIC=3              # 3 requests
RATE_LIMIT_DIAGNOSTIC_WINDOW=5       # per 5 minutes
```

## 🔍 Environment Validation

The platform includes automatic environment validation:

```bash
# Validate environment variables
npm run validate:env

# Validate everything (env + lint + test)
npm run validate:all
```

### Validation Features
- ✅ Checks required variables by environment
- ✅ Validates variable formats (URLs, numbers, etc.)
- ✅ Security warnings (default values, localhost in production)
- ✅ Rate limiting configuration validation
- ✅ Database and Redis URL format validation

## 🛠️ Available Scripts

### Development
```bash
npm run dev                    # Start all services
npm run dev:frontend          # Start React frontend
npm run dev:backend           # Start Node.js backend
npm run dev:ml                # Start ML service
```

### Building & Testing
```bash
npm run build                 # Build all services
npm run test                  # Run all tests
npm run lint                  # Lint all code
npm run format                # Format all code
```

### Database
```bash
npm run db:migrate            # Run database migrations
npm run db:seed               # Seed database with test data
npm run db:reset              # Reset database
```

### Deployment
```bash
npm run deploy:staging        # Deploy to staging
npm run deploy:prod           # Deploy to production
```

### Monitoring
```bash
npm run monitoring:start      # Start monitoring stack
npm run monitoring:stop       # Stop monitoring stack
npm run logs                  # View application logs
npm run health                # Health check
```

### ML & Blockchain
```bash
npm run ml:train              # Train ML models
npm run ml:predict            # Run ML predictions
npm run blockchain:deploy     # Deploy smart contracts
```

## 🔐 Security Features

### Automatic Security Checks
- Environment variable validation before startup
- Rate limiting on all endpoints
- Security headers (HSTS, CSP, X-Frame-Options)
- CORS policy enforcement
- Request ID tracking for observability

### Security Headers
```javascript
// Automatically applied
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
X-Request-ID: req_1234567890_abc123
```

## 📈 Monitoring & Observability

### Prometheus Metrics
- Application metrics
- Business metrics
- Custom diagnostic metrics

### Logging
- Structured logging with request IDs
- Environment-based log levels
- Error tracking with Sentry

### Health Checks
```bash
# Check application health
npm run health

# Health endpoints
GET /health                    # Basic health check
GET /health/detailed          # Detailed health status
GET /metrics                  # Prometheus metrics
```

## 🚀 Production Deployment

### Prerequisites
1. AWS EKS cluster configured
2. ArgoCD installed and configured
3. All environment variables set
4. Database migrations run

### Deployment Steps
```bash
# 1. Validate environment
npm run validate:env

# 2. Build applications
npm run build

# 3. Deploy to production
npm run deploy:prod

# 4. Monitor deployment
npm run logs
```

### Infrastructure Components
- **Frontend**: React app served via Nginx
- **Backend**: Node.js API with load balancing
- **ML Service**: FastAPI service for predictions
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for session and data caching
- **Monitoring**: Prometheus + Grafana
- **Logging**: Centralized logging with ELK stack

## 🐛 Troubleshooting

### Common Issues

#### Environment Validation Fails
```bash
# Check what's missing
npm run validate:env

# Common fixes:
# - Set NODE_ENV=development
# - Ensure DATABASE_URL is set
# - Check JWT_SECRET length (min 32 chars)
```

#### Rate Limiting Issues
```bash
# Check current limits
curl -H "X-Request-ID: test" http://localhost:3000/api/health

# Adjust limits in .env
RATE_LIMIT_API=20
RATE_LIMIT_API_WINDOW=1
```

#### Database Connection Issues
```bash
# Check database URL format
DATABASE_URL=postgresql://user:password@host:port/database

# Test connection
npm run db:migrate
```

#### ML Service Issues
```bash
# Check ML service logs
cd ml/diagnostic-service
python -m uvicorn main:app --reload --port 8000

# Verify model path
ls -la model/engine_fault_nn_model.h5
```

## 📚 Additional Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [ML Model Documentation](./ml/diagnostic-service/README.md)
- [Blockchain Integration](./blockchain/README.md)
- [Monitoring Setup](./infrastructure/monitoring/README.md)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the validation output: `npm run validate:env`
3. Check application logs: `npm run logs`
4. Open an issue in the repository

---

**Happy coding! 🚗💨**