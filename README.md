# 화 강화 공방

아이온2 "화" 전용 도구 모음 — 강화·돌파·제작 기대비용 계산기, 운명 시뮬레이터(예산 역산·결과 카드), 캐릭터 분석, 세트 비교, 딜 효율, 어비스·오드 플래너.

- 확률·비용: [NC 공식 확률공시](https://probability.plaync.com/aion2) 기준 (2026-07-22 갱신본)
- 캐릭터 데이터: 공식 캐릭터 정보실 API 조회 결과 (`data/characters.json`)
- 아이템 데이터: 공식 아이템 사전 API 전체(약 1만 종) 조회 결과 (`data/items.json`) — 검색어 파라미터가 실제로는 동작하지 않아, 전체를 받아 페이지 안에서 직접 필터링합니다
- 갱신 방법: NC API가 GitHub Actions 서버(해외 IP)를 429로 차단해 자동 스케줄은 꺼져 있습니다. `갱신.bat`을 더블클릭하면 로컬(국내) IP로 재조회 후 자동 커밋·푸시됩니다.
- 캐릭터 추가/제외: `data/roster.json`에 이름·서버를 넣고 갱신하면 반영
- 개인·지인 사용 목적의 비공식 팬 도구이며 NCSOFT와 무관합니다.

폰트: [Pretendard](https://github.com/orioncactus/pretendard) (SIL OFL 1.1, 파일에 내장)
