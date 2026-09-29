// 정보처리기사 실기 기본 커리큘럼 (교재 PART 01~08, 2026-09-29 ~ 10-25)
// 날짜별 항목 순서는 바꾸지 마세요: 체크·실제 시간 기록이 '날짜-순서' 로 연결되어 있습니다.
const PLAN = {
 "parts": [
  {
   "k": "01",
   "name": "소프트웨어 구축",
   "pages": "p.8–102"
  },
  {
   "k": "02",
   "name": "데이터베이스 구축",
   "pages": "p.104–140"
  },
  {
   "k": "03",
   "name": "운영체제",
   "pages": "p.142–166"
  },
  {
   "k": "04",
   "name": "네트워크",
   "pages": "p.168–200"
  },
  {
   "k": "05",
   "name": "정보보안",
   "pages": "p.202–226"
  },
  {
   "k": "06",
   "name": "신기술 용어",
   "pages": "p.228–238"
  },
  {
   "k": "07",
   "name": "SQL 활용 & 관계 데이터 언어",
   "pages": "p.240–334"
  },
  {
   "k": "08",
   "name": "계산식",
   "pages": "p.336~"
  }
 ],
 "phases": [
  {
   "key": "p1",
   "name": "1주차 · 진단 / PART 01–02",
   "range": "9/29 ~ 10/5",
   "desc": "기출 진단 → PART 01 소프트웨어 구축 → PART 02 데이터베이스 구축 · 코드(C, Java) 기출 병행"
  },
  {
   "key": "p2",
   "name": "2주차 · PART 03–06 / SQL 입문",
   "range": "10/6 ~ 10/12",
   "desc": "운영체제 → 네트워크 → 정보보안 → 신기술 용어 · 코드(Python) 기출 · 10/11 휴식 · 10/12 SQL 시작"
  },
  {
   "key": "p3",
   "name": "3주차 · SQL / 계산식 / 모의고사",
   "range": "10/13 ~ 10/18",
   "desc": "PART 07 SQL·관계 데이터 언어 → PART 08 계산식 · 10/18 모의고사 1회"
  },
  {
   "key": "p4",
   "name": "4주차 · 오답 보강 / 마무리",
   "range": "10/19 ~ 10/25",
   "desc": "모의고사 오답 분석 → 약점 PART 재학습 → 영역별 회독 → 오답노트 · 답안 표기 점검"
  }
 ],
 "days": [
  {
   "iso": "2026-09-29",
   "phase": "p1",
   "hol": "",
   "wd": "화",
   "md": "9/29",
   "dd": "D-26",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "진단 평가 · 이론",
     "detail": "최근 기출 1회분 이론 문항 풀이 · 채점 · 오답별 교재 PART 표기"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "진단 평가 · 코드 / SQL",
     "detail": "최근 기출 코드·SQL 문항 손 추적 풀이 · 취약 언어와 유형 기록"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-09-30",
   "phase": "p1",
   "hol": "",
   "wd": "수",
   "md": "9/30",
   "dd": "D-25",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.8–15",
     "title": "소프트웨어 공학 · 개발 방법론",
     "detail": "폭포수 · 프로토타입 · 나선형 · 애자일(XP, 스크럼) 특징 비교"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.16–29",
     "title": "프로젝트 계획 · 요구사항 분석",
     "detail": "비용 산정(COCOMO, 기능 점수) · 일정 관리(PERT, CPM) · 요구공학 절차 · 유스케이스"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-01",
   "phase": "p1",
   "hol": "",
   "wd": "목",
   "md": "10/1",
   "dd": "D-24",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.30–36",
     "title": "설계 원칙 · 소프트웨어 아키텍처",
     "detail": "추상화 · 모듈화 · 정보 은닉 · 결합도와 응집도 종류와 순서 · 아키텍처 패턴(MVC, 레이어, 파이프-필터)"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.37–46",
     "title": "UML · 화면 설계",
     "detail": "클래스 · 시퀀스 · 유스케이스 다이어그램 · 관계(연관, 집합, 합성, 일반화, 의존) · UI 설계 원칙 · 프로토타입"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-02",
   "phase": "p1",
   "hol": "",
   "wd": "금",
   "md": "10/2",
   "dd": "D-23",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "c",
     "parts": [
      "01"
     ],
     "pages": "p.47–50",
     "title": "프로그래밍 기초",
     "detail": "변수 · 자료형 · 연산자 · 제어문 · 기출 코드 2문항 손 추적"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.51–63",
     "title": "개발 환경 구축 · 모듈 구현",
     "detail": "형상 관리(Git, SVN) · 빌드 도구 · 단위 모듈"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-03",
   "phase": "p1",
   "hol": "개천절",
   "wd": "토",
   "md": "10/3",
   "dd": "D-22",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.64–77",
     "title": "서버 프로그램 구현 · 인터페이스 구현",
     "detail": "연계 방식(EAI, ESB, API, DB 링크) · 데이터 포맷(JSON, XML) · 인터페이스 검증 도구"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.78–91",
     "title": "객체지향 설계 · 테스트 케이스 설계",
     "detail": "캡슐화 · 상속 · 다형성 · 디자인 패턴 · 블랙박스 / 화이트박스 테스트 · 커버리지"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 실습 · C",
     "detail": "기출 10문항 · 포인터 · 배열 · 반복문 · 변수 추적 표 작성"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-04",
   "phase": "p1",
   "hol": "",
   "wd": "일",
   "md": "10/4",
   "dd": "D-21",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.92–102",
     "title": "통합 테스트 · 유지보수 · 패키징",
     "detail": "상향식 / 하향식 통합 · 스텁과 드라이버 · 유지보수 유형 · 릴리즈 노트 · 버전 관리"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "02"
     ],
     "pages": "p.104–117",
     "title": "데이터베이스 개념 · 논리 설계",
     "detail": "스키마 3계층 · 설계 단계 · 키 · 무결성 · 정규화(1NF~BCNF) 예제 풀이"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "02"
     ],
     "pages": "p.118–128",
     "title": "물리 설계 · 관계형 데이터베이스",
     "detail": "인덱스 · 파티션 · 반정규화 · 릴레이션 용어(속성, 튜플, 차수, 카디널리티)"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-05",
   "phase": "p1",
   "hol": "대체공휴일",
   "wd": "월",
   "md": "10/5",
   "dd": "D-20",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "02"
     ],
     "pages": "p.129–140",
     "title": "분산 DB · 병행 제어 · 데이터 전환",
     "detail": "분산 투명성 · 트랜잭션 ACID · 로킹과 2PL · 회복 기법 · ETL"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "03"
     ],
     "pages": "p.142–153",
     "title": "운영체제 기초 · 메모리 관리",
     "detail": "운영체제 기능 · 가상 메모리 · 페이징 / 세그먼테이션 · 단편화 · 배치 전략"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 실습 · Java",
     "detail": "기출 10문항 · 상속 · 오버라이딩 · static · 생성자 호출 순서 · 예외 처리"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-06",
   "phase": "p2",
   "hol": "",
   "wd": "화",
   "md": "10/6",
   "dd": "D-19",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "03"
     ],
     "pages": "p.154–161",
     "title": "프로세스 · 교착 상태",
     "detail": "프로세스 상태 전이 · 스레드 · 교착 상태 발생 조건 · 예방 / 회피 / 회복"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "03",
      "04"
     ],
     "pages": "p.162–166, 168–173",
     "title": "디스크 · 스토리지 · 네트워크 기초",
     "detail": "디스크 스케줄링(SCAN, C-SCAN, LOOK) · RAID · 토폴로지 · 회선 / 패킷 교환"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-07",
   "phase": "p2",
   "hol": "",
   "wd": "수",
   "md": "10/7",
   "dd": "D-18",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "04"
     ],
     "pages": "p.174–178",
     "title": "근거리 통신망(LAN)",
     "detail": "LAN 토폴로지 · 이더넷 · CSMA/CD · MAC 주소"
    }
   ],
   "plan": 30,
   "actual": 0
  },
  {
   "iso": "2026-10-08",
   "phase": "p2",
   "hol": "",
   "wd": "목",
   "md": "10/8",
   "dd": "D-17",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "04"
     ],
     "pages": "p.179–183",
     "title": "인터넷",
     "detail": "IPv4 / IPv6 주소 체계 · 라우팅 · DNS · 스위치와 라우터"
    }
   ],
   "plan": 30,
   "actual": 0
  },
  {
   "iso": "2026-10-09",
   "phase": "p2",
   "hol": "한글날",
   "wd": "금",
   "md": "10/9",
   "dd": "D-16",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "04"
     ],
     "pages": "p.184–193",
     "title": "프로토콜 · OSI 7계층",
     "detail": "HTTP · FTP · SMTP · DHCP · ARP · ICMP · 계층별 기능과 장비 정리표"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "04",
      "05"
     ],
     "pages": "p.194–200, 202–206",
     "title": "TCP/IP · SW 개발 보안 설계",
     "detail": "TCP / UDP · 3-way handshake · 라우팅 프로토콜 · 보안 3요소 · 접근 통제(DAC, MAC, RBAC)"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 실습 · Python",
     "detail": "기출 10문항 · 슬라이싱 · 딕셔너리 · 컴프리헨션 · 클래스 상속"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-10",
   "phase": "p2",
   "hol": "",
   "wd": "토",
   "md": "10/10",
   "dd": "D-15",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "05"
     ],
     "pages": "p.207–219",
     "title": "시큐어 코딩 · 시스템 보안",
     "detail": "시큐어 코딩 항목(입력 검증, 세션 통제 등) · 대칭 / 비대칭 암호 · 해시 · 방화벽 · IDS · IPS"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "05",
      "06"
     ],
     "pages": "p.220–226, 228–233",
     "title": "서비스 공격 · SW 개발 동향",
     "detail": "DoS / DDoS · 스니핑 · 스푸핑 · 피싱 · 파밍 · 스미싱 · XSS · CSRF · 클라우드 · 빅데이터 · 블록체인"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "r",
     "parts": [
      "06"
     ],
     "pages": "p.234–238",
     "title": "신기술 용어 · PART 03–06 기출",
     "detail": "네트워크 · DB 신기술 용어 · PART 03–06 이론 기출 풀이 · 오답 표시"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-11",
   "phase": "p2",
   "hol": "",
   "wd": "일",
   "md": "10/11",
   "dd": "D-14",
   "items": [],
   "plan": 0,
   "actual": 0
  },
  {
   "iso": "2026-10-12",
   "phase": "p2",
   "hol": "",
   "wd": "월",
   "md": "10/12",
   "dd": "D-13",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.240–246",
     "title": "SQL · DDL",
     "detail": "CREATE · ALTER · DROP · 제약조건(PK, FK, UNIQUE, CHECK) · CASCADE / RESTRICT"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.247–262",
     "title": "SQL · DCL / DML (1)",
     "detail": "GRANT · REVOKE · COMMIT · ROLLBACK · SAVEPOINT · INSERT · UPDATE · DELETE · SELECT 기본"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-13",
   "phase": "p3",
   "hol": "",
   "wd": "화",
   "md": "10/13",
   "dd": "D-12",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.263–271",
     "title": "SQL · DML (2)",
     "detail": "WHERE 조건 · ORDER BY · 별칭 · LIKE · IN · BETWEEN · 결과 테이블 작성"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.272–287",
     "title": "SQL · 집합 연산 / JOIN (1)",
     "detail": "UNION · UNION ALL · INTERSECT · EXCEPT · INNER / OUTER JOIN 결과 행 수"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-14",
   "phase": "p3",
   "hol": "",
   "wd": "수",
   "md": "10/14",
   "dd": "D-11",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.288–294",
     "title": "SQL · JOIN (2)",
     "detail": "SELF · CROSS · NATURAL JOIN · ON과 USING"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.295–309",
     "title": "SQL · 서브쿼리",
     "detail": "단일행 / 다중행 · IN · ANY · ALL · EXISTS · 상관 서브쿼리 · 기출 5문항"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-15",
   "phase": "p3",
   "hol": "",
   "wd": "목",
   "md": "10/15",
   "dd": "D-10",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.310–320",
     "title": "SQL · 집계 함수 / GROUP BY",
     "detail": "COUNT · SUM · AVG · GROUP BY · HAVING · ROLLUP · CUBE · 순위 함수"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.321–334",
     "title": "관계 데이터 언어",
     "detail": "관계대수(σ, π, ⋈, ÷) · 일반 집합 연산 · 관계해석"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-16",
   "phase": "p3",
   "hol": "",
   "wd": "금",
   "md": "10/16",
   "dd": "D-9",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.336–341",
     "title": "계산식 · 서브넷 (1)",
     "detail": "서브넷 마스크 · CIDR · 네트워크 주소 계산 · 3문항"
    }
   ],
   "plan": 30,
   "actual": 0
  },
  {
   "iso": "2026-10-17",
   "phase": "p3",
   "hol": "",
   "wd": "토",
   "md": "10/17",
   "dd": "D-8",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.342–350",
     "title": "계산식 · 서브넷 (2) / 주기억장치",
     "detail": "브로드캐스트 주소 · 호스트 수 · 서브넷 분할 · 주소 변환 · 접근 시간"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.351–364",
     "title": "계산식 · 페이지 교체 / 프로세스 스케줄링 (1)",
     "detail": "FIFO · LRU · LFU 페이지 부재 횟수 · FCFS · SJF · HRN 대기 시간"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.365–378",
     "title": "계산식 · 프로세스 스케줄링 (2) / 디스크 스케줄링",
     "detail": "라운드 로빈 · SRT · 우선순위 간트 차트 · SSTF · SCAN · C-SCAN 이동 거리"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-18",
   "phase": "p3",
   "hol": "",
   "wd": "일",
   "md": "10/18",
   "dd": "D-7",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.379~",
     "title": "계산식 · 기타 공식 / 총정리",
     "detail": "잔여 공식 정리 · 서브넷 · 페이지 교체 · 스케줄링 · 디스크 각 3문항"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "모의고사 1회 (1/2)",
     "detail": "기출 1회분 · 실전 시간 배분(총 120분) · 미해결 문항 표시"
    },
    {
     "slot": "3교시 · 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "모의고사 1회 (2/2)",
     "detail": "잔여 문항 풀이 · 답안 표기 검토 · 채점은 다음 날"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-19",
   "phase": "p4",
   "hol": "",
   "wd": "월",
   "md": "10/19",
   "dd": "D-6",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "모의고사 채점 · 오답 분류",
     "detail": "오답별 교재 PART 표기 · 원인 분류(개념 · 추적 · 표기 · 시간)"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 오답 재풀이",
     "detail": "해설 없이 손 추적 재풀이 · 재오답 별표"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-20",
   "phase": "p4",
   "hol": "",
   "wd": "화",
   "md": "10/20",
   "dd": "D-5",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "약점 PART 재학습",
     "detail": "오답 최다 PART 빈출 개념 재정리"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "",
     "title": "SQL 기출 집중",
     "detail": "DDL · JOIN · 서브쿼리 · GROUP BY 15문항 · 결과 테이블 작성"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-21",
   "phase": "p4",
   "hol": "",
   "wd": "수",
   "md": "10/21",
   "dd": "D-4",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "05",
      "06"
     ],
     "pages": "",
     "title": "핵심 용어 회독 · 보안 / 신기술",
     "detail": "공격 기법 정의 · 신기술 용어 · 가리고 떠올리기"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "",
     "title": "계산식 실전 풀이",
     "detail": "서브넷 · 페이지 교체 · 스케줄링 · 디스크 각 3문항 · 시간 측정"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-22",
   "phase": "p4",
   "hol": "",
   "wd": "목",
   "md": "10/22",
   "dd": "D-3",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "01",
      "02",
      "04"
     ],
     "pages": "",
     "title": "핵심 용어 회독 · 설계 / DB / 네트워크",
     "detail": "UML · 디자인 패턴 · 테스트 · 정규화 · 프로토콜 · 정의 설명하기"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 실전 풀이",
     "detail": "C · Java · Python 혼합 10문항 · 문항당 5분"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-23",
   "phase": "p4",
   "hol": "",
   "wd": "금",
   "md": "10/23",
   "dd": "D-2",
   "items": [
    {
     "slot": "점심 · 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "오답노트 회독",
     "detail": "별표 문항 우선"
    },
    {
     "slot": "퇴근 후 · 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "답안 표기 연습 · 시험 준비",
     "detail": "영문 약어 · 풀네임 철자 · 대소문자 · 신분증 · 흑색 볼펜 · 시험장 위치와 이동 시간(큐넷 공지)"
    }
   ],
   "plan": 90,
   "actual": 0
  },
  {
   "iso": "2026-10-24",
   "phase": "p4",
   "hol": "",
   "wd": "토",
   "md": "10/24",
   "dd": "D-1",
   "items": [
    {
     "slot": "1교시 · 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "오답노트 최종 회독",
     "detail": "별표 두 개 문항"
    },
    {
     "slot": "2교시 · 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "SQL · 계산식 복습",
     "detail": "기존 풀이 문항 재풀이 · 신규 문항 없음"
    },
    {
     "slot": "3교시 · 60분 · 선택",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "최종 정리 (선택)",
     "detail": "코드 오답 일부 · 컨디션 관리"
    }
   ],
   "plan": 180,
   "actual": 0
  },
  {
   "iso": "2026-10-25",
   "phase": "p4",
   "hol": "시험일",
   "wd": "일",
   "md": "10/25",
   "dd": "D-DAY",
   "items": [
    {
     "slot": "아침 · 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "오답노트 핵심 훑기",
     "detail": "별표 문항만 · 신규 문항 없음"
    },
    {
     "slot": "시험 · 150분",
     "min": 0,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "정보처리기사 실기 시험",
     "detail": "미해결 문항 표시 후 진행 · 코드 문항 변수 표 작성 · 종료 20분 전 답안 검토"
    }
   ],
   "plan": 30,
   "actual": 0
  }
 ]
};
