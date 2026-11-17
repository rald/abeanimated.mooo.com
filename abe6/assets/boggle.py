#!/usr/bin/env python3
from pathlib import Path
import random
import time
from typing import Dict, List, Set

# Official Modern 16-Die Boggle Configuration (Post-1987 / Hasbro)
MODERN_BOGGLE_DICE = [
    ["A", "A", "E", "E", "G", "N"],
    ["A", "B", "B", "J", "O", "O"],
    ["A", "C", "H", "O", "P", "S"],
    ["A", "F", "F", "K", "P", "S"],
    ["A", "O", "O", "T", "T", "W"],
    ["C", "I", "M", "O", "T", "U"],
    ["D", "E", "I", "L", "R", "X"],
    ["D", "E", "L", "R", "V", "Y"],
    ["D", "I", "S", "T", "T", "Y"],
    ["E", "E", "G", "H", "N", "W"],
    ["E", "E", "I", "N", "S", "U"],
    ["E", "H", "R", "T", "V", "W"],
    ["E", "I", "O", "S", "S", "T"],
    ["E", "L", "R", "T", "T", "Y"],
    ["H", "I", "M", "N", "U", "Qu"],
    ["H", "L", "N", "N", "R", "Z"],
]


class TrieNode:
  # __slots__ significantly reduces memory overhead when loading 170k+ words
  __slots__ = ("children", "is_end_of_word")

  def __init__(self):
    self.children: Dict[str, "TrieNode"] = {}
    self.is_end_of_word: bool = False


class Trie:

  def __init__(self):
    self.root = TrieNode()
    self.word_count = 0

  def insert(self, word: str) -> None:
    word = word.strip().upper()
    # Boggle minimum length is 3; max possible on a 4x4 board is 17 (if "Qu" is used)
    if not (3 <= len(word) <= 17) or not word.isalpha():
      return

    node = self.root
    for char in word:
      if char not in node.children:
        node.children[char] = TrieNode()
      node = node.children[char]

    if not node.is_end_of_word:
      node.is_end_of_word = True
      self.word_count += 1


def load_dictionary(filepath: str) -> Trie:
  path = Path(filepath)
  if not path.is_file():
    raise FileNotFoundError(
        f"Could not find '{filepath}'. Ensure it is in the working directory."
    )

  trie = Trie()
  with path.open("r", encoding="utf-8", errors="ignore") as f:
    for line in f:
      trie.insert(line)
  return trie


def generate_boggle_board() -> List[List[str]]:
  dice = MODERN_BOGGLE_DICE.copy()
  random.shuffle(dice)
  return [
      [random.choice(dice[r * 4 + c]) for c in range(4)] for r in range(4)
  ]


def print_board(board: List[List[str]]) -> None:
  print("+----+----+----+----+")
  for row in board:
    formatted_row = " | ".join(f"{tile:<2}" for tile in row)
    print(f"| {formatted_row} |")
    print("+----+----+----+----+")


def score_word(word: str) -> int:
  length = len(word)
  if length < 3:
    return 0
  if length <= 4:
    return 1
  if length == 5:
    return 2
  if length == 6:
    return 3
  if length == 7:
    return 5
  return 11


def solve_boggle(board: List[List[str]], trie: Trie) -> List[str]:
  rows, cols = len(board), len(board[0])
  found_words: Set[str] = set()
  visited = [[False] * cols for _ in range(rows)]

  directions = [
      (-1, -1),
      (-1, 0),
      (-1, 1),
      (0, -1),
      (0, 1),
      (1, -1),
      (1, 0),
      (1, 1),
  ]

  def dfs(r: int, c: int, node: TrieNode, current_word: str):
    tile = board[r][c].upper()

    curr_node = node
    for char in tile:
      if char not in curr_node.children:
        return
      curr_node = curr_node.children[char]

    next_word = current_word + tile

    if curr_node.is_end_of_word:
      found_words.add(next_word)

    visited[r][c] = True

    for dr, dc in directions:
      nr, nc = r + dr, c + dc
      if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc]:
        dfs(nr, nc, curr_node, next_word)

    visited[r][c] = False

  for r in range(rows):
    for c in range(cols):
      dfs(r, c, trie.root, "")

  return sorted(found_words, key=lambda w: (-score_word(w), w))


# --- Example Run ---
if __name__ == "__main__":
  WORDLIST_FILE = "wordlist.txt"

  # 1. Load wordlist.txt into the Trie
  t0 = time.perf_counter()
  boggle_trie = load_dictionary(WORDLIST_FILE)
  load_time = time.perf_counter() - t0
  print(f"Loaded {boggle_trie.word_count:,} valid words in {load_time:.3f}s\n")

  # 2. Generate and display a 4x4 board
  board = generate_boggle_board()
  print("Generated Board:")
  print_board(board)

  # 3. Solve the board
  t1 = time.perf_counter()
  results = solve_boggle(board, boggle_trie)
  solve_time = (time.perf_counter() - t1) * 1000  # Convert to milliseconds

  total_score = sum(score_word(w) for w in results)
  print(
      f"\nFound {len(results)} words in {solve_time:.2f}ms (Max Score:"
      f" {total_score} pts):"
  )

  # Show top 25 highest-scoring words
  # for word in results[:25]:
  #   print(f"  {word:<12} ({score_word(word)} pts)")

  # if len(results) > 25:
  #   print(f"  ... and {len(results) - 25} more words.")

  for word in results:
    print(f"  {word:<16} ({score_word(word)} pts)")
