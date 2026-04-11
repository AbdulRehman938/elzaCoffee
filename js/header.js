function initHeader() {
    const header = document.querySelector('.main-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    const indicator = document.getElementById('nav-indicator');

    if (!header || !mobileMenuBtn || !indicator) return;

    const INDICATOR_WIDTH = 80;

    // ─── Indicator ───────────────────────────────────────────────
    function moveIndicator(linkEl) {
        if (window.innerWidth <= 992) return;
        indicator.classList.add('animating');
        setTimeout(() => {
            const targetRect = linkEl.getBoundingClientRect();
            const parentRect = navLinks.getBoundingClientRect();
            const center = (targetRect.left - parentRect.left) + (targetRect.width / 2);
            indicator.style.left = `${center - (INDICATOR_WIDTH / 2)}px`;
            setTimeout(() => indicator.classList.remove('animating'), 50);
        }, 300);
    }

    // ─── Set Active Link ─────────────────────────────────────────
    function setActiveLink(sectionKey) {
        navItems.forEach(l => l.classList.remove('active'));
        const match = [...navItems].find(l => l.getAttribute('href') === `#${sectionKey}`);
        if (match) {
            match.classList.add('active');
            moveIndicator(match);
        }
    }

    // Set initial indicator on page load
    const initialActive = document.querySelector('.nav-links a.active');
    if (initialActive && window.innerWidth > 992) {
        const r = initialActive.getBoundingClientRect();
        const p = navLinks.getBoundingClientRect();
        indicator.style.left = `${(r.left - p.left) + (r.width / 2) - (INDICATOR_WIDTH / 2)}px`;
    }

    // ─── Smooth Scroll ───────────────────────────────────────────
    const offsets = {
        menu:    -50,
        product: -50,
        services: 90,
        blog:     40,
        contact:  40,
    };

    function scrollToSection(hash) {
        if (hash === '#home' || hash === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const key = hash.replace('#', '');
        const target = document.querySelector(`[data-section="${key}"]`);
        if (target) {
            const offset = offsets[key] ?? 90;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    // ─── Click Navigation ────────────────────────────────────────
    // Lock prevents scroll-spy from overriding active state during a click-scroll
    let spyLocked = false;
    let lockTimer = null;

    navItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href');

            navItems.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            moveIndicator(link);

            spyLocked = true;
            clearTimeout(lockTimer);
            lockTimer = setTimeout(() => { spyLocked = false; }, 1000);

            scrollToSection(hash);

            if (window.innerWidth <= 992) toggleMenu(false);
        });
    });

    // ─── Scroll Spy (IntersectionObserver) ──────────────────────
    const sections = document.querySelectorAll('[data-section]');

    const observer = new IntersectionObserver((entries) => {
        if (spyLocked) return;

        // Pick the intersecting entry with the highest ratio
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
            setActiveLink(visible[0].target.getAttribute('data-section'));
        }
    }, {
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5]
    });

    sections.forEach(s => observer.observe(s));

    // ─── Scroll Events (header style + home highlight) ───────────
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);

        if (!spyLocked && window.scrollY < 200) {
            setActiveLink('home');
        }
    });

    // ─── Mobile Menu ─────────────────────────────────────────────
    function toggleMenu(force) {
        const isOpen = force !== undefined ? force : !navContainer.classList.contains('active');
        navContainer.classList.toggle('active', isOpen);
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
        } else {
            spans.forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
        }
    }

    mobileMenuBtn.addEventListener('click', () => toggleMenu());

    // ─── Account Modal ───────────────────────────────────────────
    function openModal() {
        const modal = document.getElementById('account-modal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // lock background scroll
        }
    }

    function closeModal() {
        const modal = document.getElementById('account-modal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = ''; // restore scroll
        }
    }

    const accountBtn = document.getElementById('account-btn');
    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    document.addEventListener('click', (e) => {
        const aModal = document.getElementById('account-modal');
        if (aModal && (e.target === aModal || e.target.id === 'account-modal-close')) closeModal();

        const cModal = document.getElementById('cart-modal');
        if (cModal && (e.target === cModal || e.target.id === 'cart-modal-close')) closeCartModal();
    });

    // ─── Cart Modal ──────────────────────────────────────────────
    function openCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
    }
    function closeCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    }

    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartModal();
        });
    }

    // Escape closes whichever modal is open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeCartModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', initHeader);
window.initHeader = initHeader;
