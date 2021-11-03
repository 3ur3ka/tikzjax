import { dvi2html } from './dvi2html/src/index';
import { Writable } from 'stream';
import * as library from './library';
import { ReadableStream } from "web-streams-polyfill";
import fetchStream from 'fetch-readablestream';
//import { fstat } from 'fs';
import pako from 'pako';

import fontenc from './fontenc.json';
import l3backend_dvips from './l3backend-dvips.json';
import l3backend_dvisvgm from './l3backend-dvisvgm.json';
import cmsl10 from './cmsl10.json';
import cmex7 from './cmex7.json';

var fs = require('fs');

// document.currentScript polyfill
if (document.currentScript === undefined) {
  var scripts = document.getElementsByTagName('script');
  document.currentScript = scripts[scripts.length - 1];
}

// Determine where we were loaded from; we'll use that to find a
// tikzwolke server that can handle our POSTing tikz code
var url = new URL(document.currentScript.src);
// host includes the port
var host = url.host;
var urlRoot = url.protocol + '//' + host;

let pages = 2500;
var coredump;
var code;

var browserFsReady = false;
var coredumpReady = false;

/*
async function load() {
  let tex = await fetch(urlRoot + '/tex.wasm');
  code = await tex.arrayBuffer();


  library.initFs(null);
  // let response = await fetchStream(urlRoot + '/core.dump.gz');
  // //let dumpStr = urlRoot + '/7620f557a41f2bf40820e76ba1fd4d89a484859d.gz';

  const compressed = new Uint8Array(
    await fetch(urlRoot + '/7620f557a41f2bf40820e76ba1fd4d89a484859d.gz').then(res => res.arrayBuffer()) //res.arrayBuffer())
  );
    // , 0, pages * 65536);
  // Above example with Node.js Buffers:
  // Buffer.from('H4sIAAAAAAAAE8tIzcnJBwCGphA2BQAAAA==', 'base64');
  console.log(compressed);

  let decompressed;
  try {
    decompressed =
      decompressSync(compressed);
  } catch (err) {
    console.log(err);
  }
  //const decompressed = pako.ungzip(compressed);

  coredump = decompressed; //new Uint8Array(decompressed, 0, pages * 65536);

  console.log(coredump);
}*/


/*
async function load() {

  let tex = await fetch(urlRoot + '/ef253ef29e2f057334f77ead7f06ed8f22607d38.wasm');
  code = await tex.arrayBuffer();

  //library.initFs(function () { browserFsReady = true });
  
  const decompressed = new Uint8Array(
    await fetch(urlRoot + '/7620f557a41f2bf40820e76ba1fd4d89a484859d.gz').then(res => res.arrayBuffer()) //res.arrayBuffer())
  );

  coredump = new Uint8Array(decompressed, 0, pages * 65536);
  //console.log(coredump);
  coredumpReady = true;

}
*/

async function load() {
  let tex = await fetch(urlRoot + '/ef253ef29e2f057334f77ead7f06ed8f22607d38.wasm');
  code = await tex.arrayBuffer();

  let response = await fetchStream(urlRoot + '/7620f557a41f2bf40820e76ba1fd4d89a484859d.gz');
  const reader = response.body.getReader();
  const inf = new pako.Inflate();
  
  try {
    while (true) {
      const {done, value} = await reader.read();
      inf.push(value, done);
      if (done) break;
    }
  }
  finally {
    reader.releaseLock();
  }

  coredump = new Uint8Array( inf.result, 0, pages*65536 );
}


