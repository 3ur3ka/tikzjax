import { DviCommand, merge } from '../parser';
class HTML extends DviCommand {
    constructor(html) {
        super({});
        this.html = html;
    }
    execute(machine) {
        machine.putHTML(this.html);
    }
}
function* specialsToHTML(commands) {
    for (const command of commands) {
        if (!command.special) {
            yield command;
        }
        else {
            if (!command.x.startsWith('html ')) {
                yield command;
            }
            else {
                let html = command.x.replace(/^html /, '');
                yield new HTML(html);
            }
        }
    }
}
export default function (commands) {
    return merge(specialsToHTML(commands), command => command.html, function* (commands) {
        let html = commands
            .map(command => command.html)
            .join('');
        yield new HTML(html);
    });
}
//# sourceMappingURL=html.js.map