const express = require('express');
const {
    recordTransaction,
    getTransactions
} = require('../controllers/transactionController');

const router = express.Router();

router.route('/')
    .post(recordTransaction)
    .get(getTransactions);

module.exports = router;
