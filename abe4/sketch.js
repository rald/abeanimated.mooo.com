import './q5.js';
import palette from './palette.js';
import Ball from './ball.js';
import Button from './button.js';
import Box from './box.js';
import Peg from './peg.js';

let words;
let rwords;
let word;
let shufword;

let diameter = 32;
let gap = 8;

let cx;
let cy;

let imgCircle;
let imgTriangle;
let imgCross;
let imgSquare;

let balls;
let boxes;
let pegs;
let buttons;

// Loading state variables
let isLoading = true;
let loadProgress = 0; // 0.0 to 1.0

function rnd(n) {
	return Math.floor(Math.random() * n);
}

function shuffleArray(array) {
	let arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function shuffleBalls() {
	let slotXs = balls.map((_, i) => i * (diameter + gap) + cx);
	let shuffledSlots = shuffleArray(slotXs);

	for (let i = 0; i < balls.length; i++) {
		balls[i].moveTo(shuffledSlots[i], cy);
	}
}

async function loadStrings(url) {
	try {
		let response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		let textData = await response.text();
		return textData.split(/\r?\n/);
	} catch (error) {
		console.error("Error loading strings from " + url, error);
		return [];
	}
}

function shuffleString(str) {
	let chars = str.split('');
	for (let i = chars.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[chars[i], chars[j]] = [chars[j], chars[i]];
	}
	return chars.join('');
}

async function setup() {
	await new Canvas(256, 384);
	displayMode("MAXED");

	const totalAssets = 6;
	let loadedAssets = 0;

	function updateProgress() {
		loadedAssets++;
		loadProgress = loadedAssets / totalAssets;
	}

	imgCircle = loadImage('assets/circle.png', updateProgress);
	imgTriangle = loadImage('assets/triangle.png', updateProgress);
	imgCross = loadImage('assets/cross.png', updateProgress);
	imgSquare = loadImage('assets/square.png', updateProgress);

	rwords = await loadStrings('assets/rwords.txt');
	updateProgress();

	words = await loadStrings('assets/wwf.txt');
	updateProgress();

	word = rwords[rnd(rwords.length)];
	shufword = shuffleString(word);

	cx = (width - word.length * (diameter + gap) + diameter + gap) / 2;
	cy = height - 64 - 32;

	balls = [];
	for (let i = 0; i < word.length; i++) {
		balls.push(new Ball(shufword[i].toUpperCase(), 16, i * (diameter + gap) + cx, cy, diameter));
	}

	pegs = [];
	for (let i = 0; i < word.length; i++) {
		pegs.push(new Peg(i * (diameter + gap) + cx, cy, diameter / 2));
	}

	boxes = [];
	for (let i = 0; i < word.length; i++) {
		boxes.push(new Box(i * (diameter + gap) + cx, cy - 32 - 16, diameter + gap / 2));
	}

	let x = 32;
	let y = height - 32;

	buttons = [];
	buttons.push(new Button(imgCircle, x + 64 * 0, y, diameter));
	buttons.push(new Button(imgTriangle, x + 64 * 1, y, diameter));
	buttons.push(new Button(imgCross, x + 64 * 2, y, diameter));
	buttons.push(new Button(imgSquare, x + 64 * 3, y, diameter));
}

function drawLoadingScreen() {
	background(palette[0]);

	const barWidth = 160;
	const barHeight = 16;
	const barX = (width - barWidth) / 2;
	const barY = height / 2;

	fill(palette[12]);
	textAlign(CENTER, BOTTOM);
	textSize(14);
	text("LOADING...", width / 2, barY - 10);

	stroke(palette[12]);
	fill(palette[15]);
	rect(barX, barY, barWidth, barHeight, 4);

	noStroke();
	fill(palette[5]);
	rect(barX + 2, barY + 2, (barWidth - 4) * loadProgress, barHeight - 4, 2);

	if (loadProgress >= 1.0) {
		isLoading = false;
	}
}

function draw() {
	if (isLoading) {
		drawLoadingScreen();
		return;
	}

	background(palette[10]);

	for (let box of boxes) {
		box.draw();
	}

	for (let peg of pegs) {
		peg.draw();
	}

	if (buttons[0].handleEvents()) {
		shuffleBalls();
	}

	if (buttons[1].handleEvents()) {}
	if (buttons[2].handleEvents()) {}
	if (buttons[3].handleEvents()) {}

	for (let ball of balls) {
		ball.draw();
	}

	for (let button of buttons) {
		button.draw();
	}
}

function windowResized() {
	// Re-apply displayMode on resize if needed to adjust letterboxing dynamically
	displayMode("MAXED");
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;