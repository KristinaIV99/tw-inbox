// projekt/help-modal.js - Help Modal Sistema

// =============================================================================
// HELP MODAL FUNKCIONALUMAS
// =============================================================================

class HelpModal {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // Laukti kad DOM būtų užkrautas
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupModal();
            });
        } else {
            this.setupModal();
        }
    }

    setupModal() {
        this.modal = document.getElementById('helpModal');
        if (!this.modal) {
            console.error('Help modal nerastas HTML dokumente');
            return;
        }

        // Event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal background click - uždaryti
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // ESC klavišas - uždaryti
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.close();
            }
        });

        // Close button
        const closeBtn = this.modal.querySelector('.help-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Footer button
        const footerBtn = this.modal.querySelector('.help-modal-btn');
        if (footerBtn) {
            footerBtn.addEventListener('click', () => this.close());
        }
    }

    show(helpType) {
        if (!this.modal || !window.DATA || !window.DATA.HELP) {
            console.error('Help duomenys neprieiniami');
            return;
        }

        const helpText = window.DATA.HELP[helpType];
        if (!helpText) {
            console.error(`Help tekstas nerasta tipui: ${helpType}`);
            return;
        }

        // Atnaujinti modal turinį
        this.updateModalContent(helpType, helpText);
        
        // Rodyti modal
        this.modal.classList.add('show');
        this.isVisible = true;
        
        // Išvengti body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('show');
        this.isVisible = false;
        
        // Atkurti body scroll
        document.body.style.overflow = '';
    }

    updateModalContent(helpType, helpText) {
        const title = this.modal.querySelector('#helpModalTitle');
        const body = this.modal.querySelector('#helpModalBody');

        if (!title || !body) {
            console.error('Modal elementai nerasti');
            return;
        }

        // Atnaujinti antraštę
        const titles = {
            'DESCRIPTION': 'DESCRIPTION Laukas',
            'ANNOTATE': 'ANNOTATE Laukas'
        };
        
        title.textContent = titles[helpType] || `${helpType} Pagalba`;

        // Atnaujinti turinį
        body.innerHTML = this.formatHelpText(helpText);
        
        // Scroll į viršų
        body.scrollTop = 0;
    }

    formatHelpText(text) {
        if (!text) return '<p>Pagalba nepasiekiama.</p>';

        // Padalinti tekstą į dalis pagal dvigubą line break
        const sections = text.split('\n\n');
        let formattedHTML = '';

        sections.forEach((section, index) => {
            section = section.trim();
            if (!section) return;

            // Patikrinti ar sekcija prasideda pavyzdžiais
            if (section.startsWith('Pavyzdžiai:') || section.includes('Pavyzdžiai:')) {
                formattedHTML += this.formatExamplesSection(section);
            }
            // Patikrinti ar sekcija prasideda formatais
            else if (section.startsWith('Formatai:') || section.includes('Formatai:')) {
                formattedHTML += this.formatExamplesSection(section);
            }
            // Patikrinti ar sekcija prasideda "SVARBU:"
            else if (section.startsWith('SVARBU:') || section.includes('SVARBU:')) {
                formattedHTML += this.formatExamplesSection(section);
            }
            // Paprastas paragrafas
            else {
                formattedHTML += `<p>${this.formatInlineElements(section)}</p>`;
            }
        });

        return formattedHTML || '<p>Pagalba nepasiekiama.</p>';
    }

    formatExamplesSection(section) {
        const lines = section.split('\n');
        const title = lines[0];
        const examples = lines.slice(1).filter(line => line.trim());

        let html = `<h4>${title}</h4>`;
        html += '<div class="help-examples">';
        
        examples.forEach(example => {
            const trimmed = example.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                // Šalinti bullet point ir formatuoti
                const cleanExample = trimmed.substring(1).trim();
                html += `<div class="help-example-item">${this.formatInlineElements(cleanExample)}</div>`;
            } else if (trimmed) {
                html += `<div class="help-example-item">${this.formatInlineElements(trimmed)}</div>`;
            }
        });
        
        html += '</div>';
        return html;
    }

    formatInlineElements(text) {
        // Formatuoti inline code elements
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Formatuoti TaskWarrior komandas
        text = text.replace(/(\w+:\S+)/g, '<code>$1</code>');
        
        // Formatuoti dates
        text = text.replace(/(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?)/g, '<code>$1</code>');
        
        // Bold tekstas
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
}

// =============================================================================
// GLOBALIOS FUNKCIJOS
// =============================================================================

// Globalus help modal instance
let helpModalInstance = null;

// Funkcija rodymui (iškviečiama iš HTML onclick)
function showHelpModal(helpType) {
    if (!helpModalInstance) {
        helpModalInstance = new HelpModal();
        
        // Laukti, kad modal būtų setup
        setTimeout(() => {
            if (helpModalInstance) {
                helpModalInstance.show(helpType);
            }
        }, 100);
    } else {
        helpModalInstance.show(helpType);
    }
}

// Funkcija uždarymui (iškviečiama iš HTML onclick)
function closeHelpModal() {
    if (helpModalInstance) {
        helpModalInstance.close();
    }
}

// Inicializuoti modal sistemą
document.addEventListener('DOMContentLoaded', () => {
    if (!helpModalInstance) {
        helpModalInstance = new HelpModal();
    }
});

// Export'as modulinėms sistemoms
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HelpModal, showHelpModal, closeHelpModal };
}