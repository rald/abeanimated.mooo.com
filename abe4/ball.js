import palette from './palette.js';

export default class Ball {

	constructor(letter, textSize, x, y, d) {
		this.letter = letter;
		this.x = x;
		this.y = y;
		this.startX = x;
		this.startY = y;
		this.targetX = x;
		this.targetY = y;
		this.d = d;
		this.textSize = textSize;
		this.used = false;

		this.isAnimating = false;
		this.animProgress = 1;
		this.animDuration = 0.3; // Duration of the shuffle animation in seconds (e.g., 300ms)
		this.animTime = 0;
	}

	moveTo(targetX, targetY) {
		this.startX = this.x;
		this.startY = this.y;
		this.targetX = targetX;
		this.targetY = targetY;
		this.animTime = 0;
		this.animProgress = 0;
		this.isAnimating = true;
	}

	update() {
		if (this.isAnimating) {
			// deltaTime is in milliseconds; convert to seconds
			// Fallback to 1/60th of a second if deltaTime is undefined on the first frame
			let dt = (typeof deltaTime !== 'undefined' ? deltaTime : 16.67) / 1000;
			
			this.animTime += dt;
			this.animProgress = this.animTime / this.animDuration;

			if (this.animProgress >= 1) {
				this.animProgress = 1;
				this.isAnimating = false;
			}
			
			// Smooth ease-out curve
			let ease = 1 - Math.pow(1 - this.animProgress, 3);
			this.x = lerp(this.startX, this.targetX, ease);
			this.y = lerp(this.startY, this.targetY, ease);
		}
	}

	draw() {
		this.update();

		stroke(palette[12]);
		fill(palette[10]);
		circle(this.x, this.y, this.d);
		fill(palette[12]);
		textAlign(CENTER, MIDDLE);
		textSize(this.textSize);
		text(this.letter, this.x, this.y);
	}

}