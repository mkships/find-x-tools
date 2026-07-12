#!/bin/bash
# Batch-capture homepage screenshots via Firecrawl (sequential, plan concurrency=2).
cd /Users/manoharkanapaka/x-tools-directory
LOG=.firecrawl/batch.log
mkdir -p .firecrawl/shots
: > $LOG
while IFS=$'\t' read -r id url; do
  out="public/screenshots/${id}.jpg"
  [ -s "$out" ] && { echo "SKIP $id (exists)" >> $LOG; continue; }
  json=".firecrawl/shots/${id}.json"
  npx -y firecrawl-cli@1.19.6 scrape "$url" --format screenshot -o "$json" >/dev/null 2>&1
  ss=$(python3 -c "import json,sys
try: print(json.load(open('$json'))['screenshot'])
except Exception: pass" 2>/dev/null)
  if [ -z "$ss" ]; then echo "FAIL $id (no screenshot in response)" >> $LOG; continue; fi
  png=".firecrawl/shots/${id}.png"
  curl -s --max-time 60 "$ss" -o "$png"
  if ! file "$png" | grep -qE 'PNG|JPEG|WebP'; then echo "FAIL $id (download)" >> $LOG; continue; fi
  if sips --resampleWidth 1200 -s format jpeg -s formatOptions 75 "$png" --out "$out" >/dev/null 2>&1 && [ -s "$out" ]; then
    echo "OK   $id" >> $LOG
  else
    echo "FAIL $id (convert)" >> $LOG
  fi
done < .firecrawl/urls.tsv
echo "DONE $(grep -c '^OK' $LOG) ok, $(grep -c '^FAIL' $LOG) fail" >> $LOG
