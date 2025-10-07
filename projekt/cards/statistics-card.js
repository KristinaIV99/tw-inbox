// projekt/cards/statistics-card.js

// =============================================================================
// STATISTICS KORTELĖ - EXPANDABLE SAVED TASKS
// =============================================================================

class StatisticsCard {
    constructor() {
        this.name = 'statistics';
        this.element = null;
        this.app = null;
        this.isExpanded = false;
        this.savedTasks = [];
    }

    init(app) {
        this.app = app;
        
        this.element = document.querySelector('[data-card="stats"]');
        if (!this.element) {
            console.error('STATISTICS: Nerastas stats elementas');
            return;
        }

        this.generateUI();
        this.setupEvents();
        this.updateTaskCount();
    }

    generateUI() {
        const container = this.element.querySelector('.card-content');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-display" id="statsToggle">
                Išsaugota užduočių: <span id="taskCount">0</span>
            </div>
            <div class="saved-tasks-container" id="savedTasksContainer" style="display: none;">
                <div class="saved-tasks-list" id="savedTasksList">
                    <!-- Tasks bus užkrauti čia -->
                </div>
                <div class="bulk-actions">
                    <button class="bulk-btn clear-all-btn" id="clearAllBtn">Clear All</button>
                </div>
            </div>
        `;
    }

    setupEvents() {
        // Toggle expand/collapse
        const toggle = document.getElementById('statsToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleExpanded());
        }

        // Bulk actions - tik Clear All
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllTasks());
        }

        // Listen for task count updates
        if (this.app && this.app.on) {
            this.app.on('stateChange', (data) => {
                if (data.path === 'app.savedTasksCount') {
                    this.updateTaskCount();
                }
            });
        }
    }

    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        const container = document.getElementById('savedTasksContainer');
        
        if (this.isExpanded) {
            this.loadSavedTasks();
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }

    loadSavedTasks() {
        if (!window.StorageManager) {
            console.error('StorageManager neprieinamas');
            return;
        }

        this.savedTasks = window.StorageManager.getSavedTasks() || [];
        this.renderTasksList();
    }

    renderTasksList() {
        const container = document.getElementById('savedTasksList');
        if (!container) return;

        if (this.savedTasks.length === 0) {
            container.innerHTML = '<div class="no-tasks">Nėra išsaugotų užduočių</div>';
            return;
        }

        // Sort by timestamp (newest first)
        const sortedTasks = [...this.savedTasks].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sortedTasks.map(task => this.renderTaskItem(task)).join('');
    }

    renderTaskItem(task) {
        const timestamp = new Date(task.timestamp);
        const formattedDate = this.formatDate(timestamp);
        const command = task.taskCommand || 'Nėra komandos';

        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-timestamp">${formattedDate}</div>
                <div class="task-command">${this.escapeHtmlAndConvertNewlines(command)}</div>
                <div class="task-actions">
                    <button class="task-btn delete-btn" onclick="statisticsCard.deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `📅 ${year}-${month}-${day} ${hours}:${minutes}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // NAUJAS METODAS: escape HTML IR konvertuoti \n į <br>
    escapeHtmlAndConvertNewlines(text) {
        // Pirma escape'iname HTML
        const escaped = this.escapeHtml(text);
        // Tada keičiame \n į <br>
        return escaped.replace(/\n/g, '<br>');
    }

    // =============================================================================
    // TASK ACTIONS
    // =============================================================================

    deleteTask(taskId) {
        if (!confirm('Ar tikrai norite ištrinti šią užduotį?')) {
            return;
        }

        if (window.StorageManager && window.StorageManager.deleteTask(taskId)) {
            this.showFeedback('Užduotis ištrinta!', 'success');
            this.loadSavedTasks(); // Reload list
            this.updateTaskCount(); // Update counter
        } else {
            this.showFeedback('Klaida trinant užduotį', 'error');
        }
    }

    clearAllTasks() {
        if (this.savedTasks.length === 0) {
            this.showFeedback('Nėra užduočių ištrynimui', 'error');
            return;
        }

        if (!confirm(`Ar tikrai norite ištrinti visas ${this.savedTasks.length} išsaugotas užduotis? Šis veiksmas negrįžtamas!`)) {
            return;
        }

        if (window.StorageManager && window.StorageManager.clearAllTasks()) {
            this.showFeedback('Visos užduotys ištrytos!', 'success');
            this.savedTasks = [];
            this.renderTasksList();
            this.updateTaskCount();
            
            // Collapse if expanded
            if (this.isExpanded) {
                this.toggleExpanded();
            }
        } else {
            this.showFeedback('Klaida trinant užduotis', 'error');
        }
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    updateTaskCount() {
        const count = window.StorageManager ? window.StorageManager.getSavedTasksCount() : 0;
        const taskCountEl = document.getElementById('taskCount');
        if (taskCountEl) {
            taskCountEl.textContent = count;
        }

        // REMOVED app.updateState() to prevent infinite loop
        // Statistics card should only display, not modify app state
    }

    showFeedback(message, type) {
        if (this.app && this.app.showFeedback) {
            this.app.showFeedback(message, type);
        } else {
            // Fallback
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// =============================================================================
// REGISTRACIJA
// =============================================================================

let statisticsCard;

document.addEventListener('DOMContentLoaded', () => {
    statisticsCard = new StatisticsCard();
    
    if (window.registerCard) {
        window.registerCard('statistics', statisticsCard);
    } else {
        setTimeout(() => {
            if (window.registerCard) {
                window.registerCard('statistics', statisticsCard);
            }
        }, 500);
    }
});
