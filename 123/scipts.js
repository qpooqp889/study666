function getToday() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * 檢查答案是否正確，並根據當天答對情況發金幣
 * @param {string} gameId - 遊戲識別碼，如 "WordGame"
 * @param {number|string} questionIndex - 題目索引或唯一ID
 * @param {Array} sentence - 玩家輸入的陣列
 * @param {Array} correct - 正確答案的陣列
 * @param {Function} onCorrect - 當答對時的回呼，例如顯示UI或播放音效
 */
function checkAnswerAndReward(gameId, questionIndex, sentence, correct, onCorrect) {
  const today = getToday();
  const key = "doneTodayMulti";

  let allGameData = JSON.parse(localStorage.getItem(key) || "{}");
  let gameData = allGameData[gameId] || {};
  let todayDone = gameData[today] || [];

  const isSame = JSON.stringify(sentence) === JSON.stringify(correct);

  if (!isSame) return false;

  if (typeof onCorrect === "function") {
    onCorrect(); // 執行外部 UI 處理
  }

  if (!todayDone.includes(questionIndex)) {
    changeCoins(10);
    todayDone.push(questionIndex);
    gameData[today] = todayDone;
    allGameData[gameId] = gameData;
    localStorage.setItem(key, JSON.stringify(allGameData));
  }

  return true;
}
