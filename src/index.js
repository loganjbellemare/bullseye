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
      this.collisionRadius = 60; //hitbox radius
      this.image = document.getElementById("obstacles"); // get access to sprite sheet for obstacles from HTML
      this.spriteHeight = 250;
      this.spriteWidth = 250;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 70;
      this.frameX = Math.floor(Math.random() * 4);
      this.frameY = Math.floor(Math.random() * 3);
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      ); //load sprite from sprite sheet
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
      this.numberOfObstacles = 10;
      this.obstacles = [];
      this.topMargin = 260;
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
      // load randomly placed obstacles, use circle packing algo to ensure they don't overlap with each other
      let attempts = 0; //so we don't start infinite loop
      // while array of game obstacles has a length less than the amount of specified obstacles, and while number of attempts is less than 500, perform circle packing
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
        let testObstacle = new Obstacle(this); // test obstacle to compare against game obstacles
        let overlapObstacle = false; // variable to track state of obstacles overlapping with each other
        this.obstacles.forEach((obstacle) => {
          // circle pack woooooo!
          //track values of distance between the x/y coords of current obstacle in Game object and test obstacle hitboxes
          let distanceX = testObstacle.collisionX - obstacle.collisionX;
          let distanceY = testObstacle.collisionY - obstacle.collisionY;
          const bufferSpace = 100; // buffer zone between obstacles to allow players and enemies to easily maneuver around obstacles
          // get actual distance using pythagorean theorem
          let distance = Math.hypot(distanceY, distanceX);
          // store sum of radii for comparison
          let sumOfRadii =
            testObstacle.collisionRadius +
            obstacle.collisionRadius +
            bufferSpace;
          // check if actual distance between obstacles is less than sum of radii
          if (distance < sumOfRadii) {
            // hitboxes overlap if distance is less than sum of radii, set overlap to true
            overlapObstacle = true;
          }
        });
        // after checking every obstacle, if overlap is false, we can add current testObstacle to our Game object
        let overlapLeftScreen = false; // store state of test obstacle overlapping the left side of the game screen, we want them to be fully in view
        if (testObstacle.spriteX < 0) {
          overlapLeftScreen = true;
        }
        let overlapRightScreen = false; // store state of test obstacle overlapping right side of game screen
        if (testObstacle.spriteX > this.width - testObstacle.width) {
          overlapRightScreen = true;
        }
        const margin = testObstacle.collisionRadius * 2; // add some margin so obstacles appear on game path
        let overlapTopScreen = false; // store state of test obstacle overlapping with top of screen, including desired game margin
        if (testObstacle.collisionY < this.topMargin + margin) {
          overlapTopScreen = true;
        }
        let overlapBottomScreen = false; // store state of test obstacle overlapping with bottom of screen
        if (testObstacle.collisionY > this.height - margin) {
          overlapBottomScreen = true;
        }
        if (
          !overlapObstacle &&
          !overlapLeftScreen &&
          !overlapRightScreen &&
          !overlapTopScreen &&
          !overlapBottomScreen
        ) {
          //if test obstacle doesn't overlap with any edges of the game screen and doesn't overlap another obstacle, add it to the game
          this.obstacles.push(testObstacle);
        }
        attempts++;
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
