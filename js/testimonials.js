function initTestimonialsSlider() {
    const slider = document.querySelector('.testi-slider');
    const wrapper = document.querySelector('.testi-slider-wrapper');
    if (!slider || !wrapper) return;

    let cards = Array.from(slider.children);
    const cardCount = cards.length;
    
    // 1. Clone cards for seamless loop (Append/Prepend clones)
    // We clone all cards to ensure enough padding for any screen size
    cards.forEach(card => {
        const cloneNext = card.cloneNode(true);
        const clonePrev = card.cloneNode(true);
        slider.appendChild(cloneNext);
        slider.prepend(clonePrev);
    });

    // Update references after cloning
    const allCards = Array.from(slider.children);
    let currentIndex = cardCount; // Start at the first original card
    const cardWidth = cards[0].offsetWidth;
    const gap = 40;
    let isTransitioning = false;

    function updateSlider(animate = true) {
        if (animate) {
            slider.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        } else {
            slider.style.transition = 'none';
        }

        allCards.forEach((card, index) => {
            card.classList.remove('active');
            // Logic to determine which card is "active" even in the clones
            if (index === currentIndex) {
                card.classList.add('active');
            }
        });

        const containerWidth = wrapper.offsetWidth;
        const centerOffset = (containerWidth / 2) - (cardWidth / 2);
        const cardPosition = currentIndex * (cardWidth + gap);
        const finalTranslate = centerOffset - cardPosition;
        
        slider.style.transform = `translateX(${finalTranslate}px)`;
    }

    function checkPosition() {
        isTransitioning = false;
        // If we reached the end of the clones or start of clones, jump to real center
        if (currentIndex >= cardCount * 2) {
            currentIndex = cardCount;
            updateSlider(false);
        } else if (currentIndex < cardCount) {
            currentIndex = cardCount * 2 - 1;
            updateSlider(false);
        }
    }

    const prevBtn = document.querySelector('.testi-nav-btn.prev');
    const nextBtn = document.querySelector('.testi-nav-btn.next');

    prevBtn?.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateSlider();
    });

    nextBtn?.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateSlider();
    });

    slider.addEventListener('transitionend', checkPosition);
    window.addEventListener('resize', () => updateSlider(false));

    // Initial positioning
    setTimeout(() => updateSlider(false), 50);

    // ==========================================
    // Newsletter Logic
    // ==========================================
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-input');
    const emailError = document.getElementById('email-error-msg');

    if (form && emailInput && emailError) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = emailInput.value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailValue) {
                emailError.textContent = "Email address is required.";
                emailError.style.display = "block";
            } else if (!emailPattern.test(emailValue)) {
                emailError.textContent = "Please enter a valid email address.";
                emailError.style.display = "block";
            } else {
                emailError.style.display = "none";
                if (window.showToast) {
                    window.showToast("Thank you for subscribing!");
                } else {
                    alert("Thank you for subscribing!");
                }
                emailInput.value = '';
            }
        });

        emailInput.addEventListener('input', () => {
            if (emailError.style.display === "block") {
                emailError.style.display = "none";
            }
        });
    }
}

window.initTestimonialsSlider = initTestimonialsSlider;
