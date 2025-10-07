// projekt/cards/actions-card.js

// =============================================================================
// ACTIONS KORTELĖ - SU REAL-TIME PREVIEW
// =============================================================================

class ActionsCard {
    constructor() {
        this.name = 'actions';
        this.element = null;
        this.app = null;
        this.previewContainer = null;
        this.lastCommand = { html: '', plain: '', isValid: false }; // Cache komandų
    }

    init(app) {
        this.app = app;
        
        this.element = document.querySelector('[data-card="actions"]');
        if (!this.element) {
            console.error('ACTIONS: Nerastas actions elementas');
            return;
        }

        this.setupUI();
        this.setupEvents();
        this.setupStateListeners();
        this.updatePreview();
    }

    setupUI() {
        // Preview konteineris jau turi būti HTML'e
        this.previewContainer = this.element.querySelector('#commandPreview');
        if (!this.previewContainer) {
            console.error('ACTIONS: Nerastas #commandPreview konteineris');
        }
    }

    setupEvents() {
        const saveBtn = this.element.querySelector('#saveBtn');
        const exportBtn = this.element.querySelector('#exportBtn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }
    }

    setupStateListeners() {
        // Klausytis kitų kortelių pakeitimų
        if (this.app && this.app.on) {
            this.app.on('stateChange', (data) => {
                // Atnaujinti preview kai keičiasi bet kuri kortelė
                this.updatePreview();
            });
        }

        // Backup - periodinės patestuolės
        setInterval(() => {
            this.updatePreview();
        }, 1000);
    }

    updatePreview() {
        if (!this.previewContainer) return;

        const command = this.generatePreviewCommand();
        this.lastCommand = command; // Cache'iname
        
        this.previewContainer.innerHTML = `
            <div class="preview-title">
                <span>TaskWarrior komanda:</span>
                <button id="copyCommandBtn" class="copy-btn" title="Kopijuoti komandą">📋</button>
            </div>
            <div class="command-output">
                <div class="command-text">${command.html}</div>
            </div>
        `;

        // Perkabinti copy button event'ą
        const copyBtn = this.previewContainer.querySelector('#copyCommandBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopy());
        }

        // Pažymėti ar komanda galiojanti
        this.updateValidationStatus(command);
    }

    generatePreviewCommand() {
        let htmlParts = [];
        let plainParts = [];
        let hasValidContent = false;

        // 1. Description (neprivalomas)
        const descCard = this.app?.cards?.get('description')?.instance;
        if (descCard && typeof descCard.generateTaskWarriorCommand === 'function') {
            try {
                const descCmd = descCard.generateTaskWarriorCommand();
                if (descCmd && descCmd !== '""') {
                    // Turime description
                    const fullDescCmd = 'task add ' + descCmd;
                    plainParts.push(fullDescCmd);
                    const htmlDesc = this.convertLineBreaksToHtml(descCmd);
                    htmlParts.push('task add ' + htmlDesc);
                    hasValidContent = true;
                }
            } catch (error) {
                console.warn('Description card error:', error);
            }
        }

        // 2. Annotate (neprivalomas) - kiekviena eilutė = atskira komanda
        const annotateCard = this.app?.cards?.get('annotate')?.instance;
        if (annotateCard && typeof annotateCard.generateTaskWarriorCommand === 'function') {
            try {
                const annotateCmd = annotateCard.generateTaskWarriorCommand();
                if (annotateCmd) {
                    // Jei yra description, pridėti "+"
                    if (plainParts.length > 0) {
                        plainParts.push('+');
                        htmlParts.push('+');
                    }
                    
                    // Annotate jau grąžina kelias eilutes
                    plainParts.push(annotateCmd);
                    const annotateHtml = annotateCmd.replace(/\n/g, '<br>');
                    htmlParts.push('<span class="field-annotate">' + annotateHtml + '</span>');
                    hasValidContent = true;
                }
            } catch (error) {
                console.warn('Annotate card error:', error);
            }
        }

        // Jei nieko nėra - rodyti placeholder
        if (!hasValidContent) {
            const missingText = '[Bent vienas laukas privalomas: DESCRIPTION arba ANNOTATE]';
            plainParts.push(missingText);
            htmlParts.push('<span class="missing-field">' + missingText + '</span>');
        }

        return {
            html: htmlParts.join('<br>'),
            plain: plainParts.join('\n'),
            isValid: hasValidContent
        };
    }

    // Konvertuoti \n į <br> HTML preview'ui, bet išlaikyti kabutes
    convertLineBreaksToHtml(text) {
        if (!text) return text;
        
        // Tikrinti ar tekstas prasideda ir baigiasi kabutėmis
        if (text.startsWith('"') && text.endsWith('"')) {
            // Išimti kabutes, konvertuoti line breaks, grąžinti su kabutėmis
            const content = text.slice(1, -1); // Pašalinti kabutes
            const htmlContent = content.replace(/\n/g, '<br>');
            return `"${htmlContent}"`;
        }
        
        // Jei ne kabutėse, tiesiog konvertuoti
        return text.replace(/\n/g, '<br>');
    }

    updateValidationStatus(commandObj) {
        if (!this.previewContainer) return;

        // Ieškoti global-preview-section vietoj command-preview-container
        const container = this.previewContainer.closest('.global-preview-section');
        if (!container) return;

        // Pašalinti senas klases
        container.classList.remove('valid', 'invalid', 'empty');

        // Patikrinti ar yra bet kokių klaidų žymeklių
        const hasErrors = commandObj.plain && commandObj.plain.includes('[Bent vienas laukas privalomas');

        if (!commandObj.plain || hasErrors) {
            container.classList.add('invalid');
        } else if (commandObj.isValid) {
            container.classList.add('valid');
        } else {
            container.classList.add('empty');
        }
    }

    handleSave() {
        if (this.app && this.app.saveTask) {
            this.app.saveTask();
        }
    }

    handleExport() {
        if (this.app && this.app.exportTasks) {
            this.app.exportTasks();
        }
    }

    handleCopy() {
        const cleanCommand = this.lastCommand.plain;
        
        if (!cleanCommand || cleanCommand.includes('[Bent vienas laukas privalomas')) {
            this.showFeedback('Nėra ko kopijuoti!', 'warning');
            return;
        }

        // Kopijuoti į clipboard
        navigator.clipboard.writeText(cleanCommand).then(() => {
            this.showFeedback('Komanda nukopijuota!', 'success');
        }).catch(() => {
            // Fallback metodas
            const textArea = document.createElement('textarea');
            textArea.value = cleanCommand;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showFeedback('Komanda nukopijuota!', 'success');
        });
    }

    showFeedback(message, type) {
        if (this.app && this.app.showFeedback) {
            this.app.showFeedback(message, type);
        }
    }

    getValue() {
        return this.lastCommand;
    }

    generateTaskWarriorCommand() {
        return this.lastCommand.plain || '';
    }
}

// =============================================================================
// REGISTRACIJA
// =============================================================================

let actionsCard;

document.addEventListener('DOMContentLoaded', () => {
    actionsCard = new ActionsCard();
    
    if (window.registerCard) {
        window.registerCard('actions', actionsCard);
    } else {
        setTimeout(() => {
            if (window.registerCard) {
                window.registerCard('actions', actionsCard);
            }
        }, 500);
    }
});