//board
let board;
let boardWidth = 460;
let boardHeight = 676;
let context;

//doodler
let doodlerWidth = 80;
let doodlerHeight = 56;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img : null,
    x : doodlerX,
    y : doodlerY,
    width : doodlerWidth,
    height : doodlerHeight
}

//physics
let velocityX = 0; 
let velocityY = 0; //doodler jump speed
let initialVelocityY = -8; //starting velocity Y
let gravity = 0.4;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw doodler
    // context.fillStyle = "green";
    // context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./images/rabbit-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./images/rabbit-left.png";

    platformImg = new Image();
    platformImg.src = "./images/gr-platform.png";
    platformImg.src = "./images/br-platform.png";

    velocityY = initialVelocityY;

    brokenPlatform();
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //doodler
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;

    // Check if doodler reaches the top of the board
    if (doodler.y <= 0) {
        doodler.y = 0; // Stop the doodler from going further up
        velocityY = 0; // Stop the doodler's vertical velocity
    }

    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= initialVelocityY; //slide platform down
        }
        if (platform.y > boardHeight) {
            platformArray.splice(i, 1); // remove platform if it's below the board
            continue; // continue to next iteration to avoid index shift
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.img.src.includes("br-platform.png")) {
                velocityY = initialVelocityY; //jump
                platformArray.splice(i, 1); // remove the brown platform
                break; 
            }
            else {
                velocityY = initialVelocityY; //jump
            }
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*7/8);
    }
}

function brokenPlatform (){
    let randomX = Math.floor(Math.random() * (boardWidth - 0 + 1)) +0;
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}


function moveDoodler(e) {
    if (gameOver && e.code !== "Space") { 
        return;
    }

    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        //reset
        doodler = {
            img : doodlerRightImg, 
            x : doodlerX,
            y : doodlerY,
            width : doodlerWidth,
            height : doodlerHeight
        }
    
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }

    // Check if moving left or right will keep the doodler within the board boundaries
    if ((e.code == "ArrowRight" || e.code == "KeyD") && doodler.x + doodler.width + velocityX <= boardWidth) {
        doodler.x += velocityX;
    } else if ((e.code == "ArrowLeft" || e.code == "KeyA") && doodler.x + velocityX >= 0) {
        doodler.x += velocityX;
    }

    // check whether the doodler can save himself by landing on the green platform
    if (velocityY >= 0 && !gameOver) {
        let onGreenPlatform = platformArray.some(platform => {
            return detectCollision(doodler, platform) && platform.img.src.includes("gr-platform.png");
        });
        if (onGreenPlatform) {
            velocityY = initialVelocityY; // Change the doodler's direction so that it lands on the green platform
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function placePlatforms() {
    platformArray = [];

    // Initial platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    };
    platformArray.push(platform);

    // Green and brown platforms
    let maxPlatformGap = Math.abs(initialVelocityY); // The maximum distance between platforms

    for (let i = 0; i < 100; i++) { // We are increasing the number of platforms for greens to occur more often
        let randomX = Math.floor(Math.random() * boardWidth*3/4);
        let platformType = Math.random() >= 0.1 ? "gr-platform.png" : "br-platform.png"; 
        let platform = {
            img : new Image(),
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
        };
        
        // set a random displacement of the platform
        let randomOffset = Math.floor(Math.random() * maxPlatformGap * 2) - maxPlatformGap;
        platform.y -= randomOffset;

        platform.img.src = "./images/" + platformType;
        platformArray.push(platform);
    }
}

//starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);

    // platform = {
    //     img : platformImg,
    //     x : boardWidth/2,
    //     y : boardHeight - 150,
    //     width : platformWidth,
    //     height : platformHeight
    // }
    // platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
        }
    
        platformArray.push(platform);
    }


function brokenPlatform (){
    let randomX = Math.floor(Math.random() * (5 - 0 + 1)) +0;
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);

}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function updateScore() {
    let points = Math.floor(50*Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}