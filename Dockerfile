# 멀티스테이지 빌드 - 빌드 스테이지
FROM node:18-alpine as builder

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# 프로덕션 스테이지 - Nginx로 정적 파일 서빙
FROM nginx:alpine

# 기본 nginx 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# 빌드된 파일들을 nginx html 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사 (SPA를 위한 설정)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"] 