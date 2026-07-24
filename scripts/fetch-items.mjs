// 공식 아이템 사전 API의 검색어(query) 파라미터는 실제로 무시된다(2026-07-25 확인 —
// 어떤 값을 넣어도 항상 같은 목록이 반환됨). 그래서 이름으로 검색하는 대신
// 페이지네이션으로 전체 사전(약 1만여 종)을 통째로 받아 data/items.json에 저장하고,
// 웹앱은 그 파일을 fetch해 브라우저 안에서 직접 이름 필터링한다.
import {writeFileSync} from 'fs';

const API = 'https://api-goats.plaync.com/aion2/v2.0/dict/search/item';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://aion2.plaync.com/ko-kr/info/item'
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SIZE = 500;
const MAX_PAGES = 30;

const items = [];
const seen = new Set();
let page = 1, total = Infinity;

while ((page - 1) * SIZE < total && page <= MAX_PAGES) {
  const r = await fetch(`${API}?size=${SIZE}&page=${page}&locale=ko-KR`, {headers: HEADERS});
  if (!r.ok) { console.error('페이지', page, 'HTTP', r.status, '— 중단'); break; }
  const data = await r.json();
  total = data.pagination?.total ?? total;
  const contents = data.contents || [];
  for (const it of contents) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    items.push({id: it.id, name: it.name, grade: it.grade, categoryName: it.categoryName, options: it.options || []});
  }
  console.log(`페이지 ${page} (size ${SIZE}) — 누적 ${items.length}/${total}`);
  if (contents.length < SIZE) { console.log('마지막 페이지 도달'); break; }
  page++;
  await sleep(350);
}

if (items.length === 0) {
  console.error('수집 실패 — items.json을 갱신하지 않음');
  process.exit(1);
}
writeFileSync('data/items.json', JSON.stringify({generatedAt: new Date().toISOString(), items}));
console.log(`items.json 생성 완료 — 총 ${items.length}개 아이템`);
