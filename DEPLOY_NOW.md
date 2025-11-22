# 🚀 즉시 배포 가이드

## ✅ 빌드 확인 완료
- 로컬 빌드 성공: `npm run build` ✓
- 빌드 출력: `dist/` 폴더 생성됨
- 설정 파일: `vercel.json` 준비됨

## 방법 1: Vercel 웹사이트에서 배포 (가장 빠름) ⭐

### 단계별 가이드:

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **새 프로젝트 생성**
   - "Add New..." 버튼 클릭
   - "Project" 선택

3. **GitHub 저장소 연결**
   - "Import Git Repository" 클릭
   - 저장소 선택: `skyminlab/running-game-`
   - "Import" 클릭

4. **프로젝트 설정 확인**
   ```
   Framework Preset: Vite (자동 감지)
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Environment Variables**
   - 이 프로젝트는 환경 변수 불필요
   - 그대로 진행

6. **Deploy 클릭**
   - 배포 시작 (약 1-2분 소요)

7. **배포 완료 후 URL 확인**
   - 배포가 완료되면 자동으로 URL 생성
   - 예: `https://running-game-xxxxx.vercel.app`
   - 이 URL을 복사하여 사용

## 방법 2: Vercel CLI 사용 (터미널)

### 설치 및 배포:

```bash
# 프로젝트 디렉토리로 이동
cd speed-learning-app

# Vercel CLI 실행 (npx 사용 - 설치 불필요)
npx vercel

# 또는 로컬 설치 후
npm install --save-dev vercel
npx vercel
```

### 배포 과정:

1. **첫 실행 시:**
   ```
   ? Set up and deploy "~/speed-learning-app"? [Y/n] Y
   ? Which scope do you want to deploy to? (본인 계정 선택)
   ? Link to existing project? [y/N] N
   ? What's your project's name? speed-learning-app
   ? In which directory is your code located? ./
   ```

2. **프로덕션 배포:**
   ```bash
   npx vercel --prod
   ```

3. **배포 URL 확인:**
   - 터미널에 배포 URL이 표시됨
   - 또는 Vercel 대시보드에서 확인

## 방법 3: GitHub 연동 자동 배포

1. **Vercel에서 GitHub 저장소 연결**
   - Settings → Git → GitHub 연결

2. **자동 배포 설정**
   - Production Branch: `main`
   - Auto-deploy: 활성화

3. **자동 배포 확인**
   - `git push` 할 때마다 자동 배포
   - Vercel 대시보드에서 배포 상태 확인

## 📋 배포 후 확인사항

1. ✅ 배포 URL 접속 테스트
2. ✅ 교사 모드로 세션 생성 테스트
3. ✅ 같은 브라우저의 새 탭에서 학생 모드로 접속 테스트

## ⚠️ 중요 참고사항

**localStorage 제한:**
- 이 앱은 localStorage를 사용하므로 **같은 브라우저/도메인에서만 작동**합니다
- 배포 후에도 교사와 학생은 **같은 브라우저의 다른 탭**에서 접속해야 합니다
- 다른 기기나 브라우저에서는 세션이 공유되지 않습니다

## 🔧 문제 해결

### 배포 실패 시:

1. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → 해당 배포 클릭
   - "Build Logs" 탭에서 오류 확인

2. **로컬 빌드 테스트**
   ```bash
   npm run build
   ```
   - 성공하면 `dist/` 폴더 생성됨

3. **의존성 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## 📞 배포 URL 확인 방법

배포 완료 후:
- Vercel 대시보드 → 프로젝트 → "Domains" 섹션
- 또는 배포 완료 알림에서 URL 확인

