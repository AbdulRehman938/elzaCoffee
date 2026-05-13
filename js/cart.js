/**
 * elzaCoffee Cart System
 * Manages cart state in localStorage and updates the UI.
 */
(function () {
    let cart = JSON.parse(localStorage.getItem('elza_cart')) || [];

    function saveCart() {
        localStorage.setItem('elza_cart', JSON.stringify(cart));
        updateCartUI();
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    }

    function updateCartUI() {

        // Re-find containers in case they were just injected by renderer.js
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartTotalEl = document.querySelector('.total-row span:last-child');
        const subtotalEl = document.querySelector('.summary-row:nth-child(1) span:last-child');
        const taxEl = document.querySelector('.summary-row:nth-child(2) span:last-child');

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all badges (header, shop bar, etc.)
        const allBadges = document.querySelectorAll('.cart-badge, #cart-badge, #shop-cart-badge');
        allBadges.forEach(badge => {
            if (badge) {
                badge.textContent = totalItems;
                badge.classList.toggle('active', totalItems > 0);
                if (totalItems > 0) badge.style.display = 'flex';
            }
        });

        // Update Cart Modal Header Badge
        const headerBadge = document.querySelector('.cart-count-badge');
        if (headerBadge) headerBadge.textContent = `${totalItems} Items`;

        renderCartItems(cartItemsContainer);
        updateSummary(subtotalEl, taxEl, cartTotalEl);

        // Toggle summary section
        const summarySection = document.getElementById('cart-summary-section');
        if (summarySection) {
            summarySection.style.display = cart.length > 0 ? 'block' : 'none';
        }
    }


    function renderCartItems(container) {
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = `

                <div class="cart-empty-state">
                    <img src="assets/ph_shopping-cart-light.png" alt="Empty" class="empty-icon">
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="empty-shop-link">Browse Products</a>
                </div>
            `;
            return;
        }

        container.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">

                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-meta">${item.categoryLabel}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn minus" data-id="${item.id}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-right">
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="cart-item-remove" data-id="${item.id}" title="Remove">✕</button>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners for qty and remove
        attachCartItemListeners();
    }

    function updateSummary(subtotalEl, taxEl, cartTotalEl) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
    }


    function attachCartItemListeners() {
        // Use the same container logic to ensure we target correctly
        const container = document.querySelector('.cart-items');
        if (!container) return;

        container.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                updateQuantity(btn.dataset.id, -1);
            };
        });
        container.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                updateQuantity(btn.dataset.id, 1);
            };
        });
        container.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                removeFromCart(btn.dataset.id);
            };
        });
    }


    function addItemToCart(product, quantityToAdd = 1) {
        const existing = cart.find(item => item.id == product.id);
        
        const finalProduct = { ...product, image: window.pickProductImage(product.id, product.image || product.image_url) };

        if (existing) {
            existing.quantity += quantityToAdd;
        } else {
            cart.push({ ...finalProduct, quantity: quantityToAdd });
        }
        saveCart();
        
        // Show success toast
        if (window.showToast) window.showToast(`${product.name} added to cart!`);
    }

    function removeFromCart(id) {
        const targetId = Number(id);
        cart = cart.filter(item => Number(item.id) !== targetId);
        saveCart();
    }


    function updateQuantity(id, delta) {
        const targetId = Number(id);
        const item = cart.find(item => Number(item.id) === targetId);

        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                saveCart();
            }
        }
    }

    // Export to global scope
    window.cartSystem = {
        addItem: addItemToCart,
        removeItem: removeFromCart,
        updateUI: updateCartUI,
        getCart: () => cart
    };


    // Initial UI Sync
    document.addEventListener('DOMContentLoaded', () => {
        updateCartUI();

        // Watch for renderer.js injecting the modal
        const placeholder = document.getElementById('cart-modal-placeholder');
        if (placeholder) {
            const observer = new MutationObserver(() => {
                updateCartUI();
            });
            observer.observe(placeholder, { childList: true });
        }

        // The checkout button is inside the modal, so we need to wait for it
        // Or better, use event delegation
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'cart-checkout-btn') {
                const cartModal = document.getElementById('cart-modal');
                if (cartModal) cartModal.classList.remove('open');
                if (window.openCheckoutModal) window.openCheckoutModal();
            }
        });
    });


})();


