# 🚀 EC2 설정 및 배포 가이드

## 1. EC2 접속 후 초기 설정

### 방법 1: 수동 설정 (권장)
```bash
# EC2 접속 후 실행
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js 설치 (빌드용)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 재로그인 (Docker 그룹 적용)
exit
# 다시 SSH 접속
```

### 방법 2: 설정 스크립트 사용
```bash
# 1. 프로젝트를 먼저 클론
git clone https://github.com/YOUR_USERNAME/YouSumFront.git
cd YouSumFront

# 2. 설정 스크립트 실행
chmod +x setup-ec2.sh
./setup-ec2.sh

# 3. 재로그인 후 계속 진행
exit
# SSH 재접속
```

## 2. 프로젝트 배포

### 환경 변수 설정
```bash
# 기존 백엔드 .env 파일을 프론트엔드 프로젝트로 복사
# 또는 .env 파일에 MySQL 설정 추가

# MySQL 설정 추가 (기존 .env에 추가)
echo "MYSQL_ROOT_PASSWORD=yousum_root_2024" >> .env
echo "MYSQL_DATABASE=yousum" >> .env
echo "MYSQL_USER=yousum_user" >> .env
echo "MYSQL_PASSWORD=yousum_password_2024" >> .env
```

### 백엔드 이미지명 확인 및 수정
```bash
# 현재 백엔드 Docker 이미지 확인
docker images

# docker-compose.yml에서 실제 이미지명으로 수정
vim docker-compose.yml
# backend 서비스의 image를 실제 이미지명으로 변경
```

### 배포 실행
```bash
chmod +x deploy.sh
./deploy.sh
```

## 3. 실제 사용 명령어

### 환경 변수 확인
```bash
# .env 파일 확인
cat .env

# 필수 환경 변수가 있는지 확인
grep -E "(DATABASE_URL|OPENAI_API_KEY|JWT_SECRET)" .env
```

### Docker 이미지 확인
```bash
# 백엔드 이미지 확인
docker images | grep yousum
docker images | grep backend

# 없다면 백엔드를 먼저 빌드하세요
```

### 포트 확인
```bash
# 사용 중인 포트 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :3306
```

## 4. 트러블슈팅

### 백엔드 이미지가 없는 경우
```bash
# 백엔드 프로젝트에서 이미지 빌드
cd ../YouSumBackend  # 백엔드 프로젝트 경로
docker build -t yousum-backend:latest .

# 또는 docker-compose.yml에서 백엔드도 빌드하도록 수정
```

### 포트 충돌 해결
```bash
# 포트를 사용하는 프로세스 종료
sudo kill -9 $(sudo lsof -t -i:80)
sudo kill -9 $(sudo lsof -t -i:8080)
```

### 로그 확인
```bash
# 서비스별 로그 확인
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mysql
``` 