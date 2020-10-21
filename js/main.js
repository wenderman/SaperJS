// Новая игра
var score; // Количество ходов
var happenedBang; // Взорвалась бомба
var countOpenCells; // Количество открытых ячеек
var win = false; // Игрок победил
var model; // Игровая логика и данные
var view = new View(); // Объект отвечающий за графику

function newGame(row, col, mines) {	
	model = new Model(row, col, mines, view);	
	model.filField(model.row, model.col);	
	view.displayField(model.field);
	score = 0;
	document.getElementById("score").innerHTML = score;
	happenedBang = false; 
	countOpenCells = 0; 
	win = false;
}

// Данные из формы NEW GAME
var inputRow = document.getElementById("row");
var inputRowValue = document.getElementById("row").value;
var inputCol = document.getElementById("col");
var inputColValue = document.getElementById("col").value;
var inputMines = document.getElementById("mines");
var inputMinesValue = document.getElementById("mines").value;
var maxMines = 90;	

// Страница загрузилась, создается новая игра
window.onload = newGame(10, 10, 10);
// Нажата кнопка "start"
var buttonStart = document.getElementById("start");
buttonStart.onclick = function() {
	if (!inputRow.classList.contains("text-red") && !inputCol.classList.contains("text-red") && !inputMines.classList.contains("text-red")) {
		document.getElementById("field").innerHTML = "";
		newGame(inputRowValue, inputColValue, inputMinesValue, view);			
	} else {
		alert("You have entered incorrect data");
	}
};

// Обработка левого щелчка мыши
document.getElementById("field").onclick = function(e) {
	var id = e.target.getAttribute("id");	
	if (id && !happenedBang && !win) { // у span нет айди и при клике на него id undefined			
		var position = splitId(id);	
		// Если ячейка закрыта и без маркера, обрабатываем щелчок
		if (model.userView[position[0]][position[1]] === -1) {		
			// После первого щелчка по ячейке заполняем поле минами, вокруг этой ячейки мин не будет
			if (score === 0) {								
				model.addMines(model.mines, model.field, position);				
			}
			happenedBang = model.checkCell(position, id); // true - взрыв	
			if (happenedBang) {
				alert("Вы проиграли:(")
			} else {
				score++;	
				document.getElementById("score").innerHTML = score;				
				win = model.checkWin();				
				if (win) {
					alert("Вы выиграли!")
				}
			}				
		}		
	}	
}

// Обработка правого щелчка мышью
document.getElementById("field").oncontextmenu = function(e) {
	var id = e.target.getAttribute("id");
	if (id && !happenedBang && !win) {			
		view.mark(id, splitId(id));
	}	
	return false;
}

// Определяем максимально возможное количество мин на поле (не более 90%)
inputRow.oninput = function() {	
	var result = document.getElementById("maxMines");
	if (inputRow.value < 10 || inputRow.value > 30) {
		inputRow.classList.add("text-red");
		result.innerHTML = "err";
	} else {
		if(inputRow.classList.contains("text-red")) inputRow.classList.remove("text-red");
		inputRowValue = inputRow.value;
		maxMines = Math.floor(inputRow.value * inputColValue * 0.9);
		result.innerHTML = "1-" + maxMines;
	}	
}

inputCol.oninput = function() {	
	var result = document.getElementById("maxMines");
	if (inputCol.value < 10 || inputCol.value > 30) {
		inputCol.classList.add("text-red");
		result.innerHTML = "err";
	} else {
		if(inputCol.classList.contains("text-red")) inputCol.classList.remove("text-red");
		inputColValue = inputCol.value;
		maxMines= Math.floor(inputRowValue * inputCol.value * 0.9);
		result.innerHTML = "1-" + maxMines;
	}	
}

inputMines.oninput = function() {	
	inputMinesValue = inputMines.value;
	if (inputMines.value < 1 || inputMines.value > maxMines || document.getElementById("maxMines").innerHTML === "err") {
		inputMines.classList.add("text-red");
	} else if (inputMines.classList.contains("text-red")) {
		inputMines.classList.remove("text-red");		
	}
}

