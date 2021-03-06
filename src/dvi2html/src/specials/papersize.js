import { DviCommand } from '../parser';
class Papersize extends DviCommand {
    constructor(width, height) {
        super({});
        this.width = width;
        this.height = height;
    }
    execute(machine) {
        machine.setPapersize(this.width, this.height);
    }
    toString() {
        return `Papersize { width: ${this.width}, height: ${this.height} }`;
    }
}
export default function* (commands) {
    for (const command of commands) {
        if (!command.special) {
            yield command;
        }
        else {
            if (!command.x.startsWith('papersize=')) {
                yield command;
            }
            else {
                let sizes = command.x.replace(/^papersize=/, '').split(',');
                if (sizes.length != 2)
                    throw Error('Papersize special requires two arguments.');
                if (!sizes[0].endsWith('pt'))
                    throw Error('Papersize special width must be in points.');
                if (!sizes[1].endsWith('pt'))
                    throw Error('Papersize special height must be in points.');
                let width = parseFloat(sizes[0].replace(/pt$/, ''));
                let height = parseFloat(sizes[1].replace(/pt$/, ''));
                yield new Papersize(width, height);
            }
        }
    }
}
//# sourceMappingURL=papersize.js.map