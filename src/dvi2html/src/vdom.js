import { Machine } from "./machine";
export default class VDomMachine extends Machine {
    constructor(h, ximeraRuleHandler, ximeraPushHandler, ximeraPopHandler, callback) {
        super();
        this.pointsPerDviUnit = 0;
        this.svgDepth = 0;
        this.color = '';
        this.colorStack = [];
        this.paperwidth = 0;
        this.paperheight = 0;
        this.pageContent = [];
        this.svgContent = [];
        this.lastOutputHeight = 0;
        this.ximeraEnvironments = [];
        this.ximeraRuleContent = [];
        this.h = h;
        this.ximeraRuleHandler = ximeraRuleHandler;
        this.ximeraPushHandler = ximeraPushHandler;
        this.ximeraPopHandler = ximeraPopHandler;
        this.callback = callback;
        this.color = 'black';
        this.colorStack = [];
        this.svgDepth = 0;
    }
    addToPage(content) {
        if (this.ximeraRuleOpened) {
            this.ximeraRuleContent.push(content);
        }
        else {
            this.pageContent.push(content);
        }
        this.lastOutputHeight = this.position.v;
    }
    addToSvg(content) {
        this.svgContent.push(content);
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
    setXimeraRule(r) {
        this.ximeraRule = r;
    }
    setXimeraRuleOpen(r) {
        this.ximeraRuleOpen = r;
        this.ximeraRuleContent = [];
    }
    setXimeraRuleClose() {
        let rule = this.ximeraRuleOpened;
        this.ximeraRuleOpened = undefined;
        this.ximeraRuleOpen = undefined;
        let wrapped = this.h('div', { style: { position: 'absolute',
                top: `-${this.ximeraRuleStyle.top}`,
                left: `-${this.ximeraRuleStyle.left}`
            } }, this.ximeraRuleContent);
        this.addToPage(this.ximeraRuleHandler(rule, { style: this.ximeraRuleStyle }, [wrapped]));
        this.ximeraRuleStyle = {};
    }
    pushXimera(e) {
        this.ximeraPushHandler(e);
    }
    popXimera() {
        this.ximeraPopHandler();
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
        else {
            height = this.lastOutputHeight * this.pointsPerDviUnit;
        }
        this.callback(this.h('div', { style: { position: "relative", width: "100%", height: `${height}pt` },
            class: { page: true } }, this.pageContent));
        this.pageContent = [];
    }
    putHTML(html) {
    }
    beginSVG() {
        let left = this.position.h * this.pointsPerDviUnit;
        let top = this.position.v * this.pointsPerDviUnit;
        if (this.svgDepth == 0) {
            this.svgStyle = { attrs: { width: "1in", height: "1in", viewBox: "0 0 72 72" },
                style: { position: "absolute",
                    top: `${top}pt`,
                    left: `${left}pt`,
                    overflow: "visible" } };
            this.svgContent = [];
        }
        else {
            this.addToSvg(`<g transform="translate(${left},${top})">\n`);
        }
        this.svgDepth += 1;
    }
    endSVG() {
        this.svgDepth -= 1;
        if (this.svgDepth == 0) {
            this.addToPage(this.h('svg', Object.assign(Object.assign({}, this.svgStyle), { props: { innerHTML: this.svgContent.join('') } })));
        }
        else {
            this.addToSvg('</g>');
        }
    }
    putSVG(svg) {
        let left = this.position.h * this.pointsPerDviUnit;
        let top = this.position.v * this.pointsPerDviUnit;
        svg = svg.replace(/{\?x}/g, left.toString());
        svg = svg.replace(/{\?y}/g, top.toString());
        this.addToSvg(svg);
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
        const height = `${a}pt`;
        const style = { background: this.color, position: "absolute", "top": `${top}pt`, left: `${left}pt`, width: `${b}pt`, "min-width": "1px", "min-height": "1px", height: height };
        if (this.ximeraRuleOpen) {
            this.ximeraRuleOpened = this.ximeraRuleOpen;
            this.ximeraRuleOpen = undefined;
            this.ximeraRuleStyle = Object.assign(Object.assign({}, style), { background: undefined });
        }
        else if (this.ximeraRule) {
            this.addToPage(this.ximeraRuleHandler(this.ximeraRule, { style: Object.assign(Object.assign({}, style), { background: undefined }) }, []));
            this.ximeraRule = undefined;
        }
        else if (this.svgDepth == 0) {
            this.addToPage(this.h('span', { style }));
        }
        else {
            this.addToSvg(`<rect x="${left}" y="${top}" width="${b}" height="${a}"/>\n`);
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
            let code = c;
            if ((c >= 0) && (c <= 9)) {
                code = 161 + c;
            }
            else if ((c >= 10) && (c <= 19)) {
                code = 173 + c - 10;
            }
            else if (c == 20) {
                code = 8729;
            }
            else if ((c >= 21) && (c <= 32)) {
                code = 184 + c - 21;
            }
            else if (c == 127) {
                code = 196;
            }
            htmlText += String.fromCharCode(code);
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
            this.addToPage(this.h('span', { style: { "line-height": "0", "color": this.color, "font-family": this.font.name, "font-size": `${fontsize}pt`, "position": "absolute", "top": `${top - height}pt`, "left": `${left}pt`, "overflow": "visible" } }, [this.h('span', { style: { "margin-top": `-${fontsize}pt`, "line-height": `${0}pt`, "height": `${fontsize}pt`, "display": "inline-block", "vertical-align": "baseline", "white-space": "nowrap" } }, htmlText), this.h('span', { style: { "display": "inline-block", "vertical-align": `${height}pt`, "height": `${0}pt`, "line-height": "0" } })]));
        }
        else {
            let bottom = this.position.v * this.pointsPerDviUnit;
            this.addToSvg(`<text alignment-baseline="baseline" y="${bottom}" x="${left}" style="font-family: ${this.font.name};" font-size="${fontsize}">${htmlText}</text>\n`);
        }
        return textWidth * dviUnitsPerFontUnit * this.font.scaleFactor / this.font.designSize;
    }
}
//# sourceMappingURL=vdom.js.map