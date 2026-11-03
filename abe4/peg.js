import palette from './palette.js';

export default class Peg {

	constructor(x, y, d) {
		this.x = x;
		this.y = y;
		this.d = d;
	}

	draw() {
		fill(palette[4]);
		stroke(palette[12]);
		circle(this.x, this.y, this.d);
	}

}