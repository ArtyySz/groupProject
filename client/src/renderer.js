document.addEventListener('DOMContentLoaded', function() {
    
    const profileScript = document.createElement('script');
    profileScript.src = 'profile.js';
    document.head.appendChild(profileScript);

    
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
        damage_upgrades: 0,
        coins_per_second: 0,
        cps_upgrades: 0,
        cps_upgrade_price: 20
    };

    
    async function loadGame() {
        try {
            const response = await fetch(`${API_URL}/load`);
            const data = await response.json();

            if (data.error) {
                console.error("Server error:", data.error);
                return;
            }

            gameState = {
                coins: data.coins,
                level: data.level,
                damage: data.damage,
                health: data.monster_health,
                max_health: 100 * (1 + (data.level - 1) * 0.2),
                isAlive: true,
                damage_upgrade_price: data.damage_upgrade_price,
                damage_upgrades: data.damage_upgrades,
                coins_per_second: data.coins_per_second || 0,
                cps_upgrades: data.cps_upgrades || 0,
                cps_upgrade_price: data.cps_upgrade_price || 20
            };

            updateUI();
        } catch (error) {
            console.error("Error loading game:", error);
        }
    }

    async function saveGame() {
        try {
            const response = await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coins: gameState.coins,
                    level: gameState.level,
                    damage: gameState.damage,
                    monster_health: gameState.health,
                    damage_upgrade_price: gameState.damage_upgrade_price,
                    damage_upgrades: gameState.damage_upgrades,
                    coins_per_second: gameState.coins_per_second,
                    cps_upgrades: gameState.cps_upgrades,
                    cps_upgrade_price: gameState.cps_upgrade_price
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            return { error: error.message };
        }
    }

    
    function updateUI() {
        coinsDisplay.textContent = gameState.coins;
        healthDisplay.textContent = `Здоровье: ${gameState.health}`;
        levelDisplay.textContent = `Уровень: ${gameState.level}`;
    }

   
    function showDamageEffect(event, damage) {
        const monsterRect = monster.getBoundingClientRect();
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
        rewardText.style.fontSize = '28px';
        rewardText.style.fontWeight = 'bold';
        damageContainer.appendChild(rewardText);

        setTimeout(() => {
            rewardText.style.transform = 'translate(-50%, -150px)';
            rewardText.style.opacity = '0';
        }, 10);

        setTimeout(() => rewardText.remove(), 2000);
        animateCoinCounter(oldCoins, gameState.coins);
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

   
    monster.addEventListener('click', async function(e) {
        if (!gameState.isAlive) return;

        
        if (window.ProfileAPI) {
            window.ProfileAPI.incrementClickCounter();
        }

        gameState.health -= gameState.damage;
        showDamageEffect(e, gameState.damage);

        if (gameState.health <= 0) {
            gameState.isAlive = false;
            monster.src = "image/dead_monster1.png";

            const baseReward = 100;
            const levelBonus = 50 * (gameState.level - 1);
            const totalReward = baseReward + levelBonus;
            const oldCoins = gameState.coins;

            gameState.coins += totalReward;
            gameState.level += 1;
            gameState.max_health = Math.round(100 * (1 + (gameState.level - 1) * 0.2));
            gameState.health = gameState.max_health;

            showRewardAnimation(totalReward, oldCoins);

            const levelUpText = document.createElement('div');
            levelUpText.className = 'reward-text';
            levelUpText.textContent = `Уровень ${gameState.level}!`;
            levelUpText.style.left = '50%';
            levelUpText.style.top = '40%';
            levelUpText.style.color = '#4dff4d';
            levelUpText.style.fontSize = '32px';
            damageContainer.appendChild(levelUpText);

            setTimeout(() => levelUpText.remove(), 2000);
            await saveGame();

            setTimeout(() => {
                gameState.isAlive = true;
                monster.src = "image/tralalelo.png";
                updateUI();
            }, 2000);
        }

        await saveGame();
        updateUI();
    });

    
    setInterval(() => {
        if (gameState.coins_per_second > 0) {
            gameState.coins += gameState.coins_per_second;
            updateUI();
        }
    }, 1000);

    
    window.addEventListener('beforeunload', async () => {
        await saveGame();
        if (window.ProfileAPI) {
            await window.ProfileAPI.saveProfile();
        }
    });

   
    loadGame();
});