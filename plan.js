// 교재 PART 01~08 기준 일정 데이터 (9/29 ~ 10/25)
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
   "name": "진단과 PART 01·02",
   "range": "9/29 ~ 10/5",
   "desc": "기출로 약점을 확인하고 PART 01 소프트웨어 구축과 PART 02 데이터베이스를 읽습니다. 코드는 교재 목차에 파트가 없어서 기출로 따로 연습합니다."
  },
  {
   "key": "p2",
   "name": "PART 03~06과 SQL 시작",
   "range": "10/6 ~ 10/12",
   "desc": "운영체제, 네트워크, 정보보안, 신기술 용어를 마치고 10/12부터 SQL에 들어갑니다. 10/11은 쉽니다."
  },
  {
   "key": "p3",
   "name": "SQL·계산식과 첫 모의고사",
   "range": "10/13 ~ 10/18",
   "desc": "SQL과 계산식은 손으로 풀어야 점수가 됩니다. 10/18에 첫 모의고사를 봅니다."
  },
  {
   "key": "p4",
   "name": "오답 보강과 마무리",
   "range": "10/19 ~ 10/25",
   "desc": "모의고사 오답으로 약한 PART를 다시 보고, 마지막 이틀은 오답노트와 서술형 표기 연습으로 마무리합니다."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "진단: 기출 이론 문제 채점",
     "detail": "최근 기출 1회분에서 이론 문제만 풀고 채점합니다. 틀린 문제마다 교재 PART 번호를 적어 두면 뒤 일정에서 어디를 더 볼지 정할 수 있습니다."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "진단: 기출 코드·SQL 문제",
     "detail": "손으로 추적하며 풉니다. 막힌 언어와 유형을 기록하세요. 보내주신 목차에는 C·Java·Python 코드 파트가 없어서, 코드는 기출로 따로 연습합니다."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.8–15",
     "title": "소프트웨어 공학과 개발 방법론",
     "detail": "폭포수·프로토타입·나선형·애자일(XP, 스크럼)을 특징 한 줄씩으로 구분해 외우기."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.16–29",
     "title": "프로젝트 계획과 요구사항 분석",
     "detail": "비용 산정(COCOMO, 기능점수), PERT·CPM 일정, 요구공학 단계와 유스케이스."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.30–36",
     "title": "설계 기본 원칙과 아키텍처",
     "detail": "추상화·모듈화·정보 은닉, 결합도와 응집도의 종류를 순서대로. 아키텍처 패턴(MVC, 레이어, 파이프-필터)."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.37–46",
     "title": "UML과 화면 설계",
     "detail": "클래스·시퀀스·유스케이스 다이어그램, 관계 표기(연관·집합·합성·일반화·의존). UI 설계 원칙과 프로토타입 종류."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "c",
     "parts": [
      "01"
     ],
     "pages": "p.47–50",
     "title": "프로그래밍 기초 개념",
     "detail": "변수·자료형·연산자·제어문을 훑고, 기출 코드 문제 2개를 손 추적으로 풀어 보기."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.51–63",
     "title": "개발 환경 구축과 모듈 구현",
     "detail": "형상 관리(Git, SVN), 빌드 도구, 단위 모듈 개념. 용어 위주로 빠르게."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.64–77",
     "title": "서버 프로그램 구현과 인터페이스 구현",
     "detail": "연계 방식(EAI, ESB, API, DB 링크), 인터페이스 데이터 포맷(JSON, XML), 구현 검증 도구."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.78–91",
     "title": "객체지향 설계와 테스트케이스 설계",
     "detail": "캡슐화·상속·다형성, 디자인 패턴이 나오면 함께. 블랙박스·화이트박스와 커버리지 종류."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 연습 C: 기출 코드 문제",
     "detail": "포인터·배열·반복문 중심으로 10문제. 변수 값이 바뀌는 과정을 표로 그리며 풉니다."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "01"
     ],
     "pages": "p.92–102",
     "title": "통합 테스트, 유지보수, 패키징",
     "detail": "상향·하향 통합과 스텁·드라이버, 유지보수 4유형, 릴리즈 노트와 버전 관리."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "02"
     ],
     "pages": "p.104–117",
     "title": "DB 개념, 설계, 논리 설계",
     "detail": "스키마 3계층, 설계 단계, 키 종류, 무결성. 정규화(1NF~BCNF)는 예제로 직접 풀기."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "02"
     ],
     "pages": "p.118–128",
     "title": "물리 설계와 관계형 데이터베이스",
     "detail": "인덱스, 파티션, 반정규화. 릴레이션 용어(속성, 튜플, 차수, 카디널리티)."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "02"
     ],
     "pages": "p.129–140",
     "title": "분산 DB, 병행 제어, 데이터 전환",
     "detail": "분산 투명성 종류, 트랜잭션 ACID, 로킹과 2PL, 회복 기법, 데이터 전환(ETL)."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "03"
     ],
     "pages": "p.142–153",
     "title": "운영체제 기초와 메모리 관리",
     "detail": "운영체제 기능, 가상 메모리, 페이징·세그먼테이션, 단편화, 배치 전략 3가지."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 연습 Java: 기출 코드 문제",
     "detail": "상속·오버라이딩·static·생성자 호출 순서·예외 흐름 10문제."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "03"
     ],
     "pages": "p.154–161",
     "title": "프로세스와 교착 상태",
     "detail": "프로세스 상태 전이, 스레드, 교착 상태 4조건과 회피·예방·회복."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "03",
      "04"
     ],
     "pages": "p.162–166, 168–173",
     "title": "디스크 스케줄링 개념, 스토리지 용어, 네트워크 기본",
     "detail": "SCAN·C-SCAN·LOOK 차이, RAID 레벨. 토폴로지와 회선·패킷 교환."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "04"
     ],
     "pages": "p.174–178",
     "title": "근거리 통신망(LAN)",
     "detail": "LAN 토폴로지, 이더넷과 CSMA/CD, MAC 주소."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "04"
     ],
     "pages": "p.179–183",
     "title": "인터넷",
     "detail": "IPv4·IPv6 주소 체계, 라우팅과 DNS, 스위치와 라우터 구분."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "04"
     ],
     "pages": "p.184–193",
     "title": "프로토콜과 OSI 7계층",
     "detail": "HTTP·FTP·SMTP·DHCP·ARP·ICMP 역할, OSI 계층별 기능과 장비를 표로 정리."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "04",
      "05"
     ],
     "pages": "p.194–200, 202–206",
     "title": "TCP/IP와 SW 개발 보안 설계",
     "detail": "TCP·UDP 비교, 3-way handshake, 라우팅 프로토콜. 보안 3요소와 접근 통제(DAC, MAC, RBAC)."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 연습 Python: 기출 코드 문제",
     "detail": "리스트 슬라이싱, 딕셔너리, 컴프리헨션, 클래스 상속 10문제."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "05"
     ],
     "pages": "p.207–219",
     "title": "시큐어 코딩과 시스템 보안",
     "detail": "입력 검증·세션 통제 같은 시큐어 코딩 항목, 대칭·비대칭 암호와 해시, 방화벽·IDS·IPS."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "t",
     "parts": [
      "05",
      "06"
     ],
     "pages": "p.220–226, 228–233",
     "title": "서비스 공격 유형과 SW 개발 동향",
     "detail": "DoS·DDoS 종류, 스니핑·스푸핑, 피싱·파밍·스미싱, XSS·CSRF. 클라우드·빅데이터·블록체인 용어."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "r",
     "parts": [
      "06"
     ],
     "pages": "p.234–238",
     "title": "신기술 용어 마무리와 이론 기출",
     "detail": "네트워크·DB 신기술 용어를 보고, 남은 시간에 PART 03~06 범위의 기출 이론 문제를 풀어 오답을 표시합니다."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.240–246",
     "title": "DDL",
     "detail": "CREATE·ALTER·DROP, 제약조건(PK, FK, UNIQUE, CHECK), CASCADE와 RESTRICT."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.247–262",
     "title": "DCL과 DML (1)",
     "detail": "GRANT·REVOKE, COMMIT·ROLLBACK·SAVEPOINT, INSERT·UPDATE·DELETE, SELECT 기본. 예제를 직접 치듯 풀기."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.263–271",
     "title": "DML (2)",
     "detail": "조건절, 정렬, 별칭, LIKE·IN·BETWEEN. 결과 테이블을 직접 그려서 확인."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.272–287",
     "title": "SELECT 집합 연산과 JOIN (1)",
     "detail": "UNION·UNION ALL·INTERSECT·EXCEPT, INNER JOIN과 OUTER JOIN의 결과 행 수 세기."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.288–294",
     "title": "JOIN (2)",
     "detail": "SELF·CROSS·NATURAL JOIN, ON과 USING 차이."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.295–309",
     "title": "서브쿼리",
     "detail": "단일행·다중행, IN·ANY·ALL·EXISTS, 상관 서브쿼리. 기출 5문제."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.310–320",
     "title": "집계 함수와 GROUP BY",
     "detail": "COUNT·SUM·AVG, GROUP BY·HAVING, ROLLUP·CUBE, 순위 함수."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "p.321–334",
     "title": "관계 데이터 언어",
     "detail": "관계대수의 순수 연산(σ, π, ⋈, ÷)과 일반 집합 연산, 관계해석의 정량자."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.336–341",
     "title": "서브넷 (1)",
     "detail": "서브넷 마스크와 CIDR 표기, 네트워크 주소 구하기. 문제 3개."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.342–350",
     "title": "서브넷 (2)와 주기억장치 계산식",
     "detail": "브로드캐스트 주소와 호스트 수, 서브넷 나누기. 주소 변환과 접근 시간 공식."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.351–364",
     "title": "페이지 교체와 프로세스 스케줄링 (1)",
     "detail": "FIFO·LRU·LFU 페이지 부재 횟수, FCFS·SJF·HRN의 대기시간 손계산."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.365–378",
     "title": "프로세스 스케줄링 (2)와 디스크 스케줄링",
     "detail": "라운드 로빈·SRT·우선순위의 간트 차트, SSTF·SCAN·C-SCAN 헤드 이동 거리."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "p.379~",
     "title": "기타 계산식과 계산식 총정리",
     "detail": "남은 공식을 정리한 뒤 서브넷·페이지 교체·스케줄링·디스크를 각 3문제씩 손계산."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "첫 모의고사 (1/2)",
     "detail": "기출 1회분을 시간 재고 풉니다. 실제 시험은 150분이라 2·3교시 120분 안에 풀고, 못 푼 문제는 표시만 하고 넘어갑니다."
    },
    {
     "slot": "3교시 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "첫 모의고사 (2/2)",
     "detail": "이어서 풀고 마지막에 답안 표기를 검토합니다. 채점은 내일 점심에 합니다."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "모의고사 채점과 오답 분류",
     "detail": "틀린 문제마다 교재 PART를 적고 원인을 분류합니다: 개념 모름, 추적 실수, 표기 실수, 시간 부족."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 재추적: 틀린 코드 문제",
     "detail": "답을 보지 않고 손으로 다시 추적합니다. 이번에도 틀리면 별표."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "약점 PART 재독 (오답 1위)",
     "detail": "모의고사 오답이 가장 많은 PART를 골라 빈출 위주로 다시 읽기."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "s",
     "parts": [
      "07"
     ],
     "pages": "",
     "title": "SQL 기출 집중",
     "detail": "DDL·JOIN·서브쿼리·GROUP BY 15문제. 결과를 표로 그려 확인."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "05",
      "06"
     ],
     "pages": "",
     "title": "핵심 용어 회독: 보안과 신기술",
     "detail": "공격 기법 정의와 신기술 용어를 가리고 떠올리기."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "m",
     "parts": [
      "08"
     ],
     "pages": "",
     "title": "계산식 손계산",
     "detail": "서브넷·페이지 교체·스케줄링·디스크를 각 3문제, 시간을 재고."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "t",
     "parts": [
      "01",
      "02",
      "04"
     ],
     "pages": "",
     "title": "핵심 용어 회독: UML, 디자인 패턴, 테스트, 정규화, 프로토콜",
     "detail": "빈출 용어를 정의부터 가리고 말로 설명해 보기."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "c",
     "parts": [],
     "pages": "",
     "title": "코드 기출: C·Java·Python 섞어서",
     "detail": "10문제, 문제당 5분 안에."
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
     "slot": "점심 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "오답노트 회독",
     "detail": "별표 문제부터 다시 봅니다."
    },
    {
     "slot": "퇴근 후 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "서술형 표기 연습과 준비물 확인",
     "detail": "영문 약어와 풀네임 철자, 대소문자 연습. 신분증과 흑색 볼펜, 시험장 위치와 이동 시간을 큐넷 공지로 확인하고 일찍 잡니다."
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
     "slot": "1교시 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "오답노트 최종 회독",
     "detail": "별표 두 개 문제만 봅니다."
    },
    {
     "slot": "2교시 60분",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "SQL·계산식 가볍게 복습",
     "detail": "새 문제 없이 풀었던 문제만 손으로 다시."
    },
    {
     "slot": "3교시 60분 · 선택",
     "min": 60,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "가볍게 마무리",
     "detail": "컨디션이 좋으면 코드 오답 몇 개만 보고, 아니면 쉬세요."
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
     "slot": "아침 30분",
     "min": 30,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "오답노트 별표만 훑기",
     "detail": "새 문제는 풀지 않습니다."
    },
    {
     "slot": "시험 150분",
     "min": 0,
     "tag": "r",
     "parts": [],
     "pages": "",
     "title": "실기 시험: 45점에서 60점 이상으로",
     "detail": "모르는 문제는 표시하고 넘어가기, 코드 문제는 여백에 변수 표 그리기, 마지막 20분은 답안 표기 검토."
    }
   ],
   "plan": 30,
   "actual": 0
  }
 ]
};
