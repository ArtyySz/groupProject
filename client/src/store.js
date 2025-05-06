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