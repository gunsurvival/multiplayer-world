var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Schema, type } from '@colyseus/schema';
import uniqid from 'uniqid';
export class EventData {
    id = uniqid();
    name = '';
    args = [];
    constructor(data) {
        this.assign(data);
    }
    assign(data) {
        Object.assign(this, data);
        return this;
    }
}
export class EventSchema extends Schema {
    id = '';
    class = '';
    name = 'UnknownEvent';
    args = '[]';
}
__decorate([
    type('string'),
    __metadata("design:type", Object)
], EventSchema.prototype, "id", void 0);
__decorate([
    type('string'),
    __metadata("design:type", Object)
], EventSchema.prototype, "class", void 0);
__decorate([
    type('string'),
    __metadata("design:type", Object)
], EventSchema.prototype, "name", void 0);
__decorate([
    type('string'),
    __metadata("design:type", Object)
], EventSchema.prototype, "args", void 0);
//# sourceMappingURL=EventData.js.map