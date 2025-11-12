// projekt/cards/description-card.js

class DescriptionCard {
    constructor() {
        this.name = 'description';
        this.description = '';
        this.element = null;
        this.app = null;
    }

    init(app) {
        this.app = app;
        
        this.element = document.querySelector('[data-card="description"]');
        if (!this.element) {
            console.error('DESCRIPTION: Nerastas description elementas');
            return;
        }

        this.generateUI();
        this.setupEvents();
    }

    generateUI() {
        const container = this.element.querySelector('#descriptionCategories');
        
        if (!container) {
            console.error('DESCRIPTION: Nerastas #descriptionCategories konteineris');
            return;
        }

        container.innerHTML = '';
        
        const textarea = document.createElement('textarea');
        textarea.id = 'descriptionInput';
        textarea.className = 'description-textarea';
        textarea.placeholder = 'Įveskite su kuria sritimi tai susiję...';
        textarea.oninput = () => {
            this.updateDescription();
            this.autoResize(textarea);
        };
        
        container.appendChild(textarea);
    }

    updateDescription() {
        const textarea = document.getElementById('descriptionInput');
        if (textarea) {
            this.description = textarea.value.trim();
        }
        
        this.updateState();
    }

    updateState() {
        if (this.app) {
            this.app.updateState('currentTask.description', this.description);
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
        const textarea = document.getElementById('descriptionInput');
        if (textarea) {
            textarea.value = '';
        }
        
        this.description = '';
        
        this.updateState();
    }

    getValue() {
        const textarea = document.getElementById('descriptionInput');
        if (textarea) {
            this.description = textarea.value.trim();
        }
        
        return this.description;
    }

    generateTaskWarriorCommand() {
        if (!this.description) return '';
        
        return this.description;
    }

    isValid() {
        return true;
    }

    getValidationMessage() {
        return '';
    }
}

let descriptionCard;

document.addEventListener('DOMContentLoaded', () => {
    descriptionCard = new DescriptionCard();
    
    if (window.registerCard) {
        window.registerCard('description', descriptionCard);
    } else {
        setTimeout(() => {
            if (window.registerCard) {
                window.registerCard('description', descriptionCard);
            }
        }, 500);
    }
});