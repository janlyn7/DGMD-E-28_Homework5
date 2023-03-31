
function loadBoard() {
	let game = new Game();
	game.buildGameBoard();
	game.buildKeyBoard();

}
function Game() {
	this.debug = 0;
	this.theWord = "";
    this.boardDim = [5, 6]; // dimension for Squares board
    this.numGuesses = 1;    // track number of guesses
    this.squares = [];      // stores an array of Square objects
	this.keys = [];			// stores keyboard letters
	this.currentSq=0;       // track which Square should be filled in

    this.buildGameBoard = buildGameBoard;
	this.buildKeyBoard = buildKeyBoard;
    this.createButton = createButton;
	this.createKeyButton = createKeyButton;
	this.createFunctionButton = createFunctionButton;
    this.getRandomWord = getRandomWord;
	this.validateGuess = validateGuess;
	this.setWord = setWord;
	this.addLetter = addLetter;
	this.checkGuess = checkGuess;
	this.moveBack = moveBack;
	this.setMessage = setMessage;

    this.getRandomWord();
}

function buildGameBoard() {
	let board = document.getElementById("gameboard");
	let grid = document.createElement('div');
	grid.id = "grid";
	grid.setAttribute("class", "w3-display-container w3-center w3-animate-zoom");

	// create 5x6 playing field
    let len = 1;
    this.boardDim.map(dim => len *= dim);

	for (let ii = 0; ii < len; ii++) {
		this.createButton(ii, grid);
		this.squares.push( new Square() );
	}
	board.appendChild(grid);
}

function buildKeyBoard() {
	let qwerty = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
	let keyboard = document.getElementById("keyboard")
	let keygrid = document.createElement('div');

	qwerty.forEach(row => {
		let letterArray = row.split("");

		if (letterArray.includes("Z")) {
			this.createFunctionButton("ENTER", keygrid);
		}

		letterArray.forEach(letter => {
			this.createKeyButton(letter, keygrid);
			this.keys.push( new Key(letter) );
		});

		if (letterArray.includes("Z")) {
			this.createFunctionButton("BACK", keygrid);
		}

		keygrid.appendChild( document.createElement('br'));
	});

	keyboard.appendChild(keygrid);
}

// create a button and attach it to the grid
function createButton(numId, grid) {
	let button = document.createElement( "button");
	button.id = "button" + numId;
	button.className = "square";
	button.type = "button";
	button.innerHTML = "&nbsp;";

	grid.appendChild(button);
}

function createKeyButton(letter, grid) {
	let button = document.createElement( "button");
	button.id = letter + "button";
	button.className = "key";
	button.type = "button";
	button.innerHTML = letter;

	button.addEventListener('click', () => {
		this.addLetter(button.id);
	});

	grid.appendChild(button);
}


function addLetter(id) {
	this.setMessage("");
	let letter = id.charAt(0);

	let sq = document.getElementById("button" + this.currentSq);
	sq.innerText = letter;
	this.currentSq++;
}
function createFunctionButton(name, grid) {
	let button = document.createElement( "button");
	button.id = name;
	button.className = "funckey";
	button.type = "button";
	button.innerHTML = name;

	if (name === "ENTER") {
		button.addEventListener('click', () => {
			this.checkGuess();
		});
	}
	if (name === "BACK") {
		button.addEventListener('click', () => {
			this.setMessage("");
			this.moveBack();
		});
	}
	grid.appendChild(button);
}

function checkGuess() {

	if ( (this.currentSq) % 5 != 0) {
		setMessage("Not enough letters");
	} else {
		let guess = "";
		for (index = this.currentSq-5; index < this.currentSq; index++) {
			guess += document.getElementById("button" + index).innerText;
		}
		console.log(guess);
		let isValid = this.validateGuess(guess);

		// check if guess is a match to the word

		// if not update colors

		// continue to next guess

	}

}
function moveBack() {
	console.log(this.currentSq);
	if (this.currentSq > 0) {
		this.currentSq--;
		let sq = document.getElementById("button" + this.currentSq);
		sq.innerHTML = "&nbsp;";
	}
}
async function getRandomWord() {
    let res = await fetch("https://random-word-api.vercel.app/api?words=1&length=5")
        .then(res => res.json())
        .then(data => {
			this.setWord(data[0]);
        });
	return res;
}

function setWord(word) {
	this.theWord = word;
	console.log(this.theWord);
}
function validateGuess( guess ){

	let req = new XMLHttpRequest();
	req.open("GET", "https://api.dictionaryapi.dev/api/v2/entries/en/"+guess, false);
	req.send(null);
	if(req.readyState == 4)  {

		console.log(req.responseText);
	}
}
/*
function setDebugMode(){
	let banner = document.getElementById("banner");
	let label = document.createElement("label");
	let txt = document.createTextNode("Debug Mode: ");
	//label.setAttribute("for", "");
	label.appendChild(txt);
	banner.appendChild(label);

	let radio = document.createElement("input");
	radio.setAttribute("type", "radio");
  	banner.appendChild(radio);

}
*/


function setMessage(msg)
{
    document.getElementById("banner").innerHTML=msg;
}


function Square() {
	this.input = "";
	this.isEmpty = isEmpty;
}

function isEmpty() {
    return this.input === "" ? true : false;

}

function Key(inLetter) {
	this.letter = inLetter;
	this.isTaken = false;

}