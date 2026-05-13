/**
 * Product Detail Modal Logic
 * Shared between Home and Shop pages.
 */

window.openProductDetails = async (id) => {
    const modal = document.getElementById('product-detail-modal');
    if (!modal) {
        console.error('[ProductDetail] Modal element not found!');
        return;
    }

    try {
        console.log(`[ProductDetail] Fetching details for product ID: ${id}`);
        const product = await window.apiFetch(`/products/${id}/details`);
        
        // Populate Basic Info
        document.getElementById('detail-title').textContent = product.name;
        document.getElementById('detail-category').textContent = product.category_label || product.category;
        document.getElementById('detail-price').textContent = product.price.toFixed(2);
        document.getElementById('detail-description').textContent = product.description;
        
        const oldPriceEl = document.getElementById('detail-old-price');
        const discEl = document.getElementById('detail-discount');
        if (product.old_price) {
            oldPriceEl.textContent = `$${product.old_price.toFixed(2)}`;
            const pct = Math.round((1 - (product.price / product.old_price)) * 100);
            discEl.textContent = `-${pct}%`;
            discEl.style.display = 'block';
        } else {
            oldPriceEl.textContent = '';
            discEl.style.display = 'none';
        }

        const tagEl = document.getElementById('detail-tag');
        if (product.tag) {
            tagEl.textContent = product.tag;
            tagEl.style.display = 'block';
        } else {
            tagEl.style.display = 'none';
        }

        const mainImg = document.getElementById('detail-main-image');
        mainImg.src = window.pickProductImage(product.id, product.image || product.image_url);

        const starsEl = document.getElementById('detail-stars');
        const rating = product.rating || 0;

        starsEl.innerHTML = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        document.getElementById('detail-rating-text').textContent = `(${rating} • ${product.reviews} reviews)`;

        // Extra Specs
        if (product.extra) {
            const mfgDate = product.extra.manufacturing_date ? new Date(product.extra.manufacturing_date).toLocaleDateString() : 'N/A';
            const expDate = product.extra.expiry_date ? new Date(product.extra.expiry_date).toLocaleDateString() : 'N/A';
            document.getElementById('detail-mfg').textContent = mfgDate;
            document.getElementById('detail-exp').textContent = expDate;
            document.getElementById('detail-weight').textContent = product.extra.weight_info || 'N/A';
            document.getElementById('detail-origin').textContent = product.extra.origin_country || 'N/A';
            document.getElementById('detail-usage').textContent = product.extra.usage_instructions || 'Best enjoyed fresh.';
            document.getElementById('detail-ingredients').textContent = product.extra.ingredients || 'Premium quality ingredients.';
        }

        // Reviews
        const reviewsList = document.getElementById('detail-reviews-list');
        if (product.reviews_list && product.reviews_list.length > 0) {
            reviewsList.innerHTML = product.reviews_list.map(r => `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-user">${r.user_name || 'Verified Customer'}</span>
                        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                    </div>
                    <p class="review-text">${r.comment}</p>
                    <span class="review-date">${new Date(r.created_at).toLocaleDateString()}</span>
                </div>
            `).join('');
        } else {
            reviewsList.innerHTML = '<div class="empty-reviews">No reviews yet. Be the first to rate this product!</div>';
        }

        // Qty Reset
        document.getElementById('detail-qty-value').textContent = '1';
        
        // Cart Button Action
        const addBtn = document.getElementById('detail-add-to-cart');
        addBtn.onclick = () => {
            const qty = parseInt(document.getElementById('detail-qty-value').textContent);
            
            if (window.cartSystem) {
                if (!window.auth.isLoggedIn()) {
                    if (window.openErrorModal) window.openErrorModal();
                    return;
                }
                window.cartSystem.addItem(product, qty);
            }
            window.closeProductDetails();
        };

        // Open Modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

    } catch (err) {
        console.error('[ProductDetail] Failed to open product details:', err);
    }
};

window.closeProductDetails = () => {
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.initProductDetailModal = () => {
    const closeBtn = document.getElementById('detail-modal-close');
    if (closeBtn) closeBtn.onclick = window.closeProductDetails;

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            const pane = document.getElementById(`tab-${target}`);
            if (pane) pane.classList.add('active');
        };
    });

    // Qty Logic
    const minus = document.getElementById('detail-qty-minus');
    const plus = document.getElementById('detail-qty-plus');
    const val = document.getElementById('detail-qty-value');

    if (minus && plus && val) {
        minus.onclick = () => {
            let current = parseInt(val.textContent);
            if (current > 1) val.textContent = current - 1;
        };
        plus.onclick = () => {
            let current = parseInt(val.textContent);
            val.textContent = current + 1;
        };
    }
};