function copy(src)  {
  var dst = new Uint8Array(src.length);
  dst.set(src);
  return dst;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function tex(input) {
  if (input.match('\\\\begin *{document}') === null) {
    input = '\\thispagestyle{empty}\n' + '\\begin{document}\n' + input;
  }
  input = input + '\n\\end{document}\n';

  /*
  const libraries = [
  "calc",
  "positioning",
  "fit",
  "backgrounds",
  "trees",
  "arrows",
  "shapes",
  "shapes.geometric",
  "shapes.misc",
  "shapes.symbols",
  "shapes.arrows",
  "shapes.callouts",
  "shapes.multipart",
  "decorations.text",
  "3d",
  "angles",
  "babel",
  "decorations.markings",
  "decorations.shapes",
  "intersections",
  "patterns",
  "quotes",
  "shadows",
  "fadings",
  "through",
  "pgfplots.groupplots"
]

let tikzlibraries = libraries.map( (library) => `\\usetikzlibrary{${library}}` ).join('')

const packages = [
  "listings",
"lstmisc",
"everyhook",
"svn-prov",
"etoolbox",
"xcolor",
"url",
"fancyvrb",
"keyval",
"tkz-euclide",
"tikz",
"tikz-cd",
"pgf",
"pgfrcs",
"pgffor",
"pgfkeys",
"pgfplots",
"forloop",
"ifthen",
"environ",
"trimspaces",
"amssymb",
"amsfonts",
"amsmath",
"amstext",
"amsgen",
"amsbsy",
"amsopn",
"amsthm",
"xifthen",
"calc",
  "ifmtarg",
  "multido",
  "comment",
  "gettitlestring",
"kvoptions",
"ltxcmds",
"kvsetkeys",
"nameref",
"refcount",
"infwarerr",
"fontenc",
"hyperref",
"iftex",
"pdftexcmds",
"kvdefinekeys",
"pdfescape",
"hycolor",
"letltxmacro",
"auxhook",
"intcalc",
"etexcmds",
"bitset",
"bigintcalc",
"atbegshi-ltx",
"rerunfilecheck",
"ifvtex"
]

let preamble = "\\def\\pgfsysdriver{pgfsys-ximera.def}\\PassOptionsToPackage{dvisvgm}{graphicx}\\PassOptionsToPackage{hypertex}{hyperref}\\RequirePackage{expl3}\\RequirePackage[makeroom]{cancel}" + packages.map( (pkg) => `\\RequirePackage{${pkg}}` ).join('') + tikzlibraries + "\\PassOptionsToClass{web}{ximera}\\let\\abovecaptionskip=\\relax\\let\\belowcaptionskip=\\relax\\let\\maketitle=\\relax\n";

preamble = preamble + "\\documentclass{ximera}\\renewcommand{\\documentclass}[2][]{}\\snapshot\n";
*/
//   let preamble = "";
//   input =
//     //"\\documentclass[margin=0pt]{standalone}" + "\n" +
//     //"\\def\\pgfsysdriver{pgfsys-ximera.def}" + "\n" +
//     //"\\pgfplotsset{compat=1.17}" + "\n" +

//     /*"\\newcommand{\\cubeit}[1]{\\directjs{" + "\n" +
//     "tex.print('$');" + "\n"
//     "tex.print(`#1^3 = ${#1*#1*#1}`);" + "\n"
//     "tex.print('$');" + "\n" +
//     "}}" + "\n" +*/
//     //"\\usepackage{tikz}" + "\n" +
//     preamble + 
//     "\\begin{document}" + "\n" +
    
//     // "\\begin{tikzpicture}" + "\n" +
//     // "\\draw (0,0) circle (1in);" + "\n" +
//     // "\\end{tikzpicture}" + "\n"+
// input +
//     "\\end{document}" + "\n";

  
//   const aux = "\\relax" + "\n" +
// "\\providecommand\\hyper@newdestlabel[2]{}"+ "\n" +
// "\\providecommand\\HyperFirstAtBeginDocument{\\AtBeginDocument}"+ "\n" +
// "\\HyperFirstAtBeginDocument{\\ifx\\hyper@anchor\\@undefined"+ "\n" +
// "\\global\\let\\oldcontentsline\\contentsline"+ "\n" +
// "\\gdef\\contentsline#1#2#3#4{\\oldcontentsline{#1}{#2}{#3}}"+ "\n" +
// "\\global\let\\oldnewlabel\\newlabel"+ "\n" +
// "\\gdef\\newlabel#1#2{\\newlabelxx{#1}#2}"+ "\n" +
// "\\gdef\\newlabelxx#1#2#3#4#5#6{\\oldnewlabel{#1}{{#2}{#3}}}"+ "\n" +
// "\\AtEndDocument{\\ifx\\hyper@anchor\\@undefined"+ "\n" +
// "\\let\\contentsline\\oldcontentsline"+ "\n" +
// "\\let\\newlabel\\oldnewlabel"+ "\n" +
// "\\fi}"+ "\n" +
// "\\fi}"+ "\n" +
// "\\global\\let\\hyper@last\\relax"+ "\n" +
// "\\gdef\\HyperFirstAtBeginDocument#1{#1}"+ "\n" +
// "\\ttl@finishall"+ "\n" +
// "\\gdef \\@abspage@last{1} \n";
  
  
  //const aux = "\\relax " + "\n" +
  //  "\\gdef \\@abspage@last{1}" + "\n";
  const aux = "";

  library.deleteEverything();

  console.log(input);

  //library.writeFileSync("sample.tex", Buffer.from(input));
  //library.writeFileSync("./l3backend-dvips.def", Buffer.from(l3backend_dvips.FileBytes));
  //library.writeFileSync("./cmsl10.tfm", Buffer.from(cmsl10.FileBytes));
  //console.log(fs);

  library.initFs(function () { browserFsReady = true });

  while (!browserFsReady && !coredumpReady) {
    delay(200);
  }

  fs.writeFileSync("./sample.tex", Buffer.from(input));
  fs.writeFileSync("./l3backend-dvips.def", Buffer.from(l3backend_dvips.FileBytes, 'base64'));
  fs.writeFileSync("./l3backend-dvisvgm.def", Buffer.from(l3backend_dvisvgm.FileBytes, 'base64'));
  fs.writeFileSync("./cmsl10.tfm", Buffer.from(cmsl10.FileBytes, 'base64'));
  fs.writeFileSync("./cmex7.tfm", Buffer.from(cmex7.FileBytes, 'base64'));
  //fs.writeFileSync('./sample.aux', Buffer.from(aux));
  //fs.writeFileSync('./fontenc.sty', Buffer.from(fontenc.fontenc));

  let memory = new WebAssembly.Memory({initial: pages, maximum: pages});
  
  let buffer = new Uint8Array( memory.buffer, 0, pages*65536 );
  buffer.set( copy(coredump) );
  
  library.setMemory( memory.buffer );
  library.setInput( " sample.tex \n\\end\n" );
  
  let wasm = await WebAssembly.instantiate(code, { library: library,
                                                      env: { memory: memory }
                                                    });

  //const wasmExports = wasm.instance.exports;
  //library.setWasmExports( wasmExports );
  
  wasm.instance.exports.main();
  
  //await delay(15000);

  let dviData = library.readFileSync("sample.dvi");
  
  //console.log(btoa(unescape(encodeURIComponent(dviData))))

  return dviData;
  //return fs.readFileSync("./sample.dvi");
}

window.onload = async function(){
  await load();
  
  async function process(elt){
    var text = elt.childNodes[0].nodeValue;

    var div = document.createElement('div');    
    
    let dvi = await tex(text);
    
    //console.log(dvi);

    let html = "";  
    const page = new Writable({
      write(chunk, encoding, callback) {
        html = html + chunk.toString();
        console.log("write chunk: " + chunk.toString());
        callback();
      }
    });

    async function* streamBuffer() {
      yield Buffer.from(dvi);
      return;
    }  

    let machine;
    try {
      //page.write('<svg>');
      machine = await dvi2html(Buffer.from(dvi), page); //streamBuffer(), page);
      //page.write('</svg>');
    } catch (err) {
      console.log(err);
    }
    console.log(machine);

    div.style.display = 'flex';

    const width = 154;
    let height = 0;
    
    if (machine) {
      height = Math.max(machine.savedPosition.v, machine.lastOutputHeight) * machine.pointsPerDviUnit;
    }
    //machine.setPapersize(width/3.0, height/3.0);

    const widthPts = width + "pt";
    const heightPts = height + "pt";
    div.style.width = "80%"; //machine.paperwidth.toString() + "pt"; //machine.paperwidth.toString() + "pt"; //widthPts; //machine.paperwidth.toString() + "pt";
    div.style.height = heightPts;//machine.paperheight.toString() + "pt"; //heightPts; //machine.paperheight.toString() + "pt";
    div.style['align-items'] = 'center';
    div.style['justify-content'] = 'center';
    div.style['margin-left'] = '-77pt';
    div.style['margin-top'] = '100pt';
    div.style['max-width'] = '230pt';

    div.innerHTML = html;
    let svg = div.getElementsByTagName('svg');
    //svg[0].setAttribute("width", "100%");//machine.paperwidth.toString() + "pt");//widthPts);//);
    //svg[0].setAttribute("height", "100%");//machine.paperheight.toString() + "pt"); //heightPts);//machine.paperheight.toString() + "pt");
    svg[0].setAttribute("viewBox", `-72 -72 72 72`);//${machine.paperwidth} ${machine.paperheight}`);//${width} ${height}`); //${machine.paperwidth} ${machine.paperheight}`);

    elt.parentNode.replaceChild(div, elt);
  };

  var scripts = document.getElementsByTagName('script');
  var tikzScripts = Array.prototype.slice.call(scripts).filter(
    (e) => (e.getAttribute('type') === 'text/tikz'));

  tikzScripts.reduce( async (promise, element) => {
    await promise;
    return process(element);
  }, Promise.resolve());
};
