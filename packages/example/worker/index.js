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
const calendar_1 = require("./calendar");
const storage_1 = require("./storage");
let Api = class Api {
    constructor(storage, calendar) {
        this.storage = storage;
        this.calendar = calendar;
    }
    add(item) {
        return this.storage.push(item);
    }
    list() {
        return this.storage.list();
    }
    hello() {
        return `Hello World from TypeScript ${this.calendar.getNow()} Updated`;
    }
    reduce(list) {
        return list.reduce((cumulator, value) => cumulator + value, 0);
    }
};
Api = __decorate([
    platform_1.Injectable(),
    __metadata("design:paramtypes", [storage_1.Storage, calendar_1.Calendar])
], Api);
exports.default = Api;
