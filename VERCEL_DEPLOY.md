# Vercel 배포 실행 가이드

## 현재 상황
- 기존 URL: https://running-game-two.vercel.app/ (404 오류)
- 프로젝트 이름: running-game-two

## 배포 실행 방법

### 1. 터미널에서 다음 명령 실행:

```bash
cd speed-learning-app

# 1. Vercel 로그인 (처음 한 번만)
npx vercel login

# 2. 기존 프로젝트에 연결
npx vercel link

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (본인 계정 선택)
# - Link to existing project? Y
# - What's the name of your existing project? running-game-two
# - In which directory is your code located? ./

# 3. 프로덕션 배포
npx vercel --prod
```

### 2. 또는 새 프로젝트로 배포:

```bash
cd speed-learning-app

# 새 프로젝트 생성 및 배포
npx vercel --prod

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (본인 계정 선택)
# - Link to existing project? N
# - What's your project's name? running-game-two (또는 새 이름)
# - In which directory is your code located? ./
```

## 배포 완료 후

배포가 완료되면 터미널에 다음과 같은 출력이 표시됩니다:

```
✅ Production: https://running-game-two.vercel.app [copied to clipboard]
```

이 URL이 새로운 프로덕션 배포 URL입니다.

## 문제 해결

### "No existing credentials found" 오류
```bash
npx vercel login
# 브라우저에서 인증 완료
```

### 프로젝트를 찾을 수 없는 경우
- Vercel 대시보드에서 프로젝트가 존재하는지 확인
- 프로젝트 이름이 정확한지 확인
- 새 프로젝트로 생성하는 것을 고려

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 성공하면 dist 폴더가 생성됨
```

