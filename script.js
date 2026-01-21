// Имитация базы данных (в реальности здесь будет работа с GitHub API)
class Database {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('forum_users')) || [];
        this.topics = JSON.parse(localStorage.getItem('forum_topics')) || [];
        this.initSampleData();
    }

    initSampleData() {
        if (this.topics.length === 0) {
            this.topics = [
                {
                    id: 1,
                    title: 'Добро пожаловать на форум HydroHelper!',
                    category: 'Общие вопросы',
                    content: 'Это официальный форум сообщества HydroHelper. Здесь вы можете обсуждать все вопросы, связанные с гидропоникой, обмениваться опытом и задавать вопросы.',
                    author: 'Администратор',
                    date: new Date().toISOString(),
                    views: 42,
                    replies: 0
                }
            ];
            this.saveTopics();
        }
    }

    saveUsers() {
        localStorage.setItem('forum_users', JSON.stringify(this.users));
    }

    saveTopics() {
        localStorage.setItem('forum_topics', JSON.stringify(this.topics));
    }

    // Методы для пользователей
    registerUser(username, password) {
        if (this.users.find(u => u.username === username)) {
            return { success: false, error: 'Пользователь с таким логином уже существует' };
        }

        const user = {
            id: Date.now(),
            username,
            password, // В реальном приложении пароль должен быть хеширован
            registered: new Date().toISOString()
        };

        this.users.push(user);
        this.saveUsers();
        return { success: true, user };
    }

    loginUser(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            return { success: false, error: 'Неверный логин или пароль' };
        }
        return { success: true, user };
    }

    // Методы для тем
    createTopic(topicData) {
        const topic = {
            id: Date.now(),
            ...topicData,
            date: new Date().toISOString(),
            views: 0,
            replies: 0
        };

        this.topics.unshift(topic);
        this.saveTopics();
        return topic;
    }

    getTopics(filterCategory = '') {
        if (filterCategory) {
            return this.topics.filter(topic => topic.category === filterCategory);
        }
        return [...this.topics];
    }

    getTopic(id) {
        return this.topics.find(topic => topic.id === id);
    }

    incrementViews(topicId) {
        const topic = this.getTopic(topicId);
        if (topic) {
            topic.views++;
            this.saveTopics();
        }
    }
}

// Инициализация базы данных
const db = new Database();

// Состояние приложения
let currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
let currentFilter = '';

// DOM элементы
const elements = {
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userMenu: document.getElementById('userMenu'),
    usernameDisplay: document.getElementById('usernameDisplay'),
    createTopicSection: document.getElementById('createTopicSection'),
    createTopicBtn: document.getElementById('createTopicBtn'),
    topicsList: document.getElementById('topicsList'),
    categoryFilter: document.getElementById('categoryFilter'),

    // Модальные окна
    modalOverlay: document.getElementById('modalOverlay'),
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    createTopicModal: document.getElementById('createTopicModal'),

    // Формы
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    topicForm: document.getElementById('topicForm'),

    // Кнопки закрытия
    closeLoginModal: document.getElementById('closeLoginModal'),
    closeRegisterModal: document.getElementById('closeRegisterModal'),
    closeTopicModal: document.getElementById('closeTopicModal')
};

// Функции для работы с модальными окнами
function showModal(modal) {
    elements.modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideAllModals() {
    elements.modalOverlay.classList.add('hidden');
    elements.loginModal.classList.add('hidden');
    elements.registerModal.classList.add('hidden');
    elements.createTopicModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Обновление интерфейса в зависимости от состояния пользователя
function updateUI() {
    if (currentUser) {
        elements.userMenu.classList.remove('hidden');
        elements.authButtons?.classList?.add('hidden');
        elements.usernameDisplay.textContent = currentUser.username;
        elements.createTopicSection.classList.remove('hidden');
    } else {
        elements.userMenu.classList.add('hidden');
        elements.authButtons?.classList?.remove('hidden');
        elements.createTopicSection.classList.add('hidden');
    }
}

// Отображение списка тем
function renderTopics() {
    const topics = db.getTopics(currentFilter);
    
    if (topics.length === 0) {
        elements.topicsList.innerHTML = `
            <div class="no-topics">
                <p>Темы не найдены. Будьте первым, кто создаст тему!</p>
            </div>
        `;
        return;
    }

    elements.topicsList.innerHTML = topics.map(topic => `
        <div class="topic-card" onclick="viewTopic(${topic.id})">
            <div class="topic-header">
                <div>
                    <h3 class="topic-title">${escapeHtml(topic.title)}</h3>
                    <span class="topic-category">${escapeHtml(topic.category)}</span>
                </div>
                <div class="topic-date">${formatDate(topic.date)}</div>
            </div>
            <div class="topic-author">Автор: ${escapeHtml(topic.author)}</div>
            <div class="topic-content">${escapeHtml(topic.content.substring(0, 200))}${topic.content.length > 200 ? '...' : ''}</div>
            <div class="topic-stats">
                <span>👁️ ${topic.views}</span>
                <span>💬 ${topic.replies}</span>
            </div>
        </div>
    `).join('');
}

// Функция для просмотра темы (заглушка)
function viewTopic(topicId) {
    db.incrementViews(topicId);
    alert('Просмотр темы будет реализован в следующей версии');
}

// Вспомогательные функции
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// Инициализация событий
function initEventListeners() {
    // Кнопки входа/регистрации
    elements.loginBtn.addEventListener('click', () => showModal(elements.loginModal));
    elements.registerBtn.addEventListener('click', () => showModal(elements.registerModal));
    elements.logoutBtn.addEventListener('click', logout);
    elements.createTopicBtn.addEventListener('click', () => showModal(elements.createTopicModal));

    // Кнопки закрытия модальных окон
    elements.closeLoginModal.addEventListener('click', hideAllModals);
    elements.closeRegisterModal.addEventListener('click', hideAllModals);
    elements.closeTopicModal.addEventListener('click', hideAllModals);
    elements.modalOverlay.addEventListener('click', hideAllModals);

    // Обработка форм
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.topicForm.addEventListener('submit', handleCreateTopic);

    // Фильтр категорий
    elements.categoryFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTopics();
    });

    // Закрытие модальных окон по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllModals();
        }
    });
}

// Обработчики форм
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    const result = db.loginUser(username, password);
    if (result.success) {
        currentUser = result.user;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        updateUI();
        hideAllModals();
        e.target.reset();
    } else {
        showError('loginError', result.error);
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError('registerError', 'Пароли не совпадают');
        return;
    }

    const result = db.registerUser(username, password);
    if (result.success) {
        currentUser = result.user;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        updateUI();
        hideAllModals();
        alert('Регистрация успешна!');
        e.target.reset();
    } else {
        showError('registerError', result.error);
    }
}

function handleCreateTopic(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('topicError', 'Необходимо войти в систему');
        return;
    }

    const title = document.getElementById('topicTitle').value.trim();
    const category = document.getElementById('topicCategory').value;
    const content = document.getElementById('topicContent').value.trim();

    if (!title || !category || !content) {
        showError('topicError', 'Все поля обязательны для заполнения');
        return;
    }

    const topicData = {
        title,
        category,
        content,
        author: currentUser.username
    };

    db.createTopic(topicData);
    hideAllModals();
    renderTopics();
    e.target.reset();
    
    // Показываем уведомление об успешном создании
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Тема успешно создана!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функция выхода
function logout() {
    currentUser = null;
    localStorage.removeItem('current_user');
    updateUI();
}

// Инициализация приложения
function init() {
    updateUI();
    initEventListeners();
    renderTopics();
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            animation: slideIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);