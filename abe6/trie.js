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
