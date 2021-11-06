import library from './library';
import tcrm1000 from './tcrm1000.json';
import * as fs from 'fs';

    // Polyfill instantiateStreaming for browsers missing it
    /*    
    if (!WebAssembly.instantiateStreaming) {
            WebAssembly.instantiateStreaming = async (resp, importObject) => {
                    const source = await (await resp).arrayBuffer();
                    return await WebAssembly.instantiate(source, importObject);
            };
        }
    */
    // Create promise to handle Worker calls whilst
    // module is still initialising
    let wasmResolve;
    let wasmReady = new Promise((resolve) => {
        wasmResolve = resolve;
    })

    function copy(src)  {
        var dst = new Uint8Array(src.length);
        dst.set(src);
        return dst;
    }

    // Handle incoming messages
    self.addEventListener('message', function(event) {

        const { eventType, eventData, coredump, input, eventId } = event.data;

        if (eventType === "INITIALISE") {
            let pages = 2500;
            let memory = new WebAssembly.Memory({ initial: pages, maximum: pages });
  
            let buffer = new Uint8Array(memory.buffer, 0, pages * 65536);
            buffer.set(copy(coredump));
            
            library.setMemory(memory.buffer);
            library.setInput(" sample.tex \n\\end\n");

            WebAssembly.instantiate(eventData, { library: library, env: { memory: memory } })
            .then(instantiatedModule => {
                const wasmExports = instantiatedModule.instance.exports;

                // Resolve our exports for when the messages
                // to execute functions come through
                wasmResolve(wasmExports);
                library.deleteEverything();
                library.initFs(function () {
                    
                fs.writeFileSync("./sample.tex", Buffer.from(input));
                fs.writeFileSync('./tcrm1000.tfm', Buffer.from(tcrm1000.FileBytes, 'base64'));

                    // Send back initialised message to main thread
                    self.postMessage({
                        eventType: "INITIALISED",
                        eventData: Object.keys(wasmExports)
                    });
                });
            });
            /*
            WebAssembly.instantiateStreaming(fetch(eventData), ctxObject)
                .then(instantiatedModule => {
                    const wasmExports = instantiatedModule.instance.exports;

                    // Resolve our exports for when the messages
                    // to execute functions come through
                    wasmResolve(wasmExports);

                    // Send back initialised message to main thread
                    self.postMessage({
                        eventType: "INITIALISED",
                        eventData: Object.keys(wasmExports)
                    });
        
                });
            */
        } else if (eventType === "CALL") {
            wasmReady
                .then((wasmInstance) => {
                    const method = wasmInstance[eventData.method];
                    const result = method.apply(null, eventData.arguments);
                    self.postMessage({
                        eventType: "RESULT",
                        eventData: fs.readFileSync("./sample.dvi"),
                        eventId: eventId
                    });
                })
                .catch((error) => {
                    self.postMessage({
                        eventType: "ERROR",
                        eventData: "An error occured executing WASM instance function: " + error.toString(),
                        eventId: eventId
                    });
                })
        }

    }, false);