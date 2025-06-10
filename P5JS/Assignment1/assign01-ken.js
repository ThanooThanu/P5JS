let balls = [];
let g = 9.8;
let timescale = 1;
let showTimescaleUntil = 0;
let textShowFor = 2.5;

function setup() {
  createCanvas(400, 750);
  frameRate(60);
}

function draw() {
  background(220);
  line(0, height * 2/3, width, height*2/3);
  for (let ball of balls) {
    ball.update();
    ball.display();
  }

  if (millis() < showTimescaleUntil) {
    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);
    text("Timescale: " + timescale.toFixed(2), 10, 10);
  }
}

function mousePressed() {
  balls.push(new Ball(mouseX, mouseY));
}

function keyPressed() {
  if (key === ' ') {
    balls = [];
  }
  if (keyCode === RIGHT_ARROW) {
    timescale += 0.1;
    if (timescale > 5) timescale = 5;
    showTimescaleUntil = millis() + (textShowFor* 1000);
  } else if (keyCode === LEFT_ARROW) {
    timescale -= 0.1;
    if (timescale < 0.1) timescale = 0.1;
    showTimescaleUntil = millis() + (textShowFor* 1000);
  }
  console.log("Timescale:", timescale.toFixed(2));
}

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.vy = 0;
    this.color = color(random(255), random(255), random(255));
  }

  update() {

    let dt = timescale*deltaTime / 1000;
    this.vy += g*dt*10;
    this.y += this.vy*dt*60;


    if (this.y+this.radius > height) {
      this.y = height-this.radius;
      this.vy *= -2/3;

      if (abs(this.vy) < 1) this.vy = 0;
    }
  }

  display() {
    fill(this.color);
    stroke(0);
    ellipse(this.x, this.y, this.radius * 2);
  }
}
