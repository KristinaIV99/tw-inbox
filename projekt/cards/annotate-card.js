// projekt/cards/annotate-card.js

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
        
        const textarea = document.createElement('textarea');
        textarea.id = 'annotateInput';
        textarea.className = 'annotate-textarea';
        textarea.placeholder = 'Įveskite užduotis...\nKiekviena eilutė = atskira užduotis.';
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

    clearForm() {
        const textarea = document.getElementById('annotateInput');
        if (textarea) {
            textarea.value = '';
        }
        
        this.annotate = '';
        
        this.updateState();
    }

    getValue() {
        const textarea = document.getElementById('annotateInput');
        if (textarea) {
            this.annotate = textarea.value;
        }
        
        return this.annotate;
    }

    generateTaskWarriorCommand() {
        if (!this.annotate || this.annotate.trim() === '') return '';
        
        const lines = this.annotate.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) return '';
        
        return lines.join('\n');
    }

    isValid() {
        return true;
    }

    getValidationMessage() {
        return '';
    }
}

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