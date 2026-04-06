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
//console.log("Header tint:", theme.watermarkHeader);
//console.log("Body Path:", theme.bodyImage);
//console.log("Header Path:", theme.headerImage);
        root.style.setProperty('--theme-color', theme.primaryColor);
        root.style.setProperty('--body-bg', theme.bodyBackground);
        root.style.setProperty('--footer-bg', theme.footerBackground);
        root.style.setProperty('--card-container-bg', theme.cardContainerBG);
        root.style.setProperty('--card-bg', theme.cardBackground);
        root.style.setProperty('--card-header-bg', theme.cardHeaderBackground);
        root.style.setProperty('--text-main', theme.textMain);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--text-on-dark', theme.textOnDark);
        root.style.setProperty('--text-shadow-E6', theme.textShadowE6);
        root.style.setProperty('--text-shadow-99', theme.textShadow99);
        root.style.setProperty('--text-shadow-CC', theme.textShadowCC);
        root.style.setProperty('--svg-shadow-color', theme.svgShadowColor);
        root.style.setProperty('--bd-shadow-color', theme.bdShadowColor);
        root.style.setProperty('--header-tint', theme.watermarkHeader);
        root.style.setProperty('--body-tint',   theme.watermarkBody);
        
        // Helper function to safely format the URL path
        const getImagePath = (path) => {
            if (!path || path === "") return "none";
            // If the path already starts with http or dots, don't add ../
            if (path.startsWith('http') || path.startsWith('.')) return `url('${path}')`;
            // Otherwise, add the parent directory prefix
            return `url('../${path}')`;
        };
        
        // Inject the properties into CSS
        root.style.setProperty('--body-image', getImagePath(theme.bodyImage));
        root.style.setProperty('--header-image', getImagePath(theme.headerImage));
        
        if (theme.bodyImage) {
            document.body.style.backgroundImage = `url("${theme.bodyImage}")`;
            document.body.style.backgroundAttachment = "fixed";
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
        }
        
        const headerEl = document.querySelector('.top-section');
        const bodyEl = document.querySelector('.body-section');
        if (theme.headerImage && theme.headerImage !== "") {
            headerEl.classList.add('has-image'); // This triggers the CSS override
            bodyEl.classList.add('has-image'); // This triggers the CSS override
        } else {
            headerEl.classList.remove('has-image'); // Header stays transparent
            bodyEl.classList.remove('has-image'); // Header stays transparent
        }

        // 3. Update Text Content
        // 3.1 Browser Tab Title
        document.title = headerData.header.companyName;

        // 3.2 Update all elements with id="company-title" (like <h1> or <h2>)
        titleElements.forEach(el => el.textContent = headerData.header.companyName);
        
        // 3.3 Update Contact Info
        document.getElementById('contact-email').textContent = contactData.contact.email;
        document.getElementById('contact-phone').textContent = contactData.contact.phone;
        document.getElementById('contact-location').textContent = contactData.contact.location;
        
        // NEW: Update the Booking Button URL
        const bookingBtn = document.getElementById('booking-link');
        if (bookingBtn && contactData.contact.bookingUrl) {
            bookingBtn.href = contactData.contact.bookingUrl;
        }

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
        
        
        // 6. Scroll Dots for FlashCards
        const services = bodyData.services;
        const container = document.getElementById('dynamic-services-container');
        const dotsContainer = document.getElementById('scroll-dots');

        // 6.1. Calculate how many dots we actually need
        function updateDots() {
            dotsContainer.innerHTML = ''; // Clear old dots
            
            const cardWidth = container.querySelector('.accordion-item').offsetWidth + 20; // width + gap
            const visibleCards = Math.floor(container.offsetWidth / cardWidth);
            const totalDots = Math.max(1, services.length - visibleCards + 1);
        
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('div');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dotsContainer.appendChild(dot);
            }
        }

        // 6.2. Update active dot based on percentage of scroll
        const resizeObserver = new ResizeObserver(() => {
            updateDots();
        });
        resizeObserver.observe(container);
        
        container.addEventListener('scroll', () => {
            const dots = dotsContainer.querySelectorAll('.dot');
            if (dots.length === 0) return;
        
            const maxScroll = container.scrollWidth - container.offsetWidth;
            const scrollPercentage = container.scrollLeft / maxScroll;
            const activeIndex = Math.min(
                dots.length - 1,
                Math.floor(scrollPercentage * dots.length + 0.5)
            );
        
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIndex);
            });
        });

    } catch (error) {
        console.error("Critical Load Error:", error);
        titleElements.forEach(el => el.textContent = "Error Loading Content");
    }
}

document.addEventListener('DOMContentLoaded', initWebsite);