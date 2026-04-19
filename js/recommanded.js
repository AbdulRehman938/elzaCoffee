async function initProductSlider() {
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

    const recommendedImages = [
        'assets/Coffees.png',
        'assets/Rectangle (no bg).png',
        'assets/Rectangle (no bg) (1).png',
        'assets/Rectangle (no bg) (2).png',
    ];
    let currentIndex = 0;

    function pickFrontendImage(seed) {
        const safeSeed = Number.isFinite(seed) ? seed : 1;
        const idx = Math.abs((safeSeed * 9301 + 49297) % 233280) % recommendedImages.length;
        return recommendedImages[idx];
    }

    function getVisibleCards() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getCards() {
        return slider.querySelectorAll('.product-card');
    }

    function updateSlider() {
        const cards = getCards();
        const totalCards = cards.length;
        const visibleCards = getVisibleCards();

        if (!cards.length) {
            prevBtn.classList.add('disabled');
            nextBtn.classList.add('disabled');
            return;
        }

        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(slider).gap, 10) || 0;
        const maxIndex = Math.max(0, totalCards - visibleCards);
        currentIndex = Math.min(currentIndex, maxIndex);

        const offset = currentIndex * (cardWidth + gap);
        slider.style.transform = `translateX(-${offset}px)`;

        // Update Buttons
        prevBtn.classList.toggle('disabled', currentIndex === 0);
        nextBtn.classList.toggle('disabled', currentIndex >= maxIndex);
    }

    function bindCardModalEvents() {
        getCards().forEach(card => {
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
                gsap.fromTo(
                    modalContainer,
                    { scale: 0.7, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
                );

                gsap.fromTo(
                    modalImg,
                    { scale: 0.5, opacity: 0, y: 50 },
                    { scale: 1, opacity: 0.65, y: 0, duration: 0.8, delay: 0.2, ease: 'power4.out' }
                );
            });
        });
    }

    function normalizeRecommendedProduct(row, index) {
        return {
            title: row.name || `Coffee ${index + 1}`,
            description:
                row.description ||
                'Our premium coffee beans are ethically sourced and masterfully roasted to bring out rich flavor profiles.',
            image: pickFrontendImage(row.id != null ? Number(row.id) : index + 1),
        };
    }

    function renderRecommendedCards(items) {
        slider.innerHTML = items
            .map(
                item => `
                <div class="product-card" data-title="${item.title}" data-desc="${item.description}">
                    <div class="product-image-box">
                        <div class="info-tag">ⓘ</div>
                        <img src="${item.image}" alt="${item.title}" class="product-img">
                        <div class="cart-btn">
                            <img src="assets/Frame 25.png" alt="Add to cart">
                        </div>
                    </div>
                    <div class="product-info">
                        <p class="product-name">${item.title}</p>
                    </div>
                </div>
            `
            )
            .join('');
    }

    async function loadRecommendedFromSupabase() {
        if (!window.supabaseClient) {
            bindCardModalEvents();
            updateSlider();
            return;
        }

        const { data, error } = await window.supabaseClient
            .from('products')
            .select('id, name, description, rating')
            .order('rating', { ascending: false })
            .limit(8);

        if (error || !data || !data.length) {
            bindCardModalEvents();
            updateSlider();
            return;
        }

        const recommendedProducts = data.map(normalizeRecommendedProduct);
        renderRecommendedCards(recommendedProducts);
        currentIndex = 0;
        bindCardModalEvents();
        updateSlider();
    }

    nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        const totalCards = getCards().length;
        const visibleCards = getVisibleCards();
        if (currentIndex < totalCards - visibleCards) {
            currentIndex++;
            updateSlider();
        }
    });

    prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    await loadRecommendedFromSupabase();

    // Handle Resize
    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateSlider();
    });
}

// Export to window
window.initProductSlider = initProductSlider;
