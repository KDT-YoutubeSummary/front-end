#!/bin/bash

# EC2 Ubuntu 초기 설정 스크립트
echo "🚀 EC2 Ubuntu 서버 초기 설정을 시작합니다..."

# 컬러 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 시스템 업데이트
print_status "시스템 패키지를 업데이트합니다..."
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
print_status "필수 패키지를 설치합니다..."
sudo apt install -y curl wget git vim htop unzip

# Docker 설치
print_status "Docker를 설치합니다..."
# 기존 Docker 제거
sudo apt remove -y docker docker-engine docker.io containerd runc

# Docker GPG 키 및 저장소 추가
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker 서비스 시작 및 자동 시작 설정
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# Docker Compose 설치 (독립 실행형)
print_status "Docker Compose를 설치합니다..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js 설치 (프론트엔드 빌드용)
print_status "Node.js를 설치합니다..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Git 설정 (기본값)
print_status "Git 기본 설정을 합니다..."
git config --global init.defaultBranch main

# 방화벽 설정
print_status "방화벽을 설정합니다..."
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp

# 스왑 파일 생성 (메모리 부족 방지)
print_status "스왑 파일을 생성합니다..."
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 타임존 설정
print_status "타임존을 한국 시간으로 설정합니다..."
sudo timedatectl set-timezone Asia/Seoul

# 시스템 리소스 제한 설정
print_status "시스템 리소스 제한을 설정합니다..."
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf

# 프로젝트 디렉토리 생성
print_status "프로젝트 디렉토리를 생성합니다..."
mkdir -p ~/yousum
cd ~/yousum

# 환경 확인
print_status "설치된 버전을 확인합니다..."
echo "Docker 버전: $(docker --version)"
echo "Docker Compose 버전: $(docker-compose --version)"
echo "Node.js 버전: $(node --version)"
echo "NPM 버전: $(npm --version)"

print_warning "설정이 완료되었습니다! 다음 단계를 진행하세요:"
echo ""
echo "1. 현재 세션을 종료하고 다시 로그인하세요 (Docker 그룹 적용)"
echo "   exit"
echo "   ssh -i your-key.pem ubuntu@your-ec2-ip"
echo ""
echo "2. 프로젝트를 클론하세요:"
echo "   cd ~/yousum"
echo "   git clone https://github.com/your-username/YouSumFront.git ."
echo ""
echo "3. 환경 변수 파일을 설정하세요:"
echo "   cp env.example .env"
echo "   vim .env  # 실제 값으로 수정"
echo ""
echo "4. 배포를 실행하세요:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"

print_status "🎉 EC2 초기 설정이 완료되었습니다!" 