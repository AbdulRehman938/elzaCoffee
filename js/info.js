/**
 * Information Page Logic
 * Handles section switching based on hash or clicks.
 */

(function () {
    const navLinks = document.querySelectorAll('.info-nav-link');
    const sections = document.querySelectorAll('.info-section');

    function showSection(id) {
        const targetId = id.replace('#', '');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            // Update Links
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
            });

            // Update Sections
            sections.forEach(section => {
                section.classList.toggle('active', section.id === targetId);
            });
        }
    }

    // Handle clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            showSection(href);
            // Update URL hash without jumping the page
            history.pushState(null, null, href);
        });
    });

    // Handle initial hash
    window.addEventListener('load', () => {
        const hash = window.location.hash || '#faq';
        showSection(hash);
    });

    // Handle hash change
    window.addEventListener('hashchange', () => {
        showSection(window.location.hash);
    });

})();
