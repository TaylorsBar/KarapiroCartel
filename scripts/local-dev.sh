#!/bin/bash

set -e

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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) detected"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
    else
        print_status "Dependencies already installed. Run 'npm install' to update if needed."
    fi
    
    print_success "Dependencies ready!"
}

# Setup environment file
setup_env() {
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        cat > .env.local << EOF
# KarapiroCartel Local Development Environment
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key_here
VITE_ENVIRONMENT=development
EOF
        print_warning "Please update .env.local with your actual API keys and URLs"
    else
        print_status "Environment file .env.local already exists"
    fi
}

# Start Supabase locally (if available)
start_supabase() {
    if command -v supabase &> /dev/null; then
        print_status "Starting Supabase locally..."
        cd supabase 2>/dev/null || {
            print_warning "Supabase directory not found. Skipping local Supabase setup."
            return
        }
        
        if [ -f "config.toml" ]; then
            supabase start
            print_success "Supabase started locally!"
        else
            print_warning "Supabase not configured. Run 'supabase init' first."
        fi
        cd ..
    else
        print_warning "Supabase CLI not installed. You'll need to use a remote Supabase instance."
    fi
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    print_success "🚀 KarapiroCartel development server starting..."
    print_status "📱 App will be available at: http://localhost:5173"
    print_status "🔧 Features available in development mode:"
    print_status "   • Hot reload"
    print_status "   • React Developer Tools"
    print_status "   • Source maps"
    print_status "   • Error overlay"
    
    npm run dev
}

# Run tests
run_tests() {
    print_status "Running tests..."
    if grep -q "test" package.json; then
        npm test
    else
        print_warning "No test script found in package.json"
    fi
}

# Show development info
show_info() {
    print_status "🏎️  KarapiroCartel Platform - Development Mode"
    echo ""
    print_status "Available commands:"
    echo "  npm run dev      - Start development server"
    echo "  npm run build    - Build for production"
    echo "  npm run preview  - Preview production build"
    echo "  npm run lint     - Run ESLint"
    echo ""
    print_status "Project structure:"
    echo "  src/             - Source code"
    echo "  src/components/  - React components"
    echo "  src/services/    - API services"
    echo "  src/hooks/       - Custom React hooks"
    echo "  public/          - Static assets"
    echo "  k8s/             - Kubernetes manifests"
    echo "  terraform/       - Infrastructure code"
    echo ""
    print_status "Development features:"
    echo "  • Dashboard for automotive management"
    echo "  • Marketplace for parts and services"
    echo "  • Diagnostics tools"
    echo "  • Workshop management"
    echo "  • Analytics and reporting"
    echo "  • Supplier dashboard"
    echo "  • Blockchain payment integration"
    echo "  • Subscription management"
}

# Main function
main() {
    clear
    print_success "🏁 Setting up KarapiroCartel Platform for local development"
    echo ""
    
    check_node
    install_deps
    setup_env
    start_supabase
    
    echo ""
    show_info
    echo ""
    
    # Ask if user wants to start dev server
    read -p "Start development server now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_server
    else
        print_status "Run 'npm run dev' when you're ready to start the development server."
    fi
}

# Handle script arguments
case "${1:-}" in
    --install-only)
        check_node
        install_deps
        ;;
    --test)
        run_tests
        ;;
    --info)
        show_info
        ;;
    *)
        main
        ;;
esac