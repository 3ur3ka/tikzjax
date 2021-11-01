import { Machine } from "./machine";
import glyphs from './tfm/encodings.json';
import fontlist from '../tools/fontlist.json';
export default class HTMLMachine extends Machine {
    constructor(o) {
        super();
        this.pointsPerDviUnit = 0;
        this.svgDepth = 0;
        this.color = '';
        this.colorStack = [];
        this.paperwidth = 0;
        this.paperheight = 0;
        this.pageContent = [];
        this.lastOutputHeight = 0;
        this.lastTextV = 0;
        this.lastTextRight = 0;
        this.output = o;
        this.color = 'black';
        this.colorStack = [];
        this.svgDepth = 0;
    }
    writeToPage(content) {
        this.pageContent.push(content);
        this.lastOutputHeight = this.position.v;
    }
    pushColor(c) {
        this.colorStack.push(this.color);
        this.color = c;
    }
    popColor() {
        const result = this.colorStack.pop();
        if (result)
            this.color = result;
        else
            throw new Error('Popped from empty color stack');
    }
    setPapersize(width, height) {
        this.paperwidth = width;
        this.paperheight = height;
    }
    beginPage(page) {
        super.beginPage(page);
        this.pageContent = [];
    }
    endPage() {
        let height = 0;
        if (this.savedPosition) {
            height = Math.max(this.savedPosition.v, this.lastOutputHeight) * this.pointsPerDviUnit;
        }
        this.output.write(`<div style="position: relative; width: 100%; height: ${height}pt;" class="page">`);
        for (let i = 0; i < this.pageContent.length; i++) {
            let x = this.pageContent[i];
            this.output.write(x);
        }
        this.output.write(`</div>`);
        this.pageContent = [];
    }
    putHTML(html) {
        if (html == '<p>')
            this.writeToPage('<p role="text">');
        else
            this.writeToPage(html);
    }
    beginSVG() {
        let left = this.position.h * this.pointsPerDviUnit;
        let top = this.position.v * this.pointsPerDviUnit;
        if (this.svgDepth == 0) {
            this.writeToPage(`<svg width="1in" height="1in" viewBox="0 0 72 72" style="position: absolute; top: ${top}pt; left: ${left}pt; overflow: visible;">\n`);
            //this.writeToPage(`<svg width="1in" height="1in" viewBox="0 0 72 72" style="position: relative; overflow: visible;">\n`);
        }
        else {
            this.writeToPage(`<g transform="translate(${left},${top})">\n`);
        }
        this.svgDepth += 1;
    }
    endSVG() {
        this.svgDepth -= 1;
        if (this.svgDepth == 0) {
            this.writeToPage('</svg>');
        }
        else {
            this.writeToPage('</g>');
        }
    }
    putSVG(svg) {
        let left = this.position.h * this.pointsPerDviUnit;
        let top = this.position.v * this.pointsPerDviUnit;
        svg = svg.replace(/{\?x}/g, left.toString());
        svg = svg.replace(/{\?y}/g, top.toString());
        this.writeToPage(svg);
    }
    preamble(numerator, denominator, magnification, comment) {
        let dviUnit = magnification * numerator / 1000.0 / denominator;
        let resolution = 300.0;
        let tfm_conv = (25400000.0 / numerator) * (denominator / 473628672) / 16.0;
        let conv = (numerator / 254000.0) * (resolution / denominator);
        conv = conv * (magnification / 1000.0);
        this.pointsPerDviUnit = dviUnit * 72.27 / 100000.0 / 2.54;
    }
    putRule(rule) {
        let a = rule.a * this.pointsPerDviUnit;
        let b = rule.b * this.pointsPerDviUnit;
        let left = this.position.h * this.pointsPerDviUnit;
        let bottom = this.position.v * this.pointsPerDviUnit;
        let top = bottom - a;
        if (this.svgDepth == 0) {
            const height = `${a}pt`;
            this.writeToPage(`<span style="background: ${this.color}; position: absolute; top: ${top}pt; left: ${left}pt; width:${b}pt; min-width: 1px; min-height: 1px; height: ${height};"></span>\n`);
        }
        else {
            this.writeToPage(`<rect x="${left}" y="${top}" width="${b}" height="${a}"/>\n`);
        }
    }
    putText(text) {
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
            let encoding = fontlist[this.font.name];
            if (this.font.name == 'cmmi10') {
                console.log(this.font.name, encoding, JSON.stringify(glyphs[encoding]));
            }
            let codepoint = glyphs[encoding][c];
            htmlText += `&#${codepoint};`;
        }
        var dviUnitsPerFontUnit = this.font.metrics.designSize / 1048576.0 * 65536 / 1048576;
        var top = (this.position.v - textHeight * dviUnitsPerFontUnit) * this.pointsPerDviUnit;
        let left = this.position.h * this.pointsPerDviUnit;
        var width = textWidth * this.pointsPerDviUnit * dviUnitsPerFontUnit;
        var height = textHeight * this.pointsPerDviUnit * dviUnitsPerFontUnit;
        var depth = textDepth * this.pointsPerDviUnit * dviUnitsPerFontUnit;
        var top = this.position.v * this.pointsPerDviUnit;
        let fontsize = (this.font.metrics.designSize / 1048576.0) * this.font.scaleFactor / this.font.designSize;
        if (this.svgDepth == 0) {
            let space = '';
            if ((this.lastTextV == this.position.v) && (left > this.lastTextRight + 2)) {
                space = '<span style="display: inline-block; width: 0pt;">&nbsp;</span>';
            }
            this.writeToPage(`<span style="line-height: 0; color: ${this.color}; font-family: ${this.font.name}; font-size: ${fontsize}pt; position: absolute; top: ${top - height}pt; left: ${left}pt; overflow: visible;"><span style="margin-top: -${fontsize}pt; line-height: ${0}pt; height: ${fontsize}pt; display: inline-block; vertical-align: baseline; ">${space}${htmlText}</span><span style="display: inline-block; vertical-align: ${height}pt; height: ${0}pt; line-height: 0;"></span></span>\n`);
            this.lastTextV = this.position.v;
            this.lastTextRight = left + width;
        }
        else {
            let bottom = this.position.v * this.pointsPerDviUnit;
            this.writeToPage(`<text alignment-baseline="baseline" y="${bottom}" x="${left}" style="font-family: ${this.font.name};" font-size="${fontsize}">${htmlText}</text>\n`);
        }
        return textWidth * dviUnitsPerFontUnit * this.font.scaleFactor / this.font.designSize;
    }
}
//# sourceMappingURL=html.js.map