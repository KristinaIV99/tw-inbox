// projekt/app.js - TASKWARRIOR INBOX ORCHESTRATORIUS

// =============================================================================
// PAGRINDINIS APLIKACIJOS VALDIKLIS
// =============================================================================

class TaskWarriorComposer {
    constructor() {
        this.version = '1.0.0';
        this.cards = new Map(); // Registruojamos kortelės
        this.eventListeners = new Map(); // Event valdymas
        this.state = {}; // Aplikacijos būsena
        
        this.init();
    }

    // =============================================================================
    // INICIALIZAVIMAS
    // =============================================================================
    
    init() {
        // Laukiame, kad DOM būtų pilnai užkrautas
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        // Inicializuojame pagrindinius komponentus
        this.initializeState();
        this.setupEventSystem();
        this.registerAvailableCards();
        this.startApplication();
    }

    // =============================================================================
    // BŪSENOS VALDYMAS
    // =============================================================================
    
    initializeState() {
        this.state = {
            // Dabartinė užduotis
            currentTask: {
                description: '',
                annotate: ''
            },
            
            // Aplikacijos būsena
            app: {
                activeCard: null,
                isOnline: navigator.onLine,
                savedTasksCount: this.getSavedTasksCount()
            },
            
            // UI būsena
            ui: {
                theme: 'light',
                language: 'lt'
            }
        };
    }

    // =============================================================================
    // EVENT SISTEMA
    // =============================================================================
    
