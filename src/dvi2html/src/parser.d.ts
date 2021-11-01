import { Machine } from "./machine";
declare enum Opcode {
    set_char = 0,
    set1 = 128,
    set2 = 129,
    set3 = 130,
    set4 = 131,
    set_rule = 132,
    put_char = 133,
    put2 = 134,
    put3 = 135,
    put4 = 136,
    put_rule = 137,
    nop = 138,
    bop = 139,
    eop = 140,
    push = 141,
    pop = 142,
    right = 143,
    right2 = 144,
    right3 = 145,
    right4 = 146,
    w = 147,
    w1 = 148,
    w2 = 149,
    w3 = 150,
    w4 = 151,
    x = 152,
    x1 = 153,
    x2 = 154,
    x3 = 155,
    x4 = 156,
    down = 157,
    down2 = 158,
    down3 = 159,
    down4 = 160,
    y = 161,
    y1 = 162,
    y2 = 163,
    y3 = 164,
    y4 = 165,
    z = 166,
    z1 = 167,
    z2 = 168,
    z3 = 169,
    z4 = 170,
    fnt = 171,
    fnt1 = 235,
    fnt2 = 236,
    fnt3 = 237,
    fnt4 = 238,
    xxx = 239,
    xxx2 = 240,
    xxx3 = 241,
    xxx4 = 242,
    fnt_def = 243,
    fnt_def2 = 244,
    fnt_def3 = 245,
    fnt_def4 = 246,
    pre = 247,
    post = 248,
    post_post = 249,
    post_post_repeats = 223
}
interface IDviCommand {
    length?: number;
}
export declare class DviCommand {
    length: number;
    special: boolean;
    constructor(properties: IDviCommand);
    execute(machine: Machine): void;
    toString(): string;
}
interface IPutChar extends IDviCommand {
    c: number;
}
declare class PutChar extends DviCommand {
    opcode: Opcode.put_char;
    c: number;
    constructor(properties: IPutChar);
    execute(machine: Machine): void;
    toString(): string;
}
interface ISetChar extends IDviCommand {
    c: number;
}
declare class SetChar extends DviCommand {
    opcode: Opcode.set_char;
    c: number;
    constructor(properties: ISetChar);
    execute(machine: Machine): void;
    toString(): string;
}
interface IPutRule extends IDviCommand {
    a: number;
    b: number;
}
declare class PutRule extends DviCommand {
    opcode: Opcode.put_rule;
    a: number;
    b: number;
    constructor(properties: IPutRule);
    execute(machine: Machine): void;
    toString(): string;
}
declare class SetRule extends DviCommand {
    opcode: Opcode.set_rule;
    a: number;
    b: number;
    constructor(properties: any);
    execute(machine: Machine): void;
    toString(): string;
}
interface INop extends IDviCommand {
}
declare class Nop extends DviCommand {
    opcode: Opcode.nop;
    constructor(properties: INop);
    toString(): string;
}
interface IBop extends IDviCommand {
    c_0: number;
    c_1: number;
    c_2: number;
    c_3: number;
    c_4: number;
    c_5: number;
    c_6: number;
    c_7: number;
    c_8: number;
    c_9: number;
    p: number;
}
declare class Bop extends DviCommand {
    opcode: Opcode.bop;
    c_0: number;
    c_1: number;
    c_2: number;
    c_3: number;
    c_4: number;
    c_5: number;
    c_6: number;
    c_7: number;
    c_8: number;
    c_9: number;
    p: number;
    constructor(properties: IBop);
    execute(machine: Machine): void;
    toString(): string;
}
interface IEop extends IDviCommand {
}
declare class Eop extends DviCommand {
    opcode: Opcode.eop;
    constructor(properties: IEop);
    execute(machine: Machine): void;
    toString(): string;
}
interface IPush extends IDviCommand {
}
declare class Push extends DviCommand {
    opcode: Opcode.push;
    constructor(properties: IPush);
    execute(machine: Machine): void;
    toString(): string;
}
interface IPop extends IDviCommand {
}
declare class Pop extends DviCommand {
    opcode: Opcode.pop;
    constructor(properties: IPop);
    execute(machine: Machine): void;
    toString(): string;
}
interface IMoveRight extends IDviCommand {
    b: number;
}
declare class MoveRight extends DviCommand {
    opcode: Opcode.right;
    b: number;
    constructor(properties: IMoveRight);
    execute(machine: Machine): void;
    toString(): string;
}
interface IMoveW extends IDviCommand {
    b: number;
}
declare class MoveW extends DviCommand {
    opcode: Opcode.w;
    b: number;
    constructor(properties: IMoveW);
    execute(machine: Machine): void;
    toString(): string;
}
interface IMoveX extends IDviCommand {
    b: number;
}
declare class MoveX extends DviCommand {
    opcode: Opcode.x;
    b: number;
    constructor(properties: IMoveX);
    execute(machine: Machine): void;
    toString(): string;
}
interface IMoveDown extends IDviCommand {
    a: number;
}
declare class MoveDown extends DviCommand {
    opcode: Opcode.down;
    a: number;
    constructor(properties: IMoveDown);
    execute(machine: Machine): void;
    toString(): string;
}
interface IMoveY extends IDviCommand {
    a: number;
}
declare class MoveY extends DviCommand {
    opcode: Opcode.y;
    a: number;
    constructor(properties: IMoveY);
    execute(machine: Machine): void;
    toString(): string;
}
interface IMoveZ extends IDviCommand {
    a: number;
}
declare class MoveZ extends DviCommand {
    opcode: Opcode.z;
    a: number;
    constructor(properties: IMoveZ);
    execute(machine: Machine): void;
    toString(): string;
}
interface ISetFont extends IDviCommand {
    k: number;
}
declare class SetFont extends DviCommand {
    opcode: Opcode.fnt;
    k: number;
    constructor(properties: ISetFont);
    execute(machine: Machine): void;
    toString(): string;
}
interface ISpecial extends IDviCommand {
    x: string;
}
declare class Special extends DviCommand {
    opcode: Opcode.xxx;
    x: string;
    constructor(properties: ISpecial);
    toString(): string;
}
interface IFontDefinition extends IDviCommand {
    k: number;
    c: number;
    s: number;
    d: number;
    a: number;
    l: number;
    n: string;
}
declare class FontDefinition extends DviCommand {
    opcode: Opcode.fnt_def;
    k: number;
    c: number;
    s: number;
    d: number;
    a: number;
    l: number;
    n: string;
    constructor(properties: IFontDefinition);
    execute(machine: Machine): void;
    toString(): string;
}
interface IPreamble extends IDviCommand {
    i: number;
    num: number;
    den: number;
    mag: number;
    x: string;
}
declare class Preamble extends DviCommand {
    opcode: Opcode.pre;
    i: number;
    num: number;
    den: number;
    mag: number;
    x: string;
    constructor(properties: IPreamble);
    execute(machine: Machine): void;
    toString(): string;
}
interface IPost extends IDviCommand {
    p: number;
    num: number;
    den: number;
    mag: number;
    l: number;
    u: number;
    s: number;
    t: number;
}
declare class Post extends DviCommand {
    opcode: Opcode.post;
    p: number;
    num: number;
    den: number;
    mag: number;
    l: number;
    u: number;
    s: number;
    t: number;
    constructor(properties: IPost);
    execute(machine: Machine): void;
    toString(): string;
}
declare class PostPost extends DviCommand {
    opcode: Opcode.post_post;
    q: number;
    i: number;
    constructor(properties: any);
    execute(machine: Machine): void;
    toString(): string;
}
declare type Command = SetChar | SetRule | PutChar | PutRule | Nop | Bop | Eop | Push | Pop | MoveRight | MoveW | MoveX | MoveDown | MoveY | MoveZ | SetFont | Special | FontDefinition | Preamble | Post | PostPost;
export declare function dviParser(buffer: any): Generator<Command, void, unknown>;
export declare function execute(commands: any, machine: any): void;
export declare function merge(commands: any, filter: any, merge: any): Generator<any, void, any>;
export declare function mergeText(commands: any): Generator<any, void, any>;
export {};
