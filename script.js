//board
let board,
  boardWidth = 360,
  boardHeight = 640,
  context;

//bird
let birdWidth = 34, // 17/12 ratio of original bird image (408/228px)
  birdHeight = 24,
  birdX = boardWidth / 8, // position in 1/8 of vertical line of canvas from the left
  birdY = boardHeight / 2, //position in the center of horizontal line of canvas
  birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

//pipes
let pipeArray = [],
  pipeWidth = 64, // 1/8 ratio of original pipe images (384/3072px) for width and height
  pipeHeight = 512,
  pipeX = boardWidth,
  pipeY = 0,
  topPipeImg,
  bottomPipeImg;

//physics
let velocityX = -2, // pipes moving to the left 2px per frame
  velocityY = 0, // birds jump speed
  gravity = 0.4;

//HUD
let score = 0,
  gameOver = false;

//restart game
function reset() {
  bird.y = birdY;
  pipeArray = [];
  score = 0;
  gameOver = false;
}

// load main things on window opening
window.onload = function () {
  //load canvas
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); // creating 2D rendering context for canvas

  //load images
  birdImg = new Image();
  birdImg.src = "./flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };
  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";
  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  requestAnimationFrame(update);
  setInterval(placePipes, 1500); // every 1.5seconds new pipes
  document.addEventListener("keydown", moveBird);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, boardWidth, boardHeight); // clear canvas

  //bird
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird.y, limit the bird fly outside canvas
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    // game over if bird fall down out of canvas
    gameOver = true;
  }

  //pipes
  for (let pipe of pipeArray) {
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // 0.5 because there are 2 pipe (top and bottom)
      pipe.passed = true;
    }

    if (detectColision(bird, pipe)) {
      gameOver = true;
    }
  }

  //clear pipes for resources saving
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // removes first pair of pipes from Array when they get outside canvas
  }

  //score print
  context.fillStyle = "white";
  context.font = "50px Poppins";
  context.fillText(score, 5, 45);

  if (gameOver) {
    context.fillText("Game Over", 40, 320); // game over print
  }
}

function placePipes() {
  if (gameOver) {
    return;
  }
  // position of pipe = 3/4 of pipeHeight - randomNo(radius 0 - 1) * 4/2 of pipeHeight
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe); // add top pipe to array

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe); // add bottom pipe to array
}

//move bird on keyboard
function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    // bird jump by 6 px
    velocityY = -6;

    if (gameOver) {
      reset();
    }
  }
}
// move bird on mouse click
document.addEventListener("click", () => {
  velocityY = -6;
  if (gameOver) {
    reset();
  }
});

function detectColision(a, b) {
  // a - bird , b - pipe
  return (
    a.x < b.x + b.width && // bird's top left corner doesn't reach reach pipe's top right corner
    a.x + a.width > b.x && // bird's top right corner passes pipe's top left corner
    a.y < b.y + b.height && // bird's top left corner doesn't reach pipe's bottom left corner
    a.y + a.height > b.y // bird's bottom left corner passes pipe's top left corner
  );
}
