const usernameDisplay = document.getElementById('username-display');
const usernameInput = document.getElementById('username-input');
const editUsernameBtn = document.getElementById('edit-username-btn');

// Проверяем, установлен ли уже ник
const savedUsername = localStorage.getItem('username');
const usernameSet = localStorage.getItem('usernameSet') === 'true';

if (savedUsername) {
    usernameDisplay.textContent = savedUsername;
    if (usernameSet) {
        document.querySelector('.profile-shelf').classList.add('username-set');
    }
}

// Обработчик кнопки редактирования
editUsernameBtn.addEventListener('click', () => {
    if (usernameSet) return;

    usernameInput.style.display = 'block';
    usernameDisplay.style.display = 'none';
    usernameInput.focus();
});

// Сохранение ника при потере фокуса или нажатии Enter
usernameInput.addEventListener('blur', saveUsername);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveUsername();
});

function saveUsername() {
    const newUsername = usernameInput.value.trim();
    if (newUsername && !usernameSet) {
        usernameDisplay.textContent = newUsername;
        localStorage.setItem('username', newUsername);
        localStorage.setItem('usernameSet', 'true');

        usernameInput.style.display = 'none';
        usernameDisplay.style.display = 'block';
        document.querySelector('.profile-shelf').classList.add('username-set');
    }
}

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