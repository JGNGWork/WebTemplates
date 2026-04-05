/**
 * Handles modular JSON fetching and dynamic theme injection.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // SVG Dictionary for social icons to keep JSON clean
    // Official Brand Colors (Originals)
    const socialIcons = {
        linkedin: '<svg viewBox="0 0 24 24"><path fill="#0077B5" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
        github: '<svg viewBox="0 0 24 24"><path fill="#181717" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24"><path fill="#000000" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
        telegram: '<svg viewBox="0 0 24 24"><path fill="#26A5E4" d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-1.891 8.911c-.143.639-.52.798-1.056.497l-2.883-2.125-1.391 1.338c-.153.153-.283.283-.58.283l.206-2.934 5.339-4.823c.233-.206-.051-.321-.36-.115l-6.599 4.156-2.846-.89c-.619-.194-.631-.619.129-.914l11.119-4.284c.514-.186.963.123.754.984z"/></svg>'
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
            
            // Mapping JSON keys to CSS Variables
            root.style.setProperty('--theme-color', theme.primaryColor);
            root.style.setProperty('--body-bg', theme.bodyBackground);
            root.style.setProperty('--footer-bg', theme.footerBackground);
            root.style.setProperty('--card-bg', theme.cardBackground);
            root.style.setProperty('--card-header-bg', theme.cardHeaderBackground);
            root.style.setProperty('--text-main', theme.textMain);
            root.style.setProperty('--text-muted', theme.textMuted);
            root.style.setProperty('--text-on-dark', theme.textOnDark);
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