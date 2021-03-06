import { DviCommand } from '../parser';
class Title extends DviCommand {
    constructor(title) {
        super({});
        this.title = title;
    }
    execute(machine) {
        machine.setTitle(this.title);
    }
}
function* specialsToTitle(commands) {
    for (const command of commands) {
        if (!command.special) {
            yield command;
        }
        else {
            if (!command.x.startsWith('title ')) {
                yield command;
            }
            else {
                let title = command.x.replace(/^title /, '');
                yield new Title(title);
            }
        }
    }
}
export default function (commands) {
    return specialsToTitle(commands);
}
//# sourceMappingURL=title.js.map