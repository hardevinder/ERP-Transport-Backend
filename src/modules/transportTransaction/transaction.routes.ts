import { FastifyPluginAsync } from 'fastify';
import {
  recordTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFeeDue,
  getFeeDueDetails,
  getCollectionSummaryCards,
  filterTransactionsByDate,
  getTodayTransactions
} from './transaction.controller';

const transactionRoutes: FastifyPluginAsync = async (fastify) => {
  // ✅ Special route FIRST
  fastify.get('/collection-summary-cards', getCollectionSummaryCards);

  // ✅ Fee calculation routes
  fastify.get('/fee-due/:studentId', getFeeDue);
  fastify.get('/fee-due-details/:studentId', getFeeDueDetails);

  // ✅ Core CRUD routes
  fastify.post('/', recordTransaction);
  fastify.get('/', getTransactions);

    // ✅ New: Filter by start & end date
  fastify.get('/filter-by-date', filterTransactionsByDate); // ✅ Add this
  fastify.get('/today', getTodayTransactions);


  // ⚠️ Keep dynamic ID route at the end!
  fastify.get('/:id', getTransactionById);
  fastify.put('/:id', updateTransaction);
  fastify.delete('/:id', deleteTransaction);
};

export default transactionRoutes;
