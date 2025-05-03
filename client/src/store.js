let gameState = {
    coins: 0,
    damage: 1,
    damage_upgrade_price: 20,
    damage_upgrades: 0
};


// Загрузка данных из сервера
async function loadGameData() {
    try {
        const response = await fetch('http://localhost:5001/load');
        const data = await response.json();
        gameState = {
            ...gameState,
            ...data
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
            // Обновляем состояние
            gameState.coins -= gameState.damage_upgrade_price;
            gameState.damage += 1;
            gameState.damage_upgrades += 1;
            gameState.damage_upgrade_price = Math.floor(20 * Math.pow(1.2, gameState.damage_upgrades));

            try {
                await saveGameData(gameState);
                updateShopUI(); // Обновляем интерфейс после успешного сохранения
                updateCoinDisplay();
                showPurchaseEffect();
            } catch (error) {
                console.error("Ошибка при сохранении:", error);
            }
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

// Обновление цены в интерфейсе
function updateItemPrice() {
    const item = shopItems.damageUpgrade;
    const priceElement = document.querySelector('.item .price-container p');
    if (priceElement) {
        priceElement.textContent = item.price;
    }
}

// Обновление UI
function updateShopUI() {
    // Обновляем только цену
    const priceElement = document.getElementById('damage-price');
    if (priceElement) {
        priceElement.textContent = gameState.damage_upgrade_price;
    }
}

// Эффект покупки
function showPurchaseEffect() {
    const itemButton = document.querySelector('.item');
    itemButton.classList.add('purchased');
    setTimeout(() => {
        itemButton.classList.remove('purchased');
    }, 1000);
}

// Инициализация магазина
async function initShop() {
    const gameData = await loadGameData();
    if (gameData) {
        updateShopUI(gameData);
    }

    document.querySelector('.back').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mainPage.html';
    });
}

initShop();