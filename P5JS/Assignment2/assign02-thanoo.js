let balls = [];
const G = 10;          
const restitution = 1;

function setup() {
  createCanvas(750, 600);
}

function draw() {
  background(0);
  drawBackgroundZones();

  let ballsToRemove = new Set();
  let ballsToAdd = [];

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      applyGravity(balls[i], balls[j]);
      resolveCollision(balls[i], balls[j], ballsToRemove, ballsToAdd);
    }
  }

  for (let b of balls) {
    b.update();
    b.show();
  }

  balls = balls.filter(b => !ballsToRemove.has(b));
  balls.push(...ballsToAdd);
}

function mousePressed() {
  let tries = 100;
  while (tries-- > 0) {
    let r = random (20,40);
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
    let dragCoefficient = getZoneDrag(this.x, this.y);

    let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed !==0) {
      let ux = this.vx/speed;
      let uy = this.vy/speed;

      let dragMagnitude = dragCoefficient * speed * speed;
      let dragFx = -dragMagnitude * ux;
      let dragFy = -dragMagnitude * uy;

      this.applyForce(dragFx, dragFy);
    }

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

function resolveCollision(a, b, ballsToRemove, ballsToAdd) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = sqrt(dx * dx + dy * dy);
  let minDist = a.r + b.r;

  if (dist < minDist && dist > 0) {
    
    let bigger, smaller;

    if (a.r > b.r) {
      bigger = a;
      smaller = b;
    } else if (b.r > a.r) {
      bigger = b;
      smaller = a;
    }

    if (bigger && bigger.r > 10) { 
      ballsToRemove.add(bigger);
      let newR = bigger.r / 2;
      let offset = newR + 2;
      ballsToAdd.push(
        new Ball(bigger.x + offset, bigger.y, newR),
        new Ball(bigger.x - offset, bigger.y, newR)
      );
    }
    
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

function drawBackgroundZones() {
  noStroke();

  fill(180, 220, 255);
  rect(0, 0, width / 2, height / 2); // Top-left

  fill(0, 0, 50);
  rect(width / 2, 0, width, height); // Top-right

  fill(255, 230, 180);
  rect(0, height / 2, width / 2, height); // Bottom-left

  fill(180, 255, 180);
  rect(width / 2, height / 2, width, height); // Bottom-right

  stroke(0);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);

  noStroke();
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(0,0,100);
  text("Air", width * 0.25, height * 0.25);
  fill(255);
  text("Space", width * 0.75, height  * 0.25);
  fill(0);
  text("Desert", width * 0.25,height * 0.75);
  fill(0,100,0);
  text("Grassland", width * 0.75, height * 0.75);
}

function getZoneDrag(x, y) {
  if (x < width / 2 && y < height / 2) return 0.01;  // Air: low drag
  if (x >= width / 2 && y < height / 2) return 0.0001; // Space: almost no drag
  if (x < width / 2 && y >= height / 2) return 0.1;   // Desert: high drag
  if (x >= width / 2 && y >= height / 2) return 0.05; // Grassland: moderate
  return 0.01;
}
