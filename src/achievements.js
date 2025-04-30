// Данные о достижениях (можно хранить в localStorage или в переменной)
let achievementsData = {
    total: 3, // Общее количество достижений
    completed: 1, // Количество полученных достижений
    achievements: [
        { id: 1, title: "Добро пожаловать на пляж", description: "Вы встретились с легендой!", completed: true, image: "image/achivMonstr.png" },
        { id: 2, title: "Серьезный парень", description: "Вы совершили 100 кликов!", completed: false, image: "image/closeAchiv.png" },
        { id: 3, title: "Да когда это закончится?!", description: "Вы совершили 1000 кликов!", completed: false, image: "image/closeAchiv.png" }
    ]
};

// Функция для обновления счетчика
function updateAchievementsCounter() {
    document.getElementById('completed-achievements').textContent = achievementsData.completed;
    document.getElementById('total-achievements').textContent = achievementsData.total;
}

// Функция для отображения всех достижений
function renderAchievements() {
    const container = document.querySelector('.achievements-container');
    container.innerHTML = '';

    achievementsData.achievements.forEach(ach => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${ach.completed ? 'completed' : ''}`;
        achievementElement.innerHTML = `
            <img src="${ach.image}" alt="achievement-${ach.id}" class="achivImg">
            <div class="achievement-text">
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-description">${ach.description}</div>
            </div>
        `;
        container.appendChild(achievementElement);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateAchievementsCounter();
    renderAchievements();
});


//     // Пример: как можно обновлять достижения (например, при клике)
//     document.querySelector('.achievement').addEventListener('click', function() {
//         // Здесь логика получения достижения
//         achievementsData.completed = 2; // Пример изменения
//         updateAchievementsCounter();
//     });
// });

// работоспособность кнопки назад
document.querySelector('.back').addEventListener('click', function(e) {
    e.preventDefault();
    const btn = this;

    // Добавляем классы для анимации
    btn.classList.add('clicked', 'loading');

    // Показываем спиннер и скрываем иконку
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    btn.appendChild(spinner);

    // Через 1 секунду выполняем переход
    setTimeout(() => {
        window.location.href = 'mainPage.html';
    }, 500);
});