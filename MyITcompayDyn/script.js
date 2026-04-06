// Wait for the HTML document to fully load
document.addEventListener('DOMContentLoaded', () => {
    
    // A dictionary of SVG paths so your JSON doesn't get cluttered with raw code
    // Social icons dictionary
    const socialIcons = {
        linkedin: '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
        github: '<svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>'
    };
    
    // --- 1. ENCAPSULATE IN A REUSABLE FUNCTION ---
    function loadCompanyData(jsonFileUrl) {
        
        // Update title to show it's loading
        // Find the title element once to reuse
        const mainTitle = document.getElementById('company-title');
        if (mainTitle) mainTitle.textContent = "Loading...";
        
        // Fetch the plain text JSON file and populate the website
        fetch(jsonFileUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            
            .then(data => {
                // 1. INJECT THEME VARIABLES
                const root = document.documentElement;
                root.style.setProperty('--theme-color', data.theme.primaryColor);
                root.style.setProperty('--body-bg', data.theme.bodyBackground);
                root.style.setProperty('--footer-bg', data.theme.footerBackground);
                // Format the URL properly for CSS
                root.style.setProperty('--header-image', `url('${data.theme.headerImage}')`);
                
                // 2. INJECT HEADER & CONTACT TEXT
                console.log("Header Title: ", data.header.companyName);
                document.title = data.header.companyName;
                // 3.2 Update all elements with id="company-title" (like <h1> or <h2>)
                const titleElements = document.querySelectorAll('#company-title');
                titleElements.forEach(el => el.textContent = data.header.companyName);

                //document.getElementById('company-title').textContent = data.header.companyName;
                document.getElementById('contact-email').textContent = data.contact.email;
                document.getElementById('contact-phone').textContent = data.contact.phone;
                document.getElementById('contact-location').textContent = data.contact.location;
                
                // 3. DYNAMICALLY BUILD SERVICES ACCORDIONS
                const servicesContainer = document.getElementById('dynamic-services-container');
                servicesContainer.innerHTML = ''; // IMPORTANT: Clear out old items before adding new ones
                
                data.services.forEach(category => {
                    // Build the outer div
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'accordion-item';
                    
                    // Build the button
                    const btn = document.createElement('button');
                    btn.className = 'accordion-header';
                    btn.innerHTML = `${category.categoryTitle} <span class="icon">+</span>`;
                    
                    // Build the content div and list
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'accordion-content';
                    const ul = document.createElement('ul');
                    
                    category.items.forEach(service => {
                        let li = document.createElement('li');
                        li.textContent = service;
                        ul.appendChild(li);
                    });
                    
                    // Assemble it all and push to the webpage
                    contentDiv.appendChild(ul);
                    itemDiv.appendChild(btn);
                    itemDiv.appendChild(contentDiv);
                    servicesContainer.appendChild(itemDiv);
                });
                
                // 4. DYNAMICALLY BUILD SOCIAL LINKS
                const socialContainer = document.getElementById('dynamic-social-links');
                socialContainer.innerHTML = ''; // IMPORTANT: Clear out old links
                
                for (const [platform, url] of Object.entries(data.contact.social)) {
                    if (url && socialIcons[platform]) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.target = '_blank';
                        a.setAttribute('aria-label', platform);
                        a.innerHTML = socialIcons[platform];
                        socialContainer.appendChild(a);
                    }
                }
                
                // 5. ATTACH ACCORDION ANIMATION LOGIC (Must happen AFTER they are built)
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
            })
            
            // Last Error Managment
            .catch(error => {
                console.error(`Error loading config from ${jsonFileUrl}:`, error);
                document.getElementById('company-title').textContent = "Error loading data.";
            });
    }
    
    // --- 2. TRIGGER THE FUNCTION DYNAMICALLY ---
    
    // Check the URL for a 'theme' parameter (e.g., website.com/index.html?theme=client2.json)
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTheme = urlParams.get('theme');
    
    // If a theme is specified in the URL, use it. Otherwise, default to 'content.json'
    if (requestedTheme) {
        loadCompanyData(requestedTheme);
    } else {
        loadCompanyData('samples/content.json');
    }
});