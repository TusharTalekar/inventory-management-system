const express = require('express');
const router = express.Router();

// Placeholder route to satisfy folder structure. 
// Actual inventory level updates are handled in productController and transactionController.
router.get('/', (req, res) => {
    res.send({ message: 'Inventory routes placeholder. See /api/products for stock levels.' });
});

module.exports = router;
