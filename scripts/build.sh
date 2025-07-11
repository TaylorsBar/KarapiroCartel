#!/bin/bash

set -e

echo "🚀 Building KarapiroCartel Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed!"
}

# Build the application
build_app() {
    print_status "Building React application..."
    npm run build
    print_success "Application built successfully!"
}

# Build Docker image
build_docker() {
    print_status "Building Docker image..."
    
    # Get version from package.json or use default
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "latest")
    IMAGE_NAME="karapiro-cartel"
    
    docker build -t "${IMAGE_NAME}:${VERSION}" -t "${IMAGE_NAME}:latest" .
    
    print_success "Docker image built: ${IMAGE_NAME}:${VERSION}"
}

# Run linting
run_lint() {
    print_status "Running linter..."
    npm run lint || print_warning "Linting completed with warnings"
}

# Main execution
main() {
    print_status "Starting build process for KarapiroCartel Platform"
    
    check_requirements
    install_dependencies
    run_lint
    build_app
    build_docker
    
    print_success "✅ Build completed successfully!"
    print_status "🐳 Docker image: karapiro-cartel:latest"
    print_status "📁 Build output: ./dist/"
}

# Handle script arguments
case "${1:-}" in
    --deps-only)
        install_dependencies
        ;;
    --app-only)
        build_app
        ;;
    --docker-only)
        build_docker
        ;;
    --no-docker)
        check_requirements
        install_dependencies
        run_lint
        build_app
        ;;
    *)
        main
        ;;
esac