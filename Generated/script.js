document.addEventListener("DOMContentLoaded", () => {
  const coinDisplay = document.getElementById("coin-balance");
  let coins = parseInt(localStorage.getItem("coins")) || 0;
  coinDisplay.textContent = `金幣餘額: ${coins}`;

  document.querySelectorAll(".purchase-options button").forEach(btn => {
    btn.addEventListener("click", () => {
      const amount = parseInt(btn.dataset.coins);
      coins += amount;
      localStorage.setItem("coins", coins);
      coinDisplay.textContent = `金幣餘額: ${coins}`;
      showCoinAnimation(amount);
    });
  });

  function showCoinAnimation(amount) {
    const container = document.getElementById("coin-animation-container");
    const coin = document.createElement("div");
    coin.className = "coin";
    coin.textContent = `+${amount}`;
    container.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
  }
});
