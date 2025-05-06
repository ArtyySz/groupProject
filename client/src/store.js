let gameState = {
    coins: 0,
    damage: 1,
    damage_upgrade_price: 20,
    damage_upgrades: 0,
    coins_per_second: 0,
    cps_upgrades: 0,
    cps_upgrade_price: 20
};


async function loadGameData() {
    try {
        const response = await fetch('http://localhost:5001/load');
        const data = await response.json();

        if (data.error) {
            console.error("Server error:", data.error);
            return null;
        }

        gameState.coins = data.coins || 0;
        gameState.damage = data.damage || 1;
        gameState.damage_upgrade_price = data.damage_upgrade_price || 20;
        gameState.damage_upgrades = data.damage_upgrades || 0;
        gameState.coins_per_second = data.coins_per_second || 0;
        gameState.cps_upgrades = data.cps_upgrades || 0;
        gameState.cps_upgrade_price = data.cps_upgrade_price || 20;

        updateShopUI();
        updateCoinDisplay();
        return data;
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        return null;
    }
}


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


function updateShopUI() {
    
    const damagePriceElement = document.getElementById('damage-price');
    if (damagePriceElement) {
        damagePriceElement.textContent = gameState.damage_upgrade_price;
    }

    
    const cpsPriceElement = document.getElementById('cps-price');
    if (cpsPriceElement) {
        cpsPriceElement.textContent = gameState.cps_upgrade_price;
    }
}


function showPurchaseEffect() {
    const itemButtons = document.querySelectorAll('.item');
    itemButtons.forEach(button => {
        button.classList.add('purchased');
        setTimeout(() => {
            button.classList.remove('purchased');
        }, 1000);
    });
}


async function initShop() {
    await loadGameData();

    document.querySelector('.back').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mainPage.html';
    });

   
    setInterval(async () => {
        gameState.coins += gameState.coins_per_second;
        updateCoinDisplay();
        await saveGameData(gameState);
    }, 1000);
}

initShop();