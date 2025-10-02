const image = new Image();
image.src = "assets/egg1.jpg";

const unlockedAreas = []; // 存已解鎖區域

let startPoint = null; // 起始畫線點

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
 x: canvas.width -  0,
  y: canvas.height - 0,
  size: 20,
  speed: 1.5,
  dx: 0,
  dy: 0,
  trail: [],
  isDrawing: false,
  alive: true,
};

const enemy = {
  x: 100,
  y: 100,
  size: 20,
  dx: 2,
  dy: 2,
};
// 建立 maskCanvas（用於像素計算）
const maskCanvas = document.createElement("canvas");
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
const maskCtx = maskCanvas.getContext("2d");

//3. 在 draw() 中顯示百分比（加入底部 UI）
function drawUnlockPercent() {
  const imageData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
  let unlockedPixels = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i]; // 只看紅色通道（因為塗白了）
    if (r === 255) unlockedPixels++;
  }

  const totalPixels = canvas.width * canvas.height;
  const percent = (unlockedPixels / totalPixels) * 100;

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText(`已解鎖 ${percent.toFixed(1)}%`, 20, 30);
}


const keys = {};

// 鍵盤控制保留（電腦可測）
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " ") {
    player.isDrawing = true;
    startPoint = { x: player.x, y: player.y };
  }

  const drawButton = document.getElementById("drawButton");

drawButton.addEventListener("mousedown", () => {
  player.isDrawing = true;
  startPoint = { x: player.x, y: player.y };
});

drawButton.addEventListener("mouseup", () => {
  player.isDrawing = false;

  if (player.trail.length > 5) {
    const first = player.trail[0];
    const last = player.trail[player.trail.length - 1];
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const closed = dist < 20;
    let enclosedHeart = false;

    if (closed && startPoint) {
      for (let pt of player.trail) {
        const dx = pt.x - startPoint.x;
        const dy = pt.y - startPoint.y;
        if (Math.abs(dx) <= 20 && Math.abs(dy) <= 20) {
          enclosedHeart = true;
          break;
        }
      }
    }

    if (closed && enclosedHeart) {
      unlockedAreas.push({
        path: [...player.trail],
        opacity: 0,
        animating: true,
      });

      maskCtx.save();
      maskCtx.beginPath();
      maskCtx.moveTo(player.trail[0].x, player.trail[0].y);
      for (let pt of player.trail) maskCtx.lineTo(pt.x, pt.y);
      maskCtx.closePath();
      maskCtx.fillStyle = "white";
      maskCtx.fill();
      maskCtx.restore();

      //解鎖後 1秒 愛心清除
        setTimeout(() => {
    startPoint = null;
  }, 1000); // 1秒後清除 ♥
    }
  }

  player.trail = [];
});

});
document.addEventListener("keyup", e => {
  keys[e.key] = false;
  if (e.key === " ") {
    player.isDrawing = false;

    // 判斷是否封閉：首尾點距離小於20px
    if (player.trail.length > 5) {
      const first = player.trail[0];
      const last = player.trail[player.trail.length - 1];
      const dx = first.x - last.x;
      const dy = first.y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

  //     if (dist < 20) {
  //      unlockedAreas.push({
  //   path: [...player.trail],
  //   opacity: 0,         // 初始透明
  //   animating: true     // 開啟淡入動畫
  // });
  //     }

  // 判斷是否封閉（首尾相連 + 有包含 startPoint 附近）
const closed = dist < 20;
let enclosedHeart = false;

if (closed && startPoint) {
  // 檢查 trail 中是否至少有一點進入愛心區域 ±20px
  for (let pt of player.trail) {
    const dx = pt.x - startPoint.x;
    const dy = pt.y - startPoint.y;
    if (Math.abs(dx) <= 20 && Math.abs(dy) <= 20) {
      enclosedHeart = true;
      break;
    }
  }
}

if (closed && enclosedHeart) {
  unlockedAreas.push({
    path: [...player.trail],
    opacity: 0,
    animating: true
  });

  // ✅ 畫到 maskCanvas
  maskCtx.save();
  maskCtx.beginPath();
  maskCtx.moveTo(player.trail[0].x, player.trail[0].y);
  for (let pt of player.trail) maskCtx.lineTo(pt.x, pt.y);
  maskCtx.closePath();
  maskCtx.fillStyle = "white";
  maskCtx.fill();
  maskCtx.restore();
}

        // ✅ 把這區塊畫到 maskCanvas 上（當成解鎖標記）
maskCtx.save();
maskCtx.beginPath();
maskCtx.moveTo(player.trail[0].x, player.trail[0].y);
for (let pt of player.trail) maskCtx.lineTo(pt.x, pt.y);
maskCtx.closePath();
maskCtx.fillStyle = "white";
maskCtx.fill();
maskCtx.restore();
    }

    player.trail = [];
  }
});


