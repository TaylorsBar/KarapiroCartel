provider "aws" {
  region = "us-east-1"
}

# VPC Module
module "vpc" {
  source       = "./modules/vpc"
  cidr_block   = "10.0.0.0/16"
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  environment = var.environment
}

# EKS Cluster Module
module "eks" {
  source          = "./modules/eks_cluster"
  cluster_name    = "agisupergrok-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  node_pools = {
    general-purpose = { instance_type = "m5.large", min_size = 1, max_size = 3 }
    ml-inference    = { instance_type = "g5.xlarge", min_size = 0, max_size = 2 }
  }
  environment       = var.environment
  eks_role_arn      = aws_iam_role.eks_role.arn
  eks_node_role_arn = aws_iam_role.eks_node_role.arn
  depends_on        = [module.vpc]
}

# IAM Roles for EKS
resource "aws_iam_role" "eks_role" {
  name = "agisupergrok-eks-${var.environment}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_role.name
}

resource "aws_iam_role_policy_attachment" "eks_service" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
  role       = aws_iam_role.eks_role.name
}

# IAM Role for EKS Node Groups
resource "aws_iam_role" "eks_node_role" {
  name = "agisupergrok-eks-node-${var.environment}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_registry" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

# Kubernetes Provider (requires EKS cluster to exist)
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

# Namespace and Network Policy
resource "kubernetes_namespace" "app_ns" {
  metadata {
    name = "agisupergrok-${var.environment}"
  }
  depends_on = [module.eks]
}

resource "kubernetes_network_policy" "default_deny" {
  metadata {
    name      = "default-deny-all"
    namespace = kubernetes_namespace.app_ns.metadata.0.name
  }
  spec {
    pod_selector = {}
    policy_types = ["Ingress", "Egress"]
  }
  depends_on = [kubernetes_namespace.app_ns]
}

# Variables
variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}