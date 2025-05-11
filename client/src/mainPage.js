// client/src/mainPage.js

// Элементы интерфейса
let monster, coinsDisplay, healthDisplay, damageContainer;

// Конфигурация
const API_URL = 'http://localhost:5000';

// Состояние игры
let gameState = {
    coins: 0,
    health: 100,
    level: 1,
    damage: 1,
    isAlive: true
};

// Инициализация DOM элементов
function initDOMElements() {
    monster = document.getElementById('monster');
    coinsDisplay = document.getElementById('coins');
    healthDisplay = document.querySelector('.health');
    damageContainer = document.getElementById('damageContainer');
}

// Инициализация игры
async function initGame() {
    try {
        const response = await fetch(`${API_URL}/load`);
        const savedData = await response.json();

        Object.assign(gameState, {
            coins: savedData.coins || 0,
            level: savedData.level || 1,
            damage: savedData.damage || 1
        });

        updateUI();
    } catch (error) {
        console.error("Ошибка загрузки:", error);
    }
}

// Сохранение игры
async function saveGame() {
    try {
        await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                coins: gameState.coins,
                level: gameState.level,
                damage: gameState.damage
            })
        });
    } catch (error) {
        console.error("Ошибка сохранения:", error);
    }
}

// Обновление интерфейса
function updateUI() {
    if (coinsDisplay) coinsDisplay.textContent = gameState.coins;
    if (healthDisplay) healthDisplay.textContent = `Здоровье: ${gameState.health}`;
}

// Обработчик клика по монстру
function setupEventListeners() {
    if (!monster) return;

    monster.addEventListener('click', async function (e) {
        if (!gameState.isAlive) return;

        gameState.health -= gameState.damage;

        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${gameState.damage}`;
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        damageContainer.appendChild(damageText);

        setTimeout(() => {
            damageText.style.transform = 'translateY(-50px)';
            damageText.style.opacity = '0';
        }, 10);

        setTimeout(() => damageText.remove(), 1000);

        if (gameState.health <= 0) {
            gameState.isAlive = false;
            monster.src = "image/dead_monster1.png";

            gameState.coins += 100;
            gameState.health = 100;

            await saveGame();
            updateUI();

            setTimeout(() => {
                gameState.isAlive = true;
                monster.src = "image/tralalelo.png";
            }, 2000);
        }

        updateUI();
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    initDOMElements();
    setupEventListeners();
    initGame();
});

module.exports = {
    gameState,
    initGame,
    saveGame,
    updateUI,
    initDOMElements,
    setupEventListeners
};
