import { DviCommand } from '../parser';
class XimeraBegin extends DviCommand {
    constructor(environment) {
        super({});
        this.environment = environment;
    }
    execute(machine) {
        machine.pushXimera(this.environment);
    }
    toString() {
        return `pushXimera { environment: '${this.environment}' }`;
    }
}
class XimeraEnd extends DviCommand {
    constructor(environment) {
        super({});
        this.environment = environment;
    }
    execute(machine) {
        machine.popXimera();
    }
    toString() {
        return `popXimera { }`;
    }
}
class XimeraRule extends DviCommand {
    constructor(rule) {
        super({});
        this.rule = rule;
    }
    execute(machine) {
        machine.setXimeraRule(this.rule);
    }
    toString() {
        return `setXimeraRule { rule: '${this.rule}' }`;
    }
}
class XimeraRuleClose extends DviCommand {
    constructor() {
        super({});
    }
    execute(machine) {
        machine.setXimeraRuleClose();
    }
    toString() {
        return `setXimeraRuleClose { }`;
    }
}
class XimeraRuleOpen extends DviCommand {
    constructor(rule) {
        super({});
        this.rule = rule;
    }
    execute(machine) {
        machine.setXimeraRuleOpen(this.rule);
    }
    toString() {
        return `setXimeraRuleOpen { rule: '${this.rule}' }`;
    }
}
class XimeraSave extends DviCommand {
    constructor() {
        super({});
    }
    execute(machine) {
        machine.savedPosition = machine.position;
    }
}
class XimeraRestore extends DviCommand {
    constructor() {
        super({});
    }
    execute(machine) {
    }
}
function* specialsToXimera(commands) {
    for (const command of commands) {
        if (!command.special) {
            yield command;
        }
        else {
            if (!command.x.startsWith('ximera:')) {
                yield command;
            }
            else {
                if (command.x.startsWith('ximera:rule ')) {
                    let ximera = command.x.replace(/^ximera:rule /, '');
                    yield new XimeraRule(ximera);
                }
                else if (command.x.startsWith('ximera:rule:open ')) {
                    let ximera = command.x.replace(/^ximera:rule:open /, '');
                    yield new XimeraRuleOpen(ximera);
                }
                else if (command.x.startsWith('ximera:rule:close ')) {
                    yield new XimeraRuleClose();
                }
                else if (command.x.startsWith('ximera:begin ')) {
                    let ximera = command.x.replace(/^ximera:begin /, '');
                    yield new XimeraBegin(ximera);
                }
                else if (command.x.startsWith('ximera:end ')) {
                    let ximera = command.x.replace(/^ximera:end /, '');
                    yield new XimeraEnd(ximera);
                }
                else if (command.x === 'ximera:save') {
                    yield new XimeraSave();
                }
                else if (command.x === 'ximera:restore') {
                    yield new XimeraRestore();
                }
                else {
                    yield command;
                }
            }
        }
    }
}
export default function (commands) {
    return specialsToXimera(commands);
}
//# sourceMappingURL=ximera.js.map