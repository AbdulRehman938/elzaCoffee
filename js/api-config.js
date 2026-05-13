/**
 * API Configuration for elzaCoffee
 */
(function () {
    window.API_BASE_URL = 'http://localhost:5000/api';
    
    // Helper for fetching data
    window.apiFetch = async (endpoint, options = {}) => {
        const token = localStorage.getItem('elza_token');
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // If body is FormData, don't set Content-Type header (browser will set it with boundary)
        if (options.body instanceof FormData) {
            delete defaultHeaders['Content-Type'];
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Fetch Error (${endpoint}):`, error);
            throw error;
        }
    };

    // Auth Helpers
    window.auth = {
        saveToken: (token) => localStorage.setItem('elza_token', token),
        getToken: () => localStorage.getItem('elza_token'),
        logout: async () => {
            // 1. Sync cart to DB if possible
            if (window.cartSystem && window.auth.isLoggedIn()) {
                const currentItems = window.cartSystem.getCart();
                if (currentItems.length > 0) {
                    try {
                        await window.apiFetch('/cart/sync', {
                            method: 'POST',
                            body: JSON.stringify({ items: currentItems })
                        });
                    } catch (err) { console.error('Logout Sync Failed:', err); }
                }
            }
            // 2. Clear
            localStorage.removeItem('elza_token');
            localStorage.removeItem('elza_user');
            localStorage.removeItem('elza_cart');
            window.location.reload();
        },
        saveUser: (user) => localStorage.setItem('elza_user', JSON.stringify(user)),
        getUser: () => {
            const user = localStorage.getItem('elza_user');
            return user ? JSON.parse(user) : null;
        },
        isLoggedIn: () => !!localStorage.getItem('elza_token')
    };

    // Global Image Picking Logic for Products
    window.PRODUCT_IMAGES = [
        'assets/Coffees.png',
        'assets/Rectangle (no bg).png',
        'assets/Rectangle (no bg) (1).png',
        'assets/Rectangle (no bg) (2).png',
    ];

    window.pickProductImage = (id, currentImage) => {
        // If the database has a valid image, use it
        if (currentImage && !currentImage.includes('unsplash.com')) {
            // Ensure local paths are correctly prefixed if they come from the server uploads
            if (currentImage.startsWith('/uploads')) {
                return `http://localhost:5000${currentImage}`;
            }
            return currentImage;
        }

        // Otherwise use the seeded frontend images
        const safeSeed = Number.isFinite(Number(id)) ? Number(id) : 1;
        const idx = Math.abs((safeSeed * 9301 + 49297) % 233280) % window.PRODUCT_IMAGES.length;
        return window.PRODUCT_IMAGES[idx];
    };

})();
