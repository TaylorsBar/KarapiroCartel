# 🏎️ KarapiroCartel Platform

**Intelligent Automotive Management Platform**

A comprehensive automotive management platform built with React, TypeScript, and deployed on AWS EKS. KarapiroCartel provides tools for automotive professionals, dealers, mechanics, and enthusiasts to manage diagnostics, marketplace transactions, workshop operations, and analytics.

![KarapiroCartel Platform](https://img.shields.io/badge/Platform-KarapiroCartel-champagne)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![AWS](https://img.shields.io/badge/AWS-EKS-orange)
![License](https://img.shields.io/badge/License-Private-red)

## 🚀 Features

### Core Modules
- **Dashboard** - Comprehensive overview of automotive operations
- **Marketplace** - Buy and sell automotive parts and services
- **Diagnostics** - Advanced vehicle diagnostic tools and analysis
- **Workshop** - Workshop management and scheduling
- **Analytics** - Data-driven insights and reporting
- **Supplier Dashboard** - Tools for dealers and mechanics

### Technical Features
- **🔐 Authentication** - Supabase-powered user management
- **💳 Payments** - Blockchain payment integration with Hashgraph
- **📊 Subscription Management** - RevenueCat integration for premium features
- **📱 Responsive Design** - Mobile-first design with Tailwind CSS
- **🔄 Real-time Updates** - Live data synchronization
- **📈 Data Visualization** - Chart.js powered analytics

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### Backend Integrations
- **Supabase** - Database and authentication
- **Hashgraph SDK** - Blockchain functionality
- **RevenueCat** - Subscription management
- **Express.js** - API server capabilities

### Infrastructure
- **AWS EKS** - Kubernetes orchestration
- **Terraform** - Infrastructure as Code
- **Docker** - Containerization
- **Nginx** - Web server and reverse proxy

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Docker (for containerization)
- AWS CLI (for deployment)
- Terraform (for infrastructure)
- kubectl (for Kubernetes management)

### Local Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd karapiro-cartel-platform
   ./scripts/local-dev.sh
   ```

2. **Manual setup**
   ```bash
   npm install
   cp .env.example .env.local
   # Update .env.local with your API keys
   npm run dev
   ```

3. **Access the application**
   - Open http://localhost:5173
   - Default development mode with hot reload

### Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_REVENUECAT_API_KEY=your_revenuecat_key
VITE_ENVIRONMENT=development
```

## 🏗️ Building the Platform

### Local Build
```bash
# Full build process
./scripts/build.sh

# Build options
./scripts/build.sh --deps-only      # Install dependencies only
./scripts/build.sh --app-only       # Build app only
./scripts/build.sh --docker-only    # Build Docker image only
./scripts/build.sh --no-docker      # Build without Docker
```

### Production Deployment

1. **Deploy to AWS EKS**
   ```bash
   # Deploy to development environment
   ./scripts/deploy.sh dev
   
   # Deploy to production
   ./scripts/deploy.sh prod
   
   # Deploy infrastructure only
   ./scripts/deploy.sh --infrastructure-only
   
   # Deploy application only
   ./scripts/deploy.sh --app-only
   ```

2. **Check deployment status**
   ```bash
   ./scripts/deploy.sh --status
   ```

3. **Cleanup resources**
   ```bash
   ./scripts/deploy.sh --cleanup
   ```

## 📁 Project Structure

```
karapiro-cartel-platform/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx
│   │   ├── FunctionalMarketplace.tsx
│   │   ├── Diagnostics.tsx
│   │   ├── Workshop.tsx
│   │   ├── Analytics.tsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── blockchain_service.js
│   │   ├── diagnosticService.ts
│   │   ├── supplierService.ts
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities and libraries
├── terraform/               # Infrastructure as Code
│   ├── main.tf
│   ├── modules/
│   │   ├── vpc/
│   │   └── eks_cluster/
│   └── outputs.tf
├── k8s/                     # Kubernetes manifests
│   ├── namespace.yaml
│   ├── deployment.yaml
│   └── secrets.yaml
├── scripts/                 # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── local-dev.sh
├── public/                  # Static assets
├── Dockerfile              # Container configuration
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Component Development

Components are organized by feature:
- `Dashboard.tsx` - Main dashboard interface
- `FunctionalMarketplace.tsx` - Marketplace functionality
- `Diagnostics.tsx` - Vehicle diagnostic tools
- `Workshop.tsx` - Workshop management
- `Analytics.tsx` - Data analytics and reporting

### Service Integration

Services handle external integrations:
- `blockchain_service.js` - Hashgraph blockchain operations
- `diagnosticService.ts` - Vehicle diagnostic APIs
- `supplierService.ts` - Supplier management
- `revenueCatService.ts` - Subscription management

## 🚀 Deployment Architecture

### AWS Infrastructure

The platform deploys on AWS with the following components:

1. **VPC** - Isolated network environment
   - Public subnets for load balancers
   - Private subnets for application workloads
   - NAT gateways for outbound connectivity

2. **EKS Cluster** - Kubernetes orchestration
   - General-purpose node pool (m5.large instances)
   - ML-inference node pool (g5.xlarge instances)
   - Auto-scaling capabilities

3. **Security** - Comprehensive security setup
   - IAM roles and policies
   - Network policies
   - Encryption at rest and in transit

### Kubernetes Deployment

- **Namespace isolation** - Separate environments
- **Resource limits** - CPU and memory constraints
- **Health checks** - Liveness and readiness probes
- **Load balancing** - Application Load Balancer integration
- **TLS termination** - SSL/TLS certificate management

## 🔐 Security Features

- **Authentication** - Supabase auth with multiple providers
- **Authorization** - Role-based access control
- **Network Security** - VPC isolation and security groups
- **Data Encryption** - End-to-end encryption
- **API Security** - Rate limiting and validation
- **Container Security** - Minimal attack surface

## 📊 Monitoring and Analytics

- **Application Metrics** - Performance monitoring
- **Infrastructure Metrics** - AWS CloudWatch integration
- **User Analytics** - Usage tracking and insights
- **Error Tracking** - Comprehensive error monitoring
- **Logs Aggregation** - Centralized logging

## 🤝 Contributing

This is a private repository. For internal development:

1. Create feature branches from `main`
2. Follow TypeScript and React best practices
3. Add appropriate tests for new features
4. Update documentation as needed
5. Submit pull requests for review

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For technical support and questions:
- Internal documentation wiki
- Development team Slack channel
- Issue tracking system

## 🗺️ Roadmap

### Phase 1 - Core Platform ✅
- User authentication and management
- Basic dashboard functionality
- Marketplace MVP
- Infrastructure setup

### Phase 2 - Enhanced Features 🚧
- Advanced diagnostics tools
- Workshop scheduling system
- Supplier integrations
- Mobile application

### Phase 3 - AI/ML Integration 📋
- Predictive maintenance
- Intelligent recommendations
- Advanced analytics
- Machine learning models

### Phase 4 - Expansion 📋
- Multi-region deployment
- Additional integrations
- Enterprise features
- API marketplace

---

**Built with ❤️ by the KarapiroCartel Team**
