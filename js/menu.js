/**
 * Popular Menu Logic
 * Fetches top products from the API and populates the menu section.
 */

async function initPopularMenu() {
    const leftCol = document.getElementById('menu-left');
    const rightCol = document.getElementById('menu-right');

    if (!leftCol || !rightCol) return;

    // Helper to render an item
    const renderMenuItem = (p, side) => `
        <div class="menu-item" style="cursor: pointer" onclick="if(window.openProductDetails) window.openProductDetails(${p.id})">
            <div class="item-text-row">
                ${side === 'left' 
                    ? `<span class="item-price">$${Number(p.price).toFixed(2)}</span><span class="item-name">${p.name}</span>`
                    : `<span class="item-name">${p.name}</span><span class="item-price">$${Number(p.price).toFixed(2)}</span>`
                }
            </div>
            <div class="item-line"></div>
        </div>
    `;

    try {
        // Fetch products - we'll take top 8 popular ones
        const data = await window.apiFetch('/products');
        
        // Sort by reviews or rating to get "popular" items
        const popularItems = (data || [])
            .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
            .slice(0, 8);

        if (popularItems.length === 0) return;

        // Split into left and right
        const leftItems = popularItems.slice(0, 4);
        const rightItems = popularItems.slice(4, 8);

        leftCol.innerHTML = leftItems.map(p => renderMenuItem(p, 'left')).join('');
        rightCol.innerHTML = rightItems.map(p => renderMenuItem(p, 'right')).join('');

        // Re-trigger scroll animations if any (GSAP)
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('[PopularMenu] Failed to load menu:', error);
    }
}

// Export to window
window.initPopularMenu = initPopularMenu;