// 設定 nipplejs 虛擬搖桿
let joystick = nipplejs.create({
  zone: document.getElementById("joystickZone"),
  mode: 'static',
  position: { left: '60px', bottom: '60px' },
  color: 'white'
});

joystick.on("move", function (evt, data) {
  const angle = data.angle.degree;
  const force = data.force;

  const radians = angle * (Math.PI / 180);
  player.dx = Math.cos(radians) * player.speed * (force / 2);
  player.dy = -Math.sin(radians) * player.speed * (force / 2); // ✅ 修正Y方向
  
});

joystick.on("end", () => {
  player.dx = 0;
  player.dy = 0;
});

function movePlayer() {
  if (!player.alive) return;

  // 鍵盤方向優先（可關閉這段強制用搖桿）
  let up = keys["ArrowUp"];
  let down = keys["ArrowDown"];
  let left = keys["ArrowLeft"];
  let right = keys["ArrowRight"];

  if (up) player.dy = -player.speed;
  if (down) player.dy = player.speed;
  if (left) player.dx = -player.speed;
  if (right) player.dx = player.speed;

  player.x += player.dx;
  player.y += player.dy;

  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));

  if (player.isDrawing) {
    player.trail.push({ x: player.x, y: player.y });
  }
}

function moveEnemy() {
  enemy.x += enemy.dx;
  enemy.y += enemy.dy;
  if (enemy.x < 0 || enemy.x > canvas.width) enemy.dx *= -1;
  if (enemy.y < 0 || enemy.y > canvas.height) enemy.dy *= -1;
}

function checkCollision() {
  const dx = enemy.x - player.x;
  const dy = enemy.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist < enemy.size + player.size) player.alive = false;

  for (let p of player.trail) {
    if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < enemy.size) {
      player.alive = false;
      break;
    }
  }
}



function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔒 黑色遮罩底
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🔓 解鎖區域剪裁
  for (let area of unlockedAreas) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(area.path[0].x, area.path[0].y);
    for (let pt of area.path) ctx.lineTo(pt.x, pt.y);
    ctx.closePath();
    ctx.clip();

    if (area.animating && area.opacity < 1) {
      area.opacity += 0.03;
      if (area.opacity >= 1) {
        area.opacity = 1;
        area.animating = false;
      }
    }

    ctx.globalAlpha = area.opacity;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 🎯 愛心符號和圈圈
  if (startPoint) {
    ctx.fillStyle = "red";
    ctx.font = "24px serif";
    ctx.fillText("♥", startPoint.x - 10, startPoint.y + 10);

    // 淡紅色圈圈指示範圍 ±20px
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ✏️ Trail 線
  if (player.trail.length > 1) {
    const isNearEdge =
      player.x < 50 || player.x > canvas.width - 50 ||
      player.y < 50 || player.y > canvas.height - 50;

    ctx.lineWidth = isNearEdge ? 15 : 5;
    ctx.strokeStyle = `hsl(${Date.now() % 360}, 100%, 60%)`;

    ctx.beginPath();
    ctx.moveTo(player.trail[0].x, player.trail[0].y);
    for (let pt of player.trail) ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  // 🟢 玩家
  if (player.alive) {
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "red";
    ctx.font = "48px sans-serif";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
  }

  // 🔶 敵人
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
  ctx.fill();
}



function gameLoop() {
  movePlayer();
  moveEnemy();
  checkCollision();
  draw();
  requestAnimationFrame(gameLoop);
  drawUnlockPercent(); // 顯示解鎖百分比
}

gameLoop();
