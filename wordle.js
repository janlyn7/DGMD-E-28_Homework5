
function loadBoard() {
	let game = new Game();
	game.buildGameBoard();
	game.buildKeyBoard();
}
function Game() {
	this.debug = 0;
	this.theWord = "";
    this.boardDim = [5, 6]; // dimension for Squares board
    this.numGuesses = 1;    // track number of guesses (same as number of rows)
	this.currentSq = 0;       // track which Square should be filled in
	this.qwerty = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
	this.colors = ["#86888a", "#cdb559", "#6aaa64", "#ffffff"]

	//this.rowRanges= [ [0,4], [5,9], [10,14], [15,19], [20,24], [25,29] ];
	this.start = 0;  // Start of row range
	this.end = 4;    // End of row range

    this.buildGameBoard = buildGameBoard;
	this.buildKeyBoard = buildKeyBoard;
    this.createSquare = createSquare;
	this.createKeyButton = createKeyButton;
	this.createFunctionButton = createFunctionButton;
    this.getRandomWord = getRandomWord;
	this.validateGuess = validateGuess;
	this.setWord = setWord;
	this.addLetter = addLetter;
	this.checkGuess = checkGuess;
	this.moveBack = moveBack;
	this.updateColors = updateColors;
	this.setMessage = setMessage;
	this.disableKeyboard = disableKeyboard;
	this.addRestartButton = addRestartButton;
	this.reloadBoard = reloadBoard;
	this.setDebugMode = setDebugMode;

	this.getRandomWord();
}

// create the game board of 30 Squares
function buildGameBoard() {
	// allow User to select if Debug Mode is turned on or off
	// if "On" is selected, the word will appear below the keyboard
	// default = "Off"
	this.setDebugMode();

	let board = document.getElementById("gameboard");
	let grid = document.createElement('div');
	grid.id = "grid";
	grid.setAttribute("class", "w3-display-container w3-center w3-animate-zoom");

	// create 5x6 playing field
    let len = 1;
    this.boardDim.map(dim => len *= dim);

	for (let ii = 0; ii < len; ii++) {
		this.createSquare(ii, grid);
	}
	board.appendChild(grid);
}

// create the Qwerty keyboard for Users to enter letters onto the game board
function buildKeyBoard() {
	let keyboard = document.getElementById("keyboard")
	let keygrid = document.createElement('div');
	keygrid.id = "keygrid";

	this.qwerty.forEach(row => {
		let letterArray = row.split("");

		// on the third row include an "ENTER" key
		if (letterArray.includes("Z")) {
			this.createFunctionButton("ENTER", keygrid);
		}

		// create the letter buttons
		letterArray.forEach(letter => {
			this.createKeyButton(letter, keygrid);
		});

		// on the third row, include a "BACK" key
		if (letterArray.includes("Z")) {
			this.createFunctionButton("BACK", keygrid);
		}

		keygrid.appendChild( document.createElement('br'));
	});

	keyboard.appendChild(keygrid);
}

// create a square and attach it to the game grid
function createSquare(numId, grid) {
	let button = document.createElement( "button");
	button.id = "square" + numId;
	button.className = "square";
	button.type = "button";
	button.innerHTML = "&nbsp;";

	grid.appendChild(button);
}

// create key button and attach it to the key grid
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

// event listener function for keyboard letters
function addLetter(id) {
	// clear announcement banner
	this.setMessage("&nbsp;");

	// only allow letters to be added to the current row
	if ((this.currentSq >= this.start) && (this.currentSq <= this.end)) {
		let letter = id.charAt(0);

		let sq = document.getElementById("square" + this.currentSq);
		sq.innerText = letter;
		this.currentSq++;
	}
}

// create the "ENTER" and "BACK" keys with their respective actions
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

// if all the squares in the row have been filled in, verify the input word is valid
// if all 5 squares have not been filled, announce "Not enough letters
// if input is invalid, announce "Not in word list"
function checkGuess() {
	if (( (this.currentSq) % 5 !== 0 ) || (this.currentSq === this.start) ){
		setMessage("Not enough letters");
	} else {
		let guess = "";
		let index;

		// join the input letters to make a word
		for (index = this.start; index <= this.end; index++) {
			guess += document.getElementById("square" + index).innerText;
		}

		// check if User's guess is a valid word
		let isValid = this.validateGuess(guess);

		// if not valid, print message "Not in word list"
		if (!isValid) {
			this.setMessage("Not in word list");
			return;
		}

		// if valid, update colors
		this.updateColors(guess);

		// check if game is over (i.e. correct guess or user has made 6 guesses)
		let done = ((guess === this.theWord) || (this.numGuesses === 6));

		if (done) {
			if (guess === this.theWord) {
				this.setMessage("Congratulations!");
			} else {
				this.setMessage("The word is <b>" + this.theWord + "</b>");
			}

			// disallow further input via the keyboard
			this.disableKeyboard();
			this.addRestartButton();
			return;
		}

		// continue to next guess
		this.numGuesses++;

		// update the row ranges
		this.start += 5;
		this.end += 5;
	}
}

