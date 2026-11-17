#!/usr/bin/env python3
import sys

for line in sys.stdin:
  word=line.strip()
  wordLength=len(word)
  if wordLength>=3 and wordLength<=16:
    print(word)

