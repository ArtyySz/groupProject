document.addEventListener('DOMContentLoaded', function() {
    const monster = document.getElementById('monster');
    const damageContainer = document.getElementById('damageContainer');
    const healthDisplay = document.querySelector('.health');
    const coinsDisplay = document.getElementById('coins'); // Находим элемент счётчика монет
    let health = 100;
    let coins = 0;
    let isAlive = true;
    const playerStats = {
        damage: 1,        // Базовый урон
        upgrades: 0       // Количество улучшений
    };

    function showCoinReward(amount) {
        const rewardText = document.createElement('div');
        rewardText.className = 'reward-text';
        rewardText.textContent = `+${amount} монет!`;
        rewardText.style.position = 'absolute';
        rewardText.style.color = 'gold';
        rewardText.style.fontSize = '24px';
        rewardText.style.fontWeight = 'bold';
        rewardText.style.left = '50%';
        rewardText.style.top = '50%';
        rewardText.style.transform = 'translate(-50%, -50%)';
        rewardText.style.opacity = '1';
        document.body.appendChild(rewardText);


        setTimeout(() => { // вывод награды после убийства
            rewardText.style.opacity = '0';
            rewardText.style.transform = 'translate(-50%, -100%)';
            setTimeout(() => rewardText.remove(), 1000);
        }, 1500);
    }

    monster.addEventListener('click', function(e) {
        if(!isAlive) return;
        // 1. Получаем позицию клика относительно monster-area
        const rect = monster.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 2. Создаем элемент урона
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = '-1';
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;

        const totalDamage = playerStats.damage;
        damageText.textContent = `-${totalDamage}`;
        health = Math.max(0, health - totalDamage);
        healthDisplay.textContent = `Здоровье: ${health}`;

        // 3. Добавляем в контейнер
        damageContainer.appendChild(damageText);

        // 4. Анимация
        setTimeout(() => {
            damageText.style.opacity = '0';
            damageText.style.transform = 'translateY(-50px)';
        }, 10);

        // 5. Удаляем после анимации
        setTimeout(() => {
            damageText.remove();
        }, 1000);

        if(health === 0) {
            isAlive = false;
            monster.src = "image/dead_monster1.png";

            // Награда
            coins += 100;
            coinsDisplay.textContent = coins;
            showCoinReward(100);

            // Возрождение через 5 сек
            setTimeout(() => {
                health = 100;
                isAlive = true;
                monster.src = "image/tralalelo.png";
                healthDisplay.textContent = `Здоровье: ${health}`;
            }, 2000);
        }
        // 7. Эффект удара
        monster.style.transform = 'scale(0.95)';
        setTimeout(() => {
            monster.style.transform = 'scale(1)';
        }, 100);
    });
});