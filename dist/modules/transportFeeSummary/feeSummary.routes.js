"use strict";
// src/modules/transportFeeSummary/feeSummary.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const feeSummary_controller_1 = require("./feeSummary.controller");
const feeSummaryRoutes = async (fastify) => {
    fastify.get('/', {
        preHandler: [fastify.authenticate], // ✅ Protected route
    }, feeSummary_controller_1.getFeeSummaries);
};
exports.default = feeSummaryRoutes;
