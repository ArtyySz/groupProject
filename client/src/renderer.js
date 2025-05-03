document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const monster = document.getElementById('monster');
    const coinsDisplay = document.getElementById('coins');
    const healthDisplay = document.querySelector('.health');
    const damageContainer = document.getElementById('damageContainer');

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
        coinsDisplay.textContent = gameState.coins;
        healthDisplay.textContent = `Здоровье: ${gameState.health}`;
    }

    // Обработчик клика по монстру
    monster.addEventListener('click', async function(e) {
        if (!gameState.isAlive) return;
    
        gameState.health -= gameState.damage;
    
        // Получаем координаты клика относительно monster-area
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        // Создаем эффект урона
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${gameState.damage}`;
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        damageContainer.appendChild(damageText);
    
        // Анимация всплывания
        setTimeout(() => {
            damageText.style.transform = 'translateY(-50px)';
            damageText.style.opacity = '0';
        }, 10);
    
        setTimeout(() => damageText.remove(), 1000);
    
        if (gameState.health <= 0) {
            gameState.isAlive = false;
            monster.src = "image/dead_monster1.png";
    
            // Награда
            gameState.coins += 100;
            gameState.health = 100;
    
            // Создаем эффект награды
            const rewardText = document.createElement('div');
            rewardText.className = 'reward-text';
            rewardText.textContent = `+100 монет!`;
            rewardText.style.left = `${rect.width / 2}px`;
            rewardText.style.top = `${rect.height / 2}px`;
            rewardText.style.color = 'gold';
            rewardText.style.fontSize = '28px';
            rewardText.style.fontWeight = 'bold';
            rewardText.style.textShadow = '1px 1px 2px black';
            damageContainer.appendChild(rewardText);
    
            // Анимация награды
            setTimeout(() => {
                rewardText.style.transform = 'translateY(-100px)';
                rewardText.style.opacity = '0';
            }, 10);
    
            setTimeout(() => rewardText.remove(), 2000);
    
            await saveGame();
            updateUI();
    
            setTimeout(() => {
                gameState.isAlive = true; // Исправлено: было isAlive вместо isAlive
                monster.src = "image/tralalelo.png";
                gameState.health = 100; // Сброс здоровья
                updateUI();
            }, 2000);
        }
    
        updateUI();
    });

    // Запуск игры
    initGame();

  
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
  