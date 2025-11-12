// projekt/cards/actions-card.js

class ActionsCard {
    constructor() {
        this.name = 'actions';
        this.element = null;
        this.app = null;
        this.previewContainer = null;
        this.lastCommand = { html: '', plain: '', isValid: false };
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
        if (this.app && this.app.on) {
            this.app.on('stateChange', (data) => {
                this.updatePreview();
            });
        }

        setInterval(() => {
            this.updatePreview();
        }, 1000);
    }

    updatePreview() {
        if (!this.previewContainer) return;

        const command = this.generatePreviewCommand();
        this.lastCommand = command;
        
        this.previewContainer.innerHTML = `
            <div class="preview-title">
                <span>Peržiūra:</span>
                <button id="copyCommandBtn" class="copy-btn" title="Kopijuoti">📋</button>
            </div>
            <div class="command-output">
                <div class="command-text">${command.html}</div>
            </div>
        `;

        const copyBtn = this.previewContainer.querySelector('#copyCommandBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopy());
        }

        this.updateValidationStatus(command);
    }

    generatePreviewCommand() {
        let htmlParts = [];
        let plainParts = [];
        let hasValidContent = false;

        const descCard = this.app?.cards?.get('description')?.instance;
        if (descCard && typeof descCard.generateTaskWarriorCommand === 'function') {
            try {
                const descCmd = descCard.generateTaskWarriorCommand();
                if (descCmd) {
                    plainParts.push(descCmd);
                    const htmlDesc = this.convertLineBreaksToHtml(descCmd);
                    htmlParts.push(htmlDesc);
                    hasValidContent = true;
                }
            } catch (error) {
                console.warn('Description card error:', error);
            }
        }

        const annotateCard = this.app?.cards?.get('annotate')?.instance;
        if (annotateCard && typeof annotateCard.generateTaskWarriorCommand === 'function') {
            try {
                const annotateCmd = annotateCard.generateTaskWarriorCommand();
                if (annotateCmd) {
                    if (plainParts.length > 0) {
                        plainParts.push('+');
                        htmlParts.push('+');
                    }
                    
                    plainParts.push(annotateCmd);
                    const annotateHtml = annotateCmd.replace(/\n/g, '<br>');
                    htmlParts.push('<span class="field-annotate">' + annotateHtml + '</span>');
                    hasValidContent = true;
                }
            } catch (error) {
                console.warn('Annotate card error:', error);
            }
        }

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

    convertLineBreaksToHtml(text) {
        if (!text) return text;
        return text.replace(/\n/g, '<br>');
    }

    updateValidationStatus(commandObj) {
        if (!this.previewContainer) return;

        const container = this.previewContainer.closest('.global-preview-section');
        if (!container) return;

        container.classList.remove('valid', 'invalid', 'empty');

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

        navigator.clipboard.writeText(cleanCommand).then(() => {
            this.showFeedback('Nukopijuota!', 'success');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = cleanCommand;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showFeedback('Nukopijuota!', 'success');
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