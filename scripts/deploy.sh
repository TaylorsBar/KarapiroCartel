#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
NAMESPACE="karapiro-cartel"
TERRAFORM_DIR="./terraform"
K8S_DIR="./k8s"

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
    print_status "Checking deployment requirements..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform."
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl."
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI."
        exit 1
    fi
    
    print_success "All deployment requirements met!"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd "${TERRAFORM_DIR}"
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Plan the deployment
    print_status "Planning Terraform deployment..."
    terraform plan -var="environment=${ENVIRONMENT}"
    
    # Apply the deployment
    print_status "Applying Terraform deployment..."
    terraform apply -var="environment=${ENVIRONMENT}" -auto-approve
    
    cd ..
    print_success "Infrastructure deployed successfully!"
}

# Configure kubectl for EKS
configure_kubectl() {
    print_status "Configuring kubectl for EKS..."
    
    # Get cluster name from Terraform output
    CLUSTER_NAME=$(cd "${TERRAFORM_DIR}" && terraform output -raw eks_cluster_name)
    
    # Configure kubectl
    aws eks update-kubeconfig --region us-east-1 --name "${CLUSTER_NAME}"
    
    print_success "kubectl configured for cluster: ${CLUSTER_NAME}"
}

# Deploy application to Kubernetes
deploy_application() {
    print_status "Deploying application to Kubernetes..."
    
    # Create namespace
    print_status "Creating namespace..."
    kubectl apply -f "${K8S_DIR}/namespace.yaml"
    
    # Apply secrets (you'll need to update with real values)
    print_warning "Please update ${K8S_DIR}/secrets.yaml with your actual Supabase credentials"
    kubectl apply -f "${K8S_DIR}/secrets.yaml"
    
    # Deploy application
    print_status "Deploying application..."
    kubectl apply -f "${K8S_DIR}/deployment.yaml"
    
    print_success "Application deployed successfully!"
}

# Wait for deployment to be ready
wait_for_deployment() {
    print_status "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/karapiro-cartel-app -n "${NAMESPACE}"
    
    print_success "Deployment is ready!"
}

# Get deployment status
get_status() {
    print_status "Getting deployment status..."
    
    echo -e "\n${BLUE}Pods:${NC}"
    kubectl get pods -n "${NAMESPACE}"
    
    echo -e "\n${BLUE}Services:${NC}"
    kubectl get services -n "${NAMESPACE}"
    
    echo -e "\n${BLUE}Ingress:${NC}"
    kubectl get ingress -n "${NAMESPACE}"
    
    # Get Load Balancer URL if available
    LB_URL=$(kubectl get ingress karapiro-cartel-ingress -n "${NAMESPACE}" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Not available yet")
    echo -e "\n${GREEN}Application URL:${NC} http://${LB_URL}"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up resources..."
    
    read -p "Are you sure you want to destroy all resources? (yes/no): " confirm
    if [[ $confirm == "yes" ]]; then
        # Delete Kubernetes resources
        kubectl delete -f "${K8S_DIR}/" --ignore-not-found=true
        
        # Destroy Terraform infrastructure
        cd "${TERRAFORM_DIR}"
        terraform destroy -var="environment=${ENVIRONMENT}" -auto-approve
        cd ..
        
        print_success "Resources cleaned up successfully!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Main deployment function
main() {
    print_status "🚀 Starting deployment of KarapiroCartel Platform (Environment: ${ENVIRONMENT})"
    
    check_requirements
    deploy_infrastructure
    configure_kubectl
    deploy_application
    wait_for_deployment
    get_status
    
    print_success "✅ Deployment completed successfully!"
    print_status "🌐 Your KarapiroCartel platform is now running on AWS EKS!"
}

# Handle script arguments
case "${1:-}" in
    --infrastructure-only)
        check_requirements
        deploy_infrastructure
        ;;
    --app-only)
        check_requirements
        configure_kubectl
        deploy_application
        wait_for_deployment
        get_status
        ;;
    --status)
        get_status
        ;;
    --cleanup)
        cleanup
        ;;
    dev|staging|prod)
        main
        ;;
    *)
        echo "Usage: $0 [dev|staging|prod|--infrastructure-only|--app-only|--status|--cleanup]"
        echo ""
        echo "Options:"
        echo "  dev, staging, prod    Deploy to specified environment"
        echo "  --infrastructure-only Deploy only the infrastructure"
        echo "  --app-only           Deploy only the application"
        echo "  --status             Get current deployment status"
        echo "  --cleanup            Destroy all resources"
        echo ""
        echo "Example: $0 dev"
        exit 1
        ;;
esac