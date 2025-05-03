document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const monster = document.getElementById('monster');
    const coinsDisplay = document.getElementById('coins');
    const healthDisplay = document.querySelector('.health');
    const damageContainer = document.getElementById('damageContainer');

    // Конфигурация
    const API_URL = 'http://localhost:5001'; // Убедитесь, что Flask работает на этом порту!

    // Состояние игры
    let gameState = {
        coins: 0,
        health: 100,
        max_health: 100,
        level: 1,
        damage: 1,
        isAlive: true,
        damage_upgrade_price: 20,
        damage_upgrades: 0
    };
    // Загрузка данных из БД
    async function loadGame() {
        try {
            const response = await fetch(`${API_URL}/load`);
            const data = await response.json();

            // Важно: сохраняем ВСЕ поля, включая monster_health
            gameState = {
                ...gameState,  // Старые значения (если новые не пришли)
                coins: data.coins ?? 0,
                level: data.level ?? 1,
                damage: data.damage ?? 1,
                health: data.monster_health ?? gameState.max_health,
                damage_upgrade_price: data.damage_upgrade_price ?? 20,
                damage_upgrades: data.damage_upgrades ?? 0
            };

            updateUI();
        } catch (error) {
            console.error("Ошибка загрузки:", error);
        }
    }
    async function saveGame() {
        try {
            console.log("Сохранение:", gameState);
            const response = await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coins: gameState.coins,
                    level: gameState.level,
                    damage: gameState.damage,
                    monster_health: gameState.health,
                    damage_upgrade_price: gameState.damage_upgrade_price,
                    damage_upgrades: gameState.damage_upgrades
                })
            });
            const result = await response.json();
            console.log("Результат сохранения:", result);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }


    // Обновление интерфейса
    function updateUI() {
        coinsDisplay.textContent = gameState.coins;
        healthDisplay.textContent = `Здоровье: ${gameState.health}`;
        document.getElementById('level').textContent = `Уровень: ${gameState.level}`;
    }

    // Показывает анимацию урона
    function showDamageEffect(event, damage) {
        // Получаем позицию клика относительно контейнера с монстром
        const monsterRect = monster.getBoundingClientRect();
        const containerRect = damageContainer.getBoundingClientRect();

        // Вычисляем координаты клика внутри контейнера урона
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${damage}`;
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        damageContainer.appendChild(damageText);

        // Удаляем элемент после завершения анимации
        setTimeout(() => {
            damageText.remove();
        }, 800);
    }

    // Показывает анимацию награды
    function showRewardAnimation(reward, oldCoins) {
        const container = document.querySelector('.monster-area');
        const rect = container.getBoundingClientRect();

        // Создаем элемент для отображения награды
        const rewardText = document.createElement('div');
        rewardText.className = 'reward-text';
        rewardText.textContent = `+${reward} монет!`;
        rewardText.style.left = '50%';
        rewardText.style.top = '60%';
        rewardText.style.transform = 'translate(-50%, -50%)';
        rewardText.style.color = 'gold';
        rewardText.style.fontSize = '28px';
        rewardText.style.fontWeight = 'bold';
        damageContainer.appendChild(rewardText);

        // Анимация всплывания
        setTimeout(() => {
            rewardText.style.transform = 'translate(-50%, -150px)';
            rewardText.style.opacity = '0';
        }, 10);

        // Удаление через 2 секунды
        setTimeout(() => rewardText.remove(), 2000);

        // Анимация увеличения счетчика монет
        animateCoinCounter(oldCoins, gameState.coins);
    }

    function animateCoinCounter(from, to) {
        const coinsElement = document.getElementById('coins');
        let current = from;
        const duration = 1000; // 1 секунда
        const startTime = Date.now();

        function updateCounter() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            current = Math.floor(from + (to - from) * progress);
            coinsElement.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }


    // Обработчик клика по монстру
    monster.addEventListener('click', async function(e) {
        if (!gameState.isAlive) return;

        gameState.health -= gameState.damage;
        showDamageEffect(e, gameState.damage);

        await saveGame();
        updateUI();

        if (gameState.health <= 0) {
            gameState.isAlive = false;
            monster.src = "image/dead_monster1.png";

            // Расчет награды
            const baseReward = 100;
            const levelBonus = 50 * (gameState.level - 1);
            const totalReward = baseReward + levelBonus;

            // Сохраняем старые значения для анимации
            const oldCoins = gameState.coins;
            gameState.coins += totalReward;
            gameState.level += 1;
            gameState.max_health = Math.round(100 * (1 + (gameState.level - 1) * 0.2));
            gameState.health = gameState.max_health;

            // Показываем анимацию награды
            showRewardAnimation(totalReward, oldCoins);

            // Показываем повышение уровня
            const levelUpText = document.createElement('div');
            levelUpText.className = 'reward-text';
            levelUpText.textContent = `Уровень ${gameState.level}!`;
            levelUpText.style.left = '50%';
            levelUpText.style.top = '40%';
            levelUpText.style.color = '#4dff4d';
            levelUpText.style.fontSize = '32px';
            damageContainer.appendChild(levelUpText);

            setTimeout(() => {
                levelUpText.style.transform = 'translate(-50%, -200px)';
                levelUpText.style.opacity = '0';
            }, 10);

            setTimeout(() => levelUpText.remove(), 2000);

            await saveGame();
            updateUI();

            setTimeout(() => {
                gameState.isAlive = true;
                monster.src = "image/tralalelo.png";
                updateUI();
            }, 2000);
        }
    });

    window.addEventListener('beforeunload', async () => {
        await saveGame();
    });

    // Для кнопок меню добавим обработчик
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            await saveGame();
            window.location.href = button.getAttribute('onclick').match(/'(.*?)'/)[1];
        });
    });
    // Запуск игры
    loadGame(); // Используем единую функцию загрузки
});