"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlabs = void 0;
const generateSlabs = (frequency, academicYearStart = new Date().getFullYear()) => {
    const slabs = [];
    const today = new Date();
    // If today is Jan–March, then academicYearStart should be last year
    if (today.getMonth() <= 2) {
        academicYearStart -= 1;
    }
    const academicStart = new Date(academicYearStart, 3, 1); // April 1
    const academicEnd = new Date(academicYearStart + 1, 2, 31); // March 31 next year
    let slabDate = new Date(academicStart);
    while (slabDate <= today) {
        if (frequency === 'monthly') {
            const monthName = slabDate.toLocaleString('default', { month: 'long' });
            slabs.push(`${monthName} ${slabDate.getFullYear()}`);
            slabDate.setMonth(slabDate.getMonth() + 1);
        }
        else if (frequency === 'quarterly') {
            const month = slabDate.getMonth();
            let quarter = '';
            if (month >= 3 && month <= 5)
                quarter = 'Q1';
            else if (month >= 6 && month <= 8)
                quarter = 'Q2';
            else if (month >= 9 && month <= 11)
                quarter = 'Q3';
            else
                quarter = 'Q4';
            const year = quarter === 'Q4' ? slabDate.getFullYear() + 1 : slabDate.getFullYear();
            const label = `${quarter} ${year}`;
            if (!slabs.includes(label))
                slabs.push(label);
            slabDate.setMonth(slabDate.getMonth() + 3);
        }
        else if (frequency === 'half-yearly') {
            const half = slabDate.getMonth() < 9 ? 'H1' : 'H2';
            const year = slabDate.getFullYear();
            const label = `${half} ${year}`;
            if (!slabs.includes(label))
                slabs.push(label);
            slabDate.setMonth(slabDate.getMonth() + 6);
        }
        else {
            break;
        }
    }
    return slabs;
};
exports.generateSlabs = generateSlabs;
