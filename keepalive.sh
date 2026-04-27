#!/bin/bash
cd /home/z/my-project
rm -f dev.log
while true; do
  echo "[$(date)] Starting..." >> /home/z/my-project/dev.log
  bun run dev >> /home/z/my-project/dev.log 2>&1
  RC=$?
  echo "[$(date)] Exited with code $RC, restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
