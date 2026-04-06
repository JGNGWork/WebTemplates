/**
 * UI Renderer Module
 * Functions to dynamically build Services (Flashcards) and About (Accordion) sections.
 */

export function renderFlashcards(container, data) {
    if (!container) return;
    container.innerHTML = ''; 
    data.forEach(category => {
        const card = document.createElement('div');
        card.className = 'accordion-item flashcard';
        card.innerHTML = `
            <div class="accordion-header">${category.categoryTitle}</div>
            <div class="accordion-content">
                <ul>
                    ${category.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>`;
        container.appendChild(card);
    });
}

export function renderAccordion(container, data) {
    if (!container) return;
    container.innerHTML = '';
    data.forEach(section => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'accordion-item';
        
        const btn = document.createElement('button');
        btn.className = 'accordion-header';
        btn.innerHTML = `${section.categoryTitle} <span class="icon">+</span>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';
        contentDiv.innerHTML = `<ul>${section.items.map(i => `<li>${i}</li>`).join('')}</ul>`;

        itemDiv.appendChild(btn);
        itemDiv.appendChild(contentDiv);
        container.appendChild(itemDiv);

        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('.icon');
            if (icon) icon.textContent = this.classList.contains('active') ? '-' : '+';
            const content = this.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
        });
    });
}