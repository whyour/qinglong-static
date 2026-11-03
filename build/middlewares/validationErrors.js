"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const celebrate_1 = require("celebrate");
const i18n_1 = require("../shared/i18n");
const respond = (0, celebrate_1.errors)();
// Schemas are compiled once at startup; resolve their messages per request so
// changing the system language also changes errors from those existing schemas.
const validationErrors = (error, req, res, next) => {
    if ((0, celebrate_1.isCelebrateError)(error)) {
        for (const detail of error.details.values()) {
            detail.message = detail.details.map((item) => (0, i18n_1.t)(item.message)).join('. ');
        }
    }
    return respond(error, req, res, next);
};
exports.default = validationErrors;
//# sourceMappingURL=validationErrors.js.map