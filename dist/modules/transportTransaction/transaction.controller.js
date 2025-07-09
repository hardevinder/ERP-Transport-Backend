"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayTransactions = exports.filterTransactionsByDate = exports.getCollectionSummaryCards = exports.getFeeDueDetails = exports.getFeeDue = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactions = exports.recordTransaction = void 0;
const recordTransaction = async (req, reply) => {
    const body = req.body;
    if (!body.studentId || !body.mode || !body.status || !Array.isArray(body.slabs) || body.slabs.length === 0) {
        return reply.code(400).send({ message: 'Missing required fields or empty slabs' });
    }
    const now = new Date();
    try {
        const student = await req.server.prisma.student.findUnique({
            where: { id: body.studentId },
            include: { route: true, stop: true, concession: true },
        });
        if (!student || !student.routeId || !student.stopId) {
            return reply.code(404).send({
                message: 'Student, route or stop not found',
            });
        }
        const fineSetting = await req.server.prisma.fineSetting.findFirst();
        const todayDate = new Date().getDate();
        const transactions = await req.server.prisma.$transaction(async (prisma) => {
            const latest = await prisma.transportTransaction.findFirst({
                orderBy: { slipId: 'desc' },
                where: { slipId: { not: null } },
                select: { slipId: true },
            });
            const newSlipId = latest?.slipId ? latest.slipId + 1 : 10001;
            const allTransactions = [];
            for (const slab of body.slabs) {
                const feeStructure = await prisma.transportFeeStructure.findUnique({
                    where: { id: slab.feeStructureId },
                    include: { route: true, stop: true },
                });
                if (!feeStructure ||
                    feeStructure.routeId !== student.routeId ||
                    feeStructure.stopId !== student.stopId) {
                    throw new Error(`Invalid fee structure for student`);
                }
                const dueAmount = feeStructure.amount;
                let concession = 0;
                if (slab.concession !== undefined) {
                    concession = slab.concession;
                }
                else if (student.concession) {
                    concession = student.concession.type === 'percentage'
                        ? (dueAmount * student.concession.value) / 100
                        : student.concession.value;
                }
                let fine = 0;
                if (fineSetting && todayDate >= fineSetting.applyFrom) {
                    fine = fineSetting.duration === 'per_day'
                        ? ((todayDate - fineSetting.applyFrom + 1) * fineSetting.amount)
                        : fineSetting.amount;
                }
                const fineConcession = slab.fineConcession ?? null;
                const finalFine = fineConcession !== null ? 0 : fine;
                const finalPayable = dueAmount - concession + finalFine;
                const tx = await prisma.transportTransaction.create({
                    data: {
                        slipId: newSlipId,
                        studentId: body.studentId,
                        feeStructureId: slab.feeStructureId,
                        slab: feeStructure.slab,
                        amount: slab.amount,
                        dueAmount,
                        concession,
                        fine: finalFine,
                        fineConcession,
                        mode: body.mode,
                        status: body.status,
                        transactionId: slab.transactionId ?? null,
                        paymentDate: slab.paymentDate ? new Date(slab.paymentDate) : now,
                        createdAt: now,
                        razorpayOrderId: slab.razorpayOrderId ?? null, // ✅ New
                        razorpayPaymentId: slab.razorpayPaymentId ?? null, // ✅ New
                    },
                });
                allTransactions.push({
                    ...tx,
                    summary: {
                        dueAmount,
                        concession,
                        fine,
                        fineConcession,
                        finalFine,
                        finalPayable,
                        receivedAmount: slab.amount,
                    },
                });
            }
            return { slipId: newSlipId, transactions: allTransactions };
        });
        return reply.code(201).send({
            message: 'All transactions recorded with same Slip ID',
            slipId: transactions.slipId,
            transactions: transactions.transactions,
        });
    }
    catch (error) {
        console.error(error);
        return reply.code(500).send({
            message: 'Failed to record transactions',
            error: error.message,
        });
    }
};
exports.recordTransaction = recordTransaction;
const getTransactions = async (req, reply) => {
    const query = req.query;
    const user = req.user; // ⬅️ from JWT
    console.log("REQ QUERY:", query);
    console.log("AUTH USER:", user);
    const slipId = query.slipId ? parseInt(query.slipId, 10) : undefined;
    const whereClause = {
        ...(slipId && { slipId }),
        ...(query.status && { status: query.status }),
    };
    // 🔐 If user is a student, restrict to their own transactions
    if (user?.role === 'student') {
        whereClause.studentId = user.studentId;
    }
    // 🧑‍💼 If admin is querying with studentId
    if (query.studentId && user?.role !== 'student') {
        whereClause.studentId = query.studentId;
    }
    console.log("WHERE CLAUSE:", whereClause);
    const take = query.limit ? Number(query.limit) : 50;
    const skip = query.offset ? Number(query.offset) : 0;
    try {
        const [transactions, totalCount] = await Promise.all([
            req.server.prisma.transportTransaction.findMany({
                where: whereClause,
                orderBy: { paymentDate: 'desc' },
                take,
                skip,
                include: {
                    feeStructure: true,
                    student: true,
                },
            }),
            req.server.prisma.transportTransaction.count({ where: whereClause }),
        ]);
        reply.send({ transactions, totalCount });
    }
    catch (error) {
        console.error("TRANSACTION FETCH ERROR:", error);
        reply.code(500).send({
            message: 'Failed to fetch transactions',
            error: error.message,
        });
    }
};
exports.getTransactions = getTransactions;
const getTransactionById = async (req, reply) => {
    const { id } = req.params;
    try {
        const transaction = await req.server.prisma.transportTransaction.findUnique({
            where: { id },
            include: { feeStructure: true },
        });
        if (!transaction)
            return reply.code(404).send({ message: 'Transaction not found' });
        reply.send(transaction);
    }
    catch (error) {
        reply.code(500).send({ message: 'Failed to fetch transaction', error: error.message });
    }
};
exports.getTransactionById = getTransactionById;
const updateTransaction = async (req, reply) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const existingTransaction = await req.server.prisma.transportTransaction.findUnique({
            where: { id },
            include: { feeStructure: true },
        });
        if (!existingTransaction) {
            return reply.code(404).send({ message: 'Transaction not found' });
        }
        let feeStructure = existingTransaction.feeStructure;
        const feeStructureId = body.slabs?.[0]?.feeStructureId;
        if (feeStructureId) {
            const fetched = await req.server.prisma.transportFeeStructure.findUnique({
                where: { id: feeStructureId },
            });
            if (!fetched) {
                return reply.code(404).send({ message: 'Fee structure not found' });
            }
            feeStructure = fetched;
        }
        const updated = await req.server.prisma.transportTransaction.update({
            where: { id },
            data: {
                ...body,
                slab: feeStructureId ? feeStructure?.slab : undefined,
                paymentDate: body.slabs?.[0]?.paymentDate
                    ? new Date(body.slabs[0].paymentDate)
                    : undefined,
                transactionId: body.slabs?.[0]?.transactionId ?? null,
            },
        });
        reply.send({ message: 'Transaction updated', transaction: updated });
    }
    catch (error) {
        reply.code(500).send({ message: 'Failed to update transaction', error: error.message });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.transportTransaction.delete({ where: { id } });
        reply.send({ message: 'Transaction deleted' });
    }
    catch (error) {
        reply.code(500).send({ message: 'Failed to delete transaction', error: error.message });
    }
};
exports.deleteTransaction = deleteTransaction;
// GET /fee-due/:studentId
const getFeeDue = async (req, reply) => {
    const { studentId } = req.params;
    try {
        // 1️⃣ load student + relations
        const student = await req.server.prisma.student.findUnique({
            where: { id: studentId },
            include: { route: true, stop: true, concession: true },
        });
        if (!student || !student.routeId || !student.stopId) {
            return reply.code(404).send({ message: 'Student or route not found' });
        }
        const now = new Date();
        // 2️⃣ fetch opt-outs
        const optOuts = await req.server.prisma.studentOptOutSlab.findMany({
            where: { studentId },
            select: { feeStructureId: true },
        });
        const optedOutIds = optOuts.map(o => o.feeStructureId);
        // 3️⃣ fetch the “current” slab for this student (exclude opt-outs)
        const feeStructure = await req.server.prisma.transportFeeStructure.findFirst({
            where: {
                routeId: student.routeId,
                stopId: student.stopId,
                slab: student.feeSlab,
                effectiveFrom: { lte: now },
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
                id: { notIn: optedOutIds },
            },
            orderBy: { effectiveFrom: 'desc' },
        });
        const dueAmount = feeStructure?.amount ?? 0;
        // early exit if opted-out entirely
        if (!feeStructure) {
            return reply.send({
                studentId,
                dueAmount: 0,
                concession: 0,
                fine: 0,
                paidAmount: 0,
                finalDue: 0,
            });
        }
        // 4️⃣ compute concession
        let concession = 0;
        if (student.concession) {
            concession = student.concession.type === 'percentage'
                ? (dueAmount * student.concession.value) / 100
                : student.concession.value;
        }
        // 5️⃣ compute fine
        const fineSetting = await req.server.prisma.fineSetting.findFirst();
        let fine = 0;
        if (fineSetting) {
            // assume getDueDate util from details endpoint
            const dueDate = getDueDate(feeStructure.slab, feeStructure.frequency, fineSetting);
            const related = await req.server.prisma.transportTransaction.findMany({
                where: {
                    studentId,
                    feeStructureId: feeStructure.id,
                    status: 'success',
                },
            });
            const paid = related.reduce((s, tx) => s + tx.amount, 0);
            if (dueDate && now > dueDate && paid < dueAmount) {
                const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
                fine = fineSetting.duration === 'per_day'
                    ? daysLate * fineSetting.amount
                    : fineSetting.amount;
            }
        }
        // 6️⃣ aggregate paid
        const { _sum } = await req.server.prisma.transportTransaction.aggregate({
            where: { studentId, status: 'success' },
            _sum: { amount: true },
        });
        const paidAmount = _sum.amount ?? 0;
        const finalDue = Math.max(dueAmount - concession + fine - paidAmount, 0);
        return reply.send({ studentId, dueAmount, concession, fine, paidAmount, finalDue });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Failed to fetch due', error: err.message });
    }
};
exports.getFeeDue = getFeeDue;
// GET /fee-due-details/:studentId
const getFeeDueDetails = async (req, reply) => {
    const { studentId } = req.params;
    try {
        const student = await req.server.prisma.student.findUnique({
            where: { id: studentId },
            include: { route: true, stop: true, concession: true },
        });
        if (!student || !student.routeId || !student.stopId) {
            return reply.code(404).send({ message: 'Student, route or stop not found' });
        }
        const now = new Date();
        // 1️⃣ fetch opt-outs
        const optOuts = await req.server.prisma.studentOptOutSlab.findMany({
            where: { studentId },
            select: { feeStructureId: true },
        });
        const optedOutIds = new Set(optOuts.map(o => o.feeStructureId));
        // 2️⃣ fetch all active slabs for this route/stop, excluding opted-out
        let feeStructures = await req.server.prisma.transportFeeStructure.findMany({
            where: {
                routeId: student.routeId,
                stopId: student.stopId,
                effectiveFrom: { lte: now },
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
                id: { notIn: Array.from(optedOutIds) },
            },
        });
        // if none left, return empty
        if (feeStructures.length === 0) {
            return reply.send({ studentId, slabs: [] });
        }
        // 3️⃣ sorting & transactions
        const academicOrder = { Apr: 1, May: 2, Jun: 3, Jul: 4, Aug: 5, Sep: 6, Oct: 7, Nov: 8, Dec: 9, Jan: 10, Feb: 11, Mar: 12 };
        feeStructures.sort((a, b) => academicOrder[a.slab.split(' - ')[0]] - academicOrder[b.slab.split(' - ')[0]]);
        const allTxns = await req.server.prisma.transportTransaction.findMany({
            where: { studentId, status: 'success' },
            include: { feeStructure: true },
        });
        const fineSetting = await req.server.prisma.fineSetting.findFirst();
        // 4️⃣ map into dueDetails
        const dueDetails = feeStructures.map(fs => {
            const dueAmount = fs.amount;
            const dueDate = getDueDate(fs.slab, fs.frequency, fineSetting);
            const related = allTxns.filter(tx => tx.feeStructureId === fs.id);
            const paid = related.reduce((s, tx) => s + tx.amount + (tx.concession || 0), 0);
            const latest = related.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())[0];
            let concession = 0;
            if (student.concession) {
                concession = student.concession.type === 'percentage'
                    ? dueAmount * student.concession.value / 100
                    : student.concession.value;
            }
            let fine = 0;
            if (related.length === 0 && fineSetting && dueDate && now > dueDate) {
                const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
                fine = fineSetting.duration === 'per_day' ? daysLate * fineSetting.amount : fineSetting.amount;
            }
            const finalPayable = Math.max(dueAmount + fine - paid, 0);
            return {
                slab: fs.slab,
                feeStructureId: fs.id,
                dueAmount,
                concession,
                fine,
                finalPayable,
                status: finalPayable <= 0 ? 'Paid' : 'Due',
                paidAmount: paid,
                paymentDate: latest?.paymentDate || null,
                dueDate,
                slipId: latest?.slipId || null, // ✅ Add this line
            };
        });
        return reply.send({ studentId, slabs: dueDetails });
    }
    catch (err) {
        req.log.error(err);
        return reply.code(500).send({ message: 'Failed to fetch details', error: err.message });
    }
};
exports.getFeeDueDetails = getFeeDueDetails;
/** Helper to compute first-of-month dueDate */
function getDueDate(slab, frequency, fineSetting) {
    const today = new Date(), year = today.getFullYear();
    const monthMap = { Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11, Jan: 0, Feb: 1, Mar: 2 };
    const parts = slab.split(' - ')[0], m = monthMap[parts];
    const dueMonthYear = m >= 3 ? year : year + 1;
    return fineSetting
        ? new Date(dueMonthYear, m, fineSetting.applyFrom)
        : null;
}
const getCollectionSummaryCards = async (req, reply) => {
    try {
        const { startDate, endDate } = req.query;
        const filters = {
            status: 'success',
        };
        if (startDate || endDate) {
            filters.paymentDate = {};
            if (startDate)
                filters.paymentDate.gte = new Date(startDate);
            if (endDate)
                filters.paymentDate.lte = new Date(endDate);
        }
        // 1️⃣ Group by feeStructureId, slab, and mode
        const grouped = await req.server.prisma.transportTransaction.groupBy({
            by: ['feeStructureId', 'slab', 'mode'],
            where: filters,
            _sum: {
                amount: true,
            },
        });
        if (!grouped || grouped.length === 0) {
            return reply.send({
                status: 200,
                message: 'No transactions found in the given range',
                data: [],
            });
        }
        // 2️⃣ Get FeeStructures with route info
        const feeStructureIds = [...new Set(grouped.map(g => g.feeStructureId))];
        const feeStructures = await req.server.prisma.transportFeeStructure.findMany({
            where: { id: { in: feeStructureIds } },
            include: { route: true },
        });
        // 3️⃣ Create a map for fast lookup
        const feeStructureMap = new Map();
        feeStructures.forEach(fs => {
            feeStructureMap.set(fs.id, fs);
        });
        // 4️⃣ Prepare route-wise summary
        const resultMap = new Map();
        for (const entry of grouped) {
            const structure = feeStructureMap.get(entry.feeStructureId);
            if (!structure || !structure.route)
                continue;
            const { slab, mode } = entry;
            const totalAmount = entry._sum.amount || 0;
            const routeId = structure.route.id;
            const routeName = structure.route.name;
            if (!resultMap.has(routeId)) {
                resultMap.set(routeId, {
                    routeId,
                    routeName,
                    slabs: [],
                });
            }
            const routeEntry = resultMap.get(routeId);
            let slabEntry = routeEntry.slabs.find(s => s.slab === slab);
            if (!slabEntry) {
                slabEntry = { slab, totalAmount: 0, modes: [] };
                routeEntry.slabs.push(slabEntry);
            }
            // Update slab total and mode
            slabEntry.totalAmount += totalAmount;
            const existingMode = slabEntry.modes.find(m => m.mode === mode);
            if (existingMode) {
                existingMode.amount += totalAmount;
            }
            else {
                slabEntry.modes.push({ mode, amount: totalAmount });
            }
        }
        const summary = Array.from(resultMap.values());
        return reply.send({
            status: 200,
            message: 'Collection summary cards',
            data: summary,
        });
    }
    catch (err) {
        console.error("COLLECTION SUMMARY ERROR:", err);
        return reply.code(500).send({
            message: 'Failed to fetch summary',
            error: err.message,
        });
    }
};
exports.getCollectionSummaryCards = getCollectionSummaryCards;
const filterTransactionsByDate = async (req, reply) => {
    const { startDate, endDate } = req.query;
    if (!startDate && !endDate) {
        return reply.code(400).send({ message: 'Please provide startDate or endDate' });
    }
    try {
        const filters = { status: 'success' };
        if (startDate || endDate) {
            filters.paymentDate = {};
            if (startDate)
                filters.paymentDate.gte = new Date(startDate);
            if (endDate)
                filters.paymentDate.lte = new Date(endDate);
        }
        const transactions = await req.server.prisma.transportTransaction.findMany({
            where: filters,
            orderBy: { paymentDate: 'desc' },
            include: {
                student: true,
                feeStructure: true,
            },
        });
        const totalCollection = transactions.reduce((sum, txn) => {
            return sum + (txn.amount || 0) + (txn.fine || 0); // ✅ fixed
        }, 0);
        return reply.send({
            status: 200,
            message: 'Filtered transactions fetched successfully',
            transactions,
            totalCollection,
        });
    }
    catch (err) {
        console.error("FILTER DATE TRANSACTION ERROR:", err);
        return reply.code(500).send({
            message: 'Failed to fetch filtered transactions',
            error: err.message,
        });
    }
};
exports.filterTransactionsByDate = filterTransactionsByDate;
const getTodayTransactions = async (req, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    try {
        const transactions = await req.server.prisma.transportTransaction.findMany({
            where: {
                paymentDate: {
                    gte: today,
                    lt: tomorrow,
                },
                status: 'success',
            },
            orderBy: { paymentDate: 'desc' },
            include: {
                student: true,
                feeStructure: true,
            },
        });
        const totalCollection = transactions.reduce((sum, txn) => {
            return sum + (txn.amount || 0) + (txn.fine || 0); // ✅ fixed
        }, 0);
        return reply.send({ transactions, totalCollection });
    }
    catch (error) {
        return reply.code(500).send({ message: 'Error fetching today’s transactions', error: error.message });
    }
};
exports.getTodayTransactions = getTodayTransactions;
