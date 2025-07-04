"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeeStructure = exports.updateFeeStructure = exports.getFeeStructures = exports.createFeeStructure = void 0;
var Frequency;
(function (Frequency) {
    Frequency["MONTHLY"] = "monthly";
    Frequency["QUARTERLY"] = "quarterly";
    Frequency["YEARLY"] = "yearly";
    Frequency["CUSTOM"] = "custom";
})(Frequency || (Frequency = {}));
const createFeeStructure = async (req, reply) => {
    const body = req.body;
    if (!Object.values(Frequency).includes(body.frequency)) {
        return reply.code(400).send({ message: 'Invalid frequency value' });
    }
    if (!body.installments || body.installments.length === 0) {
        return reply.code(400).send({ message: 'At least one installment is required' });
    }
    try {
        const createdStructures = [];
        for (const installment of body.installments) {
            const record = await req.server.prisma.transportFeeStructure.create({
                data: {
                    routeId: body.routeId,
                    stopId: body.stopId || null,
                    slab: `${body.slab} - ${installment}`,
                    amount: body.amount,
                    frequency: body.frequency,
                    effectiveFrom: new Date(body.effectiveFrom),
                    effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
                    createdAt: new Date(),
                },
            });
            createdStructures.push(record);
        }
        reply.code(201).send({ message: 'Fee structure created', data: createdStructures });
    }
    catch (error) {
        reply.code(500).send({ message: 'Failed to create fee structure', error: error.message });
    }
};
exports.createFeeStructure = createFeeStructure;
const getFeeStructures = async (req, reply) => {
    const feeStructures = await req.server.prisma.transportFeeStructure.findMany({
        orderBy: { effectiveFrom: 'desc' },
    });
    reply.send(feeStructures);
};
exports.getFeeStructures = getFeeStructures;
const updateFeeStructure = async (req, reply) => {
    const { id } = req.params;
    const body = req.body;
    if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
        return reply.code(400).send({ message: 'Invalid frequency value' });
    }
    try {
        const updated = await req.server.prisma.transportFeeStructure.update({
            where: { id },
            data: {
                routeId: body.routeId,
                stopId: body.stopId || null,
                slab: body.slab,
                amount: body.amount,
                frequency: body.frequency,
                effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
                effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
            },
        });
        reply.send({ message: 'Fee structure updated', data: updated });
    }
    catch {
        reply.code(404).send({ message: 'Fee structure not found' });
    }
};
exports.updateFeeStructure = updateFeeStructure;
const deleteFeeStructure = async (req, reply) => {
    const { id } = req.params;
    try {
        await req.server.prisma.transportFeeStructure.delete({ where: { id } });
        reply.send({ message: 'Fee structure deleted' });
    }
    catch {
        reply.code(404).send({ message: 'Fee structure not found' });
    }
};
exports.deleteFeeStructure = deleteFeeStructure;
