// Wait for the HTML document to fully load
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Fetch the plain text JSON file and populate the website
    fetch('content.json')
        .then(response => response.json())
        .then(data => {
            // Inject the Theme Color ---
            document.documentElement.style.setProperty('--theme-color', data.themeColor);
            
            // Inject single text items
            document.getElementById('company-title').textContent = data.companyName;
            document.getElementById('contact-email').textContent = data.email;
            document.getElementById('contact-phone').textContent = data.phone;
            document.getElementById('contact-location').textContent = data.location;

            // Inject IT Services list items
            const itList = document.getElementById('it-services-list');
            data.itServices.forEach(service => {
                let li = document.createElement('li');
                li.textContent = service;
                itList.appendChild(li);
            });

            // Inject AI Services list items
            const aiList = document.getElementById('ai-services-list');
            data.aiServices.forEach(service => {
                let li = document.createElement('li');
                li.textContent = service;
                aiList.appendChild(li);
            });
        })
        .catch(error => console.error('Error loading content:', error));

    // 2. The existing Accordion Logic
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(accordion => {
        accordion.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('.icon');
            icon.textContent = this.classList.contains('active') ? '-' : '+';
            
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});