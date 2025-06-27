#!/bin/bash

# YouSum 프론트엔드 배포 스크립트
echo "🚀 YouSum 배포를 시작합니다..."

# 컬러 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 에러 발생 시 스크립트 중단
set -e

# 함수 정의
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Git 저장소에서 최신 코드 pull
print_status "Git 저장소에서 최신 코드를 가져옵니다..."
git pull origin main

# 기존 컨테이너 중지 및 제거
print_status "기존 컨테이너를 중지하고 제거합니다..."
docker-compose down --remove-orphans

# 기존 이미지 제거 (선택사항)
print_warning "기존 프론트엔드 이미지를 제거합니다..."
docker rmi $(docker images -q yousum-frontend) 2>/dev/null || true

# .env 파일 확인
if [ ! -f .env ]; then
    print_error ".env 파일이 존재하지 않습니다. env.example을 참고하여 .env 파일을 생성해주세요."
    exit 1
fi

# Docker 이미지 빌드 및 컨테이너 실행
print_status "Docker 이미지를 빌드하고 컨테이너를 실행합니다..."
docker-compose up -d --build

# 서비스 상태 확인
print_status "서비스 상태를 확인합니다..."
sleep 10

# 컨테이너 상태 확인
docker-compose ps

# 프론트엔드 헬스체크
print_status "프론트엔드 서비스 헬스체크를 수행합니다..."
for i in {1..10}; do
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        print_status "✅ 프론트엔드 서비스가 정상적으로 실행되었습니다!"
        break
    else
        print_warning "프론트엔드 서비스 확인 중... ($i/10)"
        sleep 5
    fi
    
    if [ $i -eq 10 ]; then
        print_error "❌ 프론트엔드 서비스 실행에 실패했습니다."
        exit 1
    fi
done

# 백엔드 헬스체크
print_status "백엔드 서비스 헬스체크를 수행합니다..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        print_status "✅ 백엔드 서비스가 정상적으로 실행되었습니다!"
        break
    else
        print_warning "백엔드 서비스 확인 중... ($i/10)"
        sleep 5
    fi
    
    if [ $i -eq 10 ]; then
        print_error "❌ 백엔드 서비스 실행에 실패했습니다."
        exit 1
    fi
done

# 로그 정리
print_status "오래된 Docker 로그를 정리합니다..."
docker system prune -f

print_status "🎉 배포가 완료되었습니다!"
print_status "프론트엔드: http://$(curl -s ifconfig.me || echo 'YOUR_EC2_IP')"
print_status "백엔드 API: http://$(curl -s ifconfig.me || echo 'YOUR_EC2_IP'):8080"

echo ""
echo "📋 유용한 명령어:"
echo "  - 로그 확인: docker-compose logs -f [서비스명]"
echo "  - 컨테이너 상태: docker-compose ps"
echo "  - 컨테이너 중지: docker-compose down"
echo "  - 완전 정리: docker-compose down -v --remove-orphans" 