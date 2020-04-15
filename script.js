'use strict';
const cvs = document.querySelector('.snake-field'),
    ctx = cvs.getContext('2d'),
    scoreElem = document.querySelector('.game-score'),
    speedRange = document.querySelector('#snake-speed'),
    vw = document.documentElement.clientWidth / 100,
    vh = document.documentElement.clientHeight / 100;

cvs.width = 75 * vw;
cvs.height = 60 * vh;
document.querySelector('.game-field').style.width = cvs.width + 'px';




class FieldPart {
    constructor(buildingFunction, color) {
        this.color = color;
        this.buildFunc = buildingFunction;
    }
    build() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        this.buildFunc();
    }
}
let counter = 0;
class Snake extends FieldPart {
    constructor(speed, eatingCount) {
        super(
            () => ctx.fillRect(this.x, this.y, this.size, this.size),
            '#0a4500'
        );
        this.eatingCount = eatingCount;
        this.eatCounter = 0;
        this.speed = speed;
        this.length = [];
        this.x = cvs.width / 2;
        this.y = cvs.height / 2;
        this.dx = 0;
        this.dy = 0;
        this.size = Math.max(vw, vh);
    }
    _checkEating(foodObj) {
        return (
            foodObj.x - this.x <= foodObj.size + this.size &&
            foodObj.x - this.x >= -foodObj.size - (this.size / 2) &&
            foodObj.y - this.y >= -foodObj.size - (this.size / 2) &&
            foodObj.y - this.y <= foodObj.size + this.size
        ) || (
            this.x - foodObj.x <= foodObj.size + this.size &&
            this.x - foodObj.x >= -foodObj.size - (this.size / 2) &&
            this.y - foodObj.y >= -foodObj.size - (this.size / 2) &&
            this.y - foodObj.y <= foodObj.size + this.size
        );
    }
    move(foodObj) {
        let thisObj = this;
        return new Promise(function (resolve, reject) {
            ctx.beginPath();
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            foodObj.eaten = false;
            foodObj.makeFood(false);

            thisObj.x += thisObj.dx * thisObj.speed;
            thisObj.y += thisObj.dy * thisObj.speed;

            if (thisObj.x < 0) thisObj.x = cvs.width;
            else if (thisObj.x > cvs.width) thisObj.x = 0;

            if (thisObj.y < 0) thisObj.y = cvs.height;
            else if (thisObj.y > cvs.height) thisObj.y = 0;
            thisObj.length.unshift({
                x: thisObj.x,
                y: thisObj.y
            });

            thisObj.length.forEach(function (item, index, array) {
                for (let i = index + 1; i < array.length; i++) {
                    if (thisObj.x - array[i].x < 1 &&
                        thisObj.x - array[i].x > -1 &&
                        thisObj.y - array[i].y > -1 &&
                        thisObj.y - array[i].y < 1) {
                        reject(thisObj);
                    }
                }
                ctx.fillStyle = thisObj.color;
                ctx.fillRect(item.x, item.y, thisObj.size, thisObj.size);
            })
            if (thisObj._checkEating(foodObj)) {
                foodObj.eaten = true;
                foodObj.makeFood();
                thisObj.eatCounter += thisObj.speed * thisObj.eatingCount;
                scoreElem.innerHTML = +scoreElem.innerHTML + foodObj.typeSize * thisObj.speed;
            }
            if (thisObj.eatCounter < thisObj.speed / thisObj.eatingCount) {
                thisObj.length.pop();
            } else {
                thisObj.eatCounter -= thisObj.speed / thisObj.eatingCount;
            }
            ctx.closePath();
        })
    }
};
let snake = new Snake(speedRange.value, 3);

snake.build();


