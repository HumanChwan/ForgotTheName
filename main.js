// document
const blockOne = document.getElementById('player');
const blockTwo = document.getElementById('computer');
const ball = document.getElementById('ball');
const mainBox = document.getElementById('main');
const score = document.getElementById('score');
const multiplier = document.getElementById('multiplier');
const F = document.getElementById('F');
const lost = document.getElementById('lost');
const leaderBoard = document.getElementById('leaderBoard-table');

// pixel settings
const [WIDTH, HEIGHT] = [800, 800];
const [ballWidth, ballHeight] = [20, 20];
const borderSize = 1;
const marginXOne = 20;
const [heightBlock, widthBlock] = [80 + borderSize * 2, 20 + borderSize * 2];
const [bYinit, bXinit] = [mainBox.offsetTop, mainBox.offsetLeft];
const GoodDimension = [
	marginXOne + widthBlock,
	WIDTH - marginXOne - widthBlock - ballWidth,
];
const [Xone, Xtwo] = [marginXOne, WIDTH - marginXOne - widthBlock];

// Play Meta Data
let FPS = 60;
let slope;
let deltaX, deltaY;
let ballX, ballY;
let unitSpeed = 3.5;
let letReachFinal = false;

// Play Front Data
let toMove = true; //1 : Player; 0 : computer

let toPos = 360;
let toPosPrev = 360;

let inPlay = true;

let Score = 0;
let rawScore = 0;

let Multiplier = 1;

let LeaderBoard = [];

// util functions
const okH = (Ycoor, height) => 0 <= Ycoor - height && Ycoor + height <= HEIGHT;
const okW = (Xcoor, width) => 0 <= Xcoor - width && Xcoor + width <= WIDTH;

function InitBallXY() {
	ballX = WIDTH / 2 - ballWidth / 2;
	ballY = Math.floor(Math.random() * (HEIGHT - ballHeight - 1)) + 1;
	ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
	toMove = Math.random() > 0.5;
	slope = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.914 + 0.5);
	deltaX = unitSpeed; // max error is 1px
	deltaY = slope * deltaX; // max error is 1.414px ~ 2px
	deltaX *= toMove ? -1 : 1;
	slope *= Math.sign(deltaX);
}
InitBallXY();

mainBox.addEventListener('mousemove', (e) => {
	if (!inPlay) return;
	toPos = e.clientY - bYinit;
	if (!okH(toPos, heightBlock / 2)) return;
	(toMove ? blockOne : blockTwo).style.transform = `translate(${
		toMove ? Xone : Xtwo
	}px, ${toPos - heightBlock / 2}px)`;
});

const month = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sept',
	'Oct',
	'Nov',
	'Dec',
];

function legibleDate(date) {
	return `${date.toLocaleTimeString()}, ${date.getDate()} ${
		month[date.getMonth()]
	} ${date.getFullYear()}`;
}

document.addEventListener('keypress', () => {
	if (inPlay) return;
	let date = new Date();
	LeaderBoard.push({
		Name: 'Anonymous',
		Score: Score,
		RecordMadeOn: date,
	});
	let latest = LeaderBoard[LeaderBoard.length - 1];
	let dateReadable = legibleDate(latest.RecordMadeOn);
	leaderBoard.innerHTML += `<tr> <td>${latest.Name}</td> <td>${latest.Score}</td> <td>${dateReadable}</td> </tr>`;
	inPlay = true;
	InitBallXY();
	F.className = 'none';
	lost.className = 'none';
	blockOne.style.transform = `translate(20px, 360px)`;
	blockTwo.style.transform = `translate(760px, 360px)`;
	unitSpeed = 3.5;
	Score = 0;
	score.innerText = `Score: ${Score}`;
	Multiplier = 1;
	multiplier.innerText = `Multiplier: x${Multiplier}`;
	letReachFinal = false;
	Loop();
});

const equalWError = (number, error) => Math.abs(number) <= error;

const willReflect = () => {
	const Y = parseInt(ballY) + ballWidth / 2;
	return (
		toPos - heightBlock / 2 - ballHeight / 2 <= Y &&
		Y <= toPos + heightBlock / 2 + ballHeight / 2
	);
};

const reachEnd = () => ballX <= GoodDimension[0] || GoodDimension[1] <= ballX;

function update() {
	Score += Multiplier;
	rawScore++;
	score.innerText = `Score: ${Score}`;
	if (rawScore % 5 === 0) {
		Multiplier++;
		multiplier.innerText = `Multiplier: x${Multiplier}`;
	}
	if (rawScore % 2 === 0) {
		unitSpeed += 0.25;
		deltaX = Math.sign(deltaX) * unitSpeed;
		deltaY = slope * deltaX;
	}
}

Loop();
var interval;
let j;

function Loop() {
	if (!inPlay) return;
	clearInterval(interval);
	if (letReachFinal) {
		if (!okW(ballX + ballWidth / 2, ballWidth / 2)) {
			inPlay = false;
			F.classList.remove('none');
			lost.classList.remove('none');
			F.classList.add('increase-font');
			lost.classList.add('appear');
			return;
		}
	} else {
		if (reachEnd()) {
			if (willReflect()) {
				deltaX *= -1;
				slope *= -1;
				toMove ^= 1;
				toPos ^= toPosPrev;
				toPosPrev ^= toPos;
				toPos ^= toPosPrev;
				update();
			} else {
				letReachFinal = true;
			}
		}
	}
	if (!okH(parseInt(ballY) + ballHeight / 2, ballHeight / 2)) {
		deltaY *= -1;
		slope *= -1;
	}
	ballX += deltaX;
	ballY += deltaY;
	ball.style.transform = `translate(${ballX}px, ${parseInt(ballY)}px)`;
	interval = setInterval(Loop, 1000 / FPS);
}
