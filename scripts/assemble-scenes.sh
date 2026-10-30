#!/usr/bin/env bash
# Hard-cut assembly cut: render each scene composition on its own, then join the
# files with the concat demuxer. Deliberately drops the transition overlaps and
# the soundtrack (both live in Main.tsx only) so one scene can be re-rendered and
# re-joined in seconds instead of re-running the whole film.
#
#   ./scripts/assemble-scenes.sh              # render only what is missing
#   ./scripts/assemble-scenes.sh S066Report   # force those scenes, then rejoin
#   FORCE=1 ./scripts/assemble-scenes.sh      # re-render everything
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT=out/qa/asm-v1
FF="$ROOT/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
SCENES=(S01 S02 S03 S04 S05 S06Reply S066Report S065Feed S07EndCard)

mkdir -p "$ROOT/$OUT"
cd "$ROOT"

for s in "${SCENES[@]}"; do
  if [[ -n "${FORCE:-}" ]]; then
    :
  elif [[ " $* " == *" $s "* ]]; then
    :
  elif [[ -f "$ROOT/$OUT/$s.mp4" ]]; then
    echo "==== $s cached"
    continue
  fi
  echo "==== $s $(date +%H:%M:%S)"
  npx remotion render src/index.ts "$s" "$OUT/$s.mp4" \
    --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=4
done

: > "$ROOT/$OUT/list.txt"
for s in "${SCENES[@]}"; do
  printf "file '%s.mp4'\n" "$s" >> "$ROOT/$OUT/list.txt"
done

echo "==== concat $(date +%H:%M:%S)"
( cd "$ROOT/$OUT" && "$FF" -hide_banner -loglevel error -y -f concat -i list.txt -c copy asm-all-v1.mp4 )
ls -l "$ROOT/$OUT/asm-all-v1.mp4"
