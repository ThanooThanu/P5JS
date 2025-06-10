let balls = [];
const G = 10;          
const restitution = 1;

function setup() {
  createCanvas(750, 600);
}

function draw() {
  background(0);

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      applyGravity(balls[i], balls[j]);
      resolveCollision(balls[i], balls[j]);
    }
  }

  for (let b of balls) {
    b.update();
    b.show();
  }
}

function mousePressed() {
  let tries = 100;
  while (tries-- > 0) {
    let r = random(20, 40);
    let x = mouseX;
    let y = mouseY;

    let overlap = balls.some(b => dist(x, y, b.x, b.y) < r + b.r + 1);
    if (!overlap) {
      balls.push(new Ball(x, y, r));
      break;
    }
  }
}

class Ball {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.mass = r;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.c = color(random(0, 255), random(0, 255), random(0, 255));
  }

  applyForce(fx, fy) {
    this.ax += fx / this.mass;
    this.ay += fy / this.mass;
  }

  update() {
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    this.ax = 0;
    this.ay = 0;

    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -restitution;
    } else if (this.x + this.r > width) {
      this.x = width - this.r;
      this.vx *= -restitution;
    }
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -restitution;
    } else if (this.y + this.r > height) {
      this.y = height - this.r;
      this.vy *= -restitution;
    }
  }

  show() {
    fill(this.c);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }
}

function applyGravity(a, b) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let distSq = dx * dx + dy * dy;
  let dist = sqrt(distSq);
  if (dist < a.r + b.r) dist = a.r + b.r;

  let force = (G * a.mass * b.mass) / (distSq + 1);
  let fx = force * (dx / dist);
  let fy = force * (dy / dist);

  a.applyForce(fx, fy);
  b.applyForce(-fx, -fy);
}

function resolveCollision(a, b) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = sqrt(dx * dx + dy * dy);
  let minDist = a.r + b.r;

  if (dist < minDist && dist > 0) {
    let nx = dx / dist;
    let ny = dy / dist;

    let overlap = minDist - dist;
    let totalMass = a.mass + b.mass;
    let pushA = (b.mass / totalMass) * overlap;
    let pushB = (a.mass / totalMass) * overlap;
    a.x -= nx * pushA;
    a.y -= ny * pushA;
    b.x += nx * pushB;
    b.y += ny * pushB;

    let dvx = b.vx - a.vx;
    let dvy = b.vy - a.vy;
    let impact = dvx * nx + dvy * ny;

    if (impact < 0) {
      let e = restitution;
      let impulse = (1 + e) * impact / (1 / a.mass + 1 / b.mass);
      a.vx += (impulse / a.mass) * nx;
      a.vy += (impulse / a.mass) * ny;
      b.vx -= (impulse / b.mass) * nx;
      b.vy -= (impulse / b.mass) * ny;
    }
  }
}