    setupEventSystem() {
        // Online/Offline būsenos stebėjimas
        window.addEventListener('online', () => {
            this.updateOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
        });
        
        // Bendrasis event dispatcher
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

    // =============================================================================
    // KORTELIŲ REGISTRACIJA
    // =============================================================================
    
    registerCard(cardName, cardInstance) {
        this.cards.set(cardName, {
            name: cardName,
            instance: cardInstance,
            initialized: false,
            active: false
        });
        
        // Inicializuojame kortelę
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
        // Kortelės bus registruojamos, kai jų JavaScript failai bus sukurti
        const availableCards = [
            'description',
            'annotate',
            'actions',
            'stats',
            'status'
        ];
        
        availableCards.forEach(cardName => {
            // Kortelės bus registruojamos, kai jų JavaScript failai bus sukurti
        });
    }

    // =============================================================================
    // DUOMENŲ VALDYMAS
    // =============================================================================
    
    updateState(path, value) {
        // Split path ir update nested objektą
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        
        // Emit state change event
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

    // =============================================================================
    // VALIDATION FUNKCIJOS
    // =============================================================================
    
    validateTask() {
        const errors = [];
        
        // Gauti abu laukus
        const descriptionCard = this.cards.get('description');
        const annotateCard = this.cards.get('annotate');
        
        let hasDescription = false;
        let hasAnnotate = false;
        
        // Tikrinti DESCRIPTION
        if (descriptionCard && descriptionCard.instance) {
            const descValue = descriptionCard.instance.getValue();
            if (descValue?.text && descValue.text.trim() !== '') {
                hasDescription = true;
            }
        }
        
        // Tikrinti ANNOTATE
        if (annotateCard && annotateCard.instance) {
            const annotateValue = annotateCard.instance.getValue();
            if (annotateValue && annotateValue.trim() !== '') {
                hasAnnotate = true;
            }
        }
        
        // Bent vienas turi būti užpildytas
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
        
        // Pridėti close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('validation-modal-close')) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    // =============================================================================
    // TASK BUILDING FUNKCIJOS
    // =============================================================================
    
    buildTaskData() {
        const taskData = {
            description: '',
            isMilestone: false,
            annotate: ''
        };
        
        // Gauti duomenis iš kortelių
        const descCard = this.cards.get('description');
        if (descCard && descCard.instance && descCard.instance.getValue) {
            const descValue = descCard.instance.getValue();
            taskData.description = descValue.text || '';
            taskData.isMilestone = descValue.isMilestone || false;
        }
        
        const annotateCard = this.cards.get('annotate');
        if (annotateCard && annotateCard.instance && annotateCard.instance.getValue) {
            taskData.annotate = annotateCard.instance.getValue() || '';
        }
        
        return taskData;
    }

    generateFullTaskWarriorCommand() {
        const parts = [];
        
        // 1. Description (neprivalomas)
        const descCard = this.cards.get('description');
        if (descCard && descCard.instance && descCard.instance.generateTaskWarriorCommand) {
            const descCmd = descCard.instance.generateTaskWarriorCommand();
            if (descCmd && descCmd !== '""') {
                parts.push('task add ' + descCmd);
            }
        }
        
        // 2. Annotate (neprivalomas)
        const annotateCard = this.cards.get('annotate');
        if (annotateCard && annotateCard.instance && annotateCard.instance.generateTaskWarriorCommand) {
            const annotateCmd = annotateCard.instance.generateTaskWarriorCommand();
            if (annotateCmd) {
                // Jei yra description, pridėti "+"
                if (parts.length > 0) {
                    parts.push('+');
                }
                parts.push(annotateCmd);
            }
        }
        
        return parts.join('\n');
    }

    // =============================================================================
    // TASK ACTIONS
    // =============================================================================
    
    saveTask() {
        try {
            // Validacija prieš išsaugojimą
            const validation = this.validateTask();
            
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }
            
            // Jei validation praėjo - tęsti su išsaugojimu
            const taskData = this.buildTaskData();
            const taskCommand = this.generateFullTaskWarriorCommand();
            
            // Tikrinti ar yra ko saugoti
            if (!taskCommand) {
                this.showFeedback('Nėra duomenų išsaugojimui!', 'error');
                return;
            }
            
            // Išsaugoti task'ą per StorageManager
            if (window.StorageManager) {
                const taskId = window.StorageManager.saveTask({
                    taskData,
                    taskCommand,
                    timestamp: new Date().toISOString()
                });
                console.log('Task išsaugotas su ID:', taskId);
                
                // Išvalyti formą
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
        // Tiesiog kviesti ExportManager
        if (window.ExportManager) {
            window.ExportManager.exportTasks();
        } else {
            this.showFeedback('ExportManager neprieinamas!', 'error');
        }
    }

    clearForm() {
        // Išvalyti visas korteles
        this.cards.forEach((cardData, cardName) => {
            const card = cardData.instance;
            if (card && card.clearForm && typeof card.clearForm === 'function') {
                card.clearForm();
            }
        });
    }

    // =============================================================================
    // UTILITY FUNKCIJOS
    // =============================================================================
    
    updateOnlineStatus(isOnline) {
        this.updateState('app.isOnline', isOnline);
        
        // Atnaujinti UI
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
        // Pradinis UI update
        this.updateTaskCount(this.state.app.savedTasksCount);
        this.updateOnlineStatus(this.state.app.isOnline);
        
        // Setup actions buttons jei egzistuoja
        this.setupActionButtons();
        
        // Emit aplikacijos paleisimo eventą
        this.eventBus.emit('appStarted', {
            version: this.version,
            state: this.state
        });
    }

    setupActionButtons() {
        // Dabar visus action mygtukus valdo actions-card.js
    }

    // =============================================================================
    // VIEŠAS API KORTELĖMS
    // =============================================================================
    
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

// =============================================================================
// GLOBALI APLIKACIJOS INSTANCIJA
// =============================================================================

// Sukuriame globalią aplikacijos instanciją
window.TaskWarriorApp = new TaskWarriorComposer();

// Convenience funkcijos kortelių failams
window.registerCard = (name, instance) => {
    window.TaskWarriorApp.registerCard(name, instance);
};

window.getApp = () => {
    return window.TaskWarriorApp;
};

// CSS animation feedback'ui
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