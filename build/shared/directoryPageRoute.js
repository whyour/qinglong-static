"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directoryPageHandler = exports.directoryCheckHandler = void 0;
const celebrate_1 = require("celebrate");
const directoryPage_1 = require("./directoryPage");
function directoryCheckHandler(root, blacklist) {
    return [
        (0, celebrate_1.celebrate)({ body: celebrate_1.Joi.array().items(celebrate_1.Joi.array().ordered(celebrate_1.Joi.string().allow('').max(4096).required(), celebrate_1.Joi.string().max(128).allow(null).required()).length(2)).min(1).max(128).required() }),
        async (req, res, next) => {
            try {
                const current = await (0, directoryPage_1.checkDirectoryVersions)(root(), blacklist, req.body);
                res.send({ code: 200, current });
            }
            catch (error) {
                next(error);
            }
        },
    ];
}
exports.directoryCheckHandler = directoryCheckHandler;
function directoryPageHandler(root, blacklist, newestFirst) {
    return [
        (0, celebrate_1.celebrate)({ query: celebrate_1.Joi.object({
                path: celebrate_1.Joi.string().allow(''), after: celebrate_1.Joi.string().allow(''), search: celebrate_1.Joi.string().allow(''),
                folders: celebrate_1.Joi.boolean(), t: celebrate_1.Joi.string(),
            }) }),
        async (req, res, next) => {
            try {
                const { path = '', after = '', search = '', folders } = req.query;
                const page = await (0, directoryPage_1.readDirectoryPage)(root(), blacklist, String(path), String(after), String(search), String(folders) === 'true', newestFirst);
                res.send(Object.assign({ code: 200 }, page));
            }
            catch (error) {
                next(error);
            }
        },
    ];
}
exports.directoryPageHandler = directoryPageHandler;
//# sourceMappingURL=directoryPageRoute.js.map