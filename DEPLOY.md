# 배포 가이드 (Deployment Guide)

## Vercel 배포 방법

### 1. Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
cd speed-learning-app
vercel

# 배포 확인
vercel --prod
```

### 2. Vercel 웹사이트 사용

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결: `skyminlab/running-game-`
4. 프로젝트 설정:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. "Deploy" 클릭

## Netlify 배포 방법

### 1. Netlify CLI 사용

```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 프로젝트 디렉토리에서 실행
cd speed-learning-app
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

### 2. Netlify 웹사이트 사용

1. [Netlify](https://www.netlify.com)에 로그인
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 연결: `skyminlab/running-game-`
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. "Deploy site" 클릭

## 중요 사항

⚠️ **localStorage 제한사항:**
- 이 앱은 localStorage를 사용하므로 **같은 브라우저/도메인에서만 작동**합니다
- 배포 후에도 교사와 학생은 **같은 브라우저의 다른 탭**에서 접속해야 합니다
- 다른 기기나 브라우저에서는 세션이 공유되지 않습니다

## 배포 후 확인사항

1. 배포 URL 확인
2. 교사 모드로 접속하여 세션 생성 테스트
3. 같은 브라우저의 새 탭에서 학생 모드로 접속 테스트

## 문제 해결

### "DEPLOYMENT_NOT_FOUND" 오류

1. 배포가 완료되었는지 확인
2. 올바른 프로젝트를 선택했는지 확인
3. GitHub 저장소가 올바르게 연결되었는지 확인
4. 빌드 로그 확인

### 빌드 실패

1. `npm run build` 로컬에서 테스트
2. Node.js 버전 확인 (18 이상 권장)
3. 의존성 설치 확인: `npm install`

