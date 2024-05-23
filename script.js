'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// Create username
const createUsername = function(account) {
  account.username = account.owner
                            .trim()
                            .toLowerCase()
                            .split(" ")
                            .map(word => word[0])
                            .join("")
}

accounts.forEach(acc => createUsername(acc))


// Display movements
const displayMovements = function (movements) {
  // Step 1: remove the content of the container
  containerMovements.innerHTML = '';
  
  // Step 2: display movements
  movements.forEach(function(mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    
    const movRow =
        `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>`;
    
    containerMovements.insertAdjacentHTML("afterbegin", movRow);
  });
}


// Display balance
const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
}


// Display summary
const calcDisplaySummary = function (acc) {
  const sumIn = acc.movements
                       .filter(mov => mov > 0)
                       .reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = `${sumIn}€`
  
  const sumOut = acc.movements
                        .filter(mov => mov < 0)
                        .reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = `${Math.abs(sumOut)}€`
  
  const interest = acc.movements
                          .filter(mov => mov > 0)
                          .map(deposit => deposit * acc.interestRate / 100)
                          .reduce((acc, el) => acc + el, 0)
  labelSumInterest.textContent = `${interest}€`
}


// Update UI
const updateUI = function (acc) {
  displayMovements(acc.movements);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
}


// LOGIN FUNCTIONALITY
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  
  // Step 1: Login inputs handler
  const username = inputLoginUsername.value;
  const pin = inputLoginPin.value;
  
  if (!username || !pin) {
    alert("Please fill up the fields!");
    return;
  }
  
  currentAccount = accounts.find(acc => acc.username === username);
  
  
  // Step 2: Login authenticating
  if (currentAccount?.pin === Number(pin)) { // Login successfully
    // Remove input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
    
    // Display welcome message
    labelWelcome.textContent = `Hello, ${currentAccount.owner.split(' ')[0]}`;
    
    // Display app
    containerApp.classList.add("active");
    updateUI(currentAccount);
  } else { // Login failed
    containerApp.classList.remove("active");
    alert("Something went wrong!");
  }
});


// TRANSFER MONEY FUNCTIONALITY
btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();
  
  // Step 1: transfer inputs validating
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = Number(inputTransferAmount.value);
  inputTransferTo.value = inputTransferAmount.value = '';
  
  if (amount > 0
      && receiverAcc
      && currentAccount.balance >= amount
      && receiverAcc !== currentAccount) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUI(currentAccount);
  } else {
    alert('Something went wrong');
  }

});


// Set currentAccount
let currentAccount = null;
