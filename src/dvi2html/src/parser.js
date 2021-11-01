import { Buffer } from 'buffer';
var Opcode;
(function (Opcode) {
    Opcode[Opcode["set_char"] = 0] = "set_char";
    Opcode[Opcode["set1"] = 128] = "set1";
    Opcode[Opcode["set2"] = 129] = "set2";
    Opcode[Opcode["set3"] = 130] = "set3";
    Opcode[Opcode["set4"] = 131] = "set4";
    Opcode[Opcode["set_rule"] = 132] = "set_rule";
    Opcode[Opcode["put_char"] = 133] = "put_char";
    Opcode[Opcode["put2"] = 134] = "put2";
    Opcode[Opcode["put3"] = 135] = "put3";
    Opcode[Opcode["put4"] = 136] = "put4";
    Opcode[Opcode["put_rule"] = 137] = "put_rule";
    Opcode[Opcode["nop"] = 138] = "nop";
    Opcode[Opcode["bop"] = 139] = "bop";
    Opcode[Opcode["eop"] = 140] = "eop";
    Opcode[Opcode["push"] = 141] = "push";
    Opcode[Opcode["pop"] = 142] = "pop";
    Opcode[Opcode["right"] = 143] = "right";
    Opcode[Opcode["right2"] = 144] = "right2";
    Opcode[Opcode["right3"] = 145] = "right3";
    Opcode[Opcode["right4"] = 146] = "right4";
    Opcode[Opcode["w"] = 147] = "w";
    Opcode[Opcode["w1"] = 148] = "w1";
    Opcode[Opcode["w2"] = 149] = "w2";
    Opcode[Opcode["w3"] = 150] = "w3";
    Opcode[Opcode["w4"] = 151] = "w4";
    Opcode[Opcode["x"] = 152] = "x";
    Opcode[Opcode["x1"] = 153] = "x1";
    Opcode[Opcode["x2"] = 154] = "x2";
    Opcode[Opcode["x3"] = 155] = "x3";
    Opcode[Opcode["x4"] = 156] = "x4";
    Opcode[Opcode["down"] = 157] = "down";
    Opcode[Opcode["down2"] = 158] = "down2";
    Opcode[Opcode["down3"] = 159] = "down3";
    Opcode[Opcode["down4"] = 160] = "down4";
    Opcode[Opcode["y"] = 161] = "y";
    Opcode[Opcode["y1"] = 162] = "y1";
    Opcode[Opcode["y2"] = 163] = "y2";
    Opcode[Opcode["y3"] = 164] = "y3";
    Opcode[Opcode["y4"] = 165] = "y4";
    Opcode[Opcode["z"] = 166] = "z";
    Opcode[Opcode["z1"] = 167] = "z1";
    Opcode[Opcode["z2"] = 168] = "z2";
    Opcode[Opcode["z3"] = 169] = "z3";
    Opcode[Opcode["z4"] = 170] = "z4";
    Opcode[Opcode["fnt"] = 171] = "fnt";
    Opcode[Opcode["fnt1"] = 235] = "fnt1";
    Opcode[Opcode["fnt2"] = 236] = "fnt2";
    Opcode[Opcode["fnt3"] = 237] = "fnt3";
    Opcode[Opcode["fnt4"] = 238] = "fnt4";
    Opcode[Opcode["xxx"] = 239] = "xxx";
    Opcode[Opcode["xxx2"] = 240] = "xxx2";
    Opcode[Opcode["xxx3"] = 241] = "xxx3";
    Opcode[Opcode["xxx4"] = 242] = "xxx4";
    Opcode[Opcode["fnt_def"] = 243] = "fnt_def";
    Opcode[Opcode["fnt_def2"] = 244] = "fnt_def2";
    Opcode[Opcode["fnt_def3"] = 245] = "fnt_def3";
    Opcode[Opcode["fnt_def4"] = 246] = "fnt_def4";
    Opcode[Opcode["pre"] = 247] = "pre";
    Opcode[Opcode["post"] = 248] = "post";
    Opcode[Opcode["post_post"] = 249] = "post_post";
    Opcode[Opcode["post_post_repeats"] = 223] = "post_post_repeats";
})(Opcode || (Opcode = {}));
export class DviCommand {
    constructor(properties) {
        if (properties.length !== undefined)
            this.length = properties.length;
        else
            this.length = 0;
        this.special = false;
    }
    execute(machine) { }
    toString() {
        return "DviCommand { }";
    }
}
class PutChar extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.put_char;
        this.c = 0;
        this.c = properties.c;
    }
    execute(machine) {
        machine.putText(Buffer.from([this.c]));
    }
    toString() {
        return `PutChar { c: '${String.fromCharCode(this.c)}' }`;
    }
}
class SetChar extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.set_char;
        this.c = properties.c;
    }
    execute(machine) {
        var text = Buffer.from([this.c]);
        var width = machine.putText(text);
        machine.moveRight(width);
    }
    toString() {
        return `SetChar { c: '${String.fromCharCode(this.c)}' }`;
    }
}
class SetText extends DviCommand {
    constructor(properties) {
        super(properties);
        this.t = properties.t;
    }
    execute(machine) {
        var width = machine.putText(this.t);
        machine.moveRight(width);
    }
    toString() {
        return `SetText { t: "${this.t.toString()}" }`;
    }
}
class PutRule extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.put_rule;
        this.a = properties.a;
        this.b = properties.b;
    }
    execute(machine) {
        machine.putRule(this);
    }
    toString() {
        return `PutRule { a: ${this.a}, b: ${this.b} }`;
    }
}
class SetRule extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.set_rule;
        this.a = properties.a;
        this.b = properties.b;
    }
    execute(machine) {
        machine.putRule(this);
        machine.moveRight(this.b);
    }
    toString() {
        return `SetRule { a: ${this.a}, b: ${this.b} }`;
    }
}
class Nop extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.nop;
    }
    toString() {
        return `Nop { }`;
    }
}
class Bop extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.bop;
        this.c_0 = properties.c_0;
        this.c_1 = properties.c_1;
        this.c_2 = properties.c_2;
        this.c_3 = properties.c_3;
        this.c_4 = properties.c_4;
        this.c_5 = properties.c_5;
        this.c_6 = properties.c_6;
        this.c_7 = properties.c_7;
        this.c_8 = properties.c_8;
        this.c_9 = properties.c_9;
        this.p = properties.p;
    }
    execute(machine) {
        machine.beginPage(this);
    }
    toString() {
        return `Bop { ... }`;
    }
}
class Eop extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.eop;
    }
    execute(machine) {
        if (machine.stack.length)
            throw Error('Stack should be empty at the end of a page.');
        machine.endPage();
    }
    toString() {
        return `Eop { }`;
    }
}
class Push extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.push;
    }
    execute(machine) {
        machine.push();
    }
    toString() {
        return `Push { }`;
    }
}
class Pop extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.pop;
    }
    execute(machine) {
        machine.pop();
    }
    toString() {
        return `Pop { }`;
    }
}
class MoveRight extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.right;
        this.b = properties.b;
    }
    execute(machine) {
        machine.moveRight(this.b);
    }
    toString() {
        return `MoveRight { b: ${this.b} }`;
    }
}
class MoveW extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.w;
        this.b = properties.b;
    }
    ;
    execute(machine) {
        if (this.length > 1)
            machine.position.w = this.b;
        machine.moveRight(machine.position.w);
    }
    toString() {
        if (this.length > 1)
            return `MoveW { b: ${this.b} }`;
        else
            return `MoveW0 { }`;
    }
}
class MoveX extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.x;
        this.b = properties.b;
    }
    execute(machine) {
        if (this.length > 1)
            machine.position.x = this.b;
        machine.moveRight(machine.position.x);
    }
    toString() {
        if (this.length > 1)
            return `MoveX { b: ${this.b} }`;
        else
            return `MoveX0 { }`;
    }
}
class MoveDown extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.down;
        this.a = properties.a;
    }
    execute(machine) {
        machine.moveDown(this.a);
    }
    toString() {
        return `MoveDown { a: ${this.a} }`;
    }
}
class MoveY extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.y;
        this.a = properties.a;
    }
    execute(machine) {
        if (this.length > 1)
            machine.position.y = this.a;
        machine.moveDown(machine.position.y);
    }
    toString() {
        if (this.length > 1)
            return `MoveY { a: ${this.a} }`;
        else
            return `MoveY0 { }`;
    }
}
class MoveZ extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.z;
        this.a = properties.a;
    }
    execute(machine) {
        if (this.length > 1)
            machine.position.z = this.a;
        machine.moveDown(machine.position.z);
    }
    toString() {
        if (this.length > 1)
            return `MoveZ { a: ${this.a} }`;
        else
            return `MoveZ0 { }`;
    }
}
class SetFont extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.fnt;
        this.k = properties.k;
    }
    execute(machine) {
        if (machine.fonts[this.k]) {
            machine.setFont(machine.fonts[this.k]);
        }
        else
            throw `Could not find font ${this.k}.`;
    }
    toString() {
        return `SetFont { k: ${this.k} }`;
    }
}
class Special extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.xxx;
        this.special = true;
        this.x = properties.x;
    }
    ;
    toString() {
        return `Special { x: '${this.x}' }`;
    }
}
class FontDefinition extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.fnt_def;
        this.k = properties.k;
        this.c = properties.c;
        this.s = properties.s;
        this.d = properties.d;
        this.a = properties.a;
        this.l = properties.l;
        this.n = properties.n;
    }
    execute(machine) {
        machine.fonts[this.k] = machine.loadFont({
            name: this.n,
            checksum: this.c,
            scaleFactor: this.s,
            designSize: this.d
        });
    }
    toString() {
        return `FontDefinition { k: ${this.k}, n: '${this.n}', ... }`;
    }
}
class Preamble extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.pre;
        this.i = properties.i;
        this.x = properties.x;
        this.num = properties.num;
        this.den = properties.den;
        this.mag = properties.mag;
    }
    execute(machine) {
        if (this.num <= 0)
            throw Error('Invalid numerator (must be > 0)');
        if (this.den <= 0)
            throw Error('Invalid denominator (must be > 0)');
        if (this.i != 2) {
            throw Error('DVI format must be 2.');
        }
        machine.preamble(this.num, this.den, this.mag, this.x);
    }
    toString() {
        return `Preamble { i: ${this.i}, num: ${this.num}, den: ${this.den}, mag: ${this.mag}, x: '${this.x}' }`;
    }
}
class Post extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.post;
        this.p = properties.p;
        this.num = properties.num;
        this.den = properties.den;
        this.mag = properties.mag;
        this.l = properties.l;
        this.u = properties.u;
        this.s = properties.s;
        this.t = properties.t;
    }
    execute(machine) {
        machine.post(this);
    }
    toString() {
        return `Post { p: ${this.p}, num: ${this.num}, den: ${this.den}, mag: ${this.mag}, ... }`;
    }
}
class PostPost extends DviCommand {
    constructor(properties) {
        super(properties);
        this.opcode = Opcode.post_post;
        this.q = properties.q;
        this.i = properties.i;
    }
    execute(machine) {
        machine.postPost(this);
    }
    toString() {
        return `PostPost { q: ${this.q}, i: ${this.i} }`;
    }
}
function parseCommand(opcode, buffer) {
    if ((opcode >= Opcode.set_char) && (opcode < Opcode.set1)) {
        return new SetChar({ c: opcode, length: 1 });
    }
    if ((opcode >= Opcode.fnt) && (opcode < Opcode.fnt1))
        return new SetFont({ k: opcode - 171, length: 1 });
    if ((opcode >= 250) && (opcode <= 255)) {
        throw Error(`Undefined opcode ${opcode}`);
        return new Nop({ length: 1 });
    }
    switch (opcode) {
        case Opcode.set1:
        case Opcode.set2:
        case Opcode.set3:
        case Opcode.set4:
            if (buffer.length < opcode - Opcode.set1 + 1)
                return undefined;
            return new SetChar({
                c: buffer.readUIntBE(0, opcode - Opcode.set1 + 1),
                length: opcode - Opcode.set1 + 1 + 1
            });
        case Opcode.set_rule:
            if (buffer.length < 8)
                return undefined;
            return new SetRule({
                a: buffer.readInt32BE(0),
                b: buffer.readInt32BE(4),
                length: 9
            });
        case Opcode.put_char:
        case Opcode.put2:
        case Opcode.put3:
        case Opcode.put4:
            if (buffer.length < opcode - Opcode.put_char + 1)
                return undefined;
            return new PutChar({
                c: buffer.readIntBE(0, opcode - Opcode.put_char + 1),
                length: opcode - Opcode.put_char + 1 + 1
            });
        case Opcode.put_rule:
            if (buffer.length < 8)
                return undefined;
            return new PutRule({
                a: buffer.readInt32BE(0),
                b: buffer.readInt32BE(4),
                length: 9
            });
        case Opcode.nop:
            return new Nop({ length: 1 });
        case Opcode.bop:
            if (buffer.length < 44)
                return undefined;
            return new Bop({
                c_0: buffer.readUInt32BE(0),
                c_1: buffer.readUInt32BE(4),
                c_2: buffer.readUInt32BE(8),
                c_3: buffer.readUInt32BE(12),
                c_4: buffer.readUInt32BE(16),
                c_5: buffer.readUInt32BE(20),
                c_6: buffer.readUInt32BE(24),
                c_7: buffer.readUInt32BE(28),
                c_8: buffer.readUInt32BE(32),
                c_9: buffer.readUInt32BE(36),
                p: buffer.readUInt32BE(40),
                length: 45
            });
        case Opcode.eop:
            return new Eop({ length: 1 });
        case Opcode.push:
            return new Push({ length: 1 });
        case Opcode.pop:
            return new Pop({ length: 1 });
        case Opcode.right:
        case Opcode.right2:
        case Opcode.right3:
        case Opcode.right4:
            if (buffer.length < opcode - Opcode.right + 1)
                return undefined;
            return new MoveRight({
                b: buffer.readIntBE(0, opcode - Opcode.right + 1),
                length: opcode - Opcode.right + 1 + 1
            });
        case Opcode.w:
            return new MoveW({ b: 0, length: 1 });
        case Opcode.w1:
        case Opcode.w2:
        case Opcode.w3:
        case Opcode.w4:
            if (buffer.length < opcode - Opcode.w)
                return undefined;
            return new MoveW({
                b: buffer.readIntBE(0, opcode - Opcode.w),
                length: opcode - Opcode.w + 1
            });
        case Opcode.x:
            return new MoveX({ b: 0, length: 1 });
        case Opcode.x1:
        case Opcode.x2:
        case Opcode.x3:
        case Opcode.x4:
            if (buffer.length < opcode - Opcode.x)
                return undefined;
            return new MoveX({
                b: buffer.readIntBE(0, opcode - Opcode.x),
                length: opcode - Opcode.x + 1
            });
        case Opcode.down:
        case Opcode.down2:
        case Opcode.down3:
        case Opcode.down4:
            if (buffer.length < opcode - Opcode.down + 1)
                return undefined;
            return new MoveDown({
                a: buffer.readIntBE(0, opcode - Opcode.down + 1),
                length: opcode - Opcode.down + 1 + 1
            });
        case Opcode.y:
            return new MoveY({ a: 0, length: 1 });
        case Opcode.y1:
        case Opcode.y2:
        case Opcode.y3:
        case Opcode.y4:
            if (buffer.length < opcode - Opcode.y)
                return undefined;
            return new MoveY({
                a: buffer.readIntBE(0, opcode - Opcode.y),
                length: opcode - Opcode.y + 1
            });
        case Opcode.z:
            return new MoveZ({ a: 0, length: 1 });
        case Opcode.z1:
        case Opcode.z2:
        case Opcode.z3:
        case Opcode.z4:
            if (buffer.length < opcode - Opcode.z)
                return undefined;
            return new MoveZ({
                a: buffer.readIntBE(0, opcode - Opcode.z),
                length: opcode - Opcode.z + 1
            });
        case Opcode.fnt1:
        case Opcode.fnt2:
        case Opcode.fnt3:
        case Opcode.fnt4:
            if (buffer.length < opcode - Opcode.fnt1 + 1)
                return undefined;
            return new SetFont({
                k: buffer.readIntBE(0, opcode - Opcode.fnt1 + 1),
                length: opcode - Opcode.fnt1 + 1 + 1
            });
        case Opcode.xxx:
        case Opcode.xxx2:
        case Opcode.xxx3:
        case Opcode.xxx4: {
            let i = opcode - Opcode.xxx + 1;
            if (buffer.length < i)
                return undefined;
            let k = buffer.readUIntBE(0, i);
            if (buffer.length < i + k)
                return undefined;
            return new Special({
                x: buffer.slice(i, i + k).toString(),
                length: i + k + 1
            });
        }
        case Opcode.fnt_def:
        case Opcode.fnt_def2:
        case Opcode.fnt_def3:
        case Opcode.fnt_def4: {
            let i = opcode - Opcode.fnt_def + 1;
            if (buffer.length < i)
                return undefined;
            let k = buffer.readIntBE(0, i);
            if (buffer.length < i + 14)
                return undefined;
            let c = buffer.readUInt32BE(i + 0);
            let s = buffer.readUInt32BE(i + 4);
            let d = buffer.readUInt32BE(i + 8);
            let a = buffer.readUInt8(i + 12);
            let l = buffer.readUInt8(i + 13);
            if (buffer.length < i + 14 + a + l)
                return undefined;
            let n = buffer.slice(i + 14, i + 14 + a + l).toString();
            return new FontDefinition({
                k: k,
                c: c,
                s: s,
                d: d,
                a: a,
                l: l,
                n: n,
                length: i + 14 + a + l + 1,
            });
        }
        case Opcode.pre: {
            if (buffer.length < 14)
                return undefined;
            let i = buffer.readUInt8(0);
            let num = buffer.readUInt32BE(1);
            let den = buffer.readUInt32BE(5);
            let mag = buffer.readUInt32BE(9);
            let k = buffer.readUInt8(13);
            if (buffer.length < 14 + k)
                return undefined;
            return new Preamble({
                i: i,
                num: num,
                den: den,
                mag: mag,
                x: buffer.slice(14, 14 + k).toString(),
                length: 14 + k + 1
            });
        }
        case Opcode.post:
            if (buffer.length < 4 + 4 + 4 + 4 + 4 + 4 + 2 + 2)
                return undefined;
            return new Post({
                p: buffer.readUInt32BE(0),
                num: buffer.readUInt32BE(4),
                den: buffer.readUInt32BE(8),
                mag: buffer.readUInt32BE(12),
                l: buffer.readUInt32BE(16),
                u: buffer.readUInt32BE(20),
                s: buffer.readUInt16BE(24),
                t: buffer.readUInt16BE(26),
                length: 29
            });
        case Opcode.post_post:
            if (buffer.length < 5)
                return undefined;
            return new PostPost({
                q: buffer.readUInt32BE(0),
                i: buffer.readUInt8(4),
                length: 6
            });
    }
    return undefined;
}
export function* dviParser(buffer) {
    let isAfterPostamble = false;
    let offset = 0;
    while (offset < buffer.length) {
        let opcode = buffer.readUInt8(offset);
        if (isAfterPostamble) {
            if (opcode == 223) {
                offset++;
                continue;
            }
            else {
                throw Error('Only 223 bytes are permitted after the post-postamble.');
            }
        }
        let command = parseCommand(opcode, buffer.slice(offset + 1));
        if (command) {
            yield command;
            offset += command.length;
            if (command.opcode == Opcode.post_post)
                isAfterPostamble = true;
        }
        else
            break;
    }
}
export function execute(commands, machine) {
    for (const command of commands) {
        command.execute(machine);
    }
}
export function* merge(commands, filter, merge) {
    let queue = [];
    for (const command of commands) {
        if (filter(command)) {
            queue.push(command);
        }
        else {
            if (queue.length > 0) {
                yield* merge(queue);
                queue = [];
            }
            yield command;
        }
    }
    if (queue.length > 0)
        yield* merge(queue);
}
export function mergeText(commands) {
    return merge(commands, command => (command instanceof SetChar), function* (queue) {
        let text = Buffer.from(queue.map(command => command.c));
        yield new SetText({ t: text });
    });
}
//# sourceMappingURL=parser.js.map