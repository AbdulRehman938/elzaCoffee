/**
 * Shop / Catalog Page Logic
 * Loads products from Supabase, then handles search, filter, sort, and pagination.
 */

(function () {
    const catLabels = {
        espresso: 'Espresso',
        latte: 'Latte',
        'cold-brew': 'Cold Brew',
        beans: 'Coffee Beans',
        equipment: 'Equipment',
        pastry: 'Pastry',
    };

    let products = [];

    // ─── State ───────────────────────────────────────────────────
    let currentCategory = 'all';
    let initialMaxPrice = 50;
    let currentMaxPrice = 50;
    let currentMinRating = 0;
    let currentSort = 'popular';
    let searchQuery = '';
    let displayCount = 24; // initial page load count

    // ─── DOM refs ────────────────────────────────────────────────
    const grid = document.getElementById('shop-grid');
    const resultsCount = document.getElementById('results-count');
    const loadMoreWrap = document.getElementById('load-more-wrap');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const shopCartBtn = document.getElementById('shop-cart-btn');

    function checkAuthVisibility() {
        const isLoggedIn = window.auth?.isLoggedIn();
        if (shopCartBtn) {
            shopCartBtn.style.display = isLoggedIn ? 'flex' : 'none';
        }
    }

    const searchInput = document.getElementById('shop-search');
    const priceSlider = document.getElementById('price-max');
    const priceLabel = document.getElementById('price-max-label');
    const sortSelect = document.getElementById('sort-select');
    const resetBtn = document.getElementById('filter-reset');
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const sidebar = document.getElementById('shop-sidebar');

    function formatCategoryLabel(category) {
        if (!category) return 'Other';
        return category
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }



    function normalizeProduct(row, index) {
        const category = (row.category || 'beans').toLowerCase();
        const numericPrice = Number(row.price);
        const numericRating = Number(row.rating);
        const numericReviews = Number(row.reviews);
        const numericOldPrice = row.old_price == null ? null : Number(row.old_price);

        return {
            id: row.id != null ? row.id : index + 1,
            name: row.name || 'Unnamed Product',
            category,
            categoryLabel: row.category_label || catLabels[category] || formatCategoryLabel(category),
            price: Number.isFinite(numericPrice) ? numericPrice : 0,
            oldPrice: Number.isFinite(numericOldPrice) ? numericOldPrice : null,
            rating: Number.isFinite(numericRating) ? numericRating : 0,
            reviews: Number.isFinite(numericReviews) ? numericReviews : 0,
            image: window.pickProductImage(row.id != null ? Number(row.id) : index + 1, row.image || row.image_url),
            tag: row.tag || null,
        };
    }

    function setPriceLimits(items) {
        const maxPriceInProducts = items.reduce((max, item) => Math.max(max, item.price || 0), 0);
        initialMaxPrice = Math.max(50, Math.ceil(maxPriceInProducts));
        currentMaxPrice = initialMaxPrice;
        priceSlider.max = String(initialMaxPrice);
        priceSlider.value = String(initialMaxPrice);
        priceLabel.textContent = `$${initialMaxPrice}`;
    }

    function renderStatusMessage(message) {
        grid.innerHTML = `<div class="shop-status-message">${message}</div>`;
        resultsCount.textContent = message;
        loadMoreWrap.style.display = 'none';
    }

    async function loadProductsFromAPI() {
        if (!window.API_BASE_URL) {
            renderStatusMessage('API is not configured. Update js/api-config.js');
            return;
        }

        renderStatusMessage('Loading products...');

        try {
            const data = await window.apiFetch('/products');
            products = (data || []).map(normalizeProduct);
            setPriceLimits(products);

            if (products.length === 0) {
                renderStatusMessage('No products found in the database.');
                return;
            }

            renderProducts();
        } catch (error) {
            renderStatusMessage(`Failed to load products: ${error.message}`);
        }
    }

    // ─── Filtering + Sorting ─────────────────────────────────────
    function getFilteredProducts() {
        let filtered = products.filter(p => {
            if (currentCategory !== 'all' && p.category !== currentCategory) return false;
            if (p.price > currentMaxPrice) return false;
            if (p.rating < currentMinRating) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!p.name.toLowerCase().includes(q) && !p.categoryLabel.toLowerCase().includes(q)) return false;
            }
            return true;
        });

        // Sort
        switch (currentSort) {
            case 'price-low':  filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
            case 'rating':     filtered.sort((a, b) => b.rating - a.rating); break;
            case 'newest':     filtered.sort((a, b) => b.id - a.id); break;
            default:           filtered.sort((a, b) => b.reviews - a.reviews); break; // popular
        }

        return filtered;
    }

    // ─── Render ──────────────────────────────────────────────────
    function renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating - full >= 0.4 ? 1 : 0;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
    }

    function renderProducts() {
        const filtered = getFilteredProducts();
        const visible = filtered.slice(0, displayCount);

        if (filtered.length === 0) {
            renderStatusMessage('No products match your current filters.');
            return;
        }

        grid.innerHTML = visible.map(p => {
            const isLoggedIn = window.auth?.isLoggedIn();
            const currentCart = window.cartSystem ? window.cartSystem.getCart() : [];
            const isInCart = isLoggedIn && currentCart.some(item => Number(item.id) === Number(p.id));
            
            return `
                <div class="product-card ${isInCart ? 'selected' : ''}" data-id="${p.id}">


                    <div class="product-img-wrap">
                        ${p.tag ? `<span class="product-tag ${p.tag}">${p.tag}</span>` : ''}
                        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
                    </div>
                    <div class="product-body">
                        <div class="product-category">${p.categoryLabel}</div>
                        <div class="product-name" title="${p.name}">${p.name}</div>
                        <div class="product-rating">
                            <span class="product-stars">${renderStars(p.rating)}</span>
                            <span class="product-rating-num">(${p.reviews})</span>
                        </div>
                        <div class="product-footer">
                            <div>
                                <span class="product-price">$${p.price.toFixed(2)}</span>
                                ${p.oldPrice ? `<span class="product-old-price">$${p.oldPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <div class="product-actions-wrap">
                                <button class="product-detail-btn" title="View Details" onclick="event.stopPropagation(); openProductDetails(${p.id})">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                </button>
                                ${isLoggedIn ? `
                                    <button class="product-add-btn ${isInCart ? 'selected' : ''}" title="${isInCart ? 'Remove from cart' : 'Add to cart'}" data-id="${p.id}">
                                        ${isInCart ? '✓' : '+'}
                                    </button>
                                ` : ''}
                            </div>

                        </div>

                    </div>
                </div>
            `;
        }).join('');


        resultsCount.textContent = `Showing ${visible.length} of ${filtered.length} products`;
        loadMoreWrap.style.display = displayCount < filtered.length ? 'block' : 'none';
    }

    // ─── Event Handlers ──────────────────────────────────────────

    // Category chips
    document.querySelectorAll('#filter-category .filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#filter-category .filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.value;
            displayCount = 24;
            renderProducts();
        });
    });

    // Rating chips
    document.querySelectorAll('#filter-rating .filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#filter-rating .filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentMinRating = parseFloat(chip.dataset.value);
            displayCount = 24;
            renderProducts();
        });
    });

    // Price slider
    priceSlider.addEventListener('input', () => {
        currentMaxPrice = parseInt(priceSlider.value);
        priceLabel.textContent = `$${currentMaxPrice}`;
        displayCount = 24;
        renderProducts();
    });

    // Custom Sort Dropdown Logic
    const dropdown = document.getElementById('sort-dropdown');
    const dropdownSelected = dropdown?.querySelector('.dropdown-selected');
    const dropdownOptions = dropdown?.querySelector('.dropdown-options');
    const options = dropdown?.querySelectorAll('.option');

    if (dropdownSelected && dropdownOptions) {
        dropdownSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            if (isOpen) {
                gsap.to(dropdownOptions, { 
                    autoAlpha: 1, 
                    y: 0, 
                    duration: 0.4, 
                    ease: "power3.out" 
                });
            } else {
                gsap.to(dropdownOptions, { 
                    autoAlpha: 0, 
                    y: 10, 
                    duration: 0.3, 
                    ease: "power3.in" 
                });
            }
        });

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.dataset.value;
                const text = opt.textContent;
                
                // Update UI
                dropdownSelected.querySelector('span').textContent = text;
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                // Close dropdown
                dropdown.classList.remove('open');
                gsap.to(dropdownOptions, { autoAlpha: 0, y: 10, duration: 0.3 });
                
                // Trigger Sort
                currentSort = val;
                renderProducts();
            });
        });

        // Close when clicking outside
        document.addEventListener('click', () => {
            if (dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
                gsap.to(dropdownOptions, { autoAlpha: 0, y: 10, duration: 0.3 });
            }
        });
    }


    // Search (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value.trim();
            displayCount = 24;
            renderProducts();
        }, 250);
    });

    // Load more
    loadMoreBtn.addEventListener('click', () => {
        displayCount += 12;
        renderProducts();
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        currentCategory = 'all';
        currentMaxPrice = 50;
        currentMinRating = 0;
        currentSort = 'popular';
        searchQuery = '';
        displayCount = 24;
        searchInput.value = '';
        priceSlider.value = 50;
        priceLabel.textContent = '$50';
        sortSelect.value = 'popular';

        document.querySelectorAll('#filter-category .filter-chip').forEach((c, i) => {
            c.classList.toggle('active', i === 0);
        });
        document.querySelectorAll('#filter-rating .filter-chip').forEach((c, i) => {
            c.classList.toggle('active', i === 0);
        });

        renderProducts();
    });

    // Mobile filter toggle
    mobileFilterBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileFilterBtn) {
            sidebar.classList.remove('open');
        }
    });

    // Add to cart click handler
    if (grid) {
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.product-add-btn');
            const card = e.target.closest('.product-card');
            
            if (btn || card) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetCard = card || btn.closest('.product-card');
                const id = Number(targetCard.dataset.id);
                const product = products.find(p => Number(p.id) === id);
                
                if (product && window.cartSystem) {
                    if (!window.auth.isLoggedIn()) {
                        if (window.openErrorModal) window.openErrorModal();
                        return;
                    }

                    const currentCart = window.cartSystem.getCart();
                    const isInCart = currentCart.some(item => Number(item.id) === id);

                    if (isInCart) {
                        window.cartSystem.removeItem(id);
                    } else {
                        window.cartSystem.addItem(product);
                        // Animation safety check
                        const targetBtn = targetCard.querySelector('.product-add-btn');
                        if (targetBtn && typeof gsap !== 'undefined') {
                            gsap.from(targetBtn, { scale: 1.5, duration: 0.3, ease: "back.out(2)" });
                        }
                    }
                }
            }


        });
    }



    // Cart button on shop page
    if (shopCartBtn) {

        shopCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('cart-modal');
            if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
        });
    }


    // Close cart modal
    document.addEventListener('click', (e) => {
        const cModal = document.getElementById('cart-modal');
        if (cModal && (e.target === cModal || e.target.id === 'cart-modal-close')) {
            cModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Listen for cart changes (e.g. from the modal) to update card highlights
    window.addEventListener('cartUpdated', () => {
        renderProducts();
    });

    // ─── Initial Render ──────────────────────────────────────────
    if (grid) {
        loadProductsFromAPI();
        checkAuthVisibility();
        window.addEventListener('authChange', () => {
            checkAuthVisibility();
            renderProducts();
        });
    }
})();



