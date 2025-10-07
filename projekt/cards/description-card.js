// projekt/cards/description-card.js

// =============================================================================
// DESCRIPTION KORTELĖ - SU MILESTONE IR MULTI-LINE PALAIKYMU
// =============================================================================

class DescriptionCard {
    constructor() {
        this.name = 'description';
        this.description = '';
        this.isMilestone = false;
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

        // Milestone toggle row
        const milestoneRow = document.createElement('div');
        milestoneRow.className = 'milestone-row';
        
        const milestoneBtn = document.createElement('button');
        milestoneBtn.type = 'button';
        milestoneBtn.className = 'milestone-btn';
        milestoneBtn.textContent = 'MILESTONE';
        milestoneBtn.onclick = () => this.toggleMilestone(milestoneBtn);
        
        milestoneRow.appendChild(milestoneBtn);
        
        // Description textarea
        const textarea = document.createElement('textarea');
        textarea.id = 'descriptionInput';
        textarea.className = 'description-textarea';
        textarea.placeholder = 'Įveskite užduotį...';
        textarea.oninput = () => {
            this.updateDescription();
            this.autoResize(textarea);
        };
        
        container.appendChild(milestoneRow);
        container.appendChild(textarea);
    }

    toggleMilestone(button) {
        this.isMilestone = !this.isMilestone;
        
        if (this.isMilestone) {
            button.classList.add('active');
            button.textContent = 'MILESTONE: ON';
        } else {
            button.classList.remove('active');
            button.textContent = 'MILESTONE';
        }
        
        this.updateState();
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
            this.app.updateState('currentTask.description', {
                text: this.description,
                isMilestone: this.isMilestone
            });
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
        // Išvalyti description textarea
        const textarea = document.getElementById('descriptionInput');
        if (textarea) {
            textarea.value = '';
        }
        
        // Reset milestone būseną
        const milestoneBtn = this.element.querySelector('.milestone-btn');
        if (milestoneBtn) {
            milestoneBtn.classList.remove('active');
            milestoneBtn.textContent = 'MILESTONE';
        }
        
        // Reset internal state
        this.description = '';
        this.isMilestone = false;
        
        // Update app state
        this.updateState();
    }

    // =============================================================================
    // PAGRINDINĖS FUNKCIJOS
    // =============================================================================

    getValue() {
        // Forced update - gauti dabartinę reikšmę iš textarea
        const textarea = document.getElementById('descriptionInput');
        if (textarea) {
            this.description = textarea.value.trim();
        }
        
        return {
            text: this.description,
            isMilestone: this.isMilestone
        };
    }

    // TaskWarrior formatavimas su multi-line palaikymu
    generateTaskWarriorCommand() {
        if (!this.description) return '';
        
        const finalDescription = this.isMilestone ? `MILESTONE: ${this.description}` : this.description;
        
        // TaskWarrior formatas - tiesiog kabutėse su tikrais line break'ais
        return `"${finalDescription}"`;
    }

    // =============================================================================
    // VALIDATION
    // =============================================================================
    
    isValid() {
        return true; // DESCRIPTION neprivalomas
    }

    getValidationMessage() {
        return ''; // Neprivalomas, todėl nėra klaidos
    }
}

// =============================================================================
// REGISTRACIJA
// =============================================================================

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