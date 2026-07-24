// 명단(data/roster.json)의 캐릭터를 NC 공식 캐릭터 정보실 API에서 조회해
// data/characters.json을 갱신한다. 실패한 캐릭터는 기존 데이터를 유지한다.
import {readFileSync, writeFileSync} from 'fs';

const API = 'https://aion2.plaync.com/api';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://aion2.plaync.com/ko-kr/characters/index'
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJson(url) {
  const r = await fetch(url, {headers: HEADERS});
  if (!r.ok) throw new Error(r.status + ' ' + url);
  return r.json();
}

async function fetchChar({name, server}) {
  let found = null;
  for (const race of [1, 2]) {
    const s = await getJson(`${API}/search/character?keyword=${encodeURIComponent(name)}&race=${race}&serverId=&page=1&size=30`);
    for (const c of (s.list || [])) {
      if (c.serverName === server && c.name.replace(/<[^>]+>/g, '') === name) { found = c; break; }
    }
    if (found) break;
    await sleep(400);
  }
  if (!found) throw new Error('검색 결과 없음: ' + name);
  const q = `characterId=${found.characterId}&serverId=${found.serverId}`;
  const info = await getJson(`${API}/character/info?${q}`);
  await sleep(400);
  const eq = await getJson(`${API}/character/equipment?${q}`);
  const p = info.profile;
  const today = new Date().toISOString().slice(0, 10);
  return {
    label: `${name} · ${server} (${today} 조회)`,
    info: {
      profile: {characterName: p.characterName, characterLevel: p.characterLevel, className: p.className,
        combatPower: p.combatPower, raceName: p.raceName, serverName: p.serverName},
      stat: {statList: (info.stat && info.stat.statList || []).map(s => ({name: s.name, value: s.value}))},
      title: info.title ? {ownedCount: info.title.ownedCount, totalCount: info.title.totalCount} : null,
      daevanion: {boardList: (info.daevanion && info.daevanion.boardList || []).map(b => ({name: b.name, openPercent: b.openPercent}))}
    },
    equip: {equipment: {equipmentList: (eq.equipment && eq.equipment.equipmentList || []).map(it => ({
      slotPosName: it.slotPosName, name: it.name, grade: it.grade,
      enchantLevel: it.enchantLevel, exceedLevel: it.exceedLevel || 0
    }))}}
  };
}

const roster = JSON.parse(readFileSync('data/roster.json', 'utf8'));
let prev = {chars: []};
try { prev = JSON.parse(readFileSync('data/characters.json', 'utf8')); } catch (e) {}

const chars = [];
let okCnt = 0;
for (const entry of roster) {
  try {
    chars.push(await fetchChar(entry));
    okCnt++;
    console.log('OK', entry.name);
  } catch (e) {
    console.error('FAIL', entry.name, e.message);
    const old = (prev.chars || []).find(c => c.info && c.info.profile.characterName === entry.name);
    if (old) { chars.push(old); console.log('  → 기존 데이터 유지'); }
  }
  await sleep(600);
}

if (okCnt === 0) {
  console.error('전원 조회 실패 — characters.json을 갱신하지 않음 (기존 파일 보존)');
  process.exit(1);
}
writeFileSync('data/characters.json', JSON.stringify({generatedAt: new Date().toISOString(), chars}, null, 1));
console.log(`characters.json 갱신 완료 (${okCnt}/${roster.length} 신규 조회)`);
