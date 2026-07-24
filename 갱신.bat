@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [화 강화 공방] 데이터 갱신을 시작합니다...
git pull --quiet
node scripts\fetch-characters.mjs
if errorlevel 1 goto fail
node scripts\fetch-items.mjs
git add data\characters.json
if exist data\items.json git add data\items.json
git diff --cached --quiet && echo 변경 없음 - 이미 최신입니다. && goto done
git commit -q -m "chore: 캐릭터·아이템 데이터 갱신 (로컬)"
git push --quiet
echo 갱신 완료! 1~2분 뒤 사이트에 반영됩니다.
goto done
:fail
echo 조회 실패 - 인터넷 연결을 확인해 주세요.
:done
pause