class Food extends FieldPart {
    constructor(size, typeSize) {
        super(
            () => ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2),
            '#ff9eb5'
        );
        this.size = size;
        this.typeSize = typeSize;
        this.x = this.randomize(cvs.width);
        this.y = this.randomize(cvs.height);
        this.eaten = false;
    }
    randomize(cvsType) {
        return Math.random() * (cvsType - this.size * 2)
    }
    makeFood() {
        ctx.beginPath();
        if (this.eaten) {
            this.x = this.randomize(cvs.width),
            this.y = this.randomize(cvs.height);
        }
        ctx.fillStyle = this.color;
        this.build();
        ctx.fill();
        
    }
};
class BigFood extends Food{
    makeFood() {
        super.makeFood();
        let thisObj = this;
        console.log(thisObj)
        if (this.typeSize > 1 && !this.detected && !this.eaten) {
            new Promise(function (res, rej) {
                thisObj.detected = true;
                setTimeout(function () {
                    thisObj.typeSize = 1;
                    thisObj.x = thisObj.randomize(cvs.width);
                    thisObj.y = thisObj.randomize(cvs.height);
                    thisObj.size = Math.max(vw, vh) / 2.5;
                }, 5000);
            }).then(() => {
                thisObj.build();
                ctx.fill();
            });
        } else if(this.eaten) {
            setTimeout(() => thisObj.typeSize = 6, 1000);
            thisObj.size = Math.max(vw, vh) * 2.5;
            this.hideProgress();
        }
        ctx.closePath();
    }
    drawProgress(progress) {
        ctx.beginPath();
        let y = this.y + this.size + Math.min(vh, vw) * 1.5,
            w = this.size * 2 * progress,
            x = this.x - this.size ,
            h = Math.min(vh, vw);
        ctx.fillStyle = '#f8bcca';
        ctx.fillRect(x, y, w, h);
        this._tempDrawing = this.drawProgress;
    }
    hideProgress() {
        ctx.beginPath();
        let y = this.y + this.size + Math.min(vh, vw),
            w = this.size * 2 + Math.min(vh, vw),
            x = this.x - this.size ,
            h = Math.min(vh, vw) * 2;
        ctx.clearRect(x, y, w, h);
        this.drawProgress = null;
        let thisObj = this;
        setTimeout(() => thisObj.drawProgress = thisObj._tempDrawing, 5000);
    }
}
let smallFood = new Food(Math.max(vw, vh) / 2.5, 1),
    bigFood = new BigFood(Math.max(vw, vh) * 2.5, 6);

let stopper = false;
let firstClick = true;
speedRange.onchange = function () {
    speedRange.blur();
    if (firstClick) snake.speed = speedRange.value;
}
let game = {
    play(snakeObj) {
        let thisObj = this;
        requestAnimationFrame(function animatePlay() {
            let _snakeFood; 
            +scoreElem.innerHTML / snakeObj.speed % 5 == 0 && +scoreElem.innerHTML != 0 ?
            _snakeFood = bigFood : _snakeFood = smallFood;
            snakeObj.move(_snakeFood)
            .catch(thisObj.gameOver);
            !stopper && requestAnimationFrame(animatePlay); // for perfomance
            if(_snakeFood.typeSize > 1) {
                let start = performance.now();
                requestAnimationFrame(function animateTimeBar(time) {
                    let timeFraction = (time - start) / 5000;
                    if (timeFraction > 1) timeFraction = 1;
                    if(_snakeFood.drawProgress) _snakeFood.drawProgress(timeFraction);
                    if (timeFraction < 1) {
                        requestAnimationFrame(animateTimeBar);
                    } else {
                        _snakeFood.hideProgress();
                    }
                })
            }
        });
    },
    gameOver(snakeObj) {
        alert('Game over');
        snakeObj.length = [];
        snakeObj.eatCounter = 0;
        snakeObj.x = cvs.width / 2;
        snakeObj.y = cvs.height / 2;
        snakeObj.dx = 0;
        snakeObj.dy = 0;
        scoreElem.innerHTML = 0;
        snakeObj.build();
        stopper = true;
        firstClick = true;
    }
}
snake.direction = {
    pos: '',
    coord: ''
};

document.addEventListener('keydown', function (event) {
    if (snake.direction.pos !== event.key.slice(5).toLowerCase()) {
        switch (event.key) {
            case 'ArrowUp':
                if (snake.direction.coord !== 'y') {
                    snake.dx = 0;
                    snake.dy = -1;
                    snake.direction.coord = 'y';
                }
                break;
            case 'ArrowDown':
                if (snake.direction.coord !== 'y') {
                    snake.dx = 0;
                    snake.dy = 1;
                    snake.direction.coord = 'y';
                }
                break;
            case 'ArrowRight':
                if (snake.direction.coord !== 'x') {
                    snake.dx = 1;
                    snake.dy = 0;
                    snake.direction.coord = 'x';
                }
                break;
            case 'ArrowLeft':
                if (snake.direction.coord !== 'x') {
                    snake.dx = -1;
                    snake.dy = 0;
                    snake.direction.coord = 'x';
                }
                break;
        }
        snake.direction.pos = event.key.slice(5).toLowerCase();
        if (firstClick) {
            stopper = false;
            game.play(snake);
            firstClick = false;
        }
    }
});

// for mobiles
document.querySelector('.mobile-arrows').addEventListener('click', function(event) {
    if(!event.target.closest('button')) return;
    let keyEvent = document.createEvent("Event");
    keyEvent.initEvent("keydown", true, true);
    keyEvent.key = event.target.closest('button').dataset.key;
    document.dispatchEvent(keyEvent);
})