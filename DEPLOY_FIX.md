# 배포 오류 해결 가이드

## "DEPLOYMENT_NOT_FOUND" 오류 해결

이 오류는 Vercel에서 배포를 찾을 수 없을 때 발생합니다.

### 해결 방법 1: 새로 배포하기 (권장)

#### Vercel 웹사이트에서:

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 로그인 확인

2. **기존 프로젝트 삭제 (있는 경우)**
   - 프로젝트 목록에서 해당 프로젝트 찾기
   - Settings → Delete Project

3. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택: `skyminlab/running-game-`
   - Import 클릭

4. **프로젝트 설정 확인**
   ```
   Framework Preset: Vite (자동 감지)
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Environment Variables** (필요 없음 - 이 프로젝트는 환경 변수 사용 안 함)

6. **Deploy 클릭**

### 해결 방법 2: Vercel CLI 사용

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 디렉토리로 이동
cd speed-learning-app

# 3. Vercel 로그인
vercel login

# 4. 새 프로젝트로 배포
vercel

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (본인 계정 선택)
# - Link to existing project? N (새 프로젝트)
# - Project name? speed-learning-app (또는 원하는 이름)
# - Directory? ./
# - Override settings? N

# 5. 프로덕션 배포
vercel --prod
```

### 해결 방법 3: GitHub 연동으로 자동 배포

1. **Vercel에서 GitHub 저장소 연결**
   - Vercel 대시보드 → Settings → Git
   - GitHub 저장소 연결 확인

2. **자동 배포 활성화**
   - 프로젝트 설정 → Git
   - "Production Branch"를 `main`으로 설정
   - "Auto-deploy" 활성화

3. **GitHub에 푸시하면 자동 배포**
   ```bash
   git push origin main
   ```

## 배포 후 확인

1. **배포 URL 확인**
   - Vercel 대시보드에서 배포 완료 후 URL 확인
   - 예: `https://speed-learning-app.vercel.app`

2. **배포 상태 확인**
   - "Deployments" 탭에서 빌드 로그 확인
   - 성공(Success) 또는 실패(Failed) 상태 확인

3. **앱 테스트**
   - 배포된 URL로 접속
   - 교사 모드로 세션 생성 테스트
   - 같은 브라우저의 새 탭에서 학생 모드로 접속 테스트

## 빌드 실패 시

### 로컬에서 빌드 테스트

```bash
cd speed-learning-app
npm install
npm run build
```

빌드가 성공하면 `dist` 폴더가 생성됩니다.

### 일반적인 빌드 오류

1. **의존성 문제**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Node.js 버전**
   - Vercel은 Node.js 18.x 사용
   - 로컬에서도 Node.js 18 이상 권장

3. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → 해당 배포 클릭
   - "Build Logs" 탭에서 오류 확인

## 문제가 계속되면

1. Vercel 대시보드에서 프로젝트 완전 삭제
2. GitHub 저장소 확인 (코드가 최신인지)
3. 새로 프로젝트 생성 및 배포

## 중요 참고사항

⚠️ **localStorage 제한:**
- 이 앱은 localStorage를 사용하므로 **같은 브라우저/도메인에서만 작동**합니다
- 배포 후에도 교사와 학생은 **같은 브라우저의 다른 탭**에서 접속해야 합니다
- 다른 기기나 브라우저에서는 세션이 공유되지 않습니다

