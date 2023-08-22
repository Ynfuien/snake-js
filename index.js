// Const variables
const gridSize = 32;
const scale = 20;
const snakeSize = 5;
const tickTime = 100;

// Colors
const colors = {
    background: "#242424",
    snakeHead: "#FFDD24",
    snakeBody: "#F0DB4F",
    berry: "#FF5555",
    border: "#555555",
    gameover: "#FF5555",
    score: "#FFFF55",
    scoreNumber: "#FFAA00"
};

// Game variables
let border;
let snake;
let berry;
let direction;
let gameover;
let gameInterval;


/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

canvas.width = gridSize * scale + (gridSize * 1) - 1;
canvas.height = gridSize * scale + (gridSize * 1) - 1;

context.font = `bold ${scale / 10}rem Arial`;


class Pixel {
    x;
    y;

    constructor(x, y) {
        x = Math.min(x, gridSize - 1);
        y = Math.min(y, gridSize - 1);

        if (x < 0) x = 0;
        if (y < 0) y = 0;

        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }

    render(color) {
        context.fillStyle = color;
        context.fillRect(this.x * scale + this.x, this.y * scale + this.y, scale, scale);
    }

    equals(pixel) {
        return pixel.x == this.x && pixel.y == this.y;
    }
}

class Border {
    borderPixels = [];

    constructor(size) {
        for (let i = 0; i <= size - 1; i++)
        {
            // Border in width
            this.borderPixels.push(new Pixel(i, 0));
            this.borderPixels.push(new Pixel(i, size));

            // Border in height
            if (i == 0 || i == size - 1) continue;
            this.borderPixels.push(new Pixel(0, i));
            this.borderPixels.push(new Pixel(size, i));
        }
    }

    render(color) {
        for (const p of this.borderPixels)
        {
            p.render(color);
        }
    }

    contains(pixel) {
        for (const p of this.borderPixels)
        {
            if (p.equals(pixel)) return true;
        }

        return false;
    }
}


class Snake {
    bodyPixels = [];
    headPixel;

    static Direction = {
        Up: 0,
        Down: 1,
        Left: 2,
        Right: 3
    };

    constructor(size) {
        this.headPixel = new Pixel(gridSize / 2 + (size / 2), gridSize / 2 - 1);
        for (let i = size - 1; i > 0; i--)
        {
            this.bodyPixels.push(new Pixel(this.headPixel.x - i, this.headPixel.y));
        }
    }

    render(headColor, bodyColor) {
        this.headPixel.render(headColor);
        for (const p of this.bodyPixels)
        {
            p.render(bodyColor);
        }
    }

    move(direction) {
        let x = this.headPixel.x;
        let y = this.headPixel.y;
        
        if (direction == Snake.Direction.Up) y--;
        else if (direction == Snake.Direction.Right) x++;
        else if (direction == Snake.Direction.Down) y++;
        else if (direction == Snake.Direction.Left) x--;

        const newHead = new Pixel(x, y);
        if (snake.contains(newHead)) return false;
        if (border.contains(newHead)) return false;

        this.bodyPixels.push(this.headPixel);
        this.bodyPixels.splice(0, 1);
        this.headPixel = newHead;
        return true;
    }

    grow(by = 1) {
        const newBody = new Pixel(this.bodyPixels[0].x, this.bodyPixels[0].y);
        for (let i = 0; i < by; i++)
        {
            this.bodyPixels.unshift(newBody);
        }
    }

    getSize() {
        return this.bodyPixels.length + 1;
    }

    contains(pixel) {
        if (this.headPixel.equals(pixel)) return true;
        for (const p of this.bodyPixels)
        {
            if (p.equals(pixel)) return true;
        }

        return false;
    }
}

class Berry {
    position;

    constructor(snake) {
        do
        {
            this.position = new Pixel(random(1, gridSize - 2), random(1, gridSize - 2));
        } while (snake.contains(this.position));
    }

    render(color) {
        this.position.render(color);
    }
}



start();
function start() {
    setup();
    render();

    // Listener for arrow keys
    let newDirection = direction;
    window.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowUp": case "w":
                if (direction == Snake.Direction.Down) break;
                newDirection = Snake.Direction.Up;
                break;
            case "ArrowDown":case "s":
                if (direction == Snake.Direction.Up) break;
                newDirection = Snake.Direction.Down;
                break;
            case "ArrowLeft":case "a":
                if (direction == Snake.Direction.Right) break;
                newDirection = Snake.Direction.Left;
                break;
            case "ArrowRight":case "d":
                if (direction == Snake.Direction.Left) break;
                newDirection = Snake.Direction.Right;
                break;
        }
    });


    gameInterval = setInterval(() => {
        direction = newDirection;
        tick();
    }, tickTime);
}

function setup() {
    border = new Border(gridSize);
    snake = new Snake(snakeSize);
    berry = new Berry(snake);
    direction = Snake.Direction.Right;
    gameover = false;
}

function render() {
    // Clear screen
    context.fillStyle = colors.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Game over screen
    if (gameover) {
        const score = snake.getSize() - snakeSize;

        context.textAlign = "center";

        context.fillStyle = colors.gameover;
        context.fillText("Game over!", canvas.width / 2, canvas.height / 2 - (scale * 2));

        context.fillStyle = `${colors.scoreNumber}`;
        context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 - (scale / 2));

        context.fillStyle = `${colors.score}`;
        context.fillText("Score: " + " ".repeat(("" + score).length * 2), canvas.width / 2, canvas.height / 2 - (scale / 2));
        
        border.render(colors.border);
        return;
    }

    // // render everything
    border.render(colors.border);
    snake.render(colors.snakeHead, colors.snakeBody);
    berry.render(colors.berry);
}

function tick() {
    // Move snake and check if it actually moved
    if (!snake.move(direction)) {
        // Game over
        gameover = true;
        clearInterval(gameInterval);
        render();
        return;
    }

    // Check if snake got the berry
    if (snake.contains(berry.position)) {
        berry = new Berry(snake);
        snake.grow();
    }

    // render everything to user
    render();
}


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}