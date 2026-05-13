-- SQL Server Schema for elzaCoffee

-- 1. Create Database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'elza_coffee')
BEGIN
    CREATE DATABASE elza_coffee;
END
GO

USE elza_coffee;
GO

-- 2. Create Products Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE products (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        category NVARCHAR(100) NOT NULL,
        category_label NVARCHAR(100),
        product_group NVARCHAR(100),
        product_type NVARCHAR(100),
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        old_price DECIMAL(10, 2),
        rating DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
        reviews INT NOT NULL DEFAULT 0,
        image_url NVARCHAR(MAX),
        image NVARCHAR(MAX),
        tag NVARCHAR(50),
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_products_category ON products(category);
    CREATE INDEX idx_products_rating ON products(rating DESC);
    CREATE INDEX idx_products_created_at ON products(created_at DESC);
END
GO

-- 3. Create Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(MAX) NOT NULL,
        profile_image NVARCHAR(MAX),
        points INT NOT NULL DEFAULT 0,
        reset_token NVARCHAR(255),
        created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

END
GO

-- 4. Create Orders Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND type in (N'U'))
BEGIN
    CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
        shipping_address NVARCHAR(MAX) NOT NULL,
        payment_method NVARCHAR(50) NOT NULL,
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- 5. Create Order Items Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE order_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id) ON DELETE CASCADE,
        product_id BIGINT NOT NULL FOREIGN KEY REFERENCES products(id),
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL
    );
END
GO

-- 6. Create Persistent Cart Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[in_cart_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE in_cart_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        product_id BIGINT NOT NULL FOREIGN KEY REFERENCES products(id),
        quantity INT NOT NULL DEFAULT 1,
        UNIQUE(user_id, product_id)
    );
END
GO

-- 7. Create Product Extra Details Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_extra_details]') AND type in (N'U'))
BEGIN
    CREATE TABLE product_extra_details (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
        manufacturing_date DATE,
        expiry_date DATE,
        usage_instructions NVARCHAR(MAX),
        ingredients NVARCHAR(MAX),
        weight_info NVARCHAR(100),
        origin_country NVARCHAR(100),
        nutritional_info NVARCHAR(MAX)
    );
END
GO

-- 8. Create Product Reviews Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_reviews]') AND type in (N'U'))
BEGIN
    CREATE TABLE product_reviews (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        user_name NVARCHAR(255),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment NVARCHAR(MAX),
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );
END
GO