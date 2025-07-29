# 🚀 KC Speedshop CI/CD Pipeline

## Unified GitHub Actions Workflow

### Main Pipeline Structure

```yaml
# .github/workflows/main.yml
name: KC Speedshop Platform CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: kc-speedshop-platform

jobs:
  # Frontend Build & Test
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run linting
        run: |
          cd frontend
          npm run lint
      
      - name: Run tests
        run: |
          cd frontend
          npm run test:coverage
      
      - name: Build application
        run: |
          cd frontend
          npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist

  # Backend Build & Test
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run linting
        run: |
          cd backend
          npm run lint
      
      - name: Run tests
        run: |
          cd backend
          npm run test:coverage
      
      - name: Database migrations
        run: |
          cd backend
          npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  # ML Service Build & Test
  ml-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd ml/diagnostic-service
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd ml/diagnostic-service
          pytest tests/ --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ml/diagnostic-service/coverage.xml

  # Security Scanning
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Docker Build & Push
  docker:
    needs: [frontend, backend, ml-service]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ github.repository }}/frontend:${{ github.sha }}
      
      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ github.repository }}/backend:${{ github.sha }}
      
      - name: Build and push ML Service
        uses: docker/build-push-action@v5
        with:
          context: ./ml/diagnostic-service
          push: true
          tags: ${{ env.REGISTRY }}/${{ github.repository }}/ml-service:${{ github.sha }}

  # Deploy to Staging
  deploy-staging:
    needs: [docker, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name kc-speedshop-staging
      
      - name: Deploy to staging
        run: |
          kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ github.repository }}/frontend:${{ github.sha }}
          kubectl set image deployment/backend backend=${{ env.REGISTRY }}/${{ github.repository }}/backend:${{ github.sha }}
          kubectl set image deployment/ml-service ml-service=${{ env.REGISTRY }}/${{ github.repository }}/ml-service:${{ github.sha }}

  # Deploy to Production
  deploy-production:
    needs: [docker, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name kc-speedshop-production
      
      - name: Deploy to production
        run: |
          kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ github.repository }}/frontend:${{ github.sha }}
          kubectl set image deployment/backend backend=${{ env.REGISTRY }}/${{ github.repository }}/backend:${{ github.sha }}
          kubectl set image deployment/ml-service ml-service=${{ env.REGISTRY }}/${{ github.repository }}/ml-service:${{ github.sha }}
```

## ML Model Training Pipeline

```yaml
# .github/workflows/ml-training.yml
name: ML Model Training

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  train-models:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd ml/diagnostic-service
          pip install -r requirements.txt
      
      - name: Train diagnostic model
        run: |
          cd ml/diagnostic-service
          python train_diagnostic_model.py
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          XAI_API_KEY: ${{ secrets.XAI_API_KEY }}
      
      - name: Upload model artifacts
        uses: actions/upload-artifact@v4
        with:
          name: diagnostic-model
          path: ml/diagnostic-service/models/
```

## Blockchain Deployment Pipeline

```yaml
# .github/workflows/blockchain-deploy.yml
name: Blockchain Smart Contract Deployment

on:
  push:
    branches: [main]
    paths: ['blockchain/**']

jobs:
  deploy-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd blockchain
          npm ci
      
      - name: Deploy smart contracts
        run: |
          cd blockchain
          npm run deploy:mainnet
        env:
          HEDERA_ACCOUNT_ID: ${{ secrets.HEDERA_ACCOUNT_ID }}
          HEDERA_PRIVATE_KEY: ${{ secrets.HEDERA_PRIVATE_KEY }}
```

## Migration Scripts

### Repository Consolidation Script

```bash
#!/bin/bash
# scripts/migrate-to-monorepo.sh

set -e

echo "🚀 Starting KC Speedshop Repository Migration..."

# Create monorepo structure
mkdir -p kc-speedshop-platform/{frontend,backend,ml,blockchain,infrastructure,docs,scripts}

# Migrate frontend components
echo "📱 Migrating frontend components..."

# From sb1-rhq7ejfc
cp -r sb1-rhq7ejfc/src/components kc-speedshop-platform/frontend/src/
cp -r sb1-rhq7ejfc/src/services kc-speedshop-platform/frontend/src/
cp sb1-rhq7ejfc/package.json kc-speedshop-platform/frontend/

# From studious-couscous/client
cp -r studious-couscous/client/src/* kc-speedshop-platform/frontend/src/

# From KarapiroCartel
cp -r KarapiroCartel/src/components kc-speedshop-platform/frontend/src/
cp -r KarapiroCartel/src/hooks kc-speedshop-platform/frontend/src/

# Migrate backend services
echo "🔧 Migrating backend services..."

# From studious-couscous/server
cp -r studious-couscous/server/src kc-speedshop-platform/backend/
cp -r studious-couscous/server/prisma kc-speedshop-platform/backend/
cp studious-couscous/server/package.json kc-speedshop-platform/backend/

# Migrate ML services
echo "🤖 Migrating ML services..."

mkdir -p kc-speedshop-platform/ml/diagnostic-service
cp KarapiroCartel/src/services/diagnostic_service.js kc-speedshop-platform/ml/diagnostic-service/
cp KarapiroCartel/scripts/chart_script.py kc-speedshop-platform/ml/diagnostic-service/

# Migrate blockchain services
echo "⛓️ Migrating blockchain services..."

mkdir -p kc-speedshop-platform/blockchain/services
cp KarapiroCartel/src/services/blockchain_service.js kc-speedshop-platform/blockchain/services/

# Migrate infrastructure
echo "🏗️ Migrating infrastructure..."

cp -r KarapiroCartel/terraform kc-speedshop-platform/infrastructure/
cp -r KarapiroCartel/k8s kc-speedshop-platform/infrastructure/
cp studious-couscous/docker-compose.yml kc-speedshop-platform/infrastructure/

# Create unified package.json
echo "📦 Creating unified package.json..."

cat > kc-speedshop-platform/package.json << EOF
{
  "name": "kc-speedshop-platform",
  "version": "1.0.0",
  "description": "Unified KC Speedshop Automotive Platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\" \"npm run dev:ml\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev:ml": "cd ml/diagnostic-service && python app.py",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend && npm run test:ml",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "test:ml": "cd ml/diagnostic-service && pytest",
    "deploy": "cd infrastructure && docker-compose up -d"
  },
  "workspaces": [
    "frontend",
    "backend"
  ],
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

echo "✅ Migration completed successfully!"
echo "📁 New monorepo structure created at: kc-speedshop-platform/"
```

### Docker Compose for Development

```yaml
# infrastructure/docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ../frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ../backend:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/kc_speedshop
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  ml-service:
    build:
      context: ../ml/diagnostic-service
      dockerfile: Dockerfile.dev
    ports:
      - "3002:3002"
    volumes:
      - ../ml/diagnostic-service:/app
    environment:
      - XAI_API_KEY=${XAI_API_KEY}
      - RAPIDAPI_KEY=${RAPIDAPI_KEY}

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kc_speedshop
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Security Scanning Integration

```yaml
# .github/workflows/security-scan.yml
name: Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run Bandit security linter
        uses: python-security/bandit@main
        with:
          path: ml/
          level: low
      
      - name: Run ESLint security rules
        run: |
          cd frontend
          npm run lint:security
```

## Performance Monitoring

```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://staging.kcspeedshop.ai
            https://kcspeedshop.ai
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

**Pipeline Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** After Phase 1 deployment