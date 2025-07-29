# 🏎️ KC Speedshop Platform

**Unified Automotive Management Platform**

A comprehensive, enterprise-grade automotive management platform built with React, Node.js, and cutting-edge ML/AI capabilities. This monorepo consolidates all KC Speedshop services into a unified, secure, and scalable platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KCSpeedshop/kc-speedshop-platform.git
   cd kc-speedshop-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Install dependencies**
   ```bash
   npm run install:all
   ```

4. **Start development environment**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Monorepo Structure
```
kc-speedshop-platform/
├── frontend/           # React 18 + TypeScript + Vite
├── backend/           # Node.js + Express + Prisma
├── ml/               # FastAPI + TensorFlow + X.AI
├── blockchain/       # Hedera Hashgraph integration
├── infrastructure/   # Terraform + Kubernetes
├── docs/            # Documentation
└── scripts/         # Build/deployment scripts
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **ML/AI**: FastAPI, TensorFlow, X.AI Grok
- **Blockchain**: Hedera Hashgraph, Smart Contracts
- **Infrastructure**: AWS EKS, Terraform, ArgoCD
- **Monitoring**: Prometheus, Grafana, ELK Stack

## 🔐 Security Features

### Implemented Security Measures
- ✅ Environment variable management
- ✅ Security headers (HSTS, CSP, X-Frame-Options)
- ✅ Rate limiting on all endpoints
- ✅ CORS policy enforcement
- ✅ Input validation and sanitization
- ✅ JWT token authentication
- ✅ API key rotation support

### Security Best Practices
- All secrets stored in environment variables
- Regular security scanning in CI/CD
- Automated vulnerability detection
- Secure container images
- Network segmentation

## 📊 Available Scripts

### Development
```bash
npm run dev              # Start all services
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run dev:ml          # Start ML service only
```

### Building
```bash
npm run build           # Build all services
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend
```

### Testing
```bash
npm run test            # Run all tests
npm run test:frontend   # Frontend tests
npm run test:backend    # Backend tests
npm run test:ml        # ML service tests
```

### Code Quality
```bash
npm run lint            # Lint all code
npm run format          # Format all code
npm run security:scan   # Security audit
```

### Database
```bash
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:setup        # Setup database
```

### Deployment
```bash
npm run deploy          # Deploy to development
npm run deploy:staging  # Deploy to staging
npm run deploy:prod     # Deploy to production
```

## 🚀 Deployment

### Development
```bash
# Local development with Docker
docker-compose up -d
```

### Staging
```bash
# Deploy to staging environment
npm run deploy:staging
```

### Production
```bash
# Deploy to production environment
npm run deploy:prod
```

## 📈 Monitoring & Observability

### Metrics Collection
- Application metrics with Prometheus
- Custom business metrics
- Performance monitoring
- Error tracking

### Logging
- Centralized logging with ELK Stack
- Structured logging
- Log aggregation
- Search and analytics

### Alerting
- Performance alerts
- Error rate monitoring
- Security incident alerts
- Business metric alerts

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required environment variables:

- **Database**: PostgreSQL connection string
- **Authentication**: JWT secrets, Supabase keys
- **External APIs**: X.AI, RapidAPI, Hedera
- **Security**: CORS origins, rate limits
- **Monitoring**: Sentry DSN, log levels

### Feature Flags
- `ENABLE_ML_DIAGNOSTICS`: Enable AI diagnostic features
- `ENABLE_BLOCKCHAIN_FEATURES`: Enable blockchain operations
- `ENABLE_REAL_TIME_UPDATES`: Enable real-time features

## 🧪 Testing

### Test Coverage
- Frontend: React Testing Library + Vitest
- Backend: Jest + Supertest
- ML Service: Pytest
- Integration: End-to-end tests

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:ml
```

## 📚 Documentation

### API Documentation
- Swagger/OpenAPI documentation
- Interactive API explorer
- Request/response examples
- Authentication guides

### Architecture Documentation
- System architecture diagrams
- Data flow documentation
- Deployment guides
- Troubleshooting guides

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes and add tests
3. Run linting and tests
4. Submit pull request
5. Code review and approval
6. Merge to main

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Comprehensive testing

## 🚨 Troubleshooting

### Common Issues

#### Environment Variables
```bash
# Check if all required variables are set
npm run env:check
```

#### Database Connection
```bash
# Test database connection
npm run db:test
```

#### Service Health
```bash
# Check service health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

### Getting Help
- Check the [documentation](docs/)
- Review [troubleshooting guide](docs/troubleshooting.md)
- Open an [issue](https://github.com/KCSpeedshop/kc-speedshop-platform/issues)
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.kcspeedshop.ai](https://docs.kcspeedshop.ai)
- **Issues**: [GitHub Issues](https://github.com/KCSpeedshop/kc-speedshop-platform/issues)
- **Email**: support@kcspeedshop.ai
- **Discord**: [Community Server](https://discord.gg/kcspeedshop)

---

**Built with ❤️ by the KC Speedshop Team**

*Revolutionizing automotive management with cutting-edge technology.*