// Получаем массив с номером строки и столбца из ID элемента
function splitId(id) {
	var position = [];
	var row; // номер строки
	var countRow = 0;
	var col; // номер столбца
	var countCol = 0;
	// Находим из скольки символов состоит номер строки и столбца
	for (var i = 0; i < id.length; i++) {
		if (id.charAt(i) !== "-") {			
			countRow++;
		} else {
			break;
		}		
	}
	for (var j = id.length - 1; j > 0; j--) {
		if (id.charAt(j) !== "-") {			
			countCol++
		} else {
			break;
		}
	}
	position[0] = id.substring(0, countRow);
	position[1] = id.substring((id.length - countCol), id.length);
	return position;
}

// Объект отвечающий за графику
function View() {
	// Построение игрового поля в браузере передаем методу аргумент model.field	
	this.displayField = function(field) {
		var row = field.length;
		var col = field[0].length;		
		var msg;
		var table = document.getElementById("field");
		for (var i = 0; i < row; i++) {
			msg = "";
			msg += "<div class=\"row\">";
			for (var j = 0; j < col; j++) {				
				msg += "<div class=\"cell hidden-cell\" id=\"" + i + "-" + j + "\"></div>";
			}
			msg += "</div>"
			table.innerHTML += msg;
		}
		table.innerHTML += "<p class=\"game-info-content\">Размер поля: " + row + " x " + col + "</p><p class=\"game-info-content\">Количество бомб: " + model.mines + "</p>";
	};

	// Отображает содержимое ячейки
	this.displayContent = function(content, id) {
		var cell = document.getElementById(id);
		if (content === 0) { // отображаем мину			
			cell.classList.remove("hidden-cell");			
			cell.classList.add("mine");
		} else if (content === 10) { // отображаем марикрованную мину
			cell.classList.remove("hidden-cell");			
			cell.classList.add("mark-mine");
		} else if (content === -1) { // отображаем пустое поле		
			cell.classList.remove("hidden-cell");
		} else { // отображаем число		
			var msg = "";
			switch(content) {				
				case 1:
					num = 1;
					break;
				case 2:
					num = 2;
					break;
				case 3:
					num = 3;
					break;
				case 4:
					num = 4;
					break;
				case 5:
					num = 5;
					break;
				case 6:
					num = 6;
					break;
				case 7:
					num = 7;
					break;
				case 8:
					num = 8;
					break;
			}
			msg = "<span class=\"text text-" + num + "\" oncontextmenu=\"return false\">" + num + "</span>";
			cell.innerHTML = msg;
			cell.classList.remove("hidden-cell");			
		}
	};

	// Отвечает за маркировку закрытой ячейки флагом
	this.mark = function(id, position) {
		if (model.userView[position[0]][position[1]] === -1) {
			// Если ячейка закрыта			
			model.userView[position[0]][position[1]] = 1;

			var cell = document.getElementById(id);
			cell.classList.add("mark-cell");
		} else if (model.userView[position[0]][position[1]] === 1) {
			// Если ячейка маркирована
			model.userView[position[0]][position[1]] = -1;
			var cell = document.getElementById(id);
			cell.classList.remove("mark-cell");
		}
	};
}

