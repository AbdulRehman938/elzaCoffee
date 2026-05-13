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

    let currentIndex = 0;



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
            // Modal Open Click
            card.addEventListener('click', (e) => {
                // If clicking cart button, intercept it
                if (e.target.closest('.cart-btn')) {
                    e.stopPropagation();
                    if (!window.auth.isLoggedIn()) {
                        if (window.openErrorModal) window.openErrorModal();
                    } else {
                        alert('Item added to cart!');
                    }
                    return;
                }

                const id = card.dataset.id;
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const imgSrc = card.querySelector('.product-img').src;

                // 1. Prepare Modal Content
                modalTitle.textContent = title;
                modalDesc.textContent = desc;
                modalImg.src = imgSrc;
                
                const buyBtn = document.getElementById('modal-buy-now');
                if (buyBtn) {
                    buyBtn.onclick = (e) => {
                        e.preventDefault();
                        closeModal();
                        if (window.openProductDetails) {
                            window.openProductDetails(id);
                        } else {
                            window.location.href = `shop.html?id=${id}`;
                        }
                    };
                }

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
            id: row.id || index + 1,
            title: row.name || `Coffee ${index + 1}`,
            description:
                row.description ||
                'Our premium coffee beans are ethically sourced and masterfully roasted to bring out rich flavor profiles.',
            image: window.pickProductImage(row.id != null ? Number(row.id) : index + 1, row.image || row.image_url),
        };
    }

    function renderRecommendedCards(items) {
        slider.innerHTML = items
            .map(
                item => `
                <div class="product-card" data-id="${item.id}" data-title="${item.title}" data-desc="${item.description}">
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

    async function loadRecommendedFromAPI() {
        if (!window.API_BASE_URL) {
            bindCardModalEvents();
            updateSlider();
            return;
        }

        try {
            const data = await window.apiFetch('/products/recommended');
            
            if (!data || !data.length) {
                bindCardModalEvents();
                updateSlider();
                return;
            }

            const recommendedProducts = data.map(normalizeRecommendedProduct);
            renderRecommendedCards(recommendedProducts);
            currentIndex = 0;
            bindCardModalEvents();
            updateSlider();
        } catch (error) {
            console.error('Failed to load recommended products:', error);
            bindCardModalEvents();
            updateSlider();
        }
    }

    // Event listeners
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

    await loadRecommendedFromAPI();

    // Handle Resize
    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateSlider();
    });
}

// Export to window
window.initProductSlider = initProductSlider;
