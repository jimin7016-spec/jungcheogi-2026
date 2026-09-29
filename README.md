# 정처기 합격 체크표 (10/25 실기)

빌드 없이 그대로 올리면 되는 정적 웹앱입니다. 화면은 "오늘 계획"과 "누적" 두 개입니다.

## 파일
index.html / app.js / plan.js(날짜별 계획 데이터) / sw.js(오프라인 캐시) / manifest.webmanifest / icon-*.png

## 미리보기
- 폴더의 index.html 을 더블클릭하거나, 터미널에서 `python3 -m http.server` 후 http://localhost:8000
- 날짜 바꿔 보기: `index.html?today=2026-10-03`

## GitHub Pages 배포
1. GitHub에서 새 저장소 생성 (예: itp-plan)
2. 이 폴더의 파일 전부를 저장소 루트에 업로드 (Add file → Upload files)
3. Settings → Pages → Source: Deploy from a branch → main / (root) → Save
4. 1~2분 뒤 `https://<내아이디>.github.io/<저장소이름>/` 접속
   (무료 계정은 Public 저장소여야 합니다. 개인 정보는 코드에 없고 기록은 폰 안에만 저장됩니다.)

## Vercel 배포
1. vercel.com 에서 GitHub 로그인 → Add New Project → 위 저장소 Import
2. Framework Preset: Other, Build Command 비움, Output Directory 비움 → Deploy
3. 발급된 `https://....vercel.app` 링크로 접속

## 폰에 앱처럼 설치
- iPhone(Safari): 공유 → 홈 화면에 추가
- Android(Chrome): 메뉴 → 홈 화면에 추가 / 앱 설치

## 주의
- 체크·실제 시간은 기기별 localStorage 에 저장됩니다. 폰과 PC는 서로 동기화되지 않으니 "누적" 화면 하단의 내보내기/가져오기로 옮기세요.
- 계획(plan.js)이나 화면을 고쳐 다시 올리면 sw.js 맨 위 `CACHE = "itp-v1"` 숫자를 올려야 폰에 반영됩니다.
