let health = 100;
let coins = 0;
let isAlive = true;
let level = 1;

const monster = document.getElementById('monster');
const healthDisplay = document.getElementById('health');
const coinsDisplay = document.getElementById('coins');
const levelDisplay = document.getElementById('level');
const damageContainer = document.getElementById('damageContainer');

// Функция показа урона
function showDamage(x, y, damage) {
    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    damageText.textContent = `-${damage}`;
    damageText.style.left = `${x}px`;
    damageText.style.top = `${y}px`;
    damageContainer.appendChild(damageText);

    setTimeout(() => {
        damageText.style.opacity = '0';
        damageText.style.transform = 'translateY(-50px)';
    }, 10);

    setTimeout(() => {
        damageText.remove();
    }, 1000);
}

// Обработчик клика по монстру
monster.addEventListener('click', function() {
    if (!isAlive) return;

    // Наносим урон монстру
    health -= 10;
    showDamage(monster.offsetLeft + monster.offsetWidth / 2, monster.offsetTop + monster.offsetHeight / 2, 10);
    healthDisplay.textContent = `Здоровье: ${health}`;

    // Если монстр побежден
    if (health <= 0) {
        isAlive = false;
        monster.src = "image/dead_monster1.png";
        coins += 100;
        coinsDisplay.textContent = coins;

        // Возрождаем монстра через 2 секунды
        setTimeout(() => {
            health = 100;
            isAlive = true;
            monster.src = "image/tralalelo.png";
            healthDisplay.textContent = `Здоровье: ${health}`;
        }, 2000);
    }
});
