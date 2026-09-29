# 쑥쑥 스터디

빌드 없이 그대로 올리면 되는 정적 웹앱입니다. 사용자별로 시험(정보처리기사 실기, AWS SAA-C03, 직접 등록)을 여러 개 만들 수 있고, 공부한 시간만큼 고른 캐릭터(병아리 / 아기 원숭이 / 핑크곰)가 알에서 깨어나 합격 모습까지 6단계로 자랍니다.

- **오늘**: D-day·연속 공부일·오늘 공부시간 카드, 캐릭터 응원, 그날 계획 체크와 실제 시간 기록, 계획에 없던 공부는 "공부 기록 추가하기"
- **계획·성장**: D-day·연속 공부일·총 공부시간, 캐릭터 성장/도감, 달력(날짜별 공부 여부·시간), 전체 계획 보기
- **계획 수정**: 달력·전체 계획에서 날짜를 누르면 수정·추가·삭제 가능. 기본 계획(plan.js)은 그대로 두고 고친 내용만 기기에 저장되며 "원래대로"로 되돌릴 수 있습니다.
- 폰트: 제목·숫자 Jua(Google Fonts), 본문 Pretendard(jsDelivr)

## 사용자 · 시험
- 처음 열면 **사용자 만들기**: 이름(중복 불가) + 비밀번호 4자리 → 캐릭터(병아리 / 아기 원숭이 / 핑크곰) → 시험(정보처리기사 실기 / AWS SAA-C03 / 직접 등록) → 시험일·시작일 → 평일/주말 공부 가능 시간 → 계획 방식
- 계획 방식: 정처기 기본 계획(10/25 시험일 때) / 빈 계획표(가능 시간만큼 날짜별 칸) / AI랑 같이 세우기(프롬프트 복사 → AI 답변 JSON 붙여 넣기)
- 한 사용자가 시험을 여러 개 가질 수 있어요 (예: 지민 → 정처기, AWS). 위쪽 이름을 누르면 시험 바꾸기·시험 추가·사용자 바꾸기
- 저장 구조: `localStorage["itp-app-v2"] = { users: [...], exams: { id: { ..., state } } }`. 예전 `itp-app-v1` 기록은 처음 사용자를 만들 때 그 사용자의 정처기 시험으로 옮기고, 원본은 백업으로 남겨 둬요.
- 비밀번호는 이 기기에서 다른 사람이 실수로 들어오지 않게 막는 잠금이에요(서버가 없어 진짜 보안은 아님). 잊으면 되찾을 수 없어요.

주소: https://jimin7016-spec.github.io/ssukssuk-study/

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
- 계획(plan.js)이나 화면을 고쳐 다시 올리면 sw.js 맨 위 `CACHE = "itp-v6"` 숫자를 올려야 폰에 반영됩니다.
