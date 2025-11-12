// projekt/export-manager.js
// TXT EXPORT VERSIJA

class ExportManager {
    constructor() {
        this.app = null;
    }

    init(app) {
        this.app = app;
        console.log('✅ ExportManager initialized');
    }

    exportTasks() {
        if (!window.StorageManager) {
            this.showFeedback('StorageManager neprieinamas!', 'error');
            return;
        }
        
        const savedTasks = window.StorageManager.getSavedTasks();
        
        if (!savedTasks || savedTasks.length === 0) {
            this.showFeedback('Nėra išsaugotų užduočių eksportavimui!', 'error');
            return;
        }
        
        // Generuoti .txt turinį
        let txtContent = '';
        
        savedTasks.forEach((task, index) => {
            // Pridėti task komandą
            if (task.taskCommand) {
                txtContent += task.taskCommand;
            }
            
            // Pridėti tuščią eilutę tarp taskų
            if (index < savedTasks.length - 1) {
                txtContent += '\n\n';
            }
        });
        
        // Sukurti .txt failą
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        a.download = `taskwarrior_${timestamp}.txt`;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 200);
        
        this.showFeedback(`${savedTasks.length} užduočių eksportuota!`, 'success');
    }

    showFeedback(message, type) {
        if (this.app && this.app.showFeedback) {
            this.app.showFeedback(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Global export
window.ExportManager = new ExportManager();

// Register with app
document.addEventListener('DOMContentLoaded', () => {
    const checkApp = setInterval(() => {
        if (window.TaskWarriorApp) {
            window.ExportManager.init(window.TaskWarriorApp);
            clearInterval(checkApp);
        }
    }, 100);
});