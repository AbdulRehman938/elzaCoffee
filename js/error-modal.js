/**
 * Error Modal Logic (Guest User Buy Attempt)
 */
(function () {
    function initErrorModal() {
        const modal = document.getElementById('error-modal');
        const loginBtn = document.getElementById('error-login-btn');
        const closeBtn = document.getElementById('error-close-btn');

        if (!modal) return;

        window.openErrorModal = () => {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        window.closeErrorModal = () => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        };

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.closeErrorModal();
                if (window.auth.openLoginModal) {
                    window.auth.openLoginModal();
                } else {
                    // Fallback to manual click if somehow missing
                    const hLoginBtn = document.getElementById('header-login-btn');
                    if (hLoginBtn) hLoginBtn.click();
                }
            });
        }



        if (closeBtn) {
            closeBtn.addEventListener('click', window.closeErrorModal);
        }

        document.addEventListener('click', (e) => {
            if (e.target === modal) window.closeErrorModal();
        });
    }

    window.initErrorModal = initErrorModal;
})();
