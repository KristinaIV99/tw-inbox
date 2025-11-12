// projekt/app.js

class TaskWarriorComposer {
    constructor() {
        this.version = '1.0.0';
        this.cards = new Map();
        this.eventListeners = new Map();
        this.state = {};
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        this.initializeState();
        this.setupEventSystem();
        this.registerAvailableCards();
        this.startApplication();
    }

    initializeState() {
        this.state = {
            currentTask: {
                description: '',
                annotate: ''
            },
            app: {
                activeCard: null,
                isOnline: navigator.onLine,
                savedTasksCount: this.getSavedTasksCount()
            },
            ui: {
                theme: 'light',
                language: 'lt'
            }
        };
    }

    setupEventSystem() {
        window.addEventListener('online', () => {
            this.updateOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
        });
        
        this.eventBus = {
            listeners: {},
            
            on: (event, callback) => {
                if (!this.eventBus.listeners[event]) {
                    this.eventBus.listeners[event] = [];
                }
                this.eventBus.listeners[event].push(callback);
            },
            
            emit: (event, data) => {
                if (this.eventBus.listeners[event]) {
                    this.eventBus.listeners[event].forEach(callback => {
                        callback(data);
                    });
                }
            },
            
            off: (event, callback) => {
                if (this.eventBus.listeners[event]) {
                    this.eventBus.listeners[event] = this.eventBus.listeners[event].filter(
                        cb => cb !== callback
                    );
                }
            }
        };
    }

    registerCard(cardName, cardInstance) {
        this.cards.set(cardName, {
            name: cardName,
            instance: cardInstance,
            initialized: false,
            active: false
        });
        
        if (cardInstance.init && typeof cardInstance.init === 'function') {
            try {
                cardInstance.init(this);
                this.cards.get(cardName).initialized = true;
            } catch (error) {
                console.error(`Kortelės "${cardName}" inicializavimo klaida:`, error);
            }
        }
    }

    registerAvailableCards() {
        const availableCards = [
            'description',
            'annotate',
            'actions',
            'stats',
            'status'
        ];
        
        availableCards.forEach(cardName => {
            // Kortelės bus registruojamos
        });
    }

    updateState(path, value) {
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        
        this.eventBus.emit('stateChange', { path, value, state: this.state });
    }

