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
    '2024-05-18T14:11:59.604Z',
    '2024-06-01T17:01:17.194Z',
    '2024-06-09T23:36:17.929Z',
    '2024-06-11T10:51:36.790Z',
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


// Format movement date
const formatMovementDate = function(date, locale) {
  const calcdaysPassed = (day, anotherDay) => Math.round(Math.abs(
      (day - anotherDay) / ( 24 * 60 * 60 * 1000)
  ))
  
  const daysPassed = calcdaysPassed(new Date(), date)
  
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 6) return `${daysPassed} days ago`;
  if (daysPassed <= 30) return `${Math.trunc(daysPassed / 7)} weeks ago`;
  
  // const year = date.getFullYear();
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const date = `${date.getDate()}`.padStart(2, '0');
  // return `${date}/${month}/${year}`;
  
  return new Intl.DateTimeFormat(locale).format(date);
}


// Format currency
const formatCurrency = function(value, locale, currency) {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    useGrouping: true
  }).format(value);
}


// Display movements
const displayMovements = function (acc, sort = false) {
  const movements = acc.movements;
  
  // Step 0; check if sort is needed
  const movs = sort ? movements.slice().sort((a, b) => a - b)
                    : movements;
  
  // Step 1: remove the content of the container
  containerMovements.innerHTML = '';
  
  // Step 2: display movements
  movs.forEach(function(mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    
    const dateToDisplay = formatMovementDate(new Date(acc.movementsDates[i]), acc.locale);
    const formatedMov = formatCurrency(mov, acc.locale, acc.currency);
    
    const movRow =
        `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
          <div class="movements__date">${dateToDisplay}</div>
          <div class="movements__value">${formatedMov}</div>
        </div>`;
    
    containerMovements.insertAdjacentHTML("afterbegin", movRow);
  });
}


// Display balance
const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0).toFixed(2);
  labelBalance.textContent = new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
    useGrouping: true
  }).format(acc.balance);
}


// Display summary
const calcDisplaySummary = function (acc) {
  const sumIn = acc.movements
                   .filter(mov => mov > 0)
                   .reduce((acc, mov) => acc + mov, 0)
                   .toFixed(2)
  labelSumIn.textContent = `${formatCurrency(sumIn, acc.locale, acc.currency)}`
  
  const sumOut = acc.movements
                    .filter(mov => mov < 0)
                    .reduce((acc, mov) => acc + mov, 0)
                    .toFixed(2)
  labelSumOut.textContent = `${formatCurrency(Math.abs(sumOut), acc.locale, acc.currency)}`
  
  const interest = acc.movements
                      .filter(mov => mov > 0)
                      .map(deposit => deposit * acc.interestRate / 100)
                      .reduce((acc, el) => acc + el, 0)
                      .toFixed(2)
  labelSumInterest.textContent = `${formatCurrency(interest, acc.locale, acc.currency)}`
}


// Display datetime
const displayDatetime = function () {
  // const locale = navigator.language;
  const options = {
    minute: 'numeric',
    hour: '2-digit',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  
  labelDate.textContent = new Intl
      .DateTimeFormat(currentAccount.locale, options)
      .format(new Date());
}


// Start logout timer
const startLogoutTimer = function() {
  let time = 30;
  
  const tick = function() {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    
    labelTimer.textContent = `${min}:${sec}`;
    
    if (time-- === 0) {
      containerApp.classList.remove('active');
      labelWelcome.textContent = 'Log in to get started';
      currentAccount = null;
      clearInterval(timer);
    }
  }
  
  tick();
  const timer = setInterval(tick, 1000);
  
  return timer;
}


// Update UI
const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayDatetime();
}


// LOGIN FUNCTIONALITY
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  
  clearInterval(timer);
  
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
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
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
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date());
    updateUI(currentAccount);
    
    // reset timer
    clearInterval(timer)
    timer = startLogoutTimer()
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
    currentAccount.movementsDates.push(new Date());
    updateUI(currentAccount);
    alert('Your loan request is approved!');
    
    // reset timer
    clearInterval(timer)
    timer = startLogoutTimer()
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
  displayMovements(currentAccount, sortNeeded);
});


// Set currentAccount
let currentAccount = null;
let timer;


// Fake login
// currentAccount = account1;
// containerApp.classList.add("active");
// updateUI(currentAccount);

