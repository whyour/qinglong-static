"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronServiceClient = exports.CronServiceService = exports.DeleteCronResponse = exports.DeleteCronRequest = exports.AddCronResponse = exports.AddCronRequest = exports.Cron = exports.protobufPackage = void 0;
/* eslint-disable */
const grpc_js_1 = require("@grpc/grpc-js");
const minimal_1 = __importDefault(require("protobufjs/minimal"));
exports.protobufPackage = 'com.ql.cron';
function createBaseCron() {
    return { id: '', schedule: '', command: '' };
}
exports.Cron = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.schedule !== '') {
            writer.uint32(18).string(message.schedule);
        }
        if (message.command !== '') {
            writer.uint32(26).string(message.command);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCron();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag != 10) {
                        break;
                    }
                    message.id = reader.string();
                    continue;
                case 2:
                    if (tag != 18) {
                        break;
                    }
                    message.schedule = reader.string();
                    continue;
                case 3:
                    if (tag != 26) {
                        break;
                    }
                    message.command = reader.string();
                    continue;
            }
            if ((tag & 7) == 4 || tag == 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(object) {
        return {
            id: isSet(object.id) ? String(object.id) : '',
            schedule: isSet(object.schedule) ? String(object.schedule) : '',
            command: isSet(object.command) ? String(object.command) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.schedule !== undefined && (obj.schedule = message.schedule);
        message.command !== undefined && (obj.command = message.command);
        return obj;
    },
    create(base) {
        return exports.Cron.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseCron();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : '';
        message.schedule = (_b = object.schedule) !== null && _b !== void 0 ? _b : '';
        message.command = (_c = object.command) !== null && _c !== void 0 ? _c : '';
        return message;
    },
};
function createBaseAddCronRequest() {
    return { crons: [] };
}
exports.AddCronRequest = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.crons) {
            exports.Cron.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddCronRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag != 10) {
                        break;
                    }
                    message.crons.push(exports.Cron.decode(reader, reader.uint32()));
                    continue;
            }
            if ((tag & 7) == 4 || tag == 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(object) {
        return {
            crons: Array.isArray(object === null || object === void 0 ? void 0 : object.crons)
                ? object.crons.map((e) => exports.Cron.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.crons) {
            obj.crons = message.crons.map((e) => (e ? exports.Cron.toJSON(e) : undefined));
        }
        else {
            obj.crons = [];
        }
        return obj;
    },
    create(base) {
        return exports.AddCronRequest.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseAddCronRequest();
        message.crons = ((_a = object.crons) === null || _a === void 0 ? void 0 : _a.map((e) => exports.Cron.fromPartial(e))) || [];
        return message;
    },
};
function createBaseAddCronResponse() {
    return {};
}
exports.AddCronResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddCronResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
            }
            if ((tag & 7) == 4 || tag == 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    create(base) {
        return exports.AddCronResponse.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(_) {
        const message = createBaseAddCronResponse();
        return message;
    },
};
function createBaseDeleteCronRequest() {
    return { ids: [] };
}
exports.DeleteCronRequest = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.ids) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeleteCronRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if (tag != 10) {
                        break;
                    }
                    message.ids.push(reader.string());
                    continue;
            }
            if ((tag & 7) == 4 || tag == 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(object) {
        return {
            ids: Array.isArray(object === null || object === void 0 ? void 0 : object.ids)
                ? object.ids.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.ids) {
            obj.ids = message.ids.map((e) => e);
        }
        else {
            obj.ids = [];
        }
        return obj;
    },
    create(base) {
        return exports.DeleteCronRequest.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseDeleteCronRequest();
        message.ids = ((_a = object.ids) === null || _a === void 0 ? void 0 : _a.map((e) => e)) || [];
        return message;
    },
};
function createBaseDeleteCronResponse() {
    return {};
}
exports.DeleteCronResponse = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : minimal_1.default.Reader.create(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeleteCronResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
            }
            if ((tag & 7) == 4 || tag == 0) {
                break;
            }
            reader.skipType(tag & 7);
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    create(base) {
        return exports.DeleteCronResponse.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(_) {
        const message = createBaseDeleteCronResponse();
        return message;
    },
};
exports.CronServiceService = {
    addCron: {
        path: '/com.ql.cron.CronService/addCron',
        requestStream: false,
        responseStream: false,
        requestSerialize: (value) => Buffer.from(exports.AddCronRequest.encode(value).finish()),
        requestDeserialize: (value) => exports.AddCronRequest.decode(value),
        responseSerialize: (value) => Buffer.from(exports.AddCronResponse.encode(value).finish()),
        responseDeserialize: (value) => exports.AddCronResponse.decode(value),
    },
    delCron: {
        path: '/com.ql.cron.CronService/delCron',
        requestStream: false,
        responseStream: false,
        requestSerialize: (value) => Buffer.from(exports.DeleteCronRequest.encode(value).finish()),
        requestDeserialize: (value) => exports.DeleteCronRequest.decode(value),
        responseSerialize: (value) => Buffer.from(exports.DeleteCronResponse.encode(value).finish()),
        responseDeserialize: (value) => exports.DeleteCronResponse.decode(value),
    },
};
exports.CronServiceClient = (0, grpc_js_1.makeGenericClientConstructor)(exports.CronServiceService, 'com.ql.cron.CronService');
function isSet(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=cron.js.map