import { dvi2html } from './dvi2html/src/index';
import { Writable } from 'stream';

//import { ReadableStream } from "web-streams-polyfill";
import fetchStream from 'fetch-readablestream';
import pako from 'pako';

/*
import cmsl10 from './cmsl10.json';
import cmex7 from './cmex7.json';
import cmbx7 from './cmbx7.json';
import cmbx10 from './cmbx10.json';
import tcrm1000 from './tcrm1000.json';
import ifthen from './ifthen.json';
import amsmath from './amsmath.json';
*/


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


async function load() {

  let tex = await fetch(urlRoot + '/ef253ef29e2f057334f77ead7f06ed8f22607d38.wasm');
  code = await tex.arrayBuffer();
  
  const decompressed = new Uint8Array(
    await fetch(urlRoot + '/7620f557a41f2bf40820e76ba1fd4d89a484859d.gz').then(res => res.arrayBuffer())
  );

  coredump = new Uint8Array(decompressed, 0, pages * 65536);
}



/*
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
*/

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

  console.log(input);

  return new Promise((resolve, reject) => {
    wasmWorker(code, coredump, input)
      .then((wasmProxyInstance) => {
        wasmProxyInstance.main()
          .then((result) => {
            console.log('finished render ');
            console.log(result);
            return resolve(result);
          })
          .catch((error) => {
            console.error(error);
            return reject(error);
          });
      });
  });
}

window.onload = async function(){
  await load();
  
  async function process(elt){
    var text = elt.childNodes[0].nodeValue;

    var div = document.createElement('div');    
    
    let dvi = await tex(text);
    
    console.log('done dvi');
    console.log(dvi);

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
      machine = await dvi2html(Buffer.from(dvi), page); //streamBuffer(), page);
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

function wasmWorker(wasmArrayBuffer, coredump, input) {

  // Create an object to later interact with 
  const proxy = {};

  // Keep track of the messages being sent
  // so we can resolve them correctly
  let id = 0;
  let idPromises = {};

  return new Promise((resolve, reject) => {
    const worker = new Worker(urlRoot + '/tikzjax-worker.js');
    worker.postMessage({eventType: "INITIALISE", eventData: wasmArrayBuffer, coredump: coredump, input: input});
    worker.addEventListener('message', function(event) {

      const { eventType, eventData, eventId } = event.data;

      if (eventType === "INITIALISED") {
        const methods = event.data.eventData;
        methods.forEach((method) => {
          proxy[method] = function() {
            return new Promise((resolve, reject) => {
              worker.postMessage({
                  eventType: "CALL",
                  eventData: {
                    method: method,
                    arguments: Array.from(arguments) // arguments is not an array
                },
                eventId: id
              });

              idPromises[id] = { resolve, reject };
              id++
            });
          }
        });
        resolve(proxy);
        return;
      } else if (eventType === "RESULT") {
        if (eventId !== undefined && idPromises[eventId]) {
          idPromises[eventId].resolve(eventData);
          delete idPromises[eventId];
        }
      } else if (eventType === "ERROR") {
        if (eventId !== undefined && idPromises[eventId]) {
          idPromises[eventId].reject(event.data.eventData);
          delete idPromises[eventId];
        }
      }
        
    });

    worker.addEventListener("error", function(error) {
      reject(error);
    });
  })

}
