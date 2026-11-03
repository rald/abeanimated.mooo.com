import palette from './palette.js';

export const ButtonState = Object.freeze({
	UP: 'up',
	DOWN: 'down'
});

export default class Button {

	constructor(img, x, y, s) {
		this.img = img;
		this.x = x;
		this.y = y;
		this.s = s;
		this.state = ButtonState.UP;
		
		// Internal tracking variables for click detection
		this.isPressedInside = false;
		this.wasMousePressed = false;
	}

	draw() {
		if (this.state === ButtonState.DOWN) {
			fill(palette[11]);
			stroke(palette[12]);
		} else {
			fill(palette[10]);
			stroke(palette[12]);
		}

		square(this.x - this.s / 2, this.y - this.s / 2, this.s, 8);
		
		imageMode(CENTER);
		image(this.img, this.x, this.y);
	}
	
	handleEvents() {
		let currentlyInside = this.inrect();
		let clicked = false;

		if (mouseIsPressed) {
			// If mouse just went down while inside, mark that the press started here
			if (currentlyInside && !this.wasMousePressed) {
				this.isPressedInside = true;
			}
			
			// Visual state is DOWN only if pressed and currently hovering inside
			if (this.isPressedInside && currentlyInside) {
				this.state = ButtonState.DOWN;
			} else {
				this.state = ButtonState.UP;
			}
		} else {
			// Mouse is released. If it started and ended inside, it's a valid click!
			if (this.isPressedInside && currentlyInside) {
				clicked = true;
			}
			this.isPressedInside = false;
			this.state = ButtonState.UP;
		}

		this.wasMousePressed = mouseIsPressed;
		return clicked; // Returns true on the exact frame a full click completes
	}
	
	inrect() {
		let rx = this.x - this.s / 2;
		let ry = this.y - this.s / 2;
		return mouseX >= rx && mouseX <= rx + this.s && mouseY >= ry && mouseY <= ry + this.s;
	}

}