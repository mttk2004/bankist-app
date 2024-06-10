'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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
const displayMovements = function (movements, sort = false) {
  // Step 0; check if sort is needed
  const movs = sort ? movements.slice().sort((a, b) => a - b)
                    : movements;
  
  // Step 1: remove the content of the container
  containerMovements.innerHTML = '';
  
  // Step 2: display movements
  movs.forEach(function(mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    
    const movRow =
        `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>`;
    
    containerMovements.insertAdjacentHTML("afterbegin", movRow);
  });
}


// Display balance
const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0).toFixed(2);
  labelBalance.textContent = `${acc.balance}€`;
}


// Display summary
const calcDisplaySummary = function (acc) {
  const sumIn = acc.movements
                   .filter(mov => mov > 0)
                   .reduce((acc, mov) => acc + mov, 0)
                   .toFixed(2)
  labelSumIn.textContent = `${sumIn}€`
  
  const sumOut = acc.movements
                    .filter(mov => mov < 0)
                    .reduce((acc, mov) => acc + mov, 0)
                    .toFixed(2)
  labelSumOut.textContent = `${Math.abs(sumOut)}€`
  
  const interest = acc.movements
                      .filter(mov => mov > 0)
                      .map(deposit => deposit * acc.interestRate / 100)
                      .reduce((acc, el) => acc + el, 0)
                      .toFixed(2)
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
  if (currentAccount?.pin === +pin) { // Login successfully
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
  const amount = +inputTransferAmount.value;
  inputTransferTo.value = inputTransferAmount.value = '';
  
  // Step 2: transfer
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


// CLOSE ACCOUNT FUNCTIONALITY
btnClose.addEventListener('click', function(e) {
  e.preventDefault();
  
  // Step 1: close account inputs validating
  const username = inputCloseUsername.value;
  const pin = +inputClosePin.value;
  
  if (!username ?? !pin) {
    alert('Something went wrong!');
    return;
  }
  
  if (username === currentAccount.username
      && pin === currentAccount.pin
  ) {
    accounts.splice(
        accounts.findIndex(
            acc => acc.username === username), 1);
    
    inputCloseUsername.value = inputClosePin.value = '';
    containerApp.classList.remove("active");
    labelWelcome.textContent = 'Log in to get started';
    alert('Your account has been closed! Goodbye!');
  }
});


// REQUEST LOAN FUNCTIONALITY
btnLoan.addEventListener('click', function(e) {
  e.preventDefault();
  
  const amount = Math.floor(inputLoanAmount.value);
  
  if (amount > 0 && currentAccount.movements
                                  .some(mov => mov >= amount)
  ) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
    alert('Your loan request is approved!');
  } else {
    alert('Your loan request is refused!');
  }
  
  inputLoanAmount.value = '';
});


// SORT MOVEMENTS FUNCTIONALITY
let sortNeeded = false;
btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  
  sortNeeded = !sortNeeded;
  displayMovements(currentAccount.movements, sortNeeded);
});


// Set currentAccount
let currentAccount = null;


let i = .1;
let j = .2;

console.log(+(i + j).toFixed(1));
console.log(i + j)
console.log(+'800' + 1)
console.log(7384578653)
