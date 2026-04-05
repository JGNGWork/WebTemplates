/**
 * Handles modular JSON fetching and dynamic theme injection.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // SVG Dictionary for social icons to keep JSON clean
    const socialIcons = {
        linkedin: '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
        github: '<svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>'
    };

    /**
     * Main data loader using Promise.all to fetch separate modules.
     */
    async function initWebsite() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Configuration paths
        const themeName = urlParams.get('theme') || 'default';
        const files = {
            header: 'content/header.json',
            body: 'content/body.json',
            contact: 'content/contact.json',
            theme: `themes/${themeName}.json`
        };

        // UI Loading state
        const titleElements = document.querySelectorAll('#company-title');
        titleElements.forEach(el => el.textContent = "Loading...");

        try {
            // Fetch all modules in parallel
            const [headerRes, bodyRes, contactRes, themeRes] = await Promise.all([
                fetch(files.header),
                fetch(files.body),
                fetch(files.contact),
                fetch(files.theme)
            ]);

            // Validate responses
            if (!headerRes.ok || !bodyRes.ok || !contactRes.ok || !themeRes.ok) {
                throw new Error("One or more content modules failed to load.");
            }

            const headerData = await headerRes.json();
            const bodyData = await bodyRes.json();
            const contactData = await contactRes.json();
            const themeData = await themeRes.json();

            // 1. INJECT THEME VARIABLES
            const root = document.documentElement;
            const theme = themeData.theme;
            root.style.setProperty('--theme-color', theme.primaryColor);
            root.style.setProperty('--body-bg', theme.bodyBackground);
            root.style.setProperty('--footer-bg', theme.footerBackground);
            root.style.setProperty('--header-image', `url('${theme.headerImage}')`);

            // 2. INJECT HEADER & CONTACT TEXT
            titleElements.forEach(el => el.textContent = headerData.header.companyName);
            document.getElementById('contact-email').textContent = contactData.contact.email;
            document.getElementById('contact-phone').textContent = contactData.contact.phone;
            document.getElementById('contact-location').textContent = contactData.contact.location;

            // 3. DYNAMICALLY BUILD SERVICES ACCORDIONS
            const servicesContainer = document.getElementById('dynamic-services-container');
            servicesContainer.innerHTML = ''; 

            bodyData.services.forEach(category => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'accordion-item';

                const btn = document.createElement('button');
                btn.className = 'accordion-header';
                btn.innerHTML = `${category.categoryTitle} <span class="icon">+</span>`;

                const contentDiv = document.createElement('div');
                contentDiv.className = 'accordion-content';
                const ul = document.createElement('ul');

                category.items.forEach(service => {
                    let li = document.createElement('li');
                    li.textContent = service;
                    ul.appendChild(li);
                });

                contentDiv.appendChild(ul);
                itemDiv.appendChild(btn);
                itemDiv.appendChild(contentDiv);
                servicesContainer.appendChild(itemDiv);

                // Attach animation logic
                btn.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const icon = this.querySelector('.icon');
                    icon.textContent = this.classList.contains('active') ? '-' : '+';
                    
                    const content = this.nextElementSibling;
                    content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
                });
            });

            // 4. DYNAMICALLY BUILD SOCIAL LINKS
            const socialContainer = document.getElementById('dynamic-social-links');
            socialContainer.innerHTML = ''; 

            for (const [platform, url] of Object.entries(contactData.contact.social)) {
                if (url && socialIcons[platform]) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.target = '_blank';
                    a.setAttribute('aria-label', platform);
                    a.innerHTML = socialIcons[platform];
                    socialContainer.appendChild(a);
                }
            }

        } catch (error) {
            console.error("Initialization Failed:", error);
            titleElements.forEach(el => el.textContent = "Error loading site.");
        }
    }

    initWebsite();
});