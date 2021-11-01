import color from "./specials/color";
import svg from "./specials/svg";
import html from "./specials/html";
import papersize from "./specials/papersize";
import VDomMachine from "./vdom";
import HTMLMachine from "./html";
import TextMachine from "./text";
export declare var Machines: {
    HTML: typeof HTMLMachine;
    vdom: typeof VDomMachine;
    text: typeof TextMachine;
};
import { dviParser, execute, mergeText } from "./parser";
export declare var specials: {
    color: typeof color;
    svg: typeof svg;
    html: typeof html;
    papersize: typeof papersize;
};
export declare function dvi2html(dviStream: any, htmlStream: any): HTMLMachine;
export declare function dvi2vdom(dviStream: any, h: any, ximeraRuleHandler: any, ximeraPushHandler: any, ximeraPopHandler: any, callback: any): VDomMachine;
import { tfmData } from "./tfm/index";
export { tfmData, dviParser, execute, mergeText };
