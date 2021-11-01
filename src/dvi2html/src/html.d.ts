/// <reference types="node" />
import { Machine, Rule } from "./machine";
import { Writable } from 'stream';
export default class HTMLMachine extends Machine {
    output: Writable;
    pointsPerDviUnit: number;
    svgDepth: number;
    color: string;
    colorStack: string[];
    paperwidth: number;
    paperheight: number;
    pageContent: string[];
    lastOutputHeight: number;
    lastTextV: number;
    lastTextRight: number;
    writeToPage(content: string): void;
    pushColor(c: string): void;
    popColor(): void;
    setPapersize(width: number, height: number): void;
    beginPage(page: any): void;
    endPage(): void;
    putHTML(html: string): void;
    beginSVG(): void;
    endSVG(): void;
    putSVG(svg: string): void;
    constructor(o: Writable);
    preamble(numerator: number, denominator: number, magnification: number, comment: string): void;
    putRule(rule: Rule): void;
    putText(text: Buffer): number;
}
