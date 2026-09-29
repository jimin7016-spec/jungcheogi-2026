# 정처기 삐약 플래너 (10/25 실기)

빌드 없이 그대로 올리면 되는 정적 웹앱입니다. 공부한 시간만큼 알 → 금 간 알 → 부화 → 아기 병아리 → 중병아리 → 늠름한 합격 닭으로 자랍니다.

- **오늘**: D-day·연속 공부일·오늘 공부시간 카드, 병아리 응원, 그날 계획 체크와 실제 시간 기록, 계획에 없던 공부는 "공부 기록 추가하기"
- **계획·성장**: D-day·연속 공부일·총 공부시간, 캐릭터 성장/도감, 달력(날짜별 공부 여부·시간), 전체 계획 보기
- 폰트: 제목·숫자 Jua(Google Fonts), 본문 Pretendard(jsDelivr)
- **계획 수정**: 달력·전체 계획에서 날짜를 누르면 수정·추가·삭제 가능. 기본 계획(plan.js)은 그대로 두고 고친 내용만 기기에 저장되며 "원래대로"로 되돌릴 수 있습니다.

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
- 체크·실제 시간은 기기별 localStorage 에 저장됩니다. 폰과 PC는 서로 동기화되지 않으니 "계획·성장" 화면 하단의 내보내기/가져오기로 옮기세요.
- 계획(plan.js)이나 화면을 고쳐 다시 올리면 sw.js 맨 위 `CACHE = "itp-v3"` 숫자를 올려야 폰에 반영됩니다.