// Игровая логика и данные
function Model(row, col, mines, view) {
	this.row = row; // Количество строк
	this.col = col; // Количество столбцов
	this.mines = mines; // Количество мин на поле
	this.minesPosition = []; // Позиции мин	
	this.checkWin = function() { // Проверяем выиграл ли игрок					
		if ((this.row * this.col - countOpenCells) == this.mines) {			
			return true;
		} else {			
			return false;
		}
	};

	/* 
		Массив field содержит игровое поле.
		0 - в ячейке мина
		1-:-8 - количество мин вокруг ячейки
		-1 - в ячейке пусто и вокруг нет мин
	*/
	this.field = [];

	/*
		В массиве userView хранится то, как поле видит игрок
		-1 - ячейка закрыта
		0  - ячейка открыта
		1  - на ячейке установлен флаг 
	*/
	this.userView = [];

	// Инициализируем массивы field и userView значениями -1. 
	this.filField = function(row, col) {
		for(var i = 0; i < row; i++) {	
			this.field[i] = [];	
			this.userView[i] = [];	
			for(var j = 0; j < col; j++) {
				this.field[i][j] = -1;	
				this.userView[i][j] = - 1;		
			}			
		}		
	};

	// Добавляем мины на поле 
	this.addMines = function(mines, field, firstCell) { 		
		var row = field.length;		
		var col = field[0].length;			
		var emptyCells = this.freeMinesCell(firstCell);		
		// Располагаем мины в случайном месте		
		for (var i = 0; i < mines; i++) {			
			var x; 
			var y; 			
			do {
				var test = false;
				x = Math.floor(Math.random() * row); // номер строки
				y = Math.floor(Math.random() * col); // номер столбца
				// Проверяем не лежат ли эти координаты в "пустом диапазоне"				
				for (var j = 0; j < emptyCells.length; j++) {
					if ((x === emptyCells[j][0]) && (y === emptyCells[j][1])) {
						test = true;
						break;
					}
				}
			} while ((field[x][y] === 0) || test); // Если в ячейке нет мины, помещаем ее туда			
			field[x][y] = 0;
		}		
		// Определяем количество мин вокруг каждой ячейки
		this.countMines(field);
	};

	// Вокруг ячейки по которой кликнули первой не будет мин
	this.freeMinesCell = function(firstCell) {		
		var emptyCells = [];
		var row = Number(firstCell[0]);
		var col = Number(firstCell[1]);
		for (var i = (row - 1); i <= (row + 1); i++) {
			for (var j = (col - 1); j <= (col + 1); j++) {
				emptyCells.push([i, j]);
			}
		}	
		return emptyCells;
	};

	// Определяем количество мин вокруг каждой ячейки
	this.countMines = function(field) {
		var row = field.length;
		var col = field[0].length;			
		for (var i = 0; i < row; i++) {
			for (var j = 0; j < col; j++) {
				if (field[i][j] === 0) {					
					this.minesPosition.push([i, j]); // позиции мин					
					continue; // если в ячейке мина, количество мин вокруг не определяем
				} else {
					var count = 0; // счетчик мин
					if (((i - 1 >= 0) && (i + 1 < row)) && ((j - 1 >= 0) && (j + 1 < col))) {
						// Считаем количество мин вокруг, если ячейка не находится на внешнем ряду или строке 
						for (var k = i - 1; k <= i + 1; k++){
							for (var n = j - 1; n <= j + 1; n++) {								
								if (field[k][n] === 0) count++;
							}
						}						
					} else if (i - 1 < 0) {	
						// Для первой строки
						if (j - 1 < 0) {
							// Для первой ячейки
							for (var k = i; k <= i + 1; k++) {
								for (var n = j; n <= j + 1; n++) {
									if (field[k][n] === 0) count++;
								}
							}							
						} else if (j + 1 === col) {
							// Для последней ячейки 
							for (var k = i; k <= i + 1; k++) {
								for (var n = j - 1; n <= j; n++) {
									if (field[k][n] === 0) count++;
								}
							}							
						} else {
							// Для остальных элементов первой строки
							for (var k = i; k <= i + 1; k++) {
								for (var n = j - 1; n <= j + 1; n++) {
									if (field[k][n] === 0) count++;
								}
							}							
						}
					} else if (i + 1 === row) {
						// Для последней строки
						if (j - 1 < 0) {
							// Для первой ячейки
							for (var k = i - 1; k <= i; k++) {
								for (var n = j; n <= j + 1; n++) {
									if (field[k][n] === 0) count++;
								}
							}
						} else if (j + 1 === col) {
							// Для последней ячейки 
							for (var k = i - 1; k <= i; k++){
								for (var n = j - 1; n <= j; n++) {
									if (field[k][n] === 0) count++;
								}
							}
						} else {
							// Для остальных элементов последней строки
							for (var k = i - 1; k <= i; k++) {
								for (var n = j - 1; n <= j + 1; n++) {
									if (field[k][n] === 0) count++;
								}
							}
						}
					} else if (j - 1 < 0) {
						// Для первого столбца (без 1й и последней ячейки)
						for (var k = i - 1; k <= i + 1; k++) {
							for (var n = j; n <= j + 1; n++) {
								if (field[k][n] === 0) count++;
							}
						}
					} else if (j + 1 === col) {
						// Для последнего столбца (без 1й и последней ячейки)
						for (var k = i - 1; k <= i + 1; k++) {
							for (var n = j - 1; n <= j; n++) {
								if (field[k][n] === 0) count++;
							}
						}
					}
					if (count !== 0) field[i][j] = count;
				}
			}
		}
	};

	// Проверяем есть ли мина в данной ячейке и отображаем ее содержимое
	this.checkCell = function(position, id) {
		var cellContent = this.field[position[0]][position[1]];		
		if (cellContent === 0) { // если есть мина
			view.displayContent(cellContent, id); // Отображаем
			this.userView[position[0]][position[1]]	= 0; // Отмечаем что эта ячейка открыта	
			// Открываем остальные мины
			this.openMines(this.minesPosition);
			return true;
		} else if (cellContent === -1) { // если пусто	
			view.displayContent(cellContent, id); // Отображаем
			this.userView[position[0]][position[1]]	= 0; // отмечаем что эта ячейка открыта
			countOpenCells++;
			// Теперь нужно открыть все пустые примыкающие ячейки, открывать их нужно до тех пор
			// пока вокруг пустых ячеек не образуется "кольцо" из чисел
			this.displayAroundEmptyCell(this.field, position);			
			return false;
		} else { // если число			
			view.displayContent(cellContent, id); // Отображаем
			this.userView[position[0]][position[1]]	= 0; // отмечаем что эта ячейка открыта	
			countOpenCells++;
			return false;
		}
	};

	this.openMines = function(minesPosition) {
		for (var i = 0; i < minesPosition.length; i++) {
			var id = minesPosition[i][0] + "-" + minesPosition[i][1];
			if (this.userView[minesPosition[i][0]][minesPosition[i][1]] === 0) {
				continue; // Для пропуска первой открытой мины
			} else if (this.userView[minesPosition[i][0]][minesPosition[i][1]] === 1) {
				view.displayContent(10, id); // первый аргумент сообщает что на мине стоит флаг
			} else {
				view.displayContent(0, id); // первый аргумент сообщает что на мине стоит флаг
			}			
		}
	};

	// Откываем ячейки вокруг пустой 
	this.displayAroundEmptyCell = function(field, emptyCellPosition) {
		// Открытая пустая ячейка является центром квадрата 3х3 вокруг которого проверяем какие ячейки открыть
		// Если соседняя ячейка пустая, то выполняем для нее эту же функцию
		var centerRow = Number(emptyCellPosition[0]);
		var centerCol = Number(emptyCellPosition[1]);
		if (centerRow - 1 < 0) {			
			if (centerCol - 1 < 0) {

				startRow = centerRow;
				endRow = centerRow + 1;			
				startCol = centerCol;
				endCol = centerCol + 1;
				this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);				
			} else if (centerCol + 1 === field[0].length) {

				startRow = centerRow;
				endRow = centerRow + 1;			
				startCol = centerCol - 1;
				endCol = centerCol;
				this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);				
			} else {

				startRow = centerRow;
				endRow = centerRow + 1;			
				startCol = centerCol - 1;
				endCol = centerCol + 1;
				this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);					
			}
		} else if (centerRow + 1 === field.length) {
			if (centerCol - 1 < 0) {

				startRow = centerRow - 1;
				endRow = centerRow;			
				startCol = centerCol;
				endCol = centerCol + 1;
				this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);				
			} else if (centerCol + 1 === field[0].length) {

				startRow = centerRow - 1;
				endRow = centerRow;		 	
				startCol = centerCol - 1;
				endCol = centerCol;
				this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);					
			} else {

				startRow = centerRow - 1;
				endRow = centerRow;			
				startCol = centerCol - 1;
				endCol = centerCol + 1;
				this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);					
			}
		} else if (centerCol - 1 < 0) {
			
			startRow = centerRow - 1;
			endRow = centerRow + 1;			
			startCol = centerCol;
			endCol = centerCol + 1;
			this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);			
		} else if (centerCol + 1 === field[0].length) {
			startRow = centerRow - 1;
			endRow = centerRow + 1;			
			startCol = centerCol - 1;
			endCol = centerCol;
			this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);			
		} else {
			
			startRow = centerRow - 1;
			endRow = centerRow + 1;			
			startCol = centerCol - 1;
			endCol = centerCol + 1;
			this.cycleForDisplayAroundEmptyCell(startRow, endRow, startCol, endCol, field);			
		}
	};

	this.cycleForDisplayAroundEmptyCell = function(startRow, endRow, startCol, endCol, field) {
		for (var i = startRow; i <= endRow; i++) {
			for (var j = startCol; j <= endCol; j++) {
				var id = i + "-" + j;									
				if (this.userView[i][j] === 0) continue;
				if (field[i][j] > 0) {
					view.displayContent(field[i][j], id);
					this.userView[i][j] = 0;
					countOpenCells++;
				} else if (field[i][j] === -1) {
					view.displayContent(field[i][j], id);
					this.userView[i][j] = 0;
					countOpenCells++;
					this.displayAroundEmptyCell(field, [i, j])
				}
			}
		}
	};
}