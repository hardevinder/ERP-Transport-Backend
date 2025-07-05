"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_controller_1 = require("./transaction.controller");
const transactionRoutes = async (fastify) => {
    // ✅ Special route FIRST
    fastify.get('/collection-summary-cards', transaction_controller_1.getCollectionSummaryCards);
    // ✅ Fee calculation routes
    fastify.get('/fee-due/:studentId', transaction_controller_1.getFeeDue);
    fastify.get('/fee-due-details/:studentId', transaction_controller_1.getFeeDueDetails);
    // ✅ Core CRUD routes
    fastify.post('/', transaction_controller_1.recordTransaction);
    fastify.get('/', transaction_controller_1.getTransactions);
    // ⚠️ Keep dynamic ID route at the end!
    fastify.get('/:id', transaction_controller_1.getTransactionById);
    fastify.put('/:id', transaction_controller_1.updateTransaction);
    fastify.delete('/:id', transaction_controller_1.deleteTransaction);
};
exports.default = transactionRoutes;
