/**
 * Shop / Catalog Page Logic
 * Generates 50 products, handles search, filter, sort, and pagination.
 */

(function () {
    // ─── Product Data (50 items) ─────────────────────────────────
    const images = [
        'assets/Cup1.png',
        'assets/Coffees.png',
        'assets/Popularmenu Img.png',
        'assets/Proefpakket_page-0003 2 (no bg).png',
        'assets/Rectangle (no bg).png',
        'assets/Rectangle (no bg) (1).png',
        'assets/Rectangle (no bg) (2).png',
    ];

    const tags = ['new', 'sale', 'popular', null, null, null]; // weighted so most have no tag
    const categories = ['espresso', 'latte', 'cold-brew', 'beans', 'equipment', 'pastry'];
    const catLabels = { espresso: 'Espresso', latte: 'Latte', 'cold-brew': 'Cold Brew', beans: 'Coffee Beans', equipment: 'Equipment', pastry: 'Pastry' };

    const productNames = [
        'Classic Espresso', 'Double Shot Espresso', 'Ristretto', 'Americano',
        'Espresso Macchiato', 'Long Black', 'Red Eye', 'Black Eye',
        'Vanilla Latte', 'Caramel Latte', 'Hazelnut Latte', 'Mocha Latte',
        'Oat Milk Latte', 'Iced Latte', 'Matcha Latte', 'Lavender Latte',
        'Classic Cold Brew', 'Nitro Cold Brew', 'Vanilla Cold Brew', 'Caramel Cold Brew',
        'Cold Brew Float', 'Coconut Cold Brew', 'Mocha Cold Brew', 'Honey Cold Brew',
        'Ethiopian Yirgacheffe', 'Colombian Supremo', 'Sumatra Mandheling', 'Kenya AA',
        'Brazilian Santos', 'Costa Rica Tarrazú', 'Guatemala Antigua', 'Jamaica Blue Mountain',
        'Manual Grinder Pro', 'Pour Over Dripper', 'French Press 800ml', 'Ceramic Mug Set',
        'Gooseneck Kettle', 'Digital Scale', 'Travel Tumbler', 'Cold Brew Maker',
        'Butter Croissant', 'Chocolate Muffin', 'Almond Biscotti', 'Cinnamon Roll',
        'Blueberry Scone', 'Banana Bread', 'Tiramisu Slice', 'Coffee Cookie',
        'Espresso Brownie', 'Maple Pecan Danish',
    ];

    const products = productNames.map((name, i) => {
        const cat = categories[i % categories.length];
        const price = (() => {
            if (cat === 'equipment') return +(12 + Math.random() * 38).toFixed(2);
            if (cat === 'beans') return +(8 + Math.random() * 22).toFixed(2);
            if (cat === 'pastry') return +(2 + Math.random() * 6).toFixed(2);
            return +(3 + Math.random() * 7).toFixed(2);
        })();
        const rating = +(3.5 + Math.random() * 1.5).toFixed(1);
        const tag = tags[i % tags.length];
        const oldPrice = tag === 'sale' ? +(price * (1.15 + Math.random() * 0.2)).toFixed(2) : null;

        return {
            id: i + 1,
            name,
            category: cat,
            categoryLabel: catLabels[cat],
            price,
            oldPrice,
            rating,
            reviews: Math.floor(10 + Math.random() * 290),
            image: images[i % images.length],
            tag,
        };
    });

    // ─── State ───────────────────────────────────────────────────
    let currentCategory = 'all';
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
    renderProducts();

})();
