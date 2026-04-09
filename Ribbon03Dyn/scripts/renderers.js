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
        
        // Map items and apply conditional formatting
        const itemsHtml = category.items.map((item, index) => {
            // First item is usually the 'Goal'
            if (index === 0) {
                return `<li class="card-goal"><strong>${item}</strong></li>`;
            }
            // Items with emojis or 'Business Impact' text get a special class
            if (item.includes('👉') || item.toLowerCase().includes('impact')) {
                return `<li class="card-impact">${item}</li>`;
            }
            // Standard bullet points
            return `<li>${item}</li>`;
        }).join('');
        
        card.innerHTML = `
            <div class="accordion-header"><h3>${category.categoryTitle}</h3></div>
            <div class="accordion-content">
                <ul>
                    ${itemsHtml}
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
            
            //content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
            // Smooth accordion transition
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.style.paddingBottom = "0";
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.paddingBottom = "20px";
            }
        });
    });
}