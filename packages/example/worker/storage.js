"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("@zetapush/platform");
let Storage = class Storage {
    constructor(stack) {
        this.stack = stack;
    }
    push(item) {
        return this.stack.push({ stack: 'demo', data: item, owner: null });
    }
    list() {
        return this.stack.list({ stack: 'demo', owner: null, page: null });
    }
};
Storage = __decorate([
    platform_1.Injectable(),
    __metadata("design:paramtypes", [platform_1.Stack])
], Storage);
exports.Storage = Storage;
