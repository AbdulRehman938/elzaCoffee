function initHeader() {
    const header = document.querySelector('.main-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    const indicator = document.getElementById('nav-indicator');

    // if (!header || !mobileMenuBtn || !indicator) return;

    const INDICATOR_WIDTH = 80;

    // ─── Toast System ─────────────────────────────────────────────
    let lastToast = { message: '', time: 0 };
    function showToast(message, type = 'success') {
        const now = Date.now();
        if (message === lastToast.message && now - lastToast.time < 500) return;
        lastToast = { message, time: now };

        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✓' : '✕';
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('active'), 10);
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }
    window.showToast = showToast;

    // ─── Validation Helpers ────────────────────────────────────────
    function showFieldError(inputId, message) {
        const errorEl = document.getElementById(`${inputId}-error`);
        const inputEl = document.getElementById(inputId);
        if (errorEl) { errorEl.textContent = message; errorEl.classList.add('active'); }
        if (inputEl) inputEl.style.borderColor = '#ff4d4d';
    }
    function clearFieldError(inputId) {
        const errorEl = document.getElementById(`${inputId}-error`);
        const inputEl = document.getElementById(inputId);
        if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('active'); }
        if (inputEl) inputEl.style.borderColor = '';
    }
    function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    // ─── Auth State ────────────────────────────────────────────────
    function getInitials(name) {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    }

    function updateUIForAuthState() {
        const isLoggedIn = window.auth.isLoggedIn();
        const user = window.auth.getUser();

        const guestEl = document.getElementById('header-auth-guest');
        const userEl = document.getElementById('header-auth-user');
        const cartBtn = document.getElementById('cart-btn');
        const shopCartBtn = document.getElementById('shop-cart-btn');

        if (isLoggedIn && user) {
            if (guestEl) guestEl.style.display = 'none';
            if (userEl) userEl.style.display = 'block';
            if (cartBtn) cartBtn.style.display = 'flex';
            if (shopCartBtn) shopCartBtn.style.display = 'flex';

            // Update pill
            const hName = document.getElementById('header-username');
            const hAvatar = document.getElementById('header-avatar');
            const hFallback = document.getElementById('header-fallback');
            if (hName) hName.textContent = user.name.split(' ')[0];
            if (user.profile_image) {
                const imgUrl = `http://localhost:5000${user.profile_image}`;
                if (hAvatar) { hAvatar.src = imgUrl; hAvatar.classList.add('active'); }
                if (hFallback) hFallback.classList.remove('active');
            } else {
                if (hAvatar) hAvatar.classList.remove('active');
                if (hFallback) { hFallback.textContent = getInitials(user.name); hFallback.classList.add('active'); }
            }

            const nameEl = document.getElementById('profile-name');
            const emailEl = document.getElementById('profile-email');
            const ptsEl = document.getElementById('profile-points');
            const avatarEl = document.getElementById('profile-avatar');
            const fallbackEl = document.getElementById('profile-fallback');

            if (nameEl) nameEl.textContent = user.name;
            if (emailEl) emailEl.textContent = user.email;
            if (ptsEl) ptsEl.textContent = user.points || 0;
            
            if (user.profile_image) {
                const imgUrl = `http://localhost:5000${user.profile_image}`;
                if (avatarEl) { avatarEl.src = imgUrl; avatarEl.classList.add('active'); }
                if (fallbackEl) fallbackEl.classList.remove('active');
            } else {
                if (avatarEl) avatarEl.classList.remove('active');
                if (fallbackEl) { fallbackEl.textContent = getInitials(user.name); fallbackEl.classList.add('active'); }
            }
            
            // Update Stats & Activity
            updateAccountStats(user);
        } else {
            if (guestEl) guestEl.style.display = 'flex';
            if (userEl) userEl.style.display = 'none';
            if (cartBtn) cartBtn.style.display = 'none';
            if (shopCartBtn) shopCartBtn.style.display = 'none';
        }

        // Update Cart System visibility
        if (window.cartSystem) window.cartSystem.updateUI();
        updateCartBadge();

    }

    function updateAccountStats(user) {
        // Points & Orders from user object (or defaults)
        const points = user.points || 0;
        const orders = user.orders_count || 0;
        const targetPoints = 1000;

        // Update stats counters
        const statNums = document.querySelectorAll('.stat-num');
        if (statNums.length >= 2) {
            statNums[0].textContent = orders;
            statNums[1].textContent = points.toLocaleString();
        }

        // Update Loyalty Bar
        const loyaltyPts = document.querySelector('.loyalty-pts');
        const loyaltyFill = document.querySelector('.loyalty-bar-fill');
        if (loyaltyPts) loyaltyPts.textContent = `${points.toLocaleString()} / ${targetPoints.toLocaleString()} pts`;
        if (loyaltyFill) {
            const percentage = Math.min((points / targetPoints) * 100, 100);
            loyaltyFill.style.width = `${percentage}%`;
        }

        // Update Badge based on points
        const badge = document.querySelector('.account-badge');
        if (badge) {
            if (points >= 1000) badge.textContent = '💎 Platinum Member';
            else if (points >= 500) badge.textContent = '🥈 Silver Member';
            else badge.textContent = '☕ Bronze Member';
        }
    }

    function updateCartBadge() {
        if (window.cartSystem) {
            window.cartSystem.updateUI();
        } else {
            const badge = document.getElementById('cart-badge');
            if (!badge) return;
            const count = parseInt(badge.textContent) || 0;
            badge.classList.toggle('active', count > 0);
        }
    }


    function switchAuthForm(id) {
        // Hide all views and forms first
        const views = document.querySelectorAll('.modal-view');
        views.forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        const target = document.getElementById(id);
        const modalCard = document.querySelector('.account-modal-card');

        if (target) {
            target.classList.add('active');
            
            // Toggle compact class for specific views
            if (modalCard) {
                if (id === 'edit-profile-view' || id === 'update-profile-form') {
                    modalCard.classList.add('compact-view');
                } else {
                    modalCard.classList.remove('compact-view');
                }
            }

            // If the target is a View, ensure its first form is active
            if (target.classList.contains('modal-view')) {
                const form = target.querySelector('.auth-form');
                if (form) form.classList.add('active');
            } else {
                // If targeting a form directly, ensure parent view is active
                const parentView = target.closest('.modal-view');
                if (parentView) parentView.classList.add('active');
            }
        }
    }


    // ─── Modal Open/Close ──────────────────────────────────────────
    function openModal() {
        const modal = document.getElementById('account-modal');
        if (modal) { 
            updateUIForAuthState(); 
            
            // Auto-view selection if nothing is active
            const activeView = document.querySelector('.modal-view.active');
            if (!activeView) {
                if (window.auth.isLoggedIn()) {
                    switchAuthForm('profile-view');
                } else {
                    switchAuthForm('login-form');
                }
            }
            
            modal.classList.add('open'); 
            document.body.style.overflow = 'hidden'; 
        }
    }

    function closeModal() {
        const modal = document.getElementById('account-modal');
        if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    }
    function openCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
    }
    function closeCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    }

    // Global triggers
    window.auth.openLoginModal = () => { switchAuthForm('login-form'); openModal(); };
    window.auth.openSignupModal = () => { switchAuthForm('signup-form'); openModal(); };


    // ─── Auth Form Submissions ─────────────────────────────────────
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            let isValid = true;
            ['login-email', 'login-password'].forEach(clearFieldError);
            if (!validateEmail(email)) { showFieldError('login-email', 'Valid email required'); isValid = false; }
            if (password.length < 6) { showFieldError('login-password', 'Min 6 characters'); isValid = false; }
            if (!isValid) return;
            const btn = loginForm.querySelector('button[type="submit"]');
            try {
                btn.disabled = true; btn.textContent = 'Logging in...';
                const data = await window.apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
                window.auth.saveToken(data.token); window.auth.saveUser(data.user);
                
                // RESTORE CART FROM DB
                try {
                    const cartData = await window.apiFetch('/cart', { method: 'GET' });
                    if (cartData.items && cartData.items.length > 0) {
                        localStorage.setItem('elza_cart', JSON.stringify(cartData.items));
                        // Trigger restoration modal
                        setTimeout(() => {
                            if (window.openCartRestoreModal) window.openCartRestoreModal();
                        }, 800);
                    } else {
                        localStorage.removeItem('elza_cart'); // Ensure clean start if no DB cart
                    }
                } catch (err) { console.error('Cart restoration failed:', err); }


                showToast(`Welcome back, ${data.user.name.split(' ')[0]}! ☕`);
                updateUIForAuthState(); closeModal();
                // Refresh cart UI
                if (window.cartSystem) window.cartSystem.updateUI();
            } catch (err) { showToast(err.message || 'Login failed', 'error'); }
            finally { btn.disabled = false; btn.textContent = 'Login'; }

        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            let isValid = true;
            ['signup-name', 'signup-email', 'signup-password'].forEach(clearFieldError);
            if (name.length < 2) { showFieldError('signup-name', 'Full name required'); isValid = false; }
            if (!validateEmail(email)) { showFieldError('signup-email', 'Valid email required'); isValid = false; }
            if (password.length < 6) { showFieldError('signup-password', 'Min 6 characters'); isValid = false; }
            if (!isValid) return;
            const formData = new FormData();
            formData.append('name', name); formData.append('email', email); formData.append('password', password);
            const fileInput = document.getElementById('signup-avatar');
            if (fileInput && fileInput.files[0]) formData.append('profile_image', fileInput.files[0]);
            const btn = signupForm.querySelector('button[type="submit"]');
            try {
                btn.disabled = true; btn.textContent = 'Creating Account...';
                await window.apiFetch('/auth/signup', { method: 'POST', body: formData });
                showToast('Account created! Please log in.', 'success');
                switchAuthForm('login-form');
            } catch (err) { showToast(err.message || 'Signup failed', 'error'); }
            finally { btn.disabled = false; btn.textContent = 'Create Account'; }
        });
    }

    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            clearFieldError('forgot-email');
            if (!validateEmail(email)) { showFieldError('forgot-email', 'Valid email required'); return; }
            try {
                const data = await window.apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
                // Store the token and go directly to reset form (no email sending)
                window._resetToken = data.resetToken;
                showToast('Email verified! Set your new password.', 'success');
                switchAuthForm('reset-form');
            } catch (err) { showFieldError('forgot-email', err.message || 'Email not found'); }
        });
    }

    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('reset-password').value;
            const confirm = document.getElementById('reset-confirm').value;
            ['reset-password', 'reset-confirm'].forEach(clearFieldError);
            if (password.length < 6) { showFieldError('reset-password', 'Min 6 characters'); return; }
            if (password !== confirm) { showFieldError('reset-confirm', 'Passwords do not match'); return; }
            try {
                // Use the token stored from the forgot-password step
                const token = window._resetToken;
                if (!token) { showToast('Session expired. Please start over.', 'error'); switchAuthForm('forgot-form'); return; }
                await window.apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword: password }) });
                showToast('Password changed! Please log in.', 'success');
                window._resetToken = null;
                switchAuthForm('login-form');
            } catch (err) { showToast(err.message || 'Reset failed', 'error'); }
        });
    }

    // ─── Header Button Wiring ──────────────────────────────────────
    document.getElementById('header-login-btn')?.addEventListener('click', () => { switchAuthForm('login-form'); openModal(); });
    document.getElementById('header-signup-btn')?.addEventListener('click', () => { switchAuthForm('signup-form'); openModal(); });
    document.getElementById('to-signup')?.addEventListener('click', () => switchAuthForm('signup-form'));
    document.getElementById('to-login')?.addEventListener('click', () => switchAuthForm('login-form'));
    document.getElementById('to-forgot')?.addEventListener('click', () => switchAuthForm('forgot-form'));
    document.getElementById('back-to-login')?.addEventListener('click', () => switchAuthForm('login-form'));

    // ─── User Pill Dropdown ────────────────────────────────────────
    const userPill = document.getElementById('header-auth-user');
    const pillTrigger = document.getElementById('user-pill-trigger');
    function toggleDropdown(force) {
        if (!userPill) return;
        const open = force !== undefined ? force : !userPill.classList.contains('active');
        userPill.classList.toggle('active', open);
    }
    pillTrigger?.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(); });
    document.addEventListener('click', () => toggleDropdown(false));
    document.getElementById('header-logout-btn')?.addEventListener('click', () => { window.auth.logout(); showToast('Logged out successfully'); });
    document.getElementById('logout-btn')?.addEventListener('click', () => { window.auth.logout(); showToast('Logged out successfully'); closeModal(); });
    
    document.getElementById('header-edit-profile')?.addEventListener('click', () => { 
        populateEditForm();
        switchAuthForm('edit-profile-view'); 
        openModal(); 
        toggleDropdown(false); 
    });
    
    document.getElementById('edit-profile-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        populateEditForm();
        switchAuthForm('edit-profile-view');
    });

    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
        switchAuthForm('profile-view');
    });

    function populateEditForm() {
        const user = window.auth.getUser();
        if (!user) return;

        const nameInp = document.getElementById('edit-name');
        const emailInp = document.getElementById('edit-email');
        const prevImg = document.getElementById('edit-preview-img');
        const prevFallback = document.getElementById('edit-preview-fallback');

        if (nameInp) nameInp.value = user.name;
        if (emailInp) emailInp.value = user.email;

        if (user.profile_image) {
            if (prevImg) {
                prevImg.src = `http://localhost:5000${user.profile_image}`;
                prevImg.style.display = 'block';
                prevImg.style.opacity = '1';
                prevImg.style.width = '100%';
                prevImg.style.height = '100%';
            }
            if (prevFallback) prevFallback.style.display = 'none';
        } else {
            if (prevImg) prevImg.style.display = 'none';
            if (prevFallback) {
                prevFallback.textContent = getInitials(user.name);
                prevFallback.style.display = 'block';
            }
        }
    }

    // ─── Edit Profile Submission ───────────────────────────────────
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('edit-name').value;
            const fileInput = document.getElementById('edit-avatar-input');
            
            const formData = new FormData();
            formData.append('name', name);
            if (fileInput.files[0]) formData.append('profile_image', fileInput.files[0]);

            const btn = updateProfileForm.querySelector('button[type="submit"]');
            try {
                btn.disabled = true; btn.textContent = 'Saving...';
                const data = await window.apiFetch('/auth/profile', { method: 'POST', body: formData });
                
                // Update local storage
                window.auth.saveUser(data.user);
                showToast('Profile updated successfully! ✨');
                
                // Refresh UI and go back to dashboard
                updateUIForAuthState();
                switchAuthForm('profile-view');
            } catch (err) {
                showToast(err.message || 'Update failed', 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Save Changes';
            }
        });
    }

    // ─── Edit Avatar Preview ──────────────────────────────────────
    const editAvatarInp = document.getElementById('edit-avatar-input');
    const editAvatarPrev = document.getElementById('edit-avatar-preview');
    if (editAvatarInp && editAvatarPrev) {
        editAvatarInp.addEventListener('change', () => {
            const file = editAvatarInp.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                editAvatarPrev.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            };
            reader.readAsDataURL(file);
        });
    }

    // ─── Password Visibility Toggle ────────────────────────────────
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.closest('.password-wrap')?.querySelector('input');
            if (input) {
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.textContent = show ? '🙈' : '👁️';
                btn.classList.toggle('visible', show);
            }
        });
    });

    // ─── Avatar Preview (Signup) ───────────────────────────────────
    const avatarInput = document.getElementById('signup-avatar');
    const avatarPreview = document.getElementById('avatar-preview');
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', () => {
            const file = avatarInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                avatarPreview.style.border = '2px solid #D4A055';
            };
            reader.readAsDataURL(file);
        });
    }


    document.addEventListener('click', (e) => {
        const aModal = document.getElementById('account-modal');
        if (aModal && e.target.id === 'account-modal-close') closeModal();
        const cModal = document.getElementById('cart-modal');
        if (cModal && e.target.id === 'cart-modal-close') closeCartModal();
    });

    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCartModal(); });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeCartModal(); } });

    // ─── Indicator ────────────────────────────────────────────────
    function moveIndicator(linkEl) {
        if (!indicator || !navLinks || window.innerWidth <= 992) return;
        indicator.classList.add('animating');
        setTimeout(() => {
            const targetRect = linkEl.getBoundingClientRect();
            const parentRect = navLinks.getBoundingClientRect();
            const center = (targetRect.left - parentRect.left) + (targetRect.width / 2);
            indicator.style.left = `${center - (INDICATOR_WIDTH / 2)}px`;
            setTimeout(() => indicator.classList.remove('animating'), 50);
        }, 300);
    }


    function setActiveLink(sectionKey) {
        navItems.forEach(l => l.classList.remove('active'));
        const match = [...navItems].find(l => l.getAttribute('href') === `#${sectionKey}`);
        if (match) { match.classList.add('active'); moveIndicator(match); }
    }

    const initialActive = document.querySelector('.nav-links a.active');
    if (initialActive && indicator && navLinks && window.innerWidth > 992) {
        const r = initialActive.getBoundingClientRect();
        const p = navLinks.getBoundingClientRect();
        indicator.style.left = `${(r.left - p.left) + (r.width / 2) - (INDICATOR_WIDTH / 2)}px`;
    }


    // ─── Smooth Scroll ─────────────────────────────────────────────
    const offsets = { menu: -50, product: -50, services: 90, blog: 40, contact: 40 };
    function scrollToSection(hash) {
        if (hash === '#home' || hash === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        const key = hash.replace('#', '');
        const target = document.querySelector(`[data-section="${key}"]`);
        if (target) {
            const offset = offsets[key] ?? 90;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        }
    }

    let spyLocked = false, lockTimer = null;
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

    // ─── Scroll Spy ────────────────────────────────────────────────
    const sections = document.querySelectorAll('[data-section]');
    const observer = new IntersectionObserver((entries) => {
        if (spyLocked) return;
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActiveLink(visible[0].target.getAttribute('data-section'));
    }, { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] });
    sections.forEach(s => observer.observe(s));

    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 50);
        if (!spyLocked && window.scrollY < 200) setActiveLink('home');
    });


    // ─── Mobile Menu ───────────────────────────────────────────────
    function toggleMenu(force) {
        if (!navContainer || !mobileMenuBtn) return;
        const isOpen = force !== undefined ? force : !navContainer.classList.contains('active');
        navContainer.classList.toggle('active', isOpen);
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (spans.length >= 3) {
            if (isOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
            } else {
                spans.forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
            }
        }
    }
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMenu());


    // ─── Cart Restore Modal ───────────────────────────────────────
    window.openCartRestoreModal = () => {
        const modal = document.getElementById('cart-restore-modal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    function closeCartRestoreModal() {
        const modal = document.getElementById('cart-restore-modal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'restore-view-cart') {
            closeCartRestoreModal();
            openCartModal();
        }
        if (e.target.id === 'restore-later' || e.target.id === 'cart-restore-modal') {
            closeCartRestoreModal();
        }
    });

    // ─── Init ──────────────────────────────────────────────────────

    updateUIForAuthState();
}

document.addEventListener('DOMContentLoaded', initHeader);
window.initHeader = initHeader;
