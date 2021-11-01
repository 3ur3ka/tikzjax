/// <reference types="node" />
import { Tfm } from './tfm/tfm';
export interface Rule {
    a: number;
    b: number;
}
declare class Position {
    h: number;
    v: number;
    w: number;
    x: number;
    y: number;
    z: number;
    constructor(properties?: Position);
}
export declare class DviFont {
    name: string;
    checksum: number;
    scaleFactor: number;
    designSize: number;
    metrics: Tfm;
    constructor(properties: DviFont);
}
export declare class Machine {
    fonts: DviFont[];
    font: DviFont;
    stack: Position[];
    position: Position;
    title: string;
    savedPosition: Position;
    constructor();
    preamble(numerator: number, denominator: number, magnification: number, comment: string): void;
    pushColor(c: string): void;
    popColor(): void;
    setXimeraRule(r: string): void;
    setXimeraRuleOpen(r: string): void;
    setXimeraRuleClose(): void;
    pushXimera(e: string): void;
    popXimera(): void;
    setPapersize(width: number, height: number): void;
    push(): void;
    pop(): void;
    beginPage(page: any): void;
    endPage(): void;
    post(p: any): void;
    postPost(p: any): void;
    putRule(rule: Rule): void;
    moveRight(distance: number): void;
    moveDown(distance: number): void;
    setFont(font: DviFont): void;
    beginSVG(): void;
    endSVG(): void;
    putSVG(svg: string): void;
    putHTML(html: string): void;
    setTitle(title: string): void;
    putText(text: Buffer): number;
    loadFont(properties: any): DviFont;
}
export {};
