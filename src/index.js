window.addEventListener("load", function () {
  const canvas = this.document.getElementById("canvas1");
  const context = canvas.getContext("2d");
  canvas.width = 1280;
  canvas.height = 720;

  context.fillStyle = "white";
  context.lineWidth = 3;
  context.strokeStyle = "white";

  class Player {
    constructor(game) {
      this.game = game;
      this.collisionX = this.game.width * 0.5; //set hit box default x coord to half of game screen's width
      this.collisionY = this.game.height * 0.5; // set hit box default y coord to half of game screen's height
      this.collisionRadius = 50; //set size of hit box radius to 50px
      this.speedX = 0; //initialize player horizontal movement speed to 0
      this.speedY = 0; //initialize player vertical movement speed to 0
      this.xDistance = 0; //initialize horizontal distance between player and mouse positions
      this.yDistance = 0; // initialize vertical distance between player and mouse positions
      this.speedModifier = 5; // arbitrarily set speed modifier to 5
    }
    draw(context) {
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.collisionRadius,
        0,
        Math.PI * 2
      ); //path follows hit box coords established in constructor function
      context.save();
      context.globalAlpha = 0.5;
      context.fill();
      context.restore();
      context.stroke();
      context.beginPath();
      context.moveTo(this.collisionX, this.collisionY);
      context.lineTo(this.game.mouse.x, this.game.mouse.y);
      context.stroke();
    }

    update() {
      this.xDistance = this.game.mouse.x - this.collisionX;
      this.yDistance = this.game.mouse.y - this.collisionY;
      const distance = Math.hypot(this.yDistance, this.xDistance); // find distance betweeen player and mouse using Pythagorean theory

      //if distance between player and mouse is greater than player's speed modifier, move player
      if (distance > this.speedModifier) {
        this.speedX = this.xDistance / distance || 0; // divide horizontal distance by hypotenuse distance for constant speed
        this.speedY = this.yDistance / distance || 0; // do same thing for vertical distance
        // else do not move player
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }

      // multiply player speed by speed modifier
      this.collisionX += this.speedX * this.speedModifier;
      this.collisionY += this.speedY * this.speedModifier;
    }
  }

  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width; //randomize horizontal placement of obstacles
      this.collisionY = Math.random() * this.game.height; //randomize vertical placement of obstacles
      this.collisionRadius = 100; //hitbox radius
    }

    draw(context) {
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.collisionRadius,
        0,
        Math.PI * 2
      ); //path follows hit box coords established in constructor function
      context.save();
      context.globalAlpha = 0.5;
      context.fill();
      context.restore();
      context.stroke();
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.player = new Player(this);
      this.numberOfObstacles = 5;
      this.obstacles = [];
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };

      // event listener to track mouse movement inside canvas
      canvas.addEventListener("mousemove", (e) => {
        if (this.mouse.pressed) {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
          console.log(this.mouse.x, this.mouse.y);
        }
      });

      // event listener for when mouse is pressed inside canvas
      canvas.addEventListener("mousedown", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY; //make mouse object keys x and y in Game class to values of event offsetX and offsetY coords respectively
        this.mouse.pressed = true;
      });

      // event listener for when mouse button is released after press
      canvas.addEventListener("mouseup", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
      });
    }
    render(context) {
      this.player.draw(context);
      this.player.update();
      this.obstacles.forEach((obstacle) => obstacle.draw(context));
    }

    init() {
      for (let i = 0; i < this.numberOfObstacles; i++) {
        this.obstacles.push(new Obstacle(this));
      }
    }
  }

  const game = new Game(canvas);
  game.init();
  console.log(game);

  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height); //clear context on each animation frame update
    game.render(context);
    requestAnimationFrame(animate); // request animation frame by calling parent function, infinite animation loop via recursion
  }
  animate();
});
