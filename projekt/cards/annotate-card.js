// projekt/cards/annotate-card.js

// =============================================================================
// ANNOTATE KORTELĖ - MULTI-LINE ANNOTATIONS
// =============================================================================

class AnnotateCard {
    constructor() {
        this.name = 'annotate';
        this.annotate = '';
        this.element = null;
        this.app = null;
    }

    init(app) {
        this.app = app;
        
        this.element = document.querySelector('[data-card="annotate"]');
        if (!this.element) {
            console.error('ANNOTATE: Nerastas annotate elementas');
            return;
        }

        this.generateUI();
        this.setupEvents();
    }

    generateUI() {
        const container = this.element.querySelector('#annotateContainer');
        
        if (!container) {
            console.error('ANNOTATE: Nerastas #annotateContainer konteineris');
            return;
        }

        container.innerHTML = '';
        
        // Annotate textarea
        const textarea = document.createElement('textarea');
        textarea.id = 'annotateInput';
        textarea.className = 'annotate-textarea';
        textarea.placeholder = 'Įveskite pastabas ar papildomą informaciją...\nKiekviena eilutė bus atskira annotate komanda.';
        textarea.oninput = () => {
            this.updateAnnotate();
            this.autoResize(textarea);
        };
        
        container.appendChild(textarea);
    }

    updateAnnotate() {
        const textarea = document.getElementById('annotateInput');
        if (textarea) {
            this.annotate = textarea.value;
        }
        
        this.updateState();
    }

    updateState() {
        if (this.app) {
            this.app.updateState('currentTask.annotate', this.annotate);
        }
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        
        // Kontroliuoti max height JavaScript'e
        if (textarea.scrollHeight > 300) {
            textarea.style.height = '300px';
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
    }

    setupEvents() {
        // Events jau pridėti generateUI metu
    }

    // =============================================================================
    // CLEAR FORM METODAS
    // =============================================================================
    
    clearForm() {
        // Išvalyti annotate textarea
        const textarea = document.getElementById('annotateInput');
        if (textarea) {
            textarea.value = '';
        }
        
        // Reset internal state
        this.annotate = '';
        
        // Update app state
        this.updateState();
    }

    // =============================================================================
    // PAGRINDINĖS FUNKCIJOS
    // =============================================================================

    getValue() {
        // Forced update - gauti dabartinę reikšmę iš textarea
        const textarea = document.getElementById('annotateInput');
        if (textarea) {
            this.annotate = textarea.value;
        }
        
        return this.annotate;
    }

    // TaskWarrior formatavimas - kiekviena eilutė = atskira komanda
    generateTaskWarriorCommand() {
        if (!this.annotate || this.annotate.trim() === '') return '';
        
        // Padalinti į eilutes
        const lines = this.annotate.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) return '';
        
        // Kiekvienai eilutei sukurti task <ID> annotate komandą
        const commands = lines.map(line => {
            // Escape kabutes jei yra
            const escapedLine = line.replace(/"/g, '\\"');
            return `task <ID> annotate "${escapedLine}"`;
        });
        
        return commands.join('\n');
    }

    // =============================================================================
    // VALIDATION
    // =============================================================================
    
    isValid() {
        return true; // ANNOTATE neprivalomas
    }

    getValidationMessage() {
        return ''; // Neprivalomas, todėl nėra klaidos
    }
}

// =============================================================================
// REGISTRACIJA
// =============================================================================

let annotateCard;

document.addEventListener('DOMContentLoaded', () => {
    annotateCard = new AnnotateCard();
    
    if (window.registerCard) {
        window.registerCard('annotate', annotateCard);
    } else {
        setTimeout(() => {
            if (window.registerCard) {
                window.registerCard('annotate', annotateCard);
            }
        }, 500);
    }
});
