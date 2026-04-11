function initProductSlider() {
    const slider = document.getElementById('product-slider');
    const prevBtn = document.getElementById('prev-product');
    const nextBtn = document.getElementById('next-product');
    
    // Modal elements
    const modal = document.getElementById('product-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalImg = document.getElementById('modal-img');
    const modalDesc = document.getElementById('modal-desc');

    if (!slider || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const cards = slider.querySelectorAll('.product-card');
    const totalCards = cards.length;

    function getVisibleCards() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateSlider() {
        const visibleCards = getVisibleCards();
        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(slider).gap);
        
        const offset = currentIndex * (cardWidth + gap);
        slider.style.transform = `translateX(-${offset}px)`;

        // Update Buttons
        prevBtn.classList.toggle('disabled', currentIndex === 0);
        nextBtn.classList.toggle('disabled', currentIndex >= totalCards - visibleCards);
    }

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const visibleCards = getVisibleCards();
        if (currentIndex < totalCards - visibleCards) {
            currentIndex++;
            updateSlider();
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    // --- Modal Logic with Pop Animation ---
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');
            const imgSrc = card.querySelector('.product-img').src;

            // 1. Prepare Modal Content
            modalTitle.textContent = title;
            modalDesc.textContent = desc;
            modalImg.src = imgSrc;

            // 2. Show Modal
            modal.classList.add('show');
            const modalContainer = modal.querySelector('.modal-container');
            document.body.style.overflow = 'hidden';

            // 3. Pop Animation using GSAP
            gsap.fromTo(modalContainer, 
                { scale: 0.7, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
            );

            gsap.fromTo(modalImg, 
                { scale: 0.5, opacity: 0, y: 50 }, 
                { scale: 1, opacity: 0.65, y: 0, duration: 0.8, delay: 0.2, ease: "power4.out" }
            );
        });
    });

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Initial state
    updateSlider();

    // Handle Resize
    window.addEventListener('resize', () => {
        currentIndex = 0; 
        updateSlider();
    });
}

// Export to window
window.initProductSlider = initProductSlider;
