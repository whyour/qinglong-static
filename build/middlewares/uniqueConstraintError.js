"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const i18n_1 = require("../shared/i18n");
// Handle the database constraint itself so concurrent writes are covered too.
const uniqueConstraintError = (err, req, res, next) => {
    if (!(err instanceof sequelize_1.UniqueConstraintError))
        return next(err);
    // Constraint details can contain environment values or application credentials.
    res
        .status(409)
        .json({ code: 409, message: (0, i18n_1.t)('资源已存在，请检查重复的名称或值') });
};
exports.default = uniqueConstraintError;
//# sourceMappingURL=uniqueConstraintError.js.map