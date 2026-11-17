Die = function(font, letter, x, y, s) {

    this.DieState = {
        UP: "UP",
        OVER: "OVER",
        DOWN: "DOWN"
    };

    this.s = s;
    this.x = x;
    this.y = y;
    this.state = this.DieState.UP;
    this.isPressed = false;
    this.isClicked = false;
    this.isUsed = false;

    this.letter=letter;
    this.font=font;
}

Die.prototype.handleEvents = function(pointer) {
    var isInside = inrect(pointer.x, pointer.y, this.x-this.s/2, this.y-this.s/2, this.s, this.s);
    this.isClicked = false;

    if (pointer.isDown) {
        if (isInside && !this.isPressed && this.state !== this.DieState.DOWN) {
            this.isPressed = true;
        }
        if (this.isPressed && isInside) {
            this.state = this.DieState.DOWN;
        } else {
            this.state = isInside ? this.DieState.OVER : this.DieState.UP;
        }
    } else {
        if (this.isPressed && isInside) {
            this.isClicked = true;
        }
        this.isPressed = false;
        this.state = isInside ? this.DieState.OVER : this.DieState.UP;
    }
};

Die.prototype.draw = function(ctx) {

    switch (this.state) {
        case this.DieState.UP:
            ctx.fillStyle = palette[10];
            break;
        case this.DieState.OVER:
            ctx.fillStyle = palette[9];
            break;
        case this.DieState.DOWN:
            ctx.fillStyle = palette[10];
            break;
    }

    if(this.isUsed) ctx.fillStyle = palette[9];

    ctx.fillRect(this.x-this.s/2, this.y-this.s/2, this.s, this.s);

    ctx.strokeStyle = palette[12];
    ctx.strokeRect(this.x-this.s/2, this.y-this.s/2, this.s, this.s);

    this.font.fillText(ctx,this.letter,this.x,this.y,palette[12]);
};
