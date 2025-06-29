"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_controller_1 = require("./transaction.controller");
const transactionRoutes = async (fastify) => {
    fastify.get('/fee-due/:studentId', transaction_controller_1.getFeeDue); // ✅ Calculate Fee Due
    fastify.get('/fee-due-details/:studentId', transaction_controller_1.getFeeDueDetails); // ✅ Get Fee Due Details
    fastify.post('/', transaction_controller_1.recordTransaction); // ✅ Create transaction
    fastify.get('/', transaction_controller_1.getTransactions); // ✅ Get all transactions (with filters)
    fastify.get('/:id', transaction_controller_1.getTransactionById); // ✅ Get transaction by ID
    fastify.put('/:id', transaction_controller_1.updateTransaction); // ✅ Update a transaction
    fastify.delete('/:id', transaction_controller_1.deleteTransaction); // ✅ Delete a transaction
};
exports.default = transactionRoutes;
