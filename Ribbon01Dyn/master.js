/**
 * Master Controller
 * Orchestrates data fetching, theme injection, and UI rendering.
 */
import { socialIcons } from './scripts/icons.js';
import { renderFlashcards, renderAccordion } from './scripts/renderers.js';

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
    
    // UI Elements
    const titleElements = document.querySelectorAll('#company-title');
    const servicesContainer = document.getElementById('dynamic-services-container');
    const aboutContainer = document.getElementById('dynamic-about-container');
    const socialContainer = document.getElementById('dynamic-social-links');

    try {
        // 1. Fetch all modules in parallel
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

        // 2. Inject Theme Variables
        const root = document.documentElement;
        const theme = themeData.theme;

        // Mapping JSON keys to CSS Variables
        root.style.setProperty('--theme-color', theme.primaryColor);
        root.style.setProperty('--body-bg', theme.bodyBackground);
        root.style.setProperty('--footer-bg', theme.footerBackground);
        root.style.setProperty('--card-container-bg', theme.cardContainerBG);
        root.style.setProperty('--card-bg', theme.cardBackground);
        root.style.setProperty('--card-header-bg', theme.cardHeaderBackground);
        root.style.setProperty('--text-main', theme.textMain);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--text-on-dark', theme.textOnDark);
        root.style.setProperty('--svg-shadow-color', theme.svgShadowColor);
        root.style.setProperty('--bd-shadow-color', theme.bdShadowColor);
        root.style.setProperty('--header-tint', theme.watermarkHeader);
        root.style.setProperty('--body-tint', theme.watermarkBody);
console.log("Full Theme Object:", theme);
console.log("Body Path:", theme.bodyImage);
console.log("Header Path:", theme.headerImage);
        root.style.setProperty('--body-image', `url('${theme.bodyImage}')`);
        root.style.setProperty('--header-image', `url('${theme.headerImage}')`);

        // 3. Update Text Content
        // 3.1 Browser Tab Title
        document.title = headerData.header.companyName;

        // 3.2 Update all elements with id="company-title" (like <h1> or <h2>)
        titleElements.forEach(el => el.textContent = headerData.header.companyName);
        document.getElementById('contact-email').textContent = contactData.contact.email;
        document.getElementById('contact-phone').textContent = contactData.contact.phone;
        document.getElementById('contact-location').textContent = contactData.contact.location;

        // 4. Render UI Sections
        const servicesWrapper = document.getElementById('services-section-title');
        if(servicesWrapper) servicesWrapper.textContent = "Our Services";
        
        renderFlashcards(servicesContainer, bodyData.services);
        renderAccordion(aboutContainer, bodyData.about);

        // 5. Render Social Links
        if (socialContainer) {
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
        }

    } catch (error) {
        console.error("Critical Load Error:", error);
        titleElements.forEach(el => el.textContent = "Error Loading Content");
    }
}

document.addEventListener('DOMContentLoaded', initWebsite);