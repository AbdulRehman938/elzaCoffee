/**
 * elzaCoffee Checkout Flow
 */
(function () {
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    
    // Step navigation
    const toStep2 = document.getElementById('to-step-2');
    const toStep1 = document.getElementById('to-step-1');
    const step1View = document.getElementById('step-1');
    const step2View = document.getElementById('step-2');
    const steps = document.querySelectorAll('.step');

    function switchStep(stepNum) {
        if (stepNum === 2) {
            step1View.classList.remove('active');
            step2View.classList.add('active');
            steps[1].classList.add('active');
            updateSummary();
        } else {
            step1View.classList.add('active');
            step2View.classList.remove('active');
            steps[1].classList.remove('active');
        }
    }

    function updateSummary() {
        if (!window.cartSystem) return;
        const cart = window.cartSystem.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal * 1.08; // 8% tax

        const subtotalEl = document.getElementById('checkout-subtotal');
        const totalEl = document.getElementById('checkout-total');
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }

    if (toStep2) toStep2.addEventListener('click', () => {
        const address = document.getElementById('checkout-address').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        if (address && phone) switchStep(2);
        else alert('Please fill in your shipping details.');
    });

    if (toStep1) toStep1.addEventListener('click', () => switchStep(1));

    // Handle Submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = checkoutForm.querySelector('.checkout-submit-btn');
            btn.disabled = true;
            btn.textContent = 'Processing...';

            const cart = window.cartSystem.getCart();
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalAmount = subtotal * 1.08;

            const orderData = {
                items: cart,
                totalAmount: totalAmount,
                shippingAddress: document.getElementById('checkout-address').value.trim() + ' | Phone: ' + document.getElementById('checkout-phone').value.trim(),
                paymentMethod: checkoutForm.querySelector('input[name="payment"]:checked').value
            };

            try {
                const response = await window.apiFetch('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                });

                // Success!
                if (window.showToast) window.showToast('Order placed successfully! ☕');
                
                // Clear cart
                localStorage.removeItem('elza_cart');
                window.cartSystem.updateUI(); // This will clear the UI
                
                // Close modal
                document.getElementById('checkout-modal').classList.remove('open');
                document.body.style.overflow = '';
                
                // Redirect or show success view (optional)
                setTimeout(() => window.location.href = 'index.html', 2000);

            } catch (err) {
                console.error('Order Error:', err);
                alert('Failed to place order. Please try again.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Place Your Order';
            }
        });
    }

    // Export trigger
    window.openCheckoutModal = () => {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            switchStep(1); // Reset to first step
        }
    };

    // Close handler
    document.addEventListener('click', (e) => {
        if (e.target.id === 'checkout-modal' || e.target.id === 'checkout-modal-close') {
            document.getElementById('checkout-modal').classList.remove('open');
            document.body.style.overflow = '';
        }
    });

})();
