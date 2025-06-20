// src/modules/transportTransaction/transaction.routes.ts
import { FastifyPluginAsync } from 'fastify';
import {
  recordTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFeeDue,
} from './transaction.controller';

const transactionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', recordTransaction);              // ✅ Create transaction
  fastify.get('/', getTransactions);                 // ✅ Get all transactions (with filters)
  fastify.get('/:id', getTransactionById);           // ✅ Get transaction by ID
  fastify.put('/:id', updateTransaction);            // ✅ Update a transaction
  fastify.delete('/:id', deleteTransaction);         // ✅ Delete a transaction
  fastify.get('/fee-due/:studentId', getFeeDue);     // ✅ Calculate Fee Due
};

export default transactionRoutes;
