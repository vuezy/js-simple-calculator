const mainDiv = document.querySelector('main');
const buttons = document.querySelectorAll('button');
const calculatorScreen = document.querySelector('.calculator-screen h1');
const historyButton = document.querySelector('aside');

let currentOperation = '';
let currentOperationLength = 0;
let prevButtonClass = [];
let haveDecSeparator = false;
let showHistory = false;
let historyArray = [];

buttons.forEach((button) => {
  button.addEventListener('click', function() {
    if (checkClickedButton(this.getAttribute('class'))) {
      if (currentOperationLength < 16) {
        let clickedButton = this.innerHTML;
        clickedButton = replaceIconTag(clickedButton);
        currentOperation += clickedButton;
        currentOperationLength++;
        calculatorScreen.innerHTML = useIconTag(currentOperation);
        alterFontSize();
        prevButtonClass.push(this.getAttribute('class'));
      }
    }
  });
});

historyButton.addEventListener('click', function() {
  if (!showHistory) {
    this.children[0].style.display = 'none';
    this.children[1].style.display = 'block';

    mainDiv.children[0].style.display = 'none';
    mainDiv.children[1].style.display = 'none';
    mainDiv.children[2].style.display = 'block';
  }
  else {
    this.children[0].style.display = 'block';
    this.children[1].style.display = 'none';

    mainDiv.children[0].style.display = 'block';
    mainDiv.children[1].style.display = 'block';
    mainDiv.children[2].style.display = 'none';
  }
  showHistory = !showHistory;
});

function replaceIconTag(clickedButton) {
  if (clickedButton === '<i class="fas fa-xmark"></i>') {
    return '*';
  }
  else if (clickedButton === '<i class="fas fa-divide"></i>') {
    return '/';
  }
  else if (clickedButton === '<i class="fas fa-plus"></i>') {
    return '+';
  }
  else if (clickedButton === '<i class="fas fa-minus"></i>') {
    return '-';
  }
  return clickedButton;
}

function useIconTag(operation) {
  let operatorIcons = operation;
  // using regex (positive lookbehind) to match certain characters
  operatorIcons = operatorIcons.replace(/(?<=[^a<-])\*/g, '<i class="fas fa-xmark"></i>');
  operatorIcons = operatorIcons.replace(/(?<=[^a<-])\//g, '<i class="fas fa-divide"></i>');
  operatorIcons = operatorIcons.replace(/(?<=[^a<-])\+/g, '<i class="fas fa-plus"></i>');
  operatorIcons = operatorIcons.replace(/(?<=[^a<-])-/g, '<i class="fas fa-minus"></i>');
  return operatorIcons;
}

function alterFontSize() {
  if (currentOperationLength < 8) {
    calculatorScreen.style.fontSize = '2.5rem';
  }
  else if (currentOperationLength >= 8 && currentOperationLength < 13) {
    calculatorScreen.style.fontSize = (2.2 - 0.1 * (currentOperationLength - 8)) + 'rem';
  }
}

function findDecSeparator(lastIndex) {
  for (let i = lastIndex; i > 0; i--) {
    if (prevButtonClass[i].slice(0, 8) === 'operator') {
      return false;
    }
    if (prevButtonClass[i] === 'dot') {
      return true;
    }
  }
}

function calculate(operationString) {
  const operatorIndex = operationString.search(/[\*/\+-]/);
  const operand1 = parseFloat(operationString.slice(0, operatorIndex));
  const operand2 = parseFloat(operationString.slice(operatorIndex + 1));

  switch (operationString[operatorIndex]) {
    case '*':
      return String(operand1 * operand2);
    case '/':
      const tempResult = operand1 / operand2;
      if (String(tempResult).length > 16) {
        return String(tempResult.toPrecision(16));
      }
      if (isNaN(tempResult)) {
        return 'Error';
      }
      return String(tempResult);
    case '+':
      return String(operand1 + operand2);
    case '-':
      return String(operand1 - operand2);
  }
}

function solveOperations() {
  let operations = currentOperation.replace(/%/g, '/100');

  // multiplication and division first
  const orderOfOperations = ['[0-9.]+[\\*/][0-9.]+', '[0-9.]+[\\+-][0-9.]+'];
  for (let operation of orderOfOperations) {
    const operationRegex = new RegExp(operation);
    while (operations.match(operationRegex)) {
      const match = operations.match(operationRegex);
      const result = calculate(...match);
      operations = operations.replace(operationRegex, result);
    }
  }
  return operations;
}

function addToHistory(result) {
  historyArray[0] = currentOperation;
  historyArray[1] = result;

  const historyRow = document.createElement('div');
  historyRow.className = 'history-row';
  historyRow.innerHTML =
    `<h2>${useIconTag(historyArray[0])}</h2>
    <h1><span>=</span>${historyArray[1]}</h1>`;
  mainDiv.children[2].appendChild(historyRow);
}

function checkClickedButton(buttonClass) {
  const lastIndex = prevButtonClass.length - 1;

  if (buttonClass === 'all-clear') {
    currentOperation = '';
    currentOperationLength = 0;
    calculatorScreen.innerHTML = '0';
    calculatorScreen.style.removeProperty('font-size');
    prevButtonClass = [];
    return false;
  }

  else if (buttonClass === 'backspace') {
    if (currentOperationLength > 0) {
      currentOperation = currentOperation.slice(0, -1);
      currentOperationLength--;
      calculatorScreen.innerHTML = useIconTag(currentOperation);
      alterFontSize();
      if (prevButtonClass[lastIndex].slice(0, 8) === 'operator') {
        haveDecSeparator = findDecSeparator(lastIndex - 1);
      }
      else if (prevButtonClass[lastIndex] === 'dot') {
        haveDecSeparator = false;
      }
      prevButtonClass.pop();
    }

    if (currentOperationLength === 0) {
      calculatorScreen.innerHTML = '0';
    }

    if (prevButtonClass[lastIndex] === 'equal') {
      currentOperation = historyArray[0];
      currentOperationLength = currentOperation.length;
      calculatorScreen.innerHTML = useIconTag(currentOperation);
      alterFontSize();
      prevButtonClass.pop();
    }
    
    return false;
  }

  else if (buttonClass === 'equal') {
    if (prevButtonClass[lastIndex] === 'number') {
      const result = solveOperations();
      currentOperationLength = result.length;
      calculatorScreen.innerHTML = result;
      alterFontSize();

      addToHistory(result);
      currentOperation = '';
      currentOperationLength = 0;
      prevButtonClass.push('equal');
    }
    return false;
  }

  else if (buttonClass.slice(0, 8) === 'operator' && prevButtonClass[lastIndex] !== 'number' && prevButtonClass[lastIndex] !== 'percent') {
    return false;
  }
  else if (buttonClass === 'percent' && prevButtonClass[lastIndex] !== 'number') {
    return false;
  }
  else if (buttonClass === 'number' && prevButtonClass[lastIndex] === 'percent') {
    return false;
  }
  else if (buttonClass === 'dot' && prevButtonClass[lastIndex] !== 'number') {
    return false;
  }
  else if (buttonClass === 'dot' && haveDecSeparator) {
    return false;
  }
  else {
    if (buttonClass.slice(0, 8) === 'operator') {
      haveDecSeparator = false;
    }
    else if (buttonClass === 'dot') {
      haveDecSeparator = true;
    }
    else if (buttonClass === 'number' && prevButtonClass[lastIndex] === 'equal') {
      prevButtonClass = [];
    }
    return true;
  }
}