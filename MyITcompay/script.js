// Wait for the HTML document to fully load
document.addEventListener('DOMContentLoaded', () => {
    
    // Grab all the clickable headers
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(accordion => {
        accordion.addEventListener('click', function() {
            // Toggle the active class to change styling (e.g., hover color)
            this.classList.toggle('active');

            // Toggle the '+' and '-' icon text
            const icon = this.querySelector('.icon');
            if (this.classList.contains('active')) {
                icon.textContent = '-';
            } else {
                icon.textContent = '+';
            }

            // Get the next sibling element (which is our .accordion-content div)
            const content = this.nextElementSibling;

            // If it's open, close it. If it's closed, open it dynamically.
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                // Set the max-height to the scrollHeight so it transitions smoothly
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});