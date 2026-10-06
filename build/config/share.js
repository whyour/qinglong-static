"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRandomString = void 0;
const crypto_1 = require("crypto");
function createRandomString(min, max) {
    const num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const english = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
    ];
    const ENGLISH = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
    ];
    const special = ['-', '_'];
    const config = num.concat(english).concat(ENGLISH).concat(special);
    const arr = [];
    arr.push(getOne(num));
    arr.push(getOne(english));
    arr.push(getOne(ENGLISH));
    arr.push(getOne(special));
    const len = min + (0, crypto_1.randomInt)(max - min + 1);
    for (let i = 4; i < len; i++) {
        arr.push(config[(0, crypto_1.randomInt)(config.length)]);
    }
    const newArr = [];
    for (let j = 0; j < len; j++) {
        newArr.push(arr.splice((0, crypto_1.randomInt)(arr.length), 1)[0]);
    }
    function getOne(arr) {
        return arr[(0, crypto_1.randomInt)(arr.length)];
    }
    return newArr.join('');
}
exports.createRandomString = createRandomString;
//# sourceMappingURL=share.js.map