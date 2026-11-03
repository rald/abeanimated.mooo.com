import palette from './palette.js';

export default class Box {

	constructor(x, y, s) {
		this.x = x;
		this.y = y;
		this.s = s;
	}

	draw() {
		fill(palette[10]);
		stroke(palette[12]);
		square(this.x - this.s / 2, this.y - this.s / 2, this.s);
	}

}