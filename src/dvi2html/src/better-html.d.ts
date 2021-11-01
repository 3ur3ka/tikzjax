/// <reference types="node" />
import { Machine, Rule, DviFont } from "./machine";
import { Writable } from 'stream';
interface PositionedText {
    text: string;
    position: number;
    width: number;
    height: number;
    depth: number;
}
export default class HTMLMachine extends Machine {
    output: Writable;
    pointsPerDviUnit: number;
    svgDepth: number;
    color: string;
    gatheredText: PositionedText[];
    pageContent: string[];
    constructor(o: Writable);
    addToPage(content: string): void;
    preamble(numerator: number, denominator: number, magnification: number, comment: string): void;
    putRule(rule: Rule): void;
    beginPage(page: any): void;
    endPage(): void;
    pop(): void;
    moveDown(distance: number): void;
    setFont(font: DviFont): void;
    emitGatheredText(): void;
    putText(text: Buffer): number;
}
export {};
