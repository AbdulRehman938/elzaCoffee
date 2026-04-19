/**
 * Shop / Catalog Page Logic
 * Loads products from Supabase, then handles search, filter, sort, and pagination.
 */

(function () {
    const productImages = [
        'assets/Coffees.png',
        'assets/Rectangle (no bg).png',
        'assets/Rectangle (no bg) (1).png',
        'assets/Rectangle (no bg) (2).png',
    ];
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

    function pickFrontendImage(seed) {
        const safeSeed = Number.isFinite(seed) ? seed : 1;
        const idx = Math.abs((safeSeed * 9301 + 49297) % 233280) % productImages.length;
        return productImages[idx];
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
            image: pickFrontendImage(row.id != null ? Number(row.id) : index + 1),
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

    async function loadProductsFromSupabase() {
        if (!window.supabaseClient) {
            renderStatusMessage('Supabase is not configured. Update js/supabase-config.js');
            return;
        }

        renderStatusMessage('Loading products...');

        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*');

        if (error) {
            renderStatusMessage(`Failed to load products: ${error.message}`);
            return;
        }

        products = (data || []).map(normalizeProduct);
        setPriceLimits(products);

        if (products.length === 0) {
            renderStatusMessage('No products found in the database.');
            return;
        }

        renderProducts();
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

        grid.innerHTML = visible.map(p => `
            <div class="product-card" data-id="${p.id}">
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
                        <button class="product-add-btn" title="Add to cart" data-id="${p.id}">+</button>
                    </div>
                </div>
            </div>
        `).join('');

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

    // Sort
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        renderProducts();
    });

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

    // Cart button on shop page
    const shopCartBtn = document.getElementById('shop-cart-btn');
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

    // ─── Initial Render ──────────────────────────────────────────
    loadProductsFromSupabase();

})();
