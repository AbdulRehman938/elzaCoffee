const express = require('express');
const cors = require('cors');
const { poolPromise, sql } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'elza_coffee_secret';

app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[GLOBAL LOG] Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Multer Setup for Profile Images ---

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

// --- API Endpoints ---

// Products: Get Single Product with Extra Details & Reviews
app.get('/api/products/:id/details', async (req, res) => {
    console.log(`[GET] Product Details for ID: ${req.params.id}`);
    try {
        const pool = await poolPromise;
        const productId = req.params.id;

        // 1. Get basic product info
        const productResult = await pool.request()
            .input('id', sql.BigInt, productId)
            .query('SELECT * FROM products WHERE id = @id');

        if (productResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = productResult.recordset[0];

        // 2. Get extra details
        const detailsResult = await pool.request()
            .input('id', sql.BigInt, productId)
            .query('SELECT * FROM product_extra_details WHERE product_id = @id');
        
        product.extra = detailsResult.recordset[0] || null;

        // 3. Get reviews
        const reviewsResult = await pool.request()
            .input('id', sql.BigInt, productId)
            .query('SELECT * FROM product_reviews WHERE product_id = @id ORDER BY created_at DESC');
        
        product.reviews_list = reviewsResult.recordset;

        res.json(product);
    } catch (err) {
        console.error('Fetch Details Error:', err);
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});

// Products: Get All Products
app.get('/api/products', async (req, res) => {

    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM products');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});


app.get('/api/products/recommended', async (req, res) => {

    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            'SELECT TOP 8 id, name, description, rating, reviews, price, old_price, tag FROM products ORDER BY rating DESC'
        );
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Auth: Signup
app.post('/api/auth/signup', upload.single('profile_image'), async (req, res) => {
    const { name, email, password } = req.body;
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const pool = await poolPromise;
        
        // Check if user exists
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM users WHERE email = @email');
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('profile_image', sql.NVarChar, profile_image)
            .query('INSERT INTO users (name, email, password, profile_image) VALUES (@name, @email, @password, @profile_image)');

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: err.message || 'Error creating user' });
    }
});


// Auth: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        const user = result.recordset[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, profile_image: user.profile_image } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message || 'Login error' });
    }
});

// DEBUG PING (To check if server is updated)
app.get('/api/ping', (req, res) => res.json({ status: 'ok', version: '1.3', timestamp: new Date() }));

// Auth: Update Profile
app.post('/api/auth/profile', authenticateToken, upload.single('profile_image'), async (req, res) => {
    const { name } = req.body;
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const pool = await poolPromise;
        let query = 'UPDATE users SET name = @name';
        if (profile_image) query += ', profile_image = @image';
        query += ' WHERE id = @id';

        const request = pool.request()
            .input('id', sql.Int, req.user.id)
            .input('name', sql.NVarChar, name);
        if (profile_image) request.input('image', sql.NVarChar, profile_image);

        await request.query(query);

        // Fetch updated user
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query('SELECT id, name, email, profile_image FROM users WHERE id = @id');

        res.json({ message: 'Profile updated', user: result.recordset[0] });
    } catch (err) {
        console.error('Update DB Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});// Orders: Place Order
app.post('/api/orders', authenticateToken, async (req, res) => {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        try {
            // 1. Create Order
            const orderResult = await transaction.request()
                .input('user_id', sql.Int, req.user.id)
                .input('total', sql.Decimal(10, 2), totalAmount)
                .input('address', sql.NVarChar, shippingAddress)
                .input('payment', sql.NVarChar, paymentMethod)
                .query(`
                    INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
                    OUTPUT INSERTED.id
                    VALUES (@user_id, @total, @address, @payment)
                `);
            
            const orderId = orderResult.recordset[0].id;

            // 2. Add Items
            for (const item of items) {
                await transaction.request()
                    .input('order_id', sql.Int, orderId)
                    .input('product_id', sql.BigInt, item.id)
                    .input('qty', sql.Int, item.quantity)
                    .input('price', sql.Decimal(10, 2), item.price)
                    .query(`
                        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                        VALUES (@order_id, @product_id, @qty, @price)
                    `);
            }

            // 3. Update User Points (1 point per $1 spent)
            const earnedPoints = Math.floor(totalAmount);
            await transaction.request()
                .input('id', sql.Int, req.user.id)
                .input('pts', sql.Int, earnedPoints)
                .query('UPDATE users SET points = points + @pts WHERE id = @id');

            await transaction.commit();
            res.status(201).json({ message: 'Order placed successfully', orderId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Checkout Error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // In a real app, send email here. For now, generate a token
        const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('token', sql.NVarChar, resetToken)
            .query('UPDATE users SET reset_token = @token WHERE email = @email');

        res.json({ message: 'Email verified', resetToken }); // Return token for frontend shortcut
    } catch (err) {
        res.status(500).json({ error: 'Error checking email' });
    }
});

// Auth: Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const pool = await poolPromise;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.request()
            .input('email', sql.NVarChar, decoded.email)
            .input('password', sql.NVarChar, hashedPassword)
            .query('UPDATE users SET password = @password, reset_token = NULL WHERE email = @email');

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
});

// Cart: Sync Cart
app.post('/api/cart/sync', authenticateToken, async (req, res) => {
    const { items } = req.body; // Array of { id, quantity }
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // 1. Clear old items
            await transaction.request()
                .input('user_id', sql.Int, req.user.id)
                .query('DELETE FROM in_cart_items WHERE user_id = @user_id');

            // 2. Insert new items
            if (items && items.length > 0) {
                for (const item of items) {
                    await transaction.request()
                        .input('user_id', sql.Int, req.user.id)
                        .input('product_id', sql.BigInt, item.id)
                        .input('qty', sql.Int, item.quantity)
                        .query(`
                            INSERT INTO in_cart_items (user_id, product_id, quantity)
                            VALUES (@user_id, @product_id, @qty)
                        `);
                }
            }

            await transaction.commit();
            res.json({ message: 'Cart synced successfully' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Sync Cart Error:', err);
        res.status(500).json({ error: 'Failed to sync cart' });
    }
});

// Cart: Fetch Saved Cart
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, req.user.id)
            .query(`
                SELECT p.*, c.quantity 
                FROM in_cart_items c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = @user_id
            `);
        
        // Map database fields to frontend fields
        const cartItems = result.recordset.map(row => ({
            id: row.id,
            name: row.name,
            price: row.price,
            image: row.image || row.image_url,
            categoryLabel: row.category_label,
            quantity: row.quantity
        }));

        res.json({ items: cartItems });
    } catch (err) {
        console.error('Fetch Cart Error:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Auth: Me (Verify Token)

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query('SELECT id, name, email, profile_image FROM users WHERE id = @id');
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// SPA fallback for frontend routes
app.use(express.static(path.join(__dirname, '..')));

app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    } else {
        next();
    }
});

// Final catch-all for missing API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: `API Route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});


