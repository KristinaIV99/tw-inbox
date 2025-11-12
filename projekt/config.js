// TASKWARRIOR INBOX - TECHNINĖ KONFIGŪRACIJA

// Pagrindiniai sistemos nustatymai
const CONFIG = {
    // Aplikacijos nustatymai
    APP: {
        TITLE: 'TASKWARRIOR INBOX',
        VERSION: '1.0.0',
        AUTHOR: 'TaskWarrior Team'
    },
    
    // Validacijos nustatymai
    VALIDATION: {
        DESCRIPTION: {
            MIN_LENGTH: 0,
            MAX_LENGTH: 500
        },
        ANNOTATE: {
            MIN_LENGTH: 0,
            MAX_LENGTH: 5000
        }
    }
};

// Sistemos tekstai ir užrašai
const SYSTEM_TEXTS = {
    MAIN_TITLE: 'TASKWARRIOR INBOX'
};

// UI konstantos
const UI_CONSTANTS = {
    COLORS: {
        PRIMARY: '#4299e1',
        BACKGROUND: '#f7fafc',
        TEXT: '#4a5568',
        SUCCESS: '#68d391',
        WARNING: '#f6e05e',
        ERROR: '#fc8181',
        HIGH_PRIORITY: '#f56565',
        MEDIUM_PRIORITY: '#f6e05e',
        LOW_PRIORITY: '#68d391'
    },
    
    TRANSITIONS: {
        FAST: '0.2s ease',
        NORMAL: '0.3s ease',
        SLOW: '0.5s ease'
    },
    
    BREAKPOINTS: {
        MOBILE: '480px',
        TABLET: '768px',
        DESKTOP: '1024px'
    }
};

// LocalStorage raktai
const STORAGE_KEYS = {
    TASKS: 'taskwarrior_tasks',
    SETTINGS: 'taskwarrior_settings',
    CURRENT_TASK: 'taskwarrior_current_task',
    STATS: 'taskwarrior_stats'
};

// =============================================================================
// SAFETY CHECKS & INITIALIZATION
// =============================================================================

// Patikrinti ar visi reikalingi objektai egzistuoja
function validateConfig() {
    const errors = [];
    
    if (!CONFIG) errors.push('CONFIG object missing');
    if (!SYSTEM_TEXTS) errors.push('SYSTEM_TEXTS object missing');
    if (!UI_CONSTANTS) errors.push('UI_CONSTANTS object missing');
    if (!STORAGE_KEYS) errors.push('STORAGE_KEYS object missing');
    
    if (errors.length > 0) {
        console.error('Config validation errors:', errors);
        return false;
    }
    
    return true;
}

// Eksportavimas globaliam naudojimui su safety check
(function() {
    try {
        window.CONFIG = CONFIG;
        window.SYSTEM_TEXTS = SYSTEM_TEXTS;
        window.UI_CONSTANTS = UI_CONSTANTS;
        window.STORAGE_KEYS = STORAGE_KEYS;
        
        // Validate config
        if (validateConfig()) {
            console.log('✅ Config loaded and validated successfully');
        } else {
            console.error('❌ Config validation failed');
        }
        
    } catch (error) {
        console.error('❌ Error exporting config to window:', error);
    }
})();