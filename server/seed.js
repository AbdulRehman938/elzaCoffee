const { poolPromise, sql } = require('./db');

const adjectives = ['Aurora', 'Velvet', 'Golden', 'Midnight', 'Cedar', 'Maple', 'Cocoa', 'Amber', 'Summit', 'Noble'];
const seriesList = ['Blend', 'Reserve', 'Craft', 'Estate', 'Roast', 'Series', 'Collection', 'Batch', 'Select', 'Signature'];
const categories = ['espresso', 'latte', 'cold-brew', 'beans', 'equipment', 'pastry'];
const productGroups = ['House', 'Seasonal', 'Single Origin', 'Specialty', 'Cafe Essentials'];
const tags = ['popular', 'new', 'sale', null, null];

const catLabels = {
    'espresso': 'Espresso',
    'latte': 'Latte',
    'cold-brew': 'Cold Brew',
    'beans': 'Coffee Beans',
    'equipment': 'Equipment',
    'pastry': 'Pastry'
};

const productTypes = {
    'espresso': ['Single Shot', 'Double Shot', 'Ristretto', 'Lungo'],
    'latte': ['Classic Latte', 'Flavored Latte', 'Iced Latte', 'Oat Latte'],
    'cold-brew': ['Classic Cold Brew', 'Nitro', 'Vanilla Infused', 'Barrel Aged'],
    'beans': ['Light Roast', 'Medium Roast', 'Dark Roast', 'Espresso Roast'],
    'equipment': ['Brewer', 'Grinder', 'Scale', 'Kettle'],
    'pastry': ['Croissant', 'Muffin', 'Cookie', 'Cake']
};

async function seed() {
    try {
        console.log('Seeding products to SQL Server...');
        const pool = await poolPromise;
        
        for (let i = 1; i <= 100; i++) {
            const adj = adjectives[(i - 1) % 10];
            const series = seriesList[Math.floor((i - 1) / 10) % 10];
            const category = categories[(i - 1) % 6];
            const group = productGroups[(i - 1) % 5];
            const tag = tags[(i - 1) % 5];
            
            const name = `${adj} ${series} ${String(i).padStart(3, '0')}`;
            const description = `A curated ${category} coffee product from our ${group} lineup, crafted for consistent flavor and aroma.`;
            const label = catLabels[category];
            const type = productTypes[category][(i - 1) % 4];
            
            let price = 0;
            if (category === 'espresso') price = 3.20 + (i % 18) * 0.15;
            else if (category === 'latte') price = 4.50 + (i % 20) * 0.18;
            else if (category === 'cold-brew') price = 4.80 + (i % 16) * 0.22;
            else if (category === 'beans') price = 10.00 + (i % 25) * 0.75;
            else if (category === 'equipment') price = 18.00 + (i % 35) * 1.35;
            else price = 2.20 + (i % 12) * 0.35;
            
            price = parseFloat(price.toFixed(2));
            
            let oldPrice = null;
            if (i % 4 === 0) {
                oldPrice = parseFloat((price * 1.15).toFixed(2));
            }
            
            const rating = parseFloat((3.8 + (i % 12) * 0.1).toFixed(1));
            const reviews = 20 + ((i * 7) % 320);

            const productRecord = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('category', sql.NVarChar, category)
                .input('category_label', sql.NVarChar, label)
                .input('product_group', sql.NVarChar, group)
                .input('product_type', sql.NVarChar, type)
                .input('price', sql.Decimal(10, 2), price)
                .input('old_price', sql.Decimal(10, 2), oldPrice)
                .input('rating', sql.Decimal(2, 1), rating)
                .input('reviews', sql.Int, reviews)
                .input('tag', sql.NVarChar, tag)
                .query(`
                    DECLARE @pid BIGINT;
                    IF NOT EXISTS (SELECT 1 FROM products WHERE name = @name)
                    BEGIN
                        INSERT INTO products (name, description, category, category_label, product_group, product_type, price, old_price, rating, reviews, tag)
                        OUTPUT INSERTED.id
                        VALUES (@name, @description, @category, @category_label, @product_group, @product_type, @price, @old_price, @rating, @reviews, @tag)
                    END
                    ELSE
                    BEGIN
                        SELECT id FROM products WHERE name = @name;
                    END
                `);
            
            const productId = productRecord.recordset[0].id;

            // Seed Extra Details
            await pool.request()
                .input('pid', sql.BigInt, productId)
                .input('mfg', sql.Date, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 days ago
                .input('exp', sql.Date, new Date(Date.now() + 335 * 24 * 60 * 60 * 1000)) // ~11 months from now
                .input('usage', sql.NVarChar, `Best enjoyed ${category === 'equipment' ? 'daily' : 'fresh'}. Store in a cool, dry place.`)
                .input('ing', sql.NVarChar, category === 'beans' ? '100% Arabica Coffee Beans' : 'Premium materials/ingredients')
                .input('weight', sql.NVarChar, category === 'beans' ? '250g' : (category === 'equipment' ? '1.2kg' : 'Regular Size'))
                .input('origin', sql.NVarChar, 'Brazil, Ethiopia, Columbia')
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM product_extra_details WHERE product_id = @pid)
                    BEGIN
                        INSERT INTO product_extra_details (product_id, manufacturing_date, expiry_date, usage_instructions, ingredients, weight_info, origin_country)
                        VALUES (@pid, @mfg, @exp, @usage, @ing, @weight, @origin)
                    END
                `);
        }


        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
