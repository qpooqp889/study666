  const pools = {
      normal: [
        { name: "藍色運動風", rarity: "一般", icon: "🔵" },
        { name: "夏日泳圈蛋", rarity: "稀有", icon: "🏖️" },
        { name: "星際探險家", rarity: "超稀有", icon: "🌌" }
      ],
      limited: [
        { name: "萬聖南瓜蛋", rarity: "限定", icon: "🎃" },
        { name: "聖誕雪人皮", rarity: "限定", icon: "⛄" }
      ]
    };

    let pityCounter = parseInt(localStorage.getItem("pity") || "0");

    function drawCardWithPity(poolType = "normal") {
      const pool = pools[poolType];
      const superRareItems = pool.filter(i => i.rarity === "超稀有");
      let drawnItem;

      if (pityCounter >= 9 && superRareItems.length > 0) {
        drawnItem = superRareItems[Math.floor(Math.random() * superRareItems.length)];
        pityCounter = 0;
      } else {
        drawnItem = pool[Math.floor(Math.random() * pool.length)];
        if (drawnItem.rarity === "超稀有") pityCounter = 0;
        else pityCounter++;
      }

      localStorage.setItem("pity", pityCounter);
      saveDrawHistory(drawnItem);
      alert(`🎉 抽中了：${drawnItem.name}（${drawnItem.rarity}）${drawnItem.icon}`);
      generateShareImage(drawnItem);
    }

    function saveDrawHistory(item) {
      const history = JSON.parse(localStorage.getItem("gachaHistory") || "[]");
      history.push({ ...item, time: Date.now() });
      localStorage.setItem("gachaHistory", JSON.stringify(history));
      updateCollection();
    }

    function updateCollection() {
      const history = JSON.parse(localStorage.getItem("gachaHistory") || "[]");
      const owned = {};
      history.forEach(item => owned[item.name] = item);

      let html = "<h2>🏆 已收集皮膚</h2><ul>";
      Object.values(owned).forEach(item => {
        html += `<li>${item.icon} ${item.name}（${item.rarity}）</li>`;
      });
      html += "</ul>";
      document.getElementById("collection").innerHTML = html;
    }

    function checkDailyReward() {
      const lastClaim = localStorage.getItem("lastDaily");
      const today = new Date().toDateString();
      if (lastClaim !== today) {
        alert("🎁 每日簽到成功，獲得1次抽卡機會！");
        const count = parseInt(localStorage.getItem("freeDraws") || "0");
        localStorage.setItem("freeDraws", count + 1);
        localStorage.setItem("lastDaily", today);
      } else {
        alert("✅ 今天已簽到過！");
      }
    }

    function openShop() {
      const shop = [
        { name: "牆上海報", price: 2, icon: "🖼️" },
        { name: "蛋仔地毯", price: 3, icon: "🧶" },
        { name: "派對燈飾", price: 4, icon: "🎇" }
      ];
      const ownedSkins = JSON.parse(localStorage.getItem("gachaHistory") || "[]").length;
      let html = "<h2>🧰 裝飾商城</h2><ul>";
      shop.forEach(item => {
        html += `<li>${item.icon} ${item.name} - ${item.price}張皮膚 <button onclick=\"buyDecoration('${item.name}', ${item.price})\">購買</button></li>`;
      });
      html += "</ul>";
      document.getElementById("shop").innerHTML = html;
    }

    function buyDecoration(name, cost) {
      const ownedSkins = JSON.parse(localStorage.getItem("gachaHistory") || "[]").length;
      const purchased = JSON.parse(localStorage.getItem("decor") || "[]");
      if (ownedSkins >= cost) {
        alert(`購買成功 🎉：${name}`);
        purchased.push(name);
        localStorage.setItem("decor", JSON.stringify(purchased));
      } else {
        alert("❌ 皮膚數不足，無法兌換！");
      }
    }

    function generateShareImage(item) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffeaa7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "28px sans-serif";
      ctx.fillStyle = "#2d3436";
      ctx.fillText(`我抽到了！${item.icon}`, 50, 80);
      ctx.fillText(`${item.name}（${item.rarity}）`, 50, 130);
      const img = new Image();
      img.src = canvas.toDataURL("image/png");
      document.getElementById("shareImg").innerHTML = "";
      document.getElementById("shareImg").appendChild(img);
    }