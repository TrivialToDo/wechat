"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016-now Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
require("dotenv/config.js");
var wechaty_1 = require("wechaty");
var qrcode_terminal_1 = require("qrcode-terminal");
function onScan(qrcode, status) {
    if (status === wechaty_1.ScanStatus.Waiting || status === wechaty_1.ScanStatus.Timeout) {
        qrcode_terminal_1.default.generate(qrcode, { small: true }); // show qrcode on console
        var qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('');
        wechaty_1.log.info('StarterBot', 'onScan: %s(%s) - %s', wechaty_1.ScanStatus[status], status, qrcodeImageUrl);
    }
    else {
        wechaty_1.log.info('StarterBot', 'onScan: %s(%s)', wechaty_1.ScanStatus[status], status);
    }
}
function onLogin(user) {
    wechaty_1.log.info('StarterBot', '%s login', user);
}
function onLogout(user) {
    wechaty_1.log.info('StarterBot', '%s logout', user);
}
function onMessage(msg) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wechaty_1.log.info('StarterBot', msg.toString());
                    if (!(msg.text() === 'ding')) return [3 /*break*/, 2];
                    return [4 /*yield*/, msg.say('dong')];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
var bot = wechaty_1.WechatyBuilder.build({
    name: 'ding-dong-bot',
    /**
     * How to set Wechaty Puppet Provider:
     *
     *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-padlocal' }`, see below)
     *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-padlocal`)
     *
     * You can use the following providers:
     *  - wechaty-puppet-wechat (no token required)
     *  - wechaty-puppet-padlocal (token required)
     *  - wechaty-puppet-service (token required, see: <https://wechaty.js.org/docs/puppet-services>)
     *  - etc. see: <https://github.com/wechaty/wechaty-puppet/wiki/Directory>
     */
    // puppet: 'wechaty-puppet-wechat',
});
bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);
bot.start()
    .then(function () { return wechaty_1.log.info('StarterBot', 'Starter Bot Started.'); })
    .catch(function (e) { return wechaty_1.log.error('StarterBot', e); });
