#!/bin/bash

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

# Copy security middleware
cp security-middleware.js kc-speedshop-platform/backend/src/middleware/
cp .env.example kc-speedshop-platform/

echo "✅ Migration completed successfully!"
echo "📁 New monorepo structure created at: kc-speedshop-platform/"
echo ""
echo "Next steps:"
echo "1. cd kc-speedshop-platform"
echo "2. npm run install:all"
echo "3. Copy .env.example to .env and fill in your values"
echo "4. npm run dev"