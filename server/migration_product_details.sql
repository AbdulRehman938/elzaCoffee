-- 12. Create Product Extra Details Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_extra_details]') AND type in (N'U'))
BEGIN
    CREATE TABLE product_extra_details (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL,
        manufacturing_date DATE,
        expiry_date DATE,
        usage_instructions NVARCHAR(MAX),
        ingredients NVARCHAR(MAX),
        weight_info NVARCHAR(100),
        origin_country NVARCHAR(100),
        nutritional_info NVARCHAR(MAX),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
END
GO

-- 13. Create Product Reviews Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[product_reviews]') AND type in (N'U'))
BEGIN
    CREATE TABLE product_reviews (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL,
        user_id INT NOT NULL,
        user_name NVARCHAR(255),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment NVARCHAR(MAX),
        created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO
