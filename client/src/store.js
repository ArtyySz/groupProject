let gameState = {
    coins: 0,
    damage: 1,
    damage_upgrade_price: 20,
    damage_upgrades: 0,
    coins_per_second: 0,
    cps_upgrades: 0,
    cps_upgrade_price: 20
};

// Загрузка данных из сервера
async function loadGameData() {
    try {
        const response = await fetch('http://localhost:5001/load');
        const data = await response.json();
        
        if (data.error) {
            console.error("Server error:", data.error);
            return null;
        }

        gameState = {
            coins: data.coins,
            level: data.level || 1,  // Добавляем уровень
            damage: data.damage,
            damage_upgrade_price: data.damage_upgrade_price,
            damage_upgrades: data.damage_upgrades,
            coins_per_second: data.coins_per_second,
            cps_upgrades: data.cps_upgrades,
            cps_upgrade_price: data.cps_upgrade_price,
            monster_health: data.monster_health || 100  // Добавляем здоровье монстра
        };

        updateShopUI();
        updateCoinDisplay();
        return data;
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        return null;
    }
}

// Сохранение данных на сервер
async function saveGameData(data) {
    try {
        await fetch('http://localhost:5001/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}

// Обработчик покупки
async function handleClick(itemType) {
    if (itemType === "+1 за клик") {
        if (gameState.coins >= gameState.damage_upgrade_price) {
            gameState.coins -= gameState.damage_upgrade_price;
            gameState.damage += 3;
            gameState.damage_upgrades += 1;
            gameState.damage_upgrade_price = Math.floor(20 * Math.pow(1.1, gameState.damage_upgrades));

            await saveGameData(gameState);
            updateShopUI();
            updateCoinDisplay();
            showPurchaseEffect();
        } else {
            alert("Недостаточно монет!");
        }
    } else if (itemType === "+1 в секунду") {
        if (gameState.coins >= gameState.cps_upgrade_price) {
            gameState.coins -= gameState.cps_upgrade_price;
            gameState.coins_per_second += 1;
            gameState.cps_upgrades += 1;
            gameState.cps_upgrade_price = Math.floor(gameState.cps_upgrade_price * 1.1);

            await saveGameData(gameState);
            updateShopUI();
            updateCoinDisplay();
            showPurchaseEffect();
        } else {
            alert("Недостаточно монет!");
        }
    }
}

function updateCoinDisplay() {
    const coinDisplay = document.getElementById('player-coins');
    if (coinDisplay) {
        coinDisplay.textContent = gameState.coins;
    }
}

// Обновление UI магазина
function updateShopUI() {
    // Обновляем цену урона
    const damagePriceElement = document.getElementById('damage-price');
    if (damagePriceElement) {
        damagePriceElement.textContent = gameState.damage_upgrade_price;
    }
    
    // Обновляем цену монет в секунду (добавляем ID в HTML)
    const cpsPriceElement = document.getElementById('cps-price');
    if (cpsPriceElement) {
        cpsPriceElement.textContent = gameState.cps_upgrade_price;
    }
}

// Эффект покупки
function showPurchaseEffect() {
    const itemButtons = document.querySelectorAll('.item');
    itemButtons.forEach(button => {
        button.classList.add('purchased');
        setTimeout(() => {
            button.classList.remove('purchased');
        }, 1000);
    });
}

// Инициализация магазина
async function initShop() {
    await loadGameData();

    document.querySelector('.back').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mainPage.html';
    });

    // Пассивный доход
    setInterval(async () => {
        gameState.coins += gameState.coins_per_second;
        updateCoinDisplay();
        await saveGameData(gameState);
    }, 1);
}

initShop();