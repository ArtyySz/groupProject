document.addEventListener('DOMContentLoaded', function() {
    // ========== Элементы интерфейса ==========
    const monster = document.getElementById('monster');
    const coinsDisplay = document.getElementById('coins');
    const healthDisplay = document.querySelector('.health');
    const damageContainer = document.getElementById('damageContainer');
    const output = document.getElementById('output');
    const btn = document.getElementById('btn');
    
    // ========== Конфигурация ==========
    const API_URL = 'http://localhost:5000';
    
    // ========== Состояние игры ==========
    let gameState = {
        coins: 0,
        health: 100,
        level: 1,
        damage: 1,
        isAlive: true
    };
  
    // ========== Инициализация игры ==========
    async function initGame() {
        try {
            // Загружаем данные игры
            const savedData = await fetch(`${API_URL}/load`).then(res => res.json());
            
            // Обновляем состояние
            Object.assign(gameState, {
                coins: savedData.coins || 0,
                level: savedData.level || 1,
                damage: savedData.damage || 1
            });
            
            // Выводим сообщение с сервера
            if (output) {
                output.textContent = "Добро пожаловать в игру!";
            }
            
            updateUI();
        } catch (error) {
            console.error("Ошибка инициализации:", error);
        }
    }
  
    // ========== Сохранение игры ==========
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
  
    // ========== Обновление интерфейса ==========
    function updateUI() {
        if (coinsDisplay) coinsDisplay.textContent = gameState.coins;
        if (healthDisplay) healthDisplay.textContent = `Здоровье: ${gameState.health}`;
    }
  
    // ========== Обработчик клика по монстру ==========
    if (monster) {
        monster.addEventListener('click', async function() {
            if (!gameState.isAlive) return;
            
            gameState.health -= gameState.damage;
            
            // Эффект урона
            if (damageContainer) {
                const damageText = document.createElement('div');
                damageText.className = 'damage-text';
                damageText.textContent = `-${gameState.damage}`;
                damageContainer.appendChild(damageText);
                setTimeout(() => damageText.remove(), 1000);
            }
            
            if (gameState.health <= 0) {
                gameState.isAlive = false;
                monster.src = "image/dead_monster1.png";
                
                // Награда за убийство
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
  
    // ========== Обработчик кнопки отправки данных ==========
    if (btn) {
        btn.addEventListener('click', async function() {
            try {
                const response = await fetch(`${API_URL}/api/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: "Victor" })
                });
                
                const data = await response.json();
                console.log("Ответ сервера:", data);
            } catch (error) {
                console.error('Ошибка отправки:', error);
            }
        });
    }
  
    // ========== Запуск игры ==========
    initGame();
  
  });
  