// update the colors of the squares on the game board and the letters on the keyboard
// green if the guess letter is in the same place as the answer letter
// yellow if the guess letter is in the answer but not in the correct place
// gray if the guess letter is not in the answer at all
function updateColors(guess) {
	let index = 0;
	let wordArray = this.theWord.split("");
	let guessArray= guess.split("");
	let results = [];

	guessArray.forEach( letter => {
		if (letter === wordArray[index]) {
			// if letter is in the correct place, turn green
			results.push(2);
		} else {
			if (wordArray.includes(letter)) {
				// if letter is in the word but not the correct place, turn yellow
				results.push(1);
			} else {
				// if letter is not in the word at all, turn gray
				results.push(0);
			}
		}
		index++;
	});

	let btn, sq;
	let sqIndex = this.start;
	let rgbGreen = "rgb(106, 170, 100)";  // background color is returned as rgb() instead of hex
	for (index = 0; index < 5; index++) {
		// update keyboard letter color
		btn = document.getElementById(guessArray[index]+"button");
		btn.style.color = this.colors[3];

		// if keyboard letter is green, do not change the color
		if (btn.style.backgroundColor !== rgbGreen) {
			btn.style.backgroundColor = this.colors[results[index]];
		}

		// update wordle square color
		sq = document.getElementById("square"+sqIndex);
		sq.style.color = this.colors[3];
		sq.style.backgroundColor = this.colors[results[index]];
		sqIndex++;
	}

}

// when 'BACK' button is pressed, move backward to the previous square on the row and
// remove input letter
function moveBack() {
	this.setMessage("&nbsp;");

	if ((this.currentSq >= this.start) && (this.currentSq-1 <= this.end)) {
		if (this.currentSq !== this.start) {
			this.currentSq--;
		}

		let sq = document.getElementById("square" + this.currentSq);
		sq.innerHTML = "&nbsp;";
	}
}

// retrieves a 5-letter word via random-word-api
async function getRandomWord() {
    let res = await fetch("https://random-word-api.vercel.app/api?words=1&length=5")
        .then(res => res.json())
        .then(data => {
			// get the first word in the returned array
			this.setWord(data[0]);
        });
	return res;
}

// stores the word in uppercase format
function setWord(word) {
	this.theWord = word.toUpperCase();
}

// uses the Merriam-Webster Collegiate Dictionary API to verify if the User's guess is valid or not
// NOTE: this function uses XMLHTTPRequest synchronously
function validateGuess( guess ){

	let req = new XMLHttpRequest();
	req.open("GET", "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" + guess +
			"?key=22b6c8ea-5808-466e-bf2f-146146bb7b4b", false);
	req.send(null);
	if(req.readyState === 4)  {
		let	reqJSON = JSON.parse(req.responseText);

		// valid words return an object
		// invalid words return an array or undefined
		return (typeof reqJSON[0] === 'object');
	}
}

// turns off hover and disables all buttons on the keyboard after the game has ended
function disableKeyboard() {
	let btn;
	this.qwerty.forEach(row => {
		let letterArray = row.split("");
		letterArray.forEach(letter => {
			btn = document.getElementById(letter + "button");
			btn.disabled = true;
			btn.style.pointerEvents = "none";
		});
    });

	btn = document.getElementById("ENTER");
	btn.disabled = true;
	btn.style.pointerEvents = "none";

	btn = document.getElementById("BACK");
	btn.disabled = true;
	btn.style.pointerEvents = "none";
}

// after the game has ended, adds a button below the
// game board allowing the user to reset the board and play another game
function addRestartButton() {
    let restart = document.getElementById("restart");
	restart.innerText = "";

    let btn = document.createElement( "button");
    btn.type = "button";
    btn.id = "playAgain";
    btn.style.fontSize = "20px";
    btn.innerText = "Play Again";
    btn.setAttribute("class", "w3-button w3-black w3-round-large")
    btn.addEventListener ('click', () => {
		this.reloadBoard();
	});
    restart.appendChild(btn);
}

// reloads game board and keyboard and starts a new game
function reloadBoard() {
    // remove the old board
    let div = document.getElementById("grid");
    div.parentNode.removeChild(div);

    // remove the old keyboard
    div = document.getElementById("keygrid");
    div.parentNode.removeChild(div);

    // remove the 'Play Again' button
    div = document.getElementById("playAgain");
    div.parentNode.removeChild(div);

	// clear banner
	this.setMessage(" ");

    // load a fresh game board
    loadBoard();
}

// updates the announcement banner
function setMessage(msg)
{
    document.getElementById("banner").innerHTML=msg;
}

// lets the User select if they would like to play with debug mode on or off
function setDebugMode() {
	let banner = document.getElementById("banner");

	const data = {
		"On": false,
		"Off": false,
	};

	let label, input;

	label = document.createElement("label");
	label.innerHTML = "Debug Mode: &nbsp;";
	banner.appendChild(label);

	for (let key in data) {
		label = document.createElement("label");
    	label.innerHTML = "&nbsp; &nbsp;" + key + "&nbsp;";
    	input = document.createElement("input");
		input.name = "debug";
    	input.type = "radio";

		if (key === "On") {
			input.addEventListener('change', () => {
				let worddiv = document.getElementById("restart");
				worddiv.innerText = this.theWord;
			});
		} else {
			input.defaultChecked = true;
			input.addEventListener('change', () => {
				let worddiv = document.getElementById("restart");
				worddiv.innerHTML = "&nbsp;";
			});
		}

    	label.appendChild(input);
    	banner.appendChild(label);
	}

}


