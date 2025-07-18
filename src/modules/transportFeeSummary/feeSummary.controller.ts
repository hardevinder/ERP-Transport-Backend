import { FastifyRequest, FastifyReply } from 'fastify';
import dayjs from 'dayjs';

export const getFeeSummaries = async (req: FastifyRequest, reply: FastifyReply) => {
  const prisma = req.server.prisma;
  const now = dayjs();
  const currentMonth = now.format('MMMM');
  const currentMonthLabel = now.format('YYYY-MM');
  const currentQuarter = Math.floor(now.month() / 3) + 1;
  const currentQuarterLabel = `Quarter-${currentQuarter}`;
  const isoNow = now.toISOString();
  const monthStart = now.startOf('month').toDate();
  const monthEnd = now.endOf('month').toDate();

  const fineSetting = await prisma.fineSetting.findFirst();

  const students = await prisma.student.findMany({
    where: { status: 'active' },
    include: {
      route: true,
      stop: true,
      class: true,
      concession: true,
      vehicle: true, // ✅ ADD THIS LINE

    },
    orderBy: { name: 'asc' },
  });

  const summaries = await Promise.all(
    students.map(async (student) => {
      const feeStructures = await prisma.transportFeeStructure.findMany({
        where: {
          routeId: student.routeId || undefined,
          stopId: student.stopId || undefined,
          effectiveFrom: { lte: isoNow },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: isoNow } }],
        },
      });

      let expectedAmount = 0;
      let slabType: 'monthly' | 'quarterly' | null = null;
      let slabStartDate: dayjs.Dayjs | null = null;

      for (const fee of feeStructures) {
        const slab = fee.slab || '';
        if (fee.frequency === 'monthly' && slab.includes(currentMonth)) {
          expectedAmount += fee.amount;
          slabType = 'monthly';
          slabStartDate = now.startOf('month');
        } else if (fee.frequency === 'quarterly' && slab.includes(currentQuarterLabel)) {
          expectedAmount += fee.amount;
          slabType = 'quarterly';
          const quarterStartMonth = (currentQuarter - 1) * 3;
          slabStartDate = dayjs().month(quarterStartMonth).startOf('month');
        }
      }

      let concession = 0;
      if (student.concession) {
        concession =
          student.concession.type === 'percentage'
            ? (expectedAmount * student.concession.value) / 100
            : student.concession.value;
      }

      let fine = 0;
      if (expectedAmount > 0 && fineSetting && slabStartDate) {
        const fineApplyDate = slabStartDate.add(fineSetting.applyFrom - 1, 'day');
        const today = now;
        if (today.isAfter(fineApplyDate, 'day')) {
          const daysLate = today.diff(fineApplyDate, 'day') + 1;
          fine =
            fineSetting.duration === 'per_day'
              ? daysLate * fineSetting.amount
              : fineSetting.amount;
        }
      }

      const paid = await prisma.transportTransaction.aggregate({
        _sum: { amount: true },
        where: {
          studentId: student.id,
          status: 'success',
          paymentDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const paidAmount = paid._sum.amount || 0;
      const finalPayable = expectedAmount - concession + fine;
      const pendingAmount = Math.max(finalPayable - paidAmount, 0);

      return {
        studentId: student.id,
        name: student.name,
        class: student.class?.name || '',
        route: student.route?.name || '',
        stop: student.stop?.stopName || '',
        vehicle: student.vehicle?.busNo || '', // ✅ ADD THIS LINE
        expectedAmount,
        concession,
        fine,
        paidAmount,
        pendingAmount,
      };
    })
  );

  reply.send({ currentMonth: currentMonthLabel, summaries });
};

export const getStudentsByVehicle = async (req: FastifyRequest, reply: FastifyReply) => {
  const prisma = req.server.prisma;
  const { vehicleId } = req.params as { vehicleId: string };
  const now = dayjs();
  const isoNow = now.toISOString();

  try {
    const students = await prisma.student.findMany({
      where: {
        status: 'active',
        vehicleId,
      },
      include: {
        class: true,
        route: true,
        stop: true,
        concession: true,
      },
    });

    const result = await Promise.all(
      students.map(async (student) => {
        const feeStructures = await prisma.transportFeeStructure.findMany({
          where: {
            routeId: student.routeId || undefined,
            stopId: student.stopId || undefined,
            effectiveFrom: { lte: isoNow },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: isoNow } }],
          },
        });

        const expectedAmount = feeStructures.reduce((sum, fs) => sum + fs.amount, 0);

        let concession = 0;
        if (student.concession) {
          concession =
            student.concession.type === 'percentage'
              ? (expectedAmount * student.concession.value) / 100
              : student.concession.value;
        }

        const paid = await prisma.transportTransaction.aggregate({
          _sum: { amount: true },
          where: {
            studentId: student.id,
            status: 'success',
          },
        });

        const paidAmount = paid._sum.amount || 0;
        const finalPayable = expectedAmount - concession;
        const pendingAmount = Math.max(finalPayable - paidAmount, 0);

        return {
          studentId: student.id,
          name: student.name,
          phone: student.phone,
          class: student.class?.name || '',
          route: student.route?.name || '',
          stop: student.stop?.stopName || '',
          expectedAmount,
          concession,
          paidAmount,
          pendingAmount,
        };
      })
    );

    return reply.send({ vehicleId, totalStudents: result.length, students: result });
  } catch (err) {
    console.error('🚨 Vehicle fee summary error:', err);
    return reply.code(500).send({ message: 'Failed to fetch student summaries' });
  }
};
