import { loadFont } from './tfm/index';
class Position {
    constructor(properties) {
        this.h = 0;
        this.v = 0;
        this.w = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        if (properties) {
            this.h = properties.h;
            this.v = properties.v;
            this.w = properties.w;
            this.x = properties.x;
            this.y = properties.y;
            this.z = properties.z;
        }
        else {
            this.h = this.v = this.w = this.x = this.y = this.z = 0;
        }
    }
}
export class DviFont {
    constructor(properties) {
        this.checksum = 0;
        this.scaleFactor = 0;
        this.designSize = 0;
        this.name = properties.name;
        this.checksum = properties.checksum;
        this.scaleFactor = properties.scaleFactor;
        this.designSize = properties.designSize;
    }
}
export class Machine {
    constructor() {
        this.fonts = [];
        this.stack = [];
        this.position = new Position();
        this.title = '';
        this.savedPosition = new Position();
    }
    preamble(numerator, denominator, magnification, comment) {
    }
    pushColor(c) {
    }
    popColor() {
    }
    setXimeraRule(r) {
    }
    setXimeraRuleOpen(r) {
    }
    setXimeraRuleClose() {
    }
    pushXimera(e) {
    }
    popXimera() {
    }
    setPapersize(width, height) {
    }
    push() {
        this.stack.push(new Position(this.position));
    }
    pop() {
        const result = this.stack.pop();
        if (result)
            this.position = result;
        else
            throw new Error('Popped from empty position stack');
    }
    beginPage(page) {
        this.stack = [];
        this.position = new Position();
    }
    endPage() { }
    post(p) { }
    postPost(p) { }
    putRule(rule) {
    }
    moveRight(distance) {
        this.position.h += distance;
    }
    moveDown(distance) {
        this.position.v += distance;
    }
    setFont(font) {
        this.font = font;
    }
    beginSVG() {
    }
    endSVG() {
    }
    putSVG(svg) {
    }
    putHTML(html) {
    }
    setTitle(title) {
        this.title = title;
    }
    putText(text) {
        return 0;
    }
    loadFont(properties) {
        var f = new DviFont(properties);
        f.metrics = loadFont(properties.name);
        return f;
    }
}
//# sourceMappingURL=machine.js.map