    getState(path = null) {
        if (!path) return this.state;
        
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    validateTask() {
        const errors = [];
        
        const descriptionCard = this.cards.get('description');
        const annotateCard = this.cards.get('annotate');
        
        let hasDescription = false;
        let hasAnnotate = false;
        
        if (descriptionCard && descriptionCard.instance) {
            const descValue = descriptionCard.instance.getValue();
            if (descValue && descValue.trim() !== '') {
                hasDescription = true;
            }
        }
        
        if (annotateCard && annotateCard.instance) {
            const annotateValue = annotateCard.instance.getValue();
            if (annotateValue && annotateValue.trim() !== '') {
                hasAnnotate = true;
            }
        }
        
        if (!hasDescription && !hasAnnotate) {
            errors.push('Turi būti užpildytas bent vienas laukas: DESCRIPTION arba ANNOTATE!');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    showValidationErrors(errors) {
        const modal = document.createElement('div');
        modal.className = 'validation-modal';
        modal.innerHTML = `
            <div class="validation-modal-content">
                <div class="validation-modal-header">
                    <h3>Klaidos</h3>
                    <span class="validation-modal-close">&times;</span>
                </div>
                <div class="validation-modal-body">
                    <div class="error-list">
                        ${errors.map(error => `<div class="error-item">⚠️ ${error}</div>`).join('')}
                    </div>
                </div>
                <div class="validation-modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.validation-modal').remove()">Gerai</button>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('validation-modal-close')) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    buildTaskData() {
        const taskData = {
            description: '',
            annotate: ''
        };
        
        const descCard = this.cards.get('description');
        if (descCard && descCard.instance && descCard.instance.getValue) {
            taskData.description = descCard.instance.getValue() || '';
        }
        
        const annotateCard = this.cards.get('annotate');
        if (annotateCard && annotateCard.instance && annotateCard.instance.getValue) {
            taskData.annotate = annotateCard.instance.getValue() || '';
        }
        
        return taskData;
    }

    generateFullTaskWarriorCommand() {
        const parts = [];
        
        const descCard = this.cards.get('description');
        if (descCard && descCard.instance && descCard.instance.generateTaskWarriorCommand) {
            const descCmd = descCard.instance.generateTaskWarriorCommand();
            if (descCmd) {
                parts.push(descCmd);
            }
        }
        
        const annotateCard = this.cards.get('annotate');
        if (annotateCard && annotateCard.instance && annotateCard.instance.generateTaskWarriorCommand) {
            const annotateCmd = annotateCard.instance.generateTaskWarriorCommand();
            if (annotateCmd) {
                if (parts.length > 0) {
                    parts.push('+');
                }
                parts.push(annotateCmd);
            }
        }
        
        return parts.join('\n');
    }

    saveTask() {
        try {
            const validation = this.validateTask();
            
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }
            
            const taskData = this.buildTaskData();
            const taskCommand = this.generateFullTaskWarriorCommand();
            
            if (!taskCommand) {
                this.showFeedback('Nėra duomenų išsaugojimui!', 'error');
                return;
            }
            
            if (window.StorageManager) {
                const taskId = window.StorageManager.saveTask({
                    taskData,
                    taskCommand,
                    timestamp: new Date().toISOString()
                });
                console.log('Task išsaugotas su ID:', taskId);
                
                this.clearForm();
                
                this.showFeedback('Užduotis sėkmingai išsaugota!', 'success');
                this.updateTaskCount(this.getSavedTasksCount());
            } else {
                throw new Error('StorageManager neprieinamas');
            }
            
        } catch (error) {
            console.error('Task saugojimo klaida:', error);
            this.showFeedback('Klaida išsaugojant užduotį!', 'error');
        }
    }

    exportTasks() {
        if (window.ExportManager) {
            window.ExportManager.exportTasks();
        } else {
            this.showFeedback('ExportManager neprieinamas!', 'error');
        }
    }

    clearForm() {
        this.cards.forEach((cardData, cardName) => {
            const card = cardData.instance;
            if (card && card.clearForm && typeof card.clearForm === 'function') {
                card.clearForm();
            }
        });
    }

    updateOnlineStatus(isOnline) {
        this.updateState('app.isOnline', isOnline);
        
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (statusIndicator && statusText) {
            if (isOnline) {
                statusIndicator.textContent = '🟢';
                statusText.textContent = 'Online';
                statusText.className = 'status-text online';
            } else {
                statusIndicator.textContent = '🔴';
                statusText.textContent = 'Offline';
                statusText.className = 'status-text offline';
            }
        }
    }

    getSavedTasksCount() {
        try {
            if (window.StorageManager) {
                return window.StorageManager.getSavedTasksCount();
            }
            const tasks = localStorage.getItem(window.STORAGE_KEYS?.TASKS || 'taskwarrior_tasks');
            return tasks ? JSON.parse(tasks).length : 0;
        } catch (error) {
            console.error('Klaida gaunant task count:', error);
            return 0;
        }
    }

    updateTaskCount(count) {
        this.updateState('app.savedTasksCount', count);
        
        const taskCountElement = document.getElementById('taskCount');
        if (taskCountElement) {
            taskCountElement.textContent = count;
        }
    }

    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1001;
            animation: fadeInOut 3s ease;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);
    }

    startApplication() {
        this.updateTaskCount(this.state.app.savedTasksCount);
        this.updateOnlineStatus(this.state.app.isOnline);
        
        this.setupActionButtons();
        
        this.eventBus.emit('appStarted', {
            version: this.version,
            state: this.state
        });
    }

    setupActionButtons() {
        // Dabar visus action mygtukus valdo actions-card.js
    }

    emit(event, data) {
        this.eventBus.emit(event, data);
    }

    on(event, callback) {
        this.eventBus.on(event, callback);
    }

    off(event, callback) {
        this.eventBus.off(event, callback);
    }

    log(message, data = null) {
        console.log(`📱 ${message}`, data || '');
    }

    error(message, error = null) {
        console.error(`⛔ ${message}`, error || '');
    }
}

window.TaskWarriorApp = new TaskWarriorComposer();

window.registerCard = (name, instance) => {
    window.TaskWarriorApp.registerCard(name, instance);
};

window.getApp = () => {
    return window.TaskWarriorApp;
};

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);