document.addEventListener('DOMContentLoaded', function() {
    let profileLoaded = false;

    const profileScript = document.createElement('script');
    profileScript.src = 'profile.js';
    profileScript.onload = async () => {
        await window.ProfileAPI.loadProfile();
        profileLoaded = true;
    };

    document.head.appendChild(profileScript);

    // Основная игровая логика
    const monster = document.getElementById('monster');
    const coinsDisplay = document.getElementById('coins');
    const healthDisplay = document.querySelector('.health');
    const damageContainer = document.getElementById('damageContainer');
    const levelDisplay = document.getElementById('level');

    const API_URL = 'http://localhost:5001';

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


    async function loadGame() {
        try {
            const response = await fetch(`${API_URL}/load`);
            const data = await response.json();

            gameState = {
                ...gameState,
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
            await fetch(`${API_URL}/save`, {
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
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }

    function updateUI() {
        coinsDisplay.textContent = gameState.coins;
        healthDisplay.textContent = `Здоровье: ${gameState.health}`;
        levelDisplay.textContent = `Уровень: ${gameState.level}`;
    }

    function showDamageEffect(event, damage) {
        const containerRect = damageContainer.getBoundingClientRect();
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${damage}`;
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        damageContainer.appendChild(damageText);

        setTimeout(() => damageText.remove(), 800);
    }

    function showRewardAnimation(reward, oldCoins) {
        const rewardText = document.createElement('div');
        rewardText.className = 'reward-text';
        rewardText.textContent = `+${reward} монет!`;
        rewardText.style.left = '50%';
        rewardText.style.top = '60%';
        rewardText.style.transform = 'translate(-50%, -50%)';
        rewardText.style.color = 'gold';
        damageContainer.appendChild(rewardText);

        setTimeout(() => {
            rewardText.style.transform = 'translate(-50%, -150px)';
            rewardText.style.opacity = '0';
        }, 10);

        setTimeout(() => rewardText.remove(), 2000);

        animateCoinCounter(oldCoins, oldCoins + reward);
    }

    function animateCoinCounter(from, to) {
        const startTime = Date.now();
        const duration = 1000;

        const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            coinsDisplay.textContent = Math.floor(from + (to - from) * progress);
            if (progress < 1) requestAnimationFrame(animate);
        };

        animate();
    }

    // Обработчик клика по монстру
    monster.addEventListener('click', async function(e) {
        if (!gameState.isAlive) return;

        // 1. Учет кликов
        if (window.ProfileAPI) {
            if (!profileLoaded) {
                await window.ProfileAPI.loadProfile();
                profileLoaded = true;
            }
            window.ProfileAPI.incrementClickCounter();
        }

        // 2. Нанесение урона
        gameState.health -= gameState.damage;
        showDamageEffect(e, gameState.damage);

        // 3. Проверка смерти монстра
        if (gameState.health <= 0 && gameState.isAlive) {
            gameState.isAlive = false;
            monster.src = "image/dead_monster1.png";

            // Расчет награды
            const baseReward = 100;
            const levelBonus = 50 * (gameState.level - 1);
            const totalReward = baseReward + levelBonus;
            const oldCoins = gameState.coins;

            // 4. Обновление состояния
            gameState.coins += totalReward;
            gameState.level += 1;
            gameState.max_health = Math.round(100 * (1 + (gameState.level - 1) * 0.2));
            gameState.health = gameState.max_health;

            // 5. Визуальные эффекты
            showRewardAnimation(totalReward, oldCoins); // Анимация монет

            // Анимация уровня
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

            // 6. Сохранение и восстановление монстра
            await saveGame();
            updateUI();

            setTimeout(() => {
                gameState.isAlive = true;
                monster.src = "image/tralalelo.png";
                updateUI();
            }, 2000);
        } else {
            // 7. Обычный клик (без убийства)
            await saveGame();
            updateUI();
        }
    });

    window.addEventListener('beforeunload', async () => {
        await saveGame();
    });

    // Инициализация игры
    loadGame();
});