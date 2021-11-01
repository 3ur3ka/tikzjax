import { Machine } from "./machine";
export default class HTMLMachine extends Machine {
    constructor(o) {
        super();
        this.pointsPerDviUnit = 0;
        this.svgDepth = 0;
        this.color = '';
        this.gatheredText = [];
        this.pageContent = [];
        this.output = o;
        this.color = 'black';
        this.svgDepth = 0;
    }
    addToPage(content) {
        this.pageContent.push(content);
    }
    preamble(numerator, denominator, magnification, comment) {
        let dviUnit = magnification * numerator / 1000.0 / denominator;
        let resolution = 300.0;
        let tfm_conv = (25400000.0 / numerator) * (denominator / 473628672) / 16.0;
        let conv = (numerator / 254000.0) * (resolution / denominator);
        conv = conv * (magnification / 1000.0);
        this.pointsPerDviUnit = dviUnit * 72.27 / 100000.0 / 2.54;
        this.gatheredText = [];
    }
    putRule(rule) {
        let a = rule.a * this.pointsPerDviUnit;
        let b = rule.b * this.pointsPerDviUnit;
        let left = this.position.h * this.pointsPerDviUnit;
        let bottom = this.position.v * this.pointsPerDviUnit;
        let top = bottom - a;
        this.addToPage(`<span style="background: ${this.color}; position: absolute; top: ${top}pt; left: ${left}pt; width:${b}pt; height: ${a}pt;"></span>\n`);
    }
    beginPage(page) {
        super.beginPage(page);
        this.pageContent = [];
    }
    endPage() {
        this.emitGatheredText();
        super.endPage();
        for (let i = 0; i < this.pageContent.length; i++) {
            let x = this.pageContent[i];
            this.output.write(x);
        }
        this.pageContent = [];
    }
    pop() {
        this.emitGatheredText();
        super.pop();
    }
    moveDown(distance) {
        this.emitGatheredText();
        super.moveDown(distance);
    }
    setFont(font) {
        this.emitGatheredText();
        super.setFont(font);
    }
    emitGatheredText() {
        if (this.gatheredText.length == 0)
            return;
        let dviUnitsPerFontUnit = this.font.metrics.designSize / 1048576.0 * 65536 / 1048576;
        let fontsize = (this.font.metrics.designSize / 1048576.0) * this.font.scaleFactor / this.font.designSize;
        let top = this.position.v * this.pointsPerDviUnit;
        let height = 0;
        for (let x of this.gatheredText) {
            let h = x.height * dviUnitsPerFontUnit * this.pointsPerDviUnit;
            if (h > height)
                height = h;
        }
        let left = this.gatheredText[0].position * this.pointsPerDviUnit;
        this.addToPage(`<span style="color: ${this.color}; font-family: ${this.font.name}; font-size: ${fontsize}pt; position: absolute; top: ${top - height}pt; left: ${left}pt; overflow: visible;"><span style="margin-top: -${fontsize}pt; line-height: $0pt; height: ${fontsize}pt; display: inline-block; vertical-align: baseline; ">`);
        let currentPosition = left;
        for (let i = 0; i < this.gatheredText.length; i++) {
            let x = this.gatheredText[i];
            let width = x.width * dviUnitsPerFontUnit * this.pointsPerDviUnit;
            let left = x.position * this.pointsPerDviUnit;
            this.addToPage(`<span style="margin-left: ${left - currentPosition}pt;"></span>`);
            this.addToPage(x.text);
            currentPosition = left + width;
        }
        this.addToPage(`</span><span style="display: inline-block; vertical-align: ${height}pt; height: ${0}pt; line-height: 0;"></span></span>\n`);
        this.gatheredText = [];
    }
    putText(text) {
        let dviUnitsPerFontUnit = this.font.metrics.designSize / 1048576.0 * 65536 / 1048576;
        let textWidth = 0;
        let textHeight = 0;
        let textDepth = 0;
        var htmlText = "";
        for (let i = 0; i < text.length; i++) {
            let c = text[i];
            let metrics = this.font.metrics.characters[c];
            if (metrics === undefined)
                throw Error(`Could not find font metric for ${c}`);
            textWidth += metrics.width;
            textHeight = Math.max(textHeight, metrics.height);
            textDepth = Math.max(textDepth, metrics.depth);
            if (c < 32) {
                htmlText += `&#${127 + c + 32 + 4};`;
            }
            else {
                htmlText += String.fromCharCode(c);
            }
        }
        if (this.svgDepth > 0) {
            let bottom = this.position.v * this.pointsPerDviUnit;
            let left = this.position.h * this.pointsPerDviUnit;
            let fontsize = (this.font.metrics.designSize / 1048576.0) * this.font.scaleFactor / this.font.designSize;
            this.addToPage(`<text alignment-baseline="baseline" y="${bottom}" x="${left}" style="font-family: ${this.font.name}; font-size: ${fontsize};">${htmlText}</text>\n`);
        }
        else {
            this.gatheredText.push({
                width: textWidth,
                height: textHeight,
                depth: textDepth,
                position: this.position.h,
                text: htmlText
            });
        }
        return textWidth * dviUnitsPerFontUnit * this.font.scaleFactor / this.font.designSize;
    }
}
//# sourceMappingURL=better-html.js.map