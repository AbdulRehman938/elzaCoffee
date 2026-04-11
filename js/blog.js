function initBlogSlider() {
    const slider = document.getElementById('blog-slider');
    const nextBtn = document.getElementById('next-blog');
    
    if (!slider || !nextBtn) return;

    let currentIndex = 0;
    const cards = slider.querySelectorAll('.blog-card');
    const totalCards = cards.length;

    function getVisibleCards() {
        if (window.innerWidth <= 768) return 1.2;
        if (window.innerWidth <= 1200) return 2.2;
        return 2.5;
    }

    function updateSlider() {
        const visibleCards = getVisibleCards();
        const cardWidth = cards[0].offsetWidth;
        const gapValue = getComputedStyle(slider).gap;
        const gap = gapValue === 'normal' ? 0 : parseInt(gapValue);
        
        // Boundaries
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > totalCards - Math.floor(visibleCards)) {
            currentIndex = 0; // Loop back
        }

        const offset = currentIndex * (cardWidth + gap);
        slider.style.transform = `translateX(-${offset}px)`;
    }

    nextBtn.addEventListener('click', () => {
        currentIndex++;
        updateSlider();
    });

    // --- Modal Logic ---
    const moreBtns = document.querySelectorAll('.more-btn');

    moreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Handle closing for all modals
    document.querySelectorAll('.blog-modal').forEach(modal => {
        const closeBtn = modal.querySelector('.b-modal-close');
        const overlay = modal.querySelector('.b-modal-overlay');

        const closeHandler = () => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        };

        closeBtn?.addEventListener('click', closeHandler);
        overlay?.addEventListener('click', closeHandler);
    });

    // Initial state
    updateSlider();

    // Handle Resize
    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateSlider();
    });
}

// Export to window
window.initBlogSlider = initBlogSlider;
