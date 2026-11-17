#!/usr/bin/env node

'use strict';

var fs = require('fs');

// Official Modern 16-Die Boggle Configuration (Post-1987 / Hasbro)
var MODERN_BOGGLE_DICE = [
  ['A', 'A', 'E', 'E', 'G', 'N'],
  ['A', 'B', 'B', 'J', 'O', 'O'],
  ['A', 'C', 'H', 'O', 'P', 'S'],
  ['A', 'F', 'F', 'K', 'P', 'S'],
  ['A', 'O', 'O', 'T', 'T', 'W'],
  ['C', 'I', 'M', 'O', 'T', 'U'],
  ['D', 'E', 'I', 'L', 'R', 'X'],
  ['D', 'E', 'L', 'R', 'V', 'Y'],
  ['D', 'I', 'S', 'T', 'T', 'Y'],
  ['E', 'E', 'G', 'H', 'N', 'W'],
  ['E', 'E', 'I', 'N', 'S', 'U'],
  ['E', 'H', 'R', 'T', 'V', 'W'],
  ['E', 'I', 'O', 'S', 'S', 'T'],
  ['E', 'L', 'R', 'T', 'T', 'Y'],
  ['H', 'I', 'M', 'N', 'U', 'Qu'],
  ['H', 'L', 'N', 'N', 'R', 'Z']
];

function TrieNode() {
  this.children = Object.create(null);
  this.isEndOfWord = false;
}

function Trie() {
  this.root = new TrieNode();
  this.wordCount = 0;
}

Trie.prototype.insert = function (word) {
  word = word.replace(/^\s+|\s+$/g, '').toUpperCase();

  // Boggle minimum length is 3; max possible on a 4x4 board is 17 (if "Qu" is used)
  if (word.length < 3 || word.length > 17 || !/^[A-Z]+$/.test(word)) {
    return;
  }

  var node = this.root;
  for (var i = 0; i < word.length; i++) {
    var ch = word.charAt(i);
    if (!node.children[ch]) {
      node.children[ch] = new TrieNode();
    }
    node = node.children[ch];
  }

  if (!node.isEndOfWord) {
    node.isEndOfWord = true;
    this.wordCount++;
  }
};

function loadDictionary(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error("Could not find '" + filepath + "'. Ensure it is in the working directory.");
  }

  var trie = new Trie();
  var content = fs.readFileSync(filepath, 'utf8');
  var lines = content.split(/\r?\n/);

  for (var i = 0; i < lines.length; i++) {
    trie.insert(lines[i]);
  }
  return trie;
}

function generateBoggleBoard() {
  var dice = MODERN_BOGGLE_DICE.slice();
  var i, j, temp;

  // Fisher-Yates shuffle
  for (i = dice.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = dice[i];
    dice[i] = dice[j];
    dice[j] = temp;
  }

  var board = [];
  for (var r = 0; r < 4; r++) {
    var row = [];
    for (var c = 0; c < 4; c++) {
      var die = dice[r * 4 + c];
      var face = die[Math.floor(Math.random() * die.length)];
      row.push(face);
    }
    board.push(row);
  }
  return board;
}

function padRight(str, len) {
  while (str.length < len) {
    str += ' ';
  }
  return str;
}

function printBoard(board) {
  console.log('+----+----+----+----+');
  for (var r = 0; r < board.length; r++) {
    var formattedCells = [];
    for (var c = 0; c < board[r].length; c++) {
      formattedCells.push(padRight(board[r][c], 2));
    }
    console.log('| ' + formattedCells.join(' | ') + ' |');
    console.log('+----+----+----+----+');
  }
}

function scoreWord(word) {
  var length = word.length;
  if (length < 3) {
    return 0;
  }
  if (length <= 4) {
    return 1;
  }
  if (length === 5) {
    return 2;
  }
  if (length === 6) {
    return 3;
  }
  if (length === 7) {
    return 5;
  }
  return 11;
}

function solveBoggle(board, trie) {
  var rows = board.length;
  var cols = board[0].length;
  var foundWordsMap = Object.create(null);
  var visited = [];

  for (var r = 0; r < rows; r++) {
    visited[r] = [];
    for (var c = 0; c < cols; c++) {
      visited[r][c] = false;
    }
  }

  var directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  function dfs(r, c, node, currentWord) {
    var tile = board[r][c].toUpperCase();
    var currNode = node;

    for (var i = 0; i < tile.length; i++) {
      var ch = tile.charAt(i);
      if (!currNode.children[ch]) {
        return;
      }
      currNode = currNode.children[ch];
    }

    var nextWord = currentWord + tile;

    if (currNode.isEndOfWord) {
      foundWordsMap[nextWord] = true;
    }

    visited[r][c] = true;

    for (var d = 0; d < directions.length; d++) {
      var nr = r + directions[d][0];
      var nc = c + directions[d][1];
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        dfs(nr, nc, currNode, nextWord);
      }
    }

    visited[r][c] = false;
  }

  for (var rStart = 0; rStart < rows; rStart++) {
    for (var cStart = 0; cStart < cols; cStart++) {
      dfs(rStart, cStart, trie.root, '');
    }
  }

  var results = Object.keys(foundWordsMap);
  results.sort(function (a, b) {
    var scoreDiff = scoreWord(b) - scoreWord(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });

  return results;
}

// --- Example Run ---
if (typeof require !== 'undefined' && require.main === module) {
  var WORDLIST_FILE = 'wordlist.txt';

  // 1. Load wordlist.txt into the Trie
  var t0 = Date.now();
  var boggleTrie = loadDictionary(WORDLIST_FILE);
  var loadTime = (Date.now() - t0) / 1000;
  console.log('Loaded ' + boggleTrie.wordCount.toLocaleString() + ' valid words in ' + loadTime.toFixed(3) + 's\n');

  // 2. Generate and display a 4x4 board
  var board = generateBoggleBoard();
  console.log('Generated Board:');
  printBoard(board);

  // 3. Solve the board
  var t1 = Date.now();
  var results = solveBoggle(board, boggleTrie);
  var solveTime = Date.now() - t1;

  var totalScore = 0;
  for (var i = 0; i < results.length; i++) {
    totalScore += scoreWord(results[i]);
  }

  console.log(
    '\nFound ' + results.length + ' words in ' + solveTime.toFixed(2) +
    'ms (Max Score: ' + totalScore + ' pts):'
  );

  for (var j = 0; j < results.length; j++) {
    var word = results[j];
    console.log('  ' + padRight(word, 16) + ' (' + scoreWord(word) + ' pts)');
  }
}
