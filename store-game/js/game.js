const products = ['御飯糰', '咖啡', '便當', '茶'];
let current = '';
let coins = parseInt(localStorage.getItem('coins') || '0');
let timeLeft = 60;

function newOrder() {
  current = products[Math.floor(Math.random() * products.length)];
  document.getElementById('currentOrder').textContent = current;
}

function checkOrder(choice) {
  if (choice === current) {
    coins += 10;
    localStorage.setItem('coins', coins);
    document.getElementById('coins').textContent = coins;
    newOrder();
    // 加音效
    const ding = new Audio('assets/sounds/ding.mp3');
    ding.play();
  } else {
    coins = Math.max(0, coins - 5);
    localStorage.setItem('coins', coins);
    document.getElementById('coins').textContent = coins;
    alert('錯了！扣5金幣');
  }
}

function countdown() {
  if (timeLeft > 0) {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
  } else {
    alert('遊戲結束，你賺了 ' + coins + ' 金幣');
    clearInterval(timer);
  }
}

document.getElementById('coins').textContent = coins;
newOrder();
const timer = setInterval(countdown, 1000);
