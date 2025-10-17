const connectDB = require('./config/db');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
const Inventory = require('./models/Inventory');

dotenv.config();

const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '1234567',
    role: 'admin',
};

const productsData = [
    {
        name: 'Laptop Pro X',
        category: 'Electronics',
        unitPrice: 1200.00,
        countInStock: 50,
        lowStockThreshold: 10,
        description: 'High-performance laptop with 16GB RAM.',
        sku: 'LPX-001',
    },
    {
        name: 'Wireless Mouse Basic',
        category: 'Accessories',
        unitPrice: 25.50,
        countInStock: 200,
        lowStockThreshold: 50,
        description: 'Simple wireless mouse with optical tracking.',
        sku: 'WMB-002',
    }
];

const seedData = async () => {
    await connectDB();

    try {
        console.log('--- DESTROYING EXISTING DATA ---');

        await User.deleteMany({});
        await Product.deleteMany({});
        await Transaction.deleteMany({});
        await Inventory.deleteMany({});
        console.log('All existing data destroyed successfully.');


        console.log('--- SEEDING NEW DATA ---');


        const createdAdmin = await User.create(adminUser);
        console.log(`Successfully created admin user: ${createdAdmin.email}`);
        const adminId = createdAdmin._id;


        const productsWithUser = productsData.map(product => ({
            ...product,
            user: adminId
        }));

        const createdProducts = await Product.insertMany(productsWithUser);
        console.log(`Successfully created ${createdProducts.length} sample products.`);


        const firstProduct = createdProducts[0];


        const transactionQuantity = 5;
        await Transaction.create({
            product: firstProduct._id,
            transactionType: 'sale',
            quantityChange: transactionQuantity,
            unitPriceAtTransaction: firstProduct.unitPrice,
            user: adminId,
        });


        await Product.findByIdAndUpdate(firstProduct._id, {
            $inc: { countInStock: -transactionQuantity }
        });

        console.log(`Sample transaction (sale of ${transactionQuantity} units) recorded for ${firstProduct.name}.`);

        console.log('--- SEEDING COMPLETE! ---');

        process.exit(0);
    } catch (error) {
        console.error(`\nError during data seeding: ${error.message}`);
        process.exit(1);
    }
};

seedData();