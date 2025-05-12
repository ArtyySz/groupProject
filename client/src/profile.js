const API_URL = 'http://localhost:5001';

const profileState = {
    username: 'Гость',
    totalClicks: 0,
    totalPlayTime: 0,
    isUsernameSet: false
};

let isProfileInitialized = false;

window.ProfileAPI = {
    init: function() {
        if (isProfileInitialized) return;
        isProfileInitialized = true;
        this.setupEventListeners();
        this.loadProfile().then(() => {
            if (profileState.isUsernameSet) {
                this.startPlayTimeTracker();
            }
        });
    },

    getElements: function() {
        return {
            usernameDisplay: document.getElementById('username-display'),
            usernameInput: document.getElementById('username-input'),
            editUsernameBtn: document.getElementById('edit-username-btn'),
            clickCounter: document.getElementById('click-counter'),
            playTimeDisplay: document.getElementById('play-time'),
            backButton: document.querySelector('.back')
        };
    },

    setupEventListeners: function() {
        const elements = this.getElements();
        if (!elements.usernameDisplay) return;

        if (!profileState.isUsernameSet) {
            elements.editUsernameBtn?.addEventListener('click', () => {
                elements.usernameInput.value = profileState.username;
                elements.usernameInput.style.display = 'block';
                elements.usernameDisplay.style.display = 'none';
                elements.usernameInput.focus();
            });
        } else {
            elements.editUsernameBtn.style.display = 'none';
        }

        elements.usernameInput?.addEventListener('blur', () => this.saveUsername());
        elements.usernameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveUsername();
        });

        elements.backButton?.addEventListener('click', async (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('clicked', 'loading');

            // Даем время на сохранение
            await new Promise(resolve => setTimeout(resolve, 300));
            await this.saveProfile();

            window.location.href = 'mainPage.html';
        });
    },

    incrementClickCounter: async function() {
        // Сначала загружаем текущее состояние
        await this.loadProfile();

        // Увеличиваем счетчик
        profileState.totalClicks++;
        this.updateProfileUI();

        // Сохраняем
        await this.saveProfile();
    },

    async loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile/load`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        profileState.username = data.username || 'Гость';
        profileState.totalClicks = data.total_clicks || 0;
        profileState.totalPlayTime = data.total_play_time || 0;
        profileState.isUsernameSet = data.username_set || 
                                    (data.username && data.username !== 'Гость');

        this.updateProfileUI();
        
        if (profileState.isUsernameSet) {
            this.startPlayTimeTracker();
        }
    } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
        // Можно добавить загрузку из localStorage
        this.updateProfileUI();
    }
},

    async saveProfile() {
        try {
            const response = await fetch(`${API_URL}/profile/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: profileState.username,
                    total_clicks: profileState.totalClicks,
                    total_play_time: profileState.totalPlayTime
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Ошибка сохранения профиля:", error);
            return { error: "Failed to save profile" };
        }
    },

    updateProfileUI() {
        const elements = this.getElements();
        if (!elements.usernameDisplay) return;

        elements.usernameDisplay.textContent = profileState.username;
        elements.clickCounter.textContent = profileState.totalClicks;

        const hours = Math.floor(profileState.totalPlayTime / 3600);
        const minutes = Math.floor((profileState.totalPlayTime % 3600) / 60);
        elements.playTimeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        if (profileState.isUsernameSet) {
            elements.usernameInput.style.display = 'none';
            elements.editUsernameBtn.style.display = 'none';
        }
    },

    startPlayTimeTracker: function() {
    // Очищаем предыдущий интервал, если он был
    if (this.playTimeInterval) {
        clearInterval(this.playTimeInterval);
    }

    // Запоминаем время начала отслеживания
    const trackingStartTime = Date.now();
    const initialPlayTime = profileState.totalPlayTime;

    this.playTimeInterval = setInterval(async () => {
        // Вычисляем прошедшее время с момента начала отслеживания
        const elapsedTime = Math.floor((Date.now() - trackingStartTime) / 1000);
        profileState.totalPlayTime = initialPlayTime + elapsedTime;
        
        this.updateProfileUI();

        // Сохраняем каждые 30 секунд (можно изменить интервал)
        if (elapsedTime % 30 === 0) {
            await this.saveProfile();
        }
    }, 1000);
},

    async saveUsername() {
    const elements = this.getElements();
    const newUsername = elements.usernameInput.value.trim();

    if (!newUsername || newUsername === 'Гость') {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profile/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: newUsername,
                total_clicks: profileState.totalClicks,
                total_play_time: profileState.totalPlayTime
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save username');
        }

        const result = await response.json();
        
        // Обновляем состояние только после успешного сохранения
        profileState.username = result.username || newUsername;
        profileState.isUsernameSet = result.username_set || true;
        
        elements.usernameInput.style.display = 'none';
        elements.usernameDisplay.style.display = 'block';
        elements.editUsernameBtn.style.display = 'none';
        
        this.updateProfileUI();
        this.startPlayTimeTracker();
        
        return result;
    } catch (error) {
        console.error("Ошибка сохранения ника:", error);
        alert(error.message || 'Не удалось сохранить имя пользователя');
        throw error;
    }
}
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.ProfileAPI.init();
});