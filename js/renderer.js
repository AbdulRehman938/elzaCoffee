/**
 * Simple Component Renderer
 * Loads HTML fragments from the 'html' folder into designated placeholders.
 */

async function loadComponent(elementId, filePath) {
    try {
        console.log(`[Renderer] Attempting to fetch ${filePath} for #${elementId}...`);
        
        // Add cache-busting query parameter to instantly bypass any old local server files
        const bust = new Date().getTime();
        const response = await fetch(`${filePath}?v=${bust}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status} when fetching ${filePath}`);
        
        const html = await response.text();
        const placeholder = document.getElementById(elementId);
        
        if (!placeholder) {
            console.error(`[Renderer] FATAL: Could not find placeholder element with id #${elementId} in index.html!`);
            return;
        }

        // Check if it's a full document with a body tag
        if (html.includes('<body')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            placeholder.innerHTML = doc.body.innerHTML;
            console.log(`[Renderer] Parsed ${filePath} as full HTML Document.`);
        } else {
            // If it's just a fragment (like footer/header), inject it directly
            placeholder.innerHTML = html;
            console.log(`[Renderer] Injected ${filePath} directly as HTML Fragment.`);
        }
        
        console.log(`[Renderer] Successfully completed injection for: #${elementId}`);
    } catch (error) {
        console.error(`[Renderer] Error loading component into #${elementId}:`, error);
    }
}

// Load all components in order
async function initApp() {
    // Load Account Modal first (sits outside main flow)
    await loadComponent('account-modal-placeholder', 'html/account-modal.html');

    // Load Cart Modal
    await loadComponent('cart-modal-placeholder', 'html/cart-modal.html');

    // Load Error Modal
    await loadComponent('error-modal-placeholder', 'html/error-modal.html');
    if (window.initErrorModal) window.initErrorModal();

    // Load Checkout Modal
    await loadComponent('checkout-modal-placeholder', 'html/checkout-modal.html');

    // Load Product Detail Modal
    await loadComponent('product-detail-modal-placeholder', 'html/product-detail-modal.html');
    if (window.initProductDetailModal) window.initProductDetailModal();

    // Load Cart Restore Modal
    await loadComponent('cart-restore-modal-placeholder', 'html/cart-restore-modal.html');





    // Load Header
    await loadComponent('header-placeholder', 'html/header.html');
    
    // Initialize header logic after loading
    if (window.initHeader) {
        window.initHeader();
    }
    
    // Load Hero First
    await loadComponent('hero-placeholder', 'html/Hero.html');

    // Initialize Hero logic (GSAP SplitText, etc.)
    if (window.initHero) {
        window.initHero();
    }

    // Load Story After Hero
    await loadComponent('story-placeholder', 'html/story.html');

    // Initialize Story logic (Slider, etc.)
    if (window.initStorySlider) {
        window.initStorySlider();
    }

    // Load Services
    await loadComponent('services-placeholder', 'html/services.html');

    // Load Reserve
    await loadComponent('reserve-placeholder', 'html/reserve.html');

    // Initialize Reserve logic
    if (window.initReserve) {
        window.initReserve();
    }

    // Load Recommended
    await loadComponent('recommanded-placeholder', 'html/recommanded.html');

    // Initialize Product Slider
    if (window.initProductSlider) {
        window.initProductSlider();
    }

    // Load Menu
    await loadComponent('menu-placeholder', 'html/menu.html');
    if (window.initPopularMenu) {
        window.initPopularMenu();
    }

    // Load Blog
    await loadComponent('blog-placeholder', 'html/blog.html');

    // Load Testimonials
    await loadComponent('testi-placeholder', 'html/testimonials.html');

    // Load Footer
    await loadComponent('footer-placeholder', 'html/footer.html');

    // Initialize Blog Slider
    if (window.initBlogSlider) {
        window.initBlogSlider();
    }

    // Initialize Testimonials Slider
    if (window.initTestimonialsSlider) {
        window.initTestimonialsSlider();
    }
    
    // Refresh GSAP ScrollTrigger after everything is injected
    // This forcibly prevents the browser from truncating scroll height
    setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 500);
}

// Start the rendering process
initApp();
