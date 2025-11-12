// projekt/localStorage-manager.js

// =============================================================================
// LOCALSTORAGE MANAGER - SAUGUS DUOMENŲ VALDYMAS
// =============================================================================

class LocalStorageManager {
    constructor() {
        this.storageKeys = {
            SAVED_TASKS: 'taskwarrior_saved_tasks',
            BACKUP_DATA: 'taskwarrior_backup_data',
            SETTINGS: 'taskwarrior_settings'
        };
        
        this.maxTasks = 1000; // Maksimalus tasks skaičius
        this.initializeStorage();
    }

    // =============================================================================
    // INICIALIZAVIMAS
    // =============================================================================
    
    initializeStorage() {
        try {
            // Patikrinti ar localStorage prieinamas
            if (!this.isLocalStorageSupported()) {
                console.warn('localStorage neprieinamas');
                return;
            }

            // Inicializuoti saved tasks
            if (!this.getData(this.storageKeys.SAVED_TASKS)) {
                this.setData(this.storageKeys.SAVED_TASKS, []);
            }

        } catch (error) {
            console.error('LocalStorage inicializavimo klaida:', error);
        }
    }

    // =============================================================================
    // TASK SAUGOJIMAS
    // =============================================================================
    
    saveTask(taskData) {
        try {
            // Backup prieš keitimą
            this.createBackup();

            const tasks = this.getData(this.storageKeys.SAVED_TASKS) || [];
            
            // Patikrinti size limitą
            if (tasks.length >= this.maxTasks) {
                throw new Error(`Pasiektas maksimalus tasks limitas (${this.maxTasks})`);
            }

            // Pridėti timestamp
            const taskWithMeta = {
                ...taskData,
                id: this.generateTaskId(),
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };

            tasks.push(taskWithMeta);
            this.setData(this.storageKeys.SAVED_TASKS, tasks);
            
            return taskWithMeta.id;
        } catch (error) {
            console.error('Task saugojimo klaida:', error);
            throw error;
        }
    }

    getSavedTasks() {
        try {
            return this.getData(this.storageKeys.SAVED_TASKS) || [];
        } catch (error) {
            console.error('Tasks gavimo klaida:', error);
            return [];
        }
    }

    getSavedTasksCount() {
        try {
            const tasks = this.getSavedTasks();
            return tasks.length;
        } catch (error) {
            console.error('Tasks count klaida:', error);
            return 0;
        }
    }

    deleteTask(taskId) {
        try {
            this.createBackup();
            
            const tasks = this.getData(this.storageKeys.SAVED_TASKS) || [];
            const filteredTasks = tasks.filter(task => task.id !== taskId);
            
            this.setData(this.storageKeys.SAVED_TASKS, filteredTasks);
            return true;
        } catch (error) {
            console.error('Task trynimo klaida:', error);
            return false;
        }
    }

    clearAllTasks() {
        try {
            this.createBackup();
            this.setData(this.storageKeys.SAVED_TASKS, []);
            return true;
        } catch (error) {
            console.error('Tasks valymo klaida:', error);
            return false;
        }
    }

    // =============================================================================
    // BACKUP SISTEMA
    // =============================================================================
    
    createBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                data: {
                    saved_tasks: this.getData(this.storageKeys.SAVED_TASKS)
                }
            };
            
            this.setData(this.storageKeys.BACKUP_DATA, backupData);
        } catch (error) {
            console.error('Backup kūrimo klaida:', error);
        }
    }

    restoreFromBackup() {
        try {
            const backupData = this.getData(this.storageKeys.BACKUP_DATA);
            
            if (!backupData || !backupData.data) {
                throw new Error('Backup duomenų nėra');
            }

            // Atkurti duomenis
            if (backupData.data.saved_tasks) {
                this.setData(this.storageKeys.SAVED_TASKS, backupData.data.saved_tasks);
            }

            return true;
        } catch (error) {
            console.error('Backup atkūrimo klaida:', error);
            return false;
        }
    }

    // =============================================================================
    // UTILITY FUNKCIJOS
    // =============================================================================
    
    isLocalStorageSupported() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    setData(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error(`Data saugojimo klaida (${key}):`, error);
            throw error;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Data gavimo klaida (${key}):`, error);
            return null;
        }
    }

    removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Data trynimo klaida (${key}):`, error);
            return false;
        }
    }

    generateTaskId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // =============================================================================
    // DATA EXPORT/IMPORT
    // =============================================================================
    
    exportData() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                saved_tasks: this.getData(this.storageKeys.SAVED_TASKS)
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Export klaida:', error);
            throw error;
        }
    }

    importData(jsonData) {
        try {
            // Backup prieš importavimą
            this.createBackup();
            
            const importData = JSON.parse(jsonData);
            
            // Validacija
            if (!importData.version || !importData.timestamp) {
                throw new Error('Neteisingas import formato');
            }

            // Importuoti duomenis
            if (importData.saved_tasks) {
                this.setData(this.storageKeys.SAVED_TASKS, importData.saved_tasks);
            }

            return true;
        } catch (error) {
            console.error('Import klaida:', error);
            throw error;
        }
    }

    // =============================================================================
    // SISTEMOS INFO
    // =============================================================================
    
    getStorageInfo() {
        try {
            const info = {
                isSupported: this.isLocalStorageSupported(),
                tasksCount: this.getSavedTasksCount(),
                storageUsed: 0
            };

            // Suskaičiuoti storage usage (apytiksliai)
            let totalSize = 0;
            Object.values(this.storageKeys).forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    totalSize += data.length;
                }
            });
            info.storageUsed = Math.round(totalSize / 1024); // KB

            return info;
        } catch (error) {
            console.error('Storage info klaida:', error);
            return null;
        }
    }
}

// =============================================================================
// GLOBAL INSTANCE
// =============================================================================

// Sukuriame globalų localStorage manager
window.StorageManager = new LocalStorageManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalStorageManager;
}