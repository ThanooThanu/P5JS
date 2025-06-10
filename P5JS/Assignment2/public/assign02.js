let balls = [];
const G = 6.67430e-11; // real G
const restitution = 1; // energy loss for simulation of inelastic collision
const timeScale = 10; // timescale for better visualization

function setup() {
  createCanvas(750, 750);
}

function draw() {
  background(50);

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let force = balls[i].attract(balls[j]);
      balls[j].applyForce(force);
      balls[i].applyForce(p5.Vector.mult(force, -1));
      balls[i].checkCollision(balls[j]);
    }
  }

  for (let ball of balls) {
    ball.update();
    ball.edges();
    ball.show();
  }
}

function mousePressed() {
  let r = random(5, 100);
  let newBall = new Ball(mouseX, mouseY, r);

  for (let other of balls) {
    let d = dist(newBall.pos.x, newBall.pos.y, other.pos.x, other.pos.y);
    if (d < newBall.r + other.r) {
      return; 
    }
  }

  balls.push(newBall);
}

class Ball {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.r = r;
    this.mass = PI * r * r * 1e7;
    this.color = color(random(0, 255), random(0, 255), random(0, 255));
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  attract(other) {
    let force = p5.Vector.sub(this.pos, other.pos);
    let distance = constrain(force.mag(), this.r + other.r, 500);
    force.normalize(); //make vector scale to 1
    let strength = (G * this.mass * other.mass) / (distance * distance); // then mutiply by the formula
    force.mult(strength);
    return force;
  }

  checkCollision(other) {
    let dir = p5.Vector.sub(other.pos, this.pos);
    let distBetween = dir.mag();
    let minDist = this.r + other.r;

    if (distBetween < minDist) {
      // Separate overlapping balls
      let overlap = minDist - distBetween;
      dir.normalize();
      dir.mult(overlap / 2);
      other.pos.add(dir);
      this.pos.sub(dir);

      let normal = p5.Vector.sub(other.pos, this.pos).normalize();
      let relativeVelocity = p5.Vector.sub(this.vel, other.vel);
      let speed = relativeVelocity.dot(normal);

      if (speed < 0) return; // Balls moving apart already

      let impulse = (2 * speed) / (this.mass + other.mass); //v
      impulse *= restitution;

      // P = mv
      this.vel.sub(p5.Vector.mult(normal, impulse * other.mass));
      other.vel.add(p5.Vector.mult(normal, impulse * this.mass));
    }
  }

  update() {
    this.vel.add(p5.Vector.mult(this.acc, timeScale));
    this.pos.add(p5.Vector.mult(this.vel, timeScale));
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x - this.r < 0) {
      this.pos.x = this.r;
      this.vel.x *= -restitution;
    } else if (this.pos.x + this.r > width) {
      this.pos.x = width - this.r;
      this.vel.x *= -restitution;
    }

    if (this.pos.y - this.r < 0) {
      this.pos.y = this.r;
      this.vel.y *= -restitution;
    } else if (this.pos.y + this.r > height) {
      this.pos.y = height - this.r;
      this.vel.y *= -restitution;
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}
