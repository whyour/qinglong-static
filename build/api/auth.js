"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const fs = __importStar(require("fs"));
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("../config/util");
const route = express_1.Router();
exports.default = (app) => {
    app.use('/', route);
    route.post('/login', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let username = req.body.username;
            let password = req.body.password;
            fs.readFile(config_1.default.authConfigFile, 'utf8', function (err, data) {
                if (err)
                    console.log(err);
                const authInfo = JSON.parse(data);
                if (username && password) {
                    if (authInfo.username === 'admin' &&
                        authInfo.password === 'adminadmin') {
                        const newPassword = util_1.createRandomString(16, 22);
                        fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify({
                            username: authInfo.username,
                            password: newPassword,
                        }));
                        return res.send({
                            code: 100,
                            msg: '已初始化密码，请前往auth.json查看并重新登录',
                        });
                    }
                    if (username == authInfo.username &&
                        password == authInfo.password) {
                        const data = util_1.createRandomString(50, 100);
                        let token = jsonwebtoken_1.default.sign({ data }, config_1.default.secret, {
                            expiresIn: 60 * 60 * 24 * 3,
                            algorithm: 'HS384',
                        });
                        fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify({
                            username: authInfo.username,
                            password: authInfo.password,
                            token,
                        }));
                        res.send({ code: 200, token });
                    }
                    else {
                        res.send({ code: 400, msg: config_1.default.authError });
                    }
                }
                else {
                    res.send({ err: 400, msg: '请输入用户名密码!' });
                }
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/logout', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            fs.readFile(config_1.default.authConfigFile, 'utf8', function (err, data) {
                if (err)
                    console.log(err);
                const authInfo = JSON.parse(data);
                fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify({
                    username: authInfo.username,
                    password: authInfo.password,
                }));
                res.send({ code: 200 });
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/user', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            fs.writeFile(config_1.default.authConfigFile, JSON.stringify(req.body), (err) => {
                if (err)
                    console.log(err);
                res.send({ code: 200, msg: '更新成功' });
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/user', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            fs.readFile(config_1.default.authConfigFile, 'utf8', (err, data) => {
                if (err)
                    console.log(err);
                const authInfo = JSON.parse(data);
                res.send({ code: 200, data: { username: authInfo.username } });
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=auth.js.map