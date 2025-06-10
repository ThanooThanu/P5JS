let balls = [];
let gravity = 0.5;
let groundEnergyLoss = 0.33;

function setup() {
  createCanvas(700, 500);
}

function draw() {
  background(240);

  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

function mousePressed() {
  balls.push(new Ball(mouseX, mouseY));
}

class Ball {
  constructor(x, y) {
    this.radius = random(10, 30);
    this.mass = this.radius * this.radius * 0.1;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.color = color(random(0, 255), random(0, 255), random(0, 255));
  }

  update() {
    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy *= -1 * (1 - groundEnergyLoss);
      this.vx *= 0.98;
    }

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx *= -1;
    }

    let maxV = 20;
    this.vx = constrain(this.vx, -maxV, maxV);
    this.vy = constrain(this.vy, -maxV, maxV);
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }
}
