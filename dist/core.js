var Module = typeof Module !== "undefined" ? Module : {};

var objAssign = Object.assign;

var moduleOverrides = objAssign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = function(status, toThrow) {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = false;

var ENVIRONMENT_IS_WORKER = true;

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary, setWindowTitle;

if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document !== "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 {
  read_ = function(url) {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(xhr.response);
   };
  }
  readAsync = function(url, onload, onerror) {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = function() {
    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
 setWindowTitle = function(title) {
  document.title = title;
 };
} else {}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.warn.bind(console);

objAssign(Module, moduleOverrides);

moduleOverrides = null;

if (Module["arguments"]) arguments_ = Module["arguments"];

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

if (Module["quit"]) quit_ = Module["quit"];

var STACK_ALIGN = 16;

function warnOnce(text) {
 if (!warnOnce.shown) warnOnce.shown = {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  err(text);
 }
}

function convertJsFunctionToWasm(func, sig) {
 if (typeof WebAssembly.Function === "function") {
  var typeNames = {
   "i": "i32",
   "j": "i64",
   "f": "f32",
   "d": "f64"
  };
  var type = {
   parameters: [],
   results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
  };
  for (var i = 1; i < sig.length; ++i) {
   type.parameters.push(typeNames[sig[i]]);
  }
  return new WebAssembly.Function(type, func);
 }
 var typeSection = [ 1, 0, 1, 96 ];
 var sigRet = sig.slice(0, 1);
 var sigParam = sig.slice(1);
 var typeCodes = {
  "i": 127,
  "j": 126,
  "f": 125,
  "d": 124
 };
 typeSection.push(sigParam.length);
 for (var i = 0; i < sigParam.length; ++i) {
  typeSection.push(typeCodes[sigParam[i]]);
 }
 if (sigRet == "v") {
  typeSection.push(0);
 } else {
  typeSection = typeSection.concat([ 1, typeCodes[sigRet] ]);
 }
 typeSection[1] = typeSection.length - 2;
 var bytes = new Uint8Array([ 0, 97, 115, 109, 1, 0, 0, 0 ].concat(typeSection, [ 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0 ]));
 var module = new WebAssembly.Module(bytes);
 var instance = new WebAssembly.Instance(module, {
  "e": {
   "f": func
  }
 });
 var wrappedFunc = instance.exports["f"];
 return wrappedFunc;
}

var freeTableIndexes = [];

var functionsInTableMap;

function getEmptyTableSlot() {
 if (freeTableIndexes.length) {
  return freeTableIndexes.pop();
 }
 try {
  wasmTable.grow(1);
 } catch (err) {
  if (!(err instanceof RangeError)) {
   throw err;
  }
  throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
 }
 return wasmTable.length - 1;
}

function updateTableMap(offset, count) {
 for (var i = offset; i < offset + count; i++) {
  var item = getWasmTableEntry(i);
  if (item) {
   functionsInTableMap.set(item, i);
  }
 }
}

function addFunction(func, sig) {
 if (!functionsInTableMap) {
  functionsInTableMap = new WeakMap();
  updateTableMap(0, wasmTable.length);
 }
 if (functionsInTableMap.has(func)) {
  return functionsInTableMap.get(func);
 }
 var ret = getEmptyTableSlot();
 try {
  setWasmTableEntry(ret, func);
 } catch (err) {
  if (!(err instanceof TypeError)) {
   throw err;
  }
  var wrapped = convertJsFunctionToWasm(func, sig);
  setWasmTableEntry(ret, wrapped);
 }
 functionsInTableMap.set(func, ret);
 return ret;
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
 tempRet0 = value;
};

var getTempRet0 = function() {
 return tempRet0;
};

var dynamicLibraries = Module["dynamicLibraries"] || [];

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

var noExitRuntime = Module["noExitRuntime"] || true;

if (typeof WebAssembly !== "object") {
 abort("no native wasm support detected");
}

var wasmMemory;

var ABORT = false;

var EXITSTATUS;

function assert(condition, text) {
 if (!condition) {
  abort(text);
 }
}

var ALLOC_STACK = 1;

function allocate(slab, allocator) {
 var ret;
 if (allocator == ALLOC_STACK) {
  ret = stackAlloc(slab.length);
 } else {
  ret = _malloc(slab.length);
 }
 if (slab.subarray || slab.slice) {
  HEAPU8.set(slab, ret);
 } else {
  HEAPU8.set(new Uint8Array(slab), ret);
 }
 return ret;
}

var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(heap, idx, maxBytesToRead) {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(heap.subarray(idx, endPtr));
 } else {
  var str = "";
  while (idx < endPtr) {
   var u0 = heap[idx++];
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   var u1 = heap[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   var u2 = heap[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63;
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
 return str;
}

function UTF8ToString(ptr, maxBytesToRead) {
 return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | u1 & 1023;
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++] = 192 | u >> 6;
   heap[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++] = 224 | u >> 12;
   heap[outIdx++] = 128 | u >> 6 & 63;
   heap[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 3 >= endIdx) break;
   heap[outIdx++] = 240 | u >> 18;
   heap[outIdx++] = 128 | u >> 12 & 63;
   heap[outIdx++] = 128 | u >> 6 & 63;
   heap[outIdx++] = 128 | u & 63;
  }
 }
 heap[outIdx] = 0;
 return outIdx - startIdx;
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4;
 }
 return len;
}

function allocateUTF8(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function allocateUTF8OnStack(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function writeArrayToMemory(array, buffer) {
 HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}

function alignUp(x, multiple) {
 if (x % multiple > 0) {
  x += multiple - x % multiple;
 }
 return x;
}

var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
 buffer = buf;
 Module["HEAP8"] = HEAP8 = new Int8Array(buf);
 Module["HEAP16"] = HEAP16 = new Int16Array(buf);
 Module["HEAP32"] = HEAP32 = new Int32Array(buf);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;

if (Module["wasmMemory"]) {
 wasmMemory = Module["wasmMemory"];
} else {
 wasmMemory = new WebAssembly.Memory({
  "initial": INITIAL_MEMORY / 65536,
  "maximum": 2147483648 / 65536
 });
}

if (wasmMemory) {
 buffer = wasmMemory.buffer;
}

INITIAL_MEMORY = buffer.byteLength;

updateGlobalBufferAndViews(buffer);

var wasmTable = new WebAssembly.Table({
 "initial": 420,
 "element": "anyfunc"
});

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATMAIN__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

var runtimeExited = false;

var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
 return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
 callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
 runtimeExited = true;
}

function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

Module["preloadedImages"] = {};

Module["preloadedAudios"] = {};

Module["preloadedWasm"] = {};

function abort(what) {
 {
  if (Module["onAbort"]) {
   Module["onAbort"](what);
  }
 }
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 what += ". Build with -s ASSERTIONS=1 for more info.";
 var e = new WebAssembly.RuntimeError(what);
 throw e;
}

var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
 return filename.startsWith(dataURIPrefix);
}

var wasmBinaryFile;

wasmBinaryFile = "core.wasm";

if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
 try {
  if (file == wasmBinaryFile && wasmBinary) {
   return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
   return readBinary(file);
  } else {
   throw "both async and sync fetching of the wasm failed";
  }
 } catch (err) {
  abort(err);
 }
}

function getBinaryPromise() {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch === "function") {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    if (!response["ok"]) {
     throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
    }
    return response["arrayBuffer"]();
   }).catch(function() {
    return getBinary(wasmBinaryFile);
   });
  }
 }
 return Promise.resolve().then(function() {
  return getBinary(wasmBinaryFile);
 });
}

function createWasm() {
 var info = {
  "env": asmLibraryArg,
  "wasi_snapshot_preview1": asmLibraryArg,
  "GOT.mem": new Proxy(asmLibraryArg, GOTHandler),
  "GOT.func": new Proxy(asmLibraryArg, GOTHandler)
 };
 function receiveInstance(instance, module) {
  var exports = instance.exports;
  exports = relocateExports(exports, 1024);
  Module["asm"] = exports;
  var metadata = getDylinkMetadata(module);
  if (metadata.neededDynlibs) {
   dynamicLibraries = metadata.neededDynlibs.concat(dynamicLibraries);
  }
  mergeLibSymbols(exports, "main");
  addOnInit(Module["asm"]["__wasm_call_ctors"]);
  removeRunDependency("wasm-instantiate");
 }
 addRunDependency("wasm-instantiate");
 function receiveInstantiationResult(result) {
  receiveInstance(result["instance"], result["module"]);
 }
 function instantiateArrayBuffer(receiver) {
  return getBinaryPromise().then(function(binary) {
   return WebAssembly.instantiate(binary, info);
  }).then(function(instance) {
   return instance;
  }).then(receiver, function(reason) {
   err("failed to asynchronously prepare wasm: " + reason);
   abort(reason);
  });
 }
 function instantiateAsync() {
  if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    var result = WebAssembly.instantiateStreaming(response, info);
    return result.then(receiveInstantiationResult, function(reason) {
     err("wasm streaming compile failed: " + reason);
     err("falling back to ArrayBuffer instantiation");
     return instantiateArrayBuffer(receiveInstantiationResult);
    });
   });
  } else {
   return instantiateArrayBuffer(receiveInstantiationResult);
  }
 }
 if (Module["instantiateWasm"]) {
  try {
   var exports = Module["instantiateWasm"](info, receiveInstance);
   return exports;
  } catch (e) {
   err("Module.instantiateWasm callback failed with error: " + e);
   return false;
  }
 }
 instantiateAsync();
 return {};
}

var tempDouble;

var tempI64;

var GOT = {};

var GOTHandler = {
 get: function(obj, symName) {
  if (!GOT[symName]) {
   GOT[symName] = new WebAssembly.Global({
    "value": "i32",
    "mutable": true
   });
  }
  return GOT[symName];
 }
};

function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback(Module);
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    getWasmTableEntry(func)();
   } else {
    getWasmTableEntry(func)(callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}

function getDylinkMetadata(binary) {
 var offset = 0;
 var end = 0;
 function getU8() {
  return binary[offset++];
 }
 function getLEB() {
  var ret = 0;
  var mul = 1;
  while (1) {
   var byte = binary[offset++];
   ret += (byte & 127) * mul;
   mul *= 128;
   if (!(byte & 128)) break;
  }
  return ret;
 }
 function getString() {
  var len = getLEB();
  offset += len;
  return UTF8ArrayToString(binary, offset - len, len);
 }
 function failIf(condition, message) {
  if (condition) throw new Error(message);
 }
 var name = "dylink.0";
 if (binary instanceof WebAssembly.Module) {
  var dylinkSection = WebAssembly.Module.customSections(binary, name);
  if (dylinkSection.length === 0) {
   name = "dylink";
   dylinkSection = WebAssembly.Module.customSections(binary, name);
  }
  failIf(dylinkSection.length === 0, "need dylink section");
  binary = new Uint8Array(dylinkSection[0]);
  end = binary.length;
 } else {
  var int32View = new Uint32Array(new Uint8Array(binary.subarray(0, 24)).buffer);
  failIf(int32View[0] != 1836278016, "need to see wasm magic number");
  failIf(binary[8] !== 0, "need the dylink section to be first");
  offset = 9;
  var section_size = getLEB();
  end = offset + section_size;
  name = getString();
 }
 var customSection = {
  neededDynlibs: [],
  tlsExports: {}
 };
 if (name == "dylink") {
  customSection.memorySize = getLEB();
  customSection.memoryAlign = getLEB();
  customSection.tableSize = getLEB();
  customSection.tableAlign = getLEB();
  var neededDynlibsCount = getLEB();
  for (var i = 0; i < neededDynlibsCount; ++i) {
   var name = getString();
   // customSection.neededDynlibs.push(name);
  }
 } else {
  failIf(name !== "dylink.0");
  var WASM_DYLINK_MEM_INFO = 1;
  var WASM_DYLINK_NEEDED = 2;
  var WASM_DYLINK_EXPORT_INFO = 3;
  var WASM_SYMBOL_TLS = 256;
  while (offset < end) {
   var subsectionType = getU8();
   var subsectionSize = getLEB();
   if (subsectionType === WASM_DYLINK_MEM_INFO) {
    customSection.memorySize = getLEB();
    customSection.memoryAlign = getLEB();
    customSection.tableSize = getLEB();
    customSection.tableAlign = getLEB();
   } else if (subsectionType === WASM_DYLINK_NEEDED) {
    var neededDynlibsCount = getLEB();
    for (var i = 0; i < neededDynlibsCount; ++i) {
     var name = getString();
     // customSection.neededDynlibs.push(name);
    }
   } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
    var count = getLEB();
    while (count--) {
     var name = getString();
     var flags = getLEB();
     if (flags & WASM_SYMBOL_TLS) {
      customSection.tlsExports[name] = 1;
     }
    }
   } else {
    offset += subsectionSize;
   }
  }
 }
 return customSection;
}

function getWasmTableEntry(funcPtr) {
 return wasmTable.get(funcPtr);
}

function handleException(e) {
 if (e instanceof ExitStatus || e == "unwind") {
  return EXITSTATUS;
 }
 quit_(1, e);
}

function jsStackTrace() {
 var error = new Error();
 if (!error.stack) {
  try {
   throw new Error();
  } catch (e) {
   error = e;
  }
  if (!error.stack) {
   return "(no stack trace available)";
  }
 }
 return error.stack.toString();
}

function asmjsMangle(x) {
 var unmangledSymbols = [ "stackAlloc", "stackSave", "stackRestore" ];
 return x.indexOf("dynCall_") == 0 || unmangledSymbols.includes(x) ? x : "_" + x;
}

function mergeLibSymbols(exports, libName) {
 for (var sym in exports) {
  if (!exports.hasOwnProperty(sym)) {
   continue;
  }
  if (!asmLibraryArg.hasOwnProperty(sym)) {
   asmLibraryArg[sym] = exports[sym];
  }
  var module_sym = asmjsMangle(sym);
  if (!Module.hasOwnProperty(module_sym)) {
   Module[module_sym] = exports[sym];
  }
 }
}

var LDSO = {
 loadedLibsByName: {},
 loadedLibsByHandle: {}
};

function dynCallLegacy(sig, ptr, args) {
 var f = Module["dynCall_" + sig];
 return args && args.length ? f.apply(null, [ ptr ].concat(args)) : f.call(null, ptr);
}

function dynCall(sig, ptr, args) {
 if (sig.includes("j")) {
  return dynCallLegacy(sig, ptr, args);
 }
 return getWasmTableEntry(ptr).apply(null, args);
}

function createInvokeFunction(sig) {
 return function() {
  var sp = stackSave();
  try {
   return dynCall(sig, arguments[0], Array.prototype.slice.call(arguments, 1));
  } catch (e) {
   stackRestore(sp);
   if (e !== e + 0 && e !== "longjmp") throw e;
   _setThrew(1, 0);
  }
 };
}

var ___heap_base = 5281616;

function getMemory(size) {
 if (runtimeInitialized) return _malloc(size);
 var ret = ___heap_base;
 var end = ret + size + 15 & -16;
 ___heap_base = end;
 GOT["__heap_base"].value = end;
 return ret;
}

function isInternalSym(symName) {
 return [ "__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors" ].includes(symName);
}

function updateGOT(exports, replace) {
 for (var symName in exports) {
  if (isInternalSym(symName)) {
   continue;
  }
  var value = exports[symName];
  if (symName.startsWith("orig$")) {
   symName = symName.split("$")[1];
   replace = true;
  }
  if (!GOT[symName]) {
   GOT[symName] = new WebAssembly.Global({
    "value": "i32",
    "mutable": true
   });
  }
  if (replace || GOT[symName].value == 0) {
   if (typeof value === "function") {
    GOT[symName].value = addFunction(value);
   } else if (typeof value === "number") {
    GOT[symName].value = value;
   } else if (typeof value === "bigint") {
    GOT[symName].value = Number(value);
   } else {
    err("unhandled export type for `" + symName + "`: " + typeof value);
   }
  }
 }
}

function relocateExports(exports, memoryBase, replace) {
 var relocated = {};
 for (var e in exports) {
  var value = exports[e];
  if (typeof value === "object") {
   value = value.value;
  }
  if (typeof value === "number") {
   value += memoryBase;
  }
  relocated[e] = value;
 }
 updateGOT(relocated, replace);
 return relocated;
}

function resolveGlobalSymbol(symName, direct) {
 var sym;
 if (direct) {
  sym = asmLibraryArg["orig$" + symName];
 }
 if (!sym) {
  sym = asmLibraryArg[symName];
 }
 if (!sym) {
  sym = Module[asmjsMangle(symName)];
 }
 if (!sym && symName.startsWith("invoke_")) {
  sym = createInvokeFunction(symName.split("_")[1]);
 }
 return sym;
}

function alignMemory(size, alignment) {
 return Math.ceil(size / alignment) * alignment;
}

function loadWebAssemblyModule(binary, flags, handle) {
 var metadata = getDylinkMetadata(binary);
 function loadModule() {
  var needsAllocation = !handle || !HEAP8[handle + 24 >> 0];
  if (needsAllocation) {
   var memAlign = Math.pow(2, metadata.memoryAlign);
   memAlign = Math.max(memAlign, STACK_ALIGN);
   var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0;
   var tableBase = metadata.tableSize ? wasmTable.length : 0;
   if (handle) {
    HEAP8[handle + 24 >> 0] = 1;
    HEAP32[handle + 28 >> 2] = memoryBase;
    HEAP32[handle + 32 >> 2] = metadata.memorySize;
    HEAP32[handle + 36 >> 2] = tableBase;
    HEAP32[handle + 40 >> 2] = metadata.tableSize;
   }
  } else {
   memoryBase = HEAP32[handle + 28 >> 2];
   tableBase = HEAP32[handle + 36 >> 2];
  }
  var tableGrowthNeeded = tableBase + metadata.tableSize - wasmTable.length;
  if (tableGrowthNeeded > 0) {
   wasmTable.grow(tableGrowthNeeded);
  }
  var moduleExports;
  function resolveSymbol(sym) {
   var resolved = resolveGlobalSymbol(sym, false);
   if (!resolved) {
    resolved = moduleExports[sym];
   }
   return resolved;
  }
  var proxyHandler = {
   "get": function(stubs, prop) {
    switch (prop) {
    case "__memory_base":
     return memoryBase;

    case "__table_base":
     return tableBase;
    }
    if (prop in asmLibraryArg) {
     return asmLibraryArg[prop];
    }
    if (!(prop in stubs)) {
     var resolved;
     stubs[prop] = function() {
      if (!resolved) resolved = resolveSymbol(prop, true);
      return resolved.apply(null, arguments);
     };
    }
    return stubs[prop];
   }
  };
  var proxy = new Proxy({}, proxyHandler);
  var info = {
   "GOT.mem": new Proxy({}, GOTHandler),
   "GOT.func": new Proxy({}, GOTHandler),
   "env": proxy,
   wasi_snapshot_preview1: proxy
  };
  function postInstantiation(instance) {
   updateTableMap(tableBase, metadata.tableSize);
   moduleExports = relocateExports(instance.exports, memoryBase);
   if (!flags.allowUndefined) {
    reportUndefinedSymbols();
   }
   var init = moduleExports["__wasm_call_ctors"];
   if (init) {
    if (runtimeInitialized) {
     init();
    } else {
     __ATINIT__.push(init);
    }
   }
   return moduleExports;
  }
  if (flags.loadAsync) {
   if (binary instanceof WebAssembly.Module) {
    var instance = new WebAssembly.Instance(binary, info);
    return Promise.resolve(postInstantiation(instance));
   }
   return WebAssembly.instantiate(binary, info).then(function(result) {
    return postInstantiation(result.instance);
   });
  }
  var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
  var instance = new WebAssembly.Instance(module, info);
  return postInstantiation(instance);
 }
 if (flags.loadAsync) {
  return metadata.neededDynlibs.reduce(function(chain, dynNeeded) {
   return chain.then(function() {
    return loadDynamicLibrary(dynNeeded, flags);
   });
  }, Promise.resolve()).then(function() {
   return loadModule();
  });
 }
 metadata.neededDynlibs.forEach(function(dynNeeded) {
  loadDynamicLibrary(dynNeeded, flags);
 });
 return loadModule();
}

function loadDynamicLibrary(lib, flags, handle) {
 if (lib == "__main__" && !LDSO.loadedLibsByName[lib]) {
  LDSO.loadedLibsByName[lib] = {
   refcount: Infinity,
   name: "__main__",
   module: Module["asm"],
   global: true
  };
 }
 flags = flags || {
  global: true,
  nodelete: true
 };
 var dso = LDSO.loadedLibsByName[lib];
 if (dso) {
  if (flags.global && !dso.global) {
   dso.global = true;
   if (dso.module !== "loading") {
    mergeLibSymbols(dso.module, lib);
   }
  }
  if (flags.nodelete && dso.refcount !== Infinity) {
   dso.refcount = Infinity;
  }
  dso.refcount++;
  if (handle) {
   LDSO.loadedLibsByHandle[handle] = dso;
  }
  return flags.loadAsync ? Promise.resolve(true) : true;
 }
 dso = {
  refcount: flags.nodelete ? Infinity : 1,
  name: lib,
  module: "loading",
  global: flags.global
 };
 LDSO.loadedLibsByName[lib] = dso;
 if (handle) {
  LDSO.loadedLibsByHandle[handle] = dso;
 }
 function loadLibData(libFile) {
  if (flags.fs && flags.fs.findObject(libFile)) {
   var libData = flags.fs.readFile(libFile, {
    encoding: "binary"
   });
   if (!(libData instanceof Uint8Array)) {
    libData = new Uint8Array(libData);
   }
   return flags.loadAsync ? Promise.resolve(libData) : libData;
  }
  if (flags.loadAsync) {
   return new Promise(function(resolve, reject) {
    readAsync(libFile, function(data) {
     resolve(new Uint8Array(data));
    }, reject);
   });
  }
  if (!readBinary) {
   throw new Error(libFile + ": file not found, and synchronous loading of external files is not available");
  }
  return readBinary(libFile);
 }
 function getLibModule() {
  if (Module["preloadedWasm"] !== undefined && Module["preloadedWasm"][lib] !== undefined) {
   var libModule = Module["preloadedWasm"][lib];
   return flags.loadAsync ? Promise.resolve(libModule) : libModule;
  }
  if (flags.loadAsync) {
   return loadLibData(lib).then(function(libData) {
    return loadWebAssemblyModule(libData, flags, handle);
   });
  }
  return loadWebAssemblyModule(loadLibData(lib), flags, handle);
 }
 function moduleLoaded(libModule) {
  if (dso.global) {
   mergeLibSymbols(libModule, lib);
  }
  dso.module = libModule;
 }
 if (flags.loadAsync) {
  return getLibModule().then(function(libModule) {
   moduleLoaded(libModule);
   return true;
  });
 }
 moduleLoaded(getLibModule());
 return true;
}

function reportUndefinedSymbols() {
 for (var symName in GOT) {
  if (GOT[symName].value == 0) {
   var value = resolveGlobalSymbol(symName, true);
   if (typeof value === "function") {
    GOT[symName].value = addFunction(value, value.sig);
   } else if (typeof value === "number") {
    GOT[symName].value = value;
   } else {
    throw new Error("bad export type for `" + symName + "`: " + typeof value);
   }
  }
 }
}

function preloadDylibs() {
 if (!dynamicLibraries.length) {
  reportUndefinedSymbols();
  return;
 }
 addRunDependency("preloadDylibs");
 dynamicLibraries.reduce(function(chain, lib) {
  return chain.then(function() {
   return loadDynamicLibrary(lib, {
    loadAsync: true,
    global: true,
    nodelete: true,
    allowUndefined: true
   });
  });
 }, Promise.resolve()).then(function() {
  reportUndefinedSymbols();
  removeRunDependency("preloadDylibs");
 });
}

function setWasmTableEntry(idx, func) {
 wasmTable.set(idx, func);
}

function ___assert_fail(condition, filename, line, func) {
 abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
}

___assert_fail.sig = "viiii";

function ___cxa_allocate_exception(size) {
 return _malloc(size + 16) + 16;
}

Module["___cxa_allocate_exception"] = ___cxa_allocate_exception;

___cxa_allocate_exception.sig = "vi";

function _atexit(func, arg) {}

_atexit.sig = "iii";

function ___cxa_atexit(a0, a1) {
 return _atexit(a0, a1);
}

___cxa_atexit.sig = "iii";

function ExceptionInfo(excPtr) {
 this.excPtr = excPtr;
 this.ptr = excPtr - 16;
 this.set_type = function(type) {
  HEAP32[this.ptr + 4 >> 2] = type;
 };
 this.get_type = function() {
  return HEAP32[this.ptr + 4 >> 2];
 };
 this.set_destructor = function(destructor) {
  HEAP32[this.ptr + 8 >> 2] = destructor;
 };
 this.get_destructor = function() {
  return HEAP32[this.ptr + 8 >> 2];
 };
 this.set_refcount = function(refcount) {
  HEAP32[this.ptr >> 2] = refcount;
 };
 this.set_caught = function(caught) {
  caught = caught ? 1 : 0;
  HEAP8[this.ptr + 12 >> 0] = caught;
 };
 this.get_caught = function() {
  return HEAP8[this.ptr + 12 >> 0] != 0;
 };
 this.set_rethrown = function(rethrown) {
  rethrown = rethrown ? 1 : 0;
  HEAP8[this.ptr + 13 >> 0] = rethrown;
 };
 this.get_rethrown = function() {
  return HEAP8[this.ptr + 13 >> 0] != 0;
 };
 this.init = function(type, destructor) {
  this.set_type(type);
  this.set_destructor(destructor);
  this.set_refcount(0);
  this.set_caught(false);
  this.set_rethrown(false);
 };
 this.add_ref = function() {
  var value = HEAP32[this.ptr >> 2];
  HEAP32[this.ptr >> 2] = value + 1;
 };
 this.release_ref = function() {
  var prev = HEAP32[this.ptr >> 2];
  HEAP32[this.ptr >> 2] = prev - 1;
  return prev === 1;
 };
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

function ___cxa_throw(ptr, type, destructor) {
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = ptr;
 uncaughtExceptionCount++;
 throw ptr;
}

Module["___cxa_throw"] = ___cxa_throw;

___cxa_throw.sig = "viii";

function _gmtime_r(time, tmPtr) {
 var date = new Date(HEAP32[time >> 2] * 1e3);
 HEAP32[tmPtr >> 2] = date.getUTCSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
 HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
 HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
 HEAP32[tmPtr + 36 >> 2] = 0;
 HEAP32[tmPtr + 32 >> 2] = 0;
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 if (!_gmtime_r.GMTString) _gmtime_r.GMTString = allocateUTF8("GMT");
 HEAP32[tmPtr + 40 >> 2] = _gmtime_r.GMTString;
 return tmPtr;
}

_gmtime_r.sig = "iii";

function ___gmtime_r(a0, a1) {
 return _gmtime_r(a0, a1);
}

___gmtime_r.sig = "iii";

function _tzset_impl() {
 var currentYear = new Date().getFullYear();
 var winter = new Date(currentYear, 0, 1);
 var summer = new Date(currentYear, 6, 1);
 var winterOffset = winter.getTimezoneOffset();
 var summerOffset = summer.getTimezoneOffset();
 var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
 HEAP32[__get_timezone() >> 2] = stdTimezoneOffset * 60;
 HEAP32[__get_daylight() >> 2] = Number(winterOffset != summerOffset);
 function extractZone(date) {
  var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
  return match ? match[1] : "GMT";
 }
 var winterName = extractZone(winter);
 var summerName = extractZone(summer);
 var winterNamePtr = allocateUTF8(winterName);
 var summerNamePtr = allocateUTF8(summerName);
 if (summerOffset < winterOffset) {
  HEAP32[__get_tzname() >> 2] = winterNamePtr;
  HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr;
 } else {
  HEAP32[__get_tzname() >> 2] = summerNamePtr;
  HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr;
 }
}

_tzset_impl.sig = "v";

function _tzset() {
 if (_tzset.called) return;
 _tzset.called = true;
 _tzset_impl();
}

_tzset.sig = "v";

function _localtime_r(time, tmPtr) {
 _tzset();
 var date = new Date(HEAP32[time >> 2] * 1e3);
 HEAP32[tmPtr >> 2] = date.getSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getHours();
 HEAP32[tmPtr + 12 >> 2] = date.getDate();
 HEAP32[tmPtr + 16 >> 2] = date.getMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var start = new Date(date.getFullYear(), 0, 1);
 var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
 HEAP32[tmPtr + 32 >> 2] = dst;
 var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
 HEAP32[tmPtr + 40 >> 2] = zonePtr;
 return tmPtr;
}

_localtime_r.sig = "iii";

function ___localtime_r(a0, a1) {
 return _localtime_r(a0, a1);
}

___localtime_r.sig = "iii";

var ___memory_base = new WebAssembly.Global({
 "value": "i32",
 "mutable": false
}, 1024);

Module["___memory_base"] = ___memory_base;

var ___stack_pointer = new WebAssembly.Global({
 "value": "i32",
 "mutable": true
}, 5281616);

Module["___stack_pointer"] = ___stack_pointer;

function setErrNo(value) {
 HEAP32[___errno_location() >> 2] = value;
 return value;
}

var SYSCALLS = {
 mappings: {},
 DEFAULT_POLLMASK: 5,
 calculateAt: function(dirfd, path, allowEmpty) {
  if (path[0] === "/") {
   return path;
  }
  var dir;
  if (dirfd === -100) {
   dir = FS.cwd();
  } else {
   var dirstream = FS.getStream(dirfd);
   if (!dirstream) throw new FS.ErrnoError(8);
   dir = dirstream.path;
  }
  if (path.length == 0) {
   if (!allowEmpty) {
    throw new FS.ErrnoError(44);
   }
   return dir;
  }
  return PATH.join2(dir, path);
 },
 doStat: function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -54;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = 0;
  HEAP32[buf + 8 >> 2] = stat.ino;
  HEAP32[buf + 12 >> 2] = stat.mode;
  HEAP32[buf + 16 >> 2] = stat.nlink;
  HEAP32[buf + 20 >> 2] = stat.uid;
  HEAP32[buf + 24 >> 2] = stat.gid;
  HEAP32[buf + 28 >> 2] = stat.rdev;
  HEAP32[buf + 32 >> 2] = 0;
  tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
  HEAP32[buf + 48 >> 2] = 4096;
  HEAP32[buf + 52 >> 2] = stat.blocks;
  HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
  HEAP32[buf + 60 >> 2] = 0;
  HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
  HEAP32[buf + 68 >> 2] = 0;
  HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
  HEAP32[buf + 76 >> 2] = 0;
  tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
  return 0;
 },
 doMsync: function(addr, stream, len, flags, offset) {
  var buffer = HEAPU8.slice(addr, addr + len);
  FS.msync(stream, buffer, offset, len, flags);
 },
 doMkdir: function(path, mode) {
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 },
 doMknod: function(path, mode, dev) {
  switch (mode & 61440) {
  case 32768:
  case 8192:
  case 24576:
  case 4096:
  case 49152:
   break;

  default:
   return -28;
  }
  FS.mknod(path, mode, dev);
  return 0;
 },
 doReadlink: function(path, buf, bufsize) {
  if (bufsize <= 0) return -28;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 },
 doAccess: function(path, amode) {
  if (amode & ~7) {
   return -28;
  }
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node) {
   return -44;
  }
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -2;
  }
  return 0;
 },
 doDup: function(path, flags, suggestFD) {
  var suggest = FS.getStream(suggestFD);
  if (suggest) FS.close(suggest);
  return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
 },
 doReadv: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.read(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
   if (curr < len) break;
  }
  return ret;
 },
 doWritev: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.write(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
  }
  return ret;
 },
 varargs: undefined,
 get: function() {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 },
 getStr: function(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 },
 getStreamFromFD: function(fd) {
  var stream = FS.getStream(fd);
  if (!stream) throw new FS.ErrnoError(8);
  return stream;
 },
 get64: function(low, high) {
  return low;
 }
};

function ___syscall_fcntl64(fd, cmd, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -28;
    }
    var newStream;
    newStream = FS.open(stream.path, stream.flags, 0, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 5:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }

  case 6:
  case 7:
   return 0;

  case 16:
  case 8:
   return -28;

  case 9:
   setErrNo(28);
   return -1;

  default:
   {
    return -28;
   }
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_ioctl(fd, op, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (op) {
  case 21509:
  case 21505:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -59;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -59;
    return -28;
   }

  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  default:
   abort("bad ioctl syscall " + op);
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_mkdir(path, mode) {
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doMkdir(path, mode);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_open(path, flags, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pathname = SYSCALLS.getStr(path);
  var mode = varargs ? SYSCALLS.get() : 0;
  var stream = FS.open(pathname, flags, mode);
  return stream.fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

var ___table_base = new WebAssembly.Global({
 "value": "i32",
 "mutable": false
}, 1);

Module["___table_base"] = ___table_base;

function _abort() {
 abort("");
}

_abort.sig = "v";

function _clock() {
 if (_clock.start === undefined) _clock.start = Date.now();
 return (Date.now() - _clock.start) * (1e6 / 1e3) | 0;
}

Module["_clock"] = _clock;

_clock.sig = "i";

function _emscripten_get_heap_max() {
 return 2147483648;
}

function reallyNegative(x) {
 return x < 0 || x === 0 && 1 / x === -Infinity;
}

function convertI32PairToI53(lo, hi) {
 return (lo >>> 0) + hi * 4294967296;
}

function convertU32PairToI53(lo, hi) {
 return (lo >>> 0) + (hi >>> 0) * 4294967296;
}

function reSign(value, bits) {
 if (value <= 0) {
  return value;
 }
 var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
 if (value >= half && (bits <= 32 || value > half)) {
  value = -2 * half + value;
 }
 return value;
}

function unSign(value, bits) {
 if (value >= 0) {
  return value;
 }
 return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
}

function formatString(format, varargs) {
 var textIndex = format;
 var argIndex = varargs;
 function prepVararg(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    ptr += 4;
   }
  } else {}
  return ptr;
 }
 function getNextArg(type) {
  var ret;
  argIndex = prepVararg(argIndex, type);
  if (type === "double") {
   ret = Number(HEAPF64[argIndex >> 3]);
   argIndex += 8;
  } else if (type == "i64") {
   ret = [ HEAP32[argIndex >> 2], HEAP32[argIndex + 4 >> 2] ];
   argIndex += 8;
  } else {
   type = "i32";
   ret = HEAP32[argIndex >> 2];
   argIndex += 4;
  }
  return ret;
 }
 var ret = [];
 var curr, next, currArg;
 while (1) {
  var startTextIndex = textIndex;
  curr = HEAP8[textIndex >> 0];
  if (curr === 0) break;
  next = HEAP8[textIndex + 1 >> 0];
  if (curr == 37) {
   var flagAlwaysSigned = false;
   var flagLeftAlign = false;
   var flagAlternative = false;
   var flagZeroPad = false;
   var flagPadSign = false;
   flagsLoop: while (1) {
    switch (next) {
    case 43:
     flagAlwaysSigned = true;
     break;

    case 45:
     flagLeftAlign = true;
     break;

    case 35:
     flagAlternative = true;
     break;

    case 48:
     if (flagZeroPad) {
      break flagsLoop;
     } else {
      flagZeroPad = true;
      break;
     }

    case 32:
     flagPadSign = true;
     break;

    default:
     break flagsLoop;
    }
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
   }
   var width = 0;
   if (next == 42) {
    width = getNextArg("i32");
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
   } else {
    while (next >= 48 && next <= 57) {
     width = width * 10 + (next - 48);
     textIndex++;
     next = HEAP8[textIndex + 1 >> 0];
    }
   }
   var precisionSet = false, precision = -1;
   if (next == 46) {
    precision = 0;
    precisionSet = true;
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
    if (next == 42) {
     precision = getNextArg("i32");
     textIndex++;
    } else {
     while (1) {
      var precisionChr = HEAP8[textIndex + 1 >> 0];
      if (precisionChr < 48 || precisionChr > 57) break;
      precision = precision * 10 + (precisionChr - 48);
      textIndex++;
     }
    }
    next = HEAP8[textIndex + 1 >> 0];
   }
   if (precision < 0) {
    precision = 6;
    precisionSet = false;
   }
   var argSize;
   switch (String.fromCharCode(next)) {
   case "h":
    var nextNext = HEAP8[textIndex + 2 >> 0];
    if (nextNext == 104) {
     textIndex++;
     argSize = 1;
    } else {
     argSize = 2;
    }
    break;

   case "l":
    var nextNext = HEAP8[textIndex + 2 >> 0];
    if (nextNext == 108) {
     textIndex++;
     argSize = 8;
    } else {
     argSize = 4;
    }
    break;

   case "L":
   case "q":
   case "j":
    argSize = 8;
    break;

   case "z":
   case "t":
   case "I":
    argSize = 4;
    break;

   default:
    argSize = null;
   }
   if (argSize) textIndex++;
   next = HEAP8[textIndex + 1 >> 0];
   switch (String.fromCharCode(next)) {
   case "d":
   case "i":
   case "u":
   case "o":
   case "x":
   case "X":
   case "p":
    {
     var signed = next == 100 || next == 105;
     argSize = argSize || 4;
     currArg = getNextArg("i" + argSize * 8);
     var argText;
     if (argSize == 8) {
      currArg = next == 117 ? convertU32PairToI53(currArg[0], currArg[1]) : convertI32PairToI53(currArg[0], currArg[1]);
     }
     if (argSize <= 4) {
      var limit = Math.pow(256, argSize) - 1;
      currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
     }
     var currAbsArg = Math.abs(currArg);
     var prefix = "";
     if (next == 100 || next == 105) {
      argText = reSign(currArg, 8 * argSize, 1).toString(10);
     } else if (next == 117) {
      argText = unSign(currArg, 8 * argSize, 1).toString(10);
      currArg = Math.abs(currArg);
     } else if (next == 111) {
      argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8);
     } else if (next == 120 || next == 88) {
      prefix = flagAlternative && currArg != 0 ? "0x" : "";
      if (currArg < 0) {
       currArg = -currArg;
       argText = (currAbsArg - 1).toString(16);
       var buffer = [];
       for (var i = 0; i < argText.length; i++) {
        buffer.push((15 - parseInt(argText[i], 16)).toString(16));
       }
       argText = buffer.join("");
       while (argText.length < argSize * 2) argText = "f" + argText;
      } else {
       argText = currAbsArg.toString(16);
      }
      if (next == 88) {
       prefix = prefix.toUpperCase();
       argText = argText.toUpperCase();
      }
     } else if (next == 112) {
      if (currAbsArg === 0) {
       argText = "(nil)";
      } else {
       prefix = "0x";
       argText = currAbsArg.toString(16);
      }
     }
     if (precisionSet) {
      while (argText.length < precision) {
       argText = "0" + argText;
      }
     }
     if (currArg >= 0) {
      if (flagAlwaysSigned) {
       prefix = "+" + prefix;
      } else if (flagPadSign) {
       prefix = " " + prefix;
      }
     }
     if (argText.charAt(0) == "-") {
      prefix = "-" + prefix;
      argText = argText.substr(1);
     }
     while (prefix.length + argText.length < width) {
      if (flagLeftAlign) {
       argText += " ";
      } else {
       if (flagZeroPad) {
        argText = "0" + argText;
       } else {
        prefix = " " + prefix;
       }
      }
     }
     argText = prefix + argText;
     argText.split("").forEach(function(chr) {
      ret.push(chr.charCodeAt(0));
     });
     break;
    }

   case "f":
   case "F":
   case "e":
   case "E":
   case "g":
   case "G":
    {
     currArg = getNextArg("double");
     var argText;
     if (isNaN(currArg)) {
      argText = "nan";
      flagZeroPad = false;
     } else if (!isFinite(currArg)) {
      argText = (currArg < 0 ? "-" : "") + "inf";
      flagZeroPad = false;
     } else {
      var isGeneral = false;
      var effectivePrecision = Math.min(precision, 20);
      if (next == 103 || next == 71) {
       isGeneral = true;
       precision = precision || 1;
       var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
       if (precision > exponent && exponent >= -4) {
        next = (next == 103 ? "f" : "F").charCodeAt(0);
        precision -= exponent + 1;
       } else {
        next = (next == 103 ? "e" : "E").charCodeAt(0);
        precision--;
       }
       effectivePrecision = Math.min(precision, 20);
      }
      if (next == 101 || next == 69) {
       argText = currArg.toExponential(effectivePrecision);
       if (/[eE][-+]\d$/.test(argText)) {
        argText = argText.slice(0, -1) + "0" + argText.slice(-1);
       }
      } else if (next == 102 || next == 70) {
       argText = currArg.toFixed(effectivePrecision);
       if (currArg === 0 && reallyNegative(currArg)) {
        argText = "-" + argText;
       }
      }
      var parts = argText.split("e");
      if (isGeneral && !flagAlternative) {
       while (parts[0].length > 1 && parts[0].includes(".") && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
        parts[0] = parts[0].slice(0, -1);
       }
      } else {
       if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
       while (precision > effectivePrecision++) parts[0] += "0";
      }
      argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
      if (next == 69) argText = argText.toUpperCase();
      if (currArg >= 0) {
       if (flagAlwaysSigned) {
        argText = "+" + argText;
       } else if (flagPadSign) {
        argText = " " + argText;
       }
      }
     }
     while (argText.length < width) {
      if (flagLeftAlign) {
       argText += " ";
      } else {
       if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
        argText = argText[0] + "0" + argText.slice(1);
       } else {
        argText = (flagZeroPad ? "0" : " ") + argText;
       }
      }
     }
     if (next < 97) argText = argText.toUpperCase();
     argText.split("").forEach(function(chr) {
      ret.push(chr.charCodeAt(0));
     });
     break;
    }

   case "s":
    {
     var arg = getNextArg("i8*");
     var argLength = arg ? _strlen(arg) : "(null)".length;
     if (precisionSet) argLength = Math.min(argLength, precision);
     if (!flagLeftAlign) {
      while (argLength < width--) {
       ret.push(32);
      }
     }
     if (arg) {
      for (var i = 0; i < argLength; i++) {
       ret.push(HEAPU8[arg++ >> 0]);
      }
     } else {
      ret = ret.concat(intArrayFromString("(null)".substr(0, argLength), true));
     }
     if (flagLeftAlign) {
      while (argLength < width--) {
       ret.push(32);
      }
     }
     break;
    }

   case "c":
    {
     if (flagLeftAlign) ret.push(getNextArg("i8"));
     while (--width > 0) {
      ret.push(32);
     }
     if (!flagLeftAlign) ret.push(getNextArg("i8"));
     break;
    }

   case "n":
    {
     var ptr = getNextArg("i32*");
     HEAP32[ptr >> 2] = ret.length;
     break;
    }

   case "%":
    {
     ret.push(curr);
     break;
    }

   default:
    {
     for (var i = startTextIndex; i < textIndex + 2; i++) {
      ret.push(HEAP8[i >> 0]);
     }
    }
   }
   textIndex += 2;
  } else {
   ret.push(curr);
   textIndex += 1;
  }
 }
 return ret;
}

function traverseStack(args) {
 if (!args || !args.callee || !args.callee.name) {
  return [ null, "", "" ];
 }
 var funstr = args.callee.toString();
 var funcname = args.callee.name;
 var str = "(";
 var first = true;
 for (var i in args) {
  var a = args[i];
  if (!first) {
   str += ", ";
  }
  first = false;
  if (typeof a === "number" || typeof a === "string") {
   str += a;
  } else {
   str += "(" + typeof a + ")";
  }
 }
 str += ")";
 var caller = args.callee.caller;
 args = caller ? caller.arguments : [];
 if (first) str = "";
 return [ args, funcname, str ];
}

function _emscripten_get_callstack_js(flags) {
 var callstack = jsStackTrace();
 var iThisFunc = callstack.lastIndexOf("_emscripten_log");
 var iThisFunc2 = callstack.lastIndexOf("_emscripten_get_callstack");
 var iNextLine = callstack.indexOf("\n", Math.max(iThisFunc, iThisFunc2)) + 1;
 callstack = callstack.slice(iNextLine);
 if (flags & 32) {
  warnOnce("EM_LOG_DEMANGLE is deprecated; ignoring");
 }
 if (flags & 8 && typeof emscripten_source_map === "undefined") {
  warnOnce('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.');
  flags ^= 8;
  flags |= 16;
 }
 var stack_args = null;
 if (flags & 128) {
  stack_args = traverseStack(arguments);
  while (stack_args[1].includes("_emscripten_")) stack_args = traverseStack(stack_args[0]);
 }
 var lines = callstack.split("\n");
 callstack = "";
 var newFirefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
 var firefoxRe = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?");
 var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
 for (var l in lines) {
  var line = lines[l];
  var symbolName = "";
  var file = "";
  var lineno = 0;
  var column = 0;
  var parts = chromeRe.exec(line);
  if (parts && parts.length == 5) {
   symbolName = parts[1];
   file = parts[2];
   lineno = parts[3];
   column = parts[4];
  } else {
   parts = newFirefoxRe.exec(line);
   if (!parts) parts = firefoxRe.exec(line);
   if (parts && parts.length >= 4) {
    symbolName = parts[1];
    file = parts[2];
    lineno = parts[3];
    column = parts[4] | 0;
   } else {
    callstack += line + "\n";
    continue;
   }
  }
  var haveSourceMap = false;
  if (flags & 8) {
   var orig = emscripten_source_map.originalPositionFor({
    line: lineno,
    column: column
   });
   haveSourceMap = orig && orig.source;
   if (haveSourceMap) {
    if (flags & 64) {
     orig.source = orig.source.substring(orig.source.replace(/\\/g, "/").lastIndexOf("/") + 1);
    }
    callstack += "    at " + symbolName + " (" + orig.source + ":" + orig.line + ":" + orig.column + ")\n";
   }
  }
  if (flags & 16 || !haveSourceMap) {
   if (flags & 64) {
    file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1);
   }
   callstack += (haveSourceMap ? "     = " + symbolName : "    at " + symbolName) + " (" + file + ":" + lineno + ":" + column + ")\n";
  }
  if (flags & 128 && stack_args[0]) {
   if (stack_args[1] == symbolName && stack_args[2].length > 0) {
    callstack = callstack.replace(/\s+$/, "");
    callstack += " with values: " + stack_args[1] + stack_args[2] + "\n";
   }
   stack_args = traverseStack(stack_args[0]);
  }
 }
 callstack = callstack.replace(/\s+$/, "");
 return callstack;
}

function _emscripten_log_js(flags, str) {
 if (flags & 24) {
  str = str.replace(/\s+$/, "");
  str += (str.length > 0 ? "\n" : "") + _emscripten_get_callstack_js(flags);
 }
 if (flags & 1) {
  if (flags & 4) {
   err(str);
  } else if (flags & 2) {
   console.warn(str);
  } else if (flags & 512) {
   console.info(str);
  } else if (flags & 256) {
   console.debug(str);
  } else {
   out(str);
  }
 } else if (flags & 6) {
  err(str);
 } else {
  out(str);
 }
}

function _emscripten_log(flags, format, varargs) {
 var result = formatString(format, varargs);
 var str = UTF8ArrayToString(result, 0);
 _emscripten_log_js(flags, str);
}

Module["_emscripten_log"] = _emscripten_log;

function emscripten_realloc_buffer(size) {
 try {
  wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
  updateGlobalBufferAndViews(wasmMemory.buffer);
  return 1;
 } catch (e) {}
}

function _emscripten_resize_heap(requestedSize) {
 var oldSize = HEAPU8.length;
 requestedSize = requestedSize >>> 0;
 var maxHeapSize = 2147483648;
 if (requestedSize > maxHeapSize) {
  return false;
 }
 for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
  var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
  overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
  var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  var replacement = emscripten_realloc_buffer(newSize);
  if (replacement) {
   return true;
  }
 }
 return false;
}

function _emscripten_run_script(ptr) {
 eval(UTF8ToString(ptr));
}

Module["_emscripten_run_script"] = _emscripten_run_script;

_emscripten_run_script.sig = "vi";

function _emscripten_run_script_int(ptr) {
 return eval(UTF8ToString(ptr)) | 0;
}

_emscripten_run_script_int.sig = "ii";

function _emscripten_run_script_string(ptr) {
 var s = eval(UTF8ToString(ptr));
 if (s == null) {
  return 0;
 }
 s += "";
 var me = _emscripten_run_script_string;
 var len = lengthBytesUTF8(s);
 if (!me.bufferSize || me.bufferSize < len + 1) {
  if (me.bufferSize) _emscripten_builtin_free(me.buffer);
  me.bufferSize = len + 1;
  me.buffer = _emscripten_builtin_malloc(me.bufferSize);
 }
 stringToUTF8(s, me.buffer, me.bufferSize);
 return me.buffer;
}

_emscripten_run_script_string.sig = "ii";

var ENV = {};

function getExecutableName() {
 return thisProgram || "./this.program";
}

function getEnvStrings() {
 if (!getEnvStrings.strings) {
  var lang = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(x + "=" + env[x]);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
}

function _environ_get(__environ, environ_buf) {
 var bufSize = 0;
 getEnvStrings().forEach(function(string, i) {
  var ptr = environ_buf + bufSize;
  HEAP32[__environ + i * 4 >> 2] = ptr;
  writeAsciiToMemory(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
}

_environ_get.sig = "iii";

function _environ_sizes_get(penviron_count, penviron_buf_size) {
 var strings = getEnvStrings();
 HEAP32[penviron_count >> 2] = strings.length;
 var bufSize = 0;
 strings.forEach(function(string) {
  bufSize += string.length + 1;
 });
 HEAP32[penviron_buf_size >> 2] = bufSize;
 return 0;
}

_environ_sizes_get.sig = "iii";

function _fd_close(fd) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

_fd_close.sig = "ii";

function _fd_read(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = SYSCALLS.doReadv(stream, iov, iovcnt);
  HEAP32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

_fd_read.sig = "iiiii";

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var HIGH_OFFSET = 4294967296;
  var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  var DOUBLE_LIMIT = 9007199254740992;
  if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
   return -61;
  }
  FS.llseek(stream, offset, whence);
  tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

function _fd_write(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = SYSCALLS.doWritev(stream, iov, iovcnt);
  HEAP32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

_fd_write.sig = "iiiii";

function _getTempRet0() {
 return getTempRet0();
}

Module["_getTempRet0"] = _getTempRet0;

_getTempRet0.sig = "i";

function _setTempRet0(val) {
 setTempRet0(val);
}

Module["_setTempRet0"] = _setTempRet0;

_setTempRet0.sig = "vi";

function __isLeapYear(year) {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function __arraySum(array, index) {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
}

var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

function __addDays(date, days) {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = __isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
}

function _strftime(s, maxsize, format, tm) {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value === "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   } else {
    return thisDate.getFullYear();
   }
  } else {
   return thisDate.getFullYear() - 1;
  }
 }
 var EXPANSION_RULES_2 = {
  "%a": function(date) {
   return WEEKDAYS[date.tm_wday].substring(0, 3);
  },
  "%A": function(date) {
   return WEEKDAYS[date.tm_wday];
  },
  "%b": function(date) {
   return MONTHS[date.tm_mon].substring(0, 3);
  },
  "%B": function(date) {
   return MONTHS[date.tm_mon];
  },
  "%C": function(date) {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  },
  "%d": function(date) {
   return leadingNulls(date.tm_mday, 2);
  },
  "%e": function(date) {
   return leadingSomething(date.tm_mday, 2, " ");
  },
  "%g": function(date) {
   return getWeekBasedYear(date).toString().substring(2);
  },
  "%G": function(date) {
   return getWeekBasedYear(date);
  },
  "%H": function(date) {
   return leadingNulls(date.tm_hour, 2);
  },
  "%I": function(date) {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": function(date) {
   return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  },
  "%m": function(date) {
   return leadingNulls(date.tm_mon + 1, 2);
  },
  "%M": function(date) {
   return leadingNulls(date.tm_min, 2);
  },
  "%n": function() {
   return "\n";
  },
  "%p": function(date) {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   } else {
    return "PM";
   }
  },
  "%S": function(date) {
   return leadingNulls(date.tm_sec, 2);
  },
  "%t": function() {
   return "\t";
  },
  "%u": function(date) {
   return date.tm_wday || 7;
  },
  "%U": function(date) {
   var janFirst = new Date(date.tm_year + 1900, 0, 1);
   var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstSunday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
  },
  "%V": function(date) {
   var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
   var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
    return "53";
   }
   if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
    return "01";
   }
   var daysDifference;
   if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
   } else {
    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
   }
   return leadingNulls(Math.ceil(daysDifference / 7), 2);
  },
  "%w": function(date) {
   return date.tm_wday;
  },
  "%W": function(date) {
   var janFirst = new Date(date.tm_year, 0, 1);
   var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstMonday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
  },
  "%y": function(date) {
   return (date.tm_year + 1900).toString().substring(2);
  },
  "%Y": function(date) {
   return date.tm_year + 1900;
  },
  "%z": function(date) {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": function(date) {
   return date.tm_zone;
  },
  "%%": function() {
   return "%";
  }
 };
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}

_strftime.sig = "iiiii";

function _strftime_l(s, maxsize, format, tm) {
 return _strftime(s, maxsize, format, tm);
}

function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}

Module["_time"] = _time;

_time.sig = "ii";

function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var asmLibraryArg = {
 "__assert_fail": ___assert_fail,
 "__cxa_allocate_exception": ___cxa_allocate_exception,
 "__cxa_throw": ___cxa_throw,
 "__gmtime_r": ___gmtime_r,
 "__heap_base": ___heap_base,
 "__indirect_function_table": wasmTable,
 "__localtime_r": ___localtime_r,
 "__memory_base": ___memory_base,
 "__stack_pointer": ___stack_pointer,
 "__syscall_fcntl64": ___syscall_fcntl64,
 "__syscall_ioctl": ___syscall_ioctl,
 "__syscall_mkdir": ___syscall_mkdir,
 "__syscall_open": ___syscall_open,
 "__table_base": ___table_base,
 "abort": _abort,
 "emscripten_get_heap_max": _emscripten_get_heap_max,
 "emscripten_log": _emscripten_log,
 "emscripten_resize_heap": _emscripten_resize_heap,
 "emscripten_run_script_int": _emscripten_run_script_int,
 "emscripten_run_script_string": _emscripten_run_script_string,
 "environ_get": _environ_get,
 "environ_sizes_get": _environ_sizes_get,
 "fd_close": _fd_close,
 "fd_read": _fd_read,
 "fd_seek": _fd_seek,
 "fd_write": _fd_write,
 "memory": wasmMemory,
 "setTempRet0": _setTempRet0,
 "strftime": _strftime,
 "strftime_l": _strftime_l,
 "time": _time
};

var asm = createWasm();

var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
 return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2IDnEEPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2IDnEEPKc"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2IDnEEPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2IDnEEPKc"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2IDnEEPKc"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev"]).apply(null, arguments);
};

var __ZN4Json5ValueC1ENS_9ValueTypeE = Module["__ZN4Json5ValueC1ENS_9ValueTypeE"] = function() {
 return (__ZN4Json5ValueC1ENS_9ValueTypeE = Module["__ZN4Json5ValueC1ENS_9ValueTypeE"] = Module["asm"]["_ZN4Json5ValueC1ENS_9ValueTypeE"]).apply(null, arguments);
};

var __ZN4Json5ValueD1Ev = Module["__ZN4Json5ValueD1Ev"] = function() {
 return (__ZN4Json5ValueD1Ev = Module["__ZN4Json5ValueD1Ev"] = Module["asm"]["_ZN4Json5ValueD1Ev"]).apply(null, arguments);
};

var __ZN8corewasm19getCurrentTimeStampEv = Module["__ZN8corewasm19getCurrentTimeStampEv"] = function() {
 return (__ZN8corewasm19getCurrentTimeStampEv = Module["__ZN8corewasm19getCurrentTimeStampEv"] = Module["asm"]["_ZN8corewasm19getCurrentTimeStampEv"]).apply(null, arguments);
};

var __ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1Ev = Module["__ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1Ev"] = function() {
 return (__ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1Ev = Module["__ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1Ev"] = Module["asm"]["_ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1Ev"]).apply(null, arguments);
};

var __ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc = Module["__ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc"] = function() {
 return (__ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc = Module["__ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc"] = Module["asm"]["_ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc"]).apply(null, arguments);
};

var __ZN8corewasm14getFormatedNowEv = Module["__ZN8corewasm14getFormatedNowEv"] = function() {
 return (__ZN8corewasm14getFormatedNowEv = Module["__ZN8corewasm14getFormatedNowEv"] = Module["asm"]["_ZN8corewasm14getFormatedNowEv"]).apply(null, arguments);
};

var __ZN8corewasm15getResponseJsonEiPcS0_ = Module["__ZN8corewasm15getResponseJsonEiPcS0_"] = function() {
 return (__ZN8corewasm15getResponseJsonEiPcS0_ = Module["__ZN8corewasm15getResponseJsonEiPcS0_"] = Module["asm"]["_ZN8corewasm15getResponseJsonEiPcS0_"]).apply(null, arguments);
};

var __ZN4Json5ValueC1Ei = Module["__ZN4Json5ValueC1Ei"] = function() {
 return (__ZN4Json5ValueC1Ei = Module["__ZN4Json5ValueC1Ei"] = Module["asm"]["_ZN4Json5ValueC1Ei"]).apply(null, arguments);
};

var __ZN4Json5ValueixEPKc = Module["__ZN4Json5ValueixEPKc"] = function() {
 return (__ZN4Json5ValueixEPKc = Module["__ZN4Json5ValueixEPKc"] = Module["asm"]["_ZN4Json5ValueixEPKc"]).apply(null, arguments);
};

var __ZN4Json5ValueaSEOS0_ = Module["__ZN4Json5ValueaSEOS0_"] = function() {
 return (__ZN4Json5ValueaSEOS0_ = Module["__ZN4Json5ValueaSEOS0_"] = Module["asm"]["_ZN4Json5ValueaSEOS0_"]).apply(null, arguments);
};

var __ZN8corewasm9getPszRetERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE = Module["__ZN8corewasm9getPszRetERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE"] = function() {
 return (__ZN8corewasm9getPszRetERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE = Module["__ZN8corewasm9getPszRetERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE"] = Module["asm"]["_ZN8corewasm9getPszRetERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE"]).apply(null, arguments);
};

var __ZdaPv = Module["__ZdaPv"] = function() {
 return (__ZdaPv = Module["__ZdaPv"] = Module["asm"]["_ZdaPv"]).apply(null, arguments);
};

var __Znam = Module["__Znam"] = function() {
 return (__Znam = Module["__Znam"] = Module["asm"]["_Znam"]).apply(null, arguments);
};

var __ZN8corewasm9getPszRetEPKc = Module["__ZN8corewasm9getPszRetEPKc"] = function() {
 return (__ZN8corewasm9getPszRetEPKc = Module["__ZN8corewasm9getPszRetEPKc"] = Module["asm"]["_ZN8corewasm9getPszRetEPKc"]).apply(null, arguments);
};

var _strlen = Module["_strlen"] = function() {
 return (_strlen = Module["_strlen"] = Module["asm"]["strlen"]).apply(null, arguments);
};

var _tolower = Module["_tolower"] = function() {
 return (_tolower = Module["_tolower"] = Module["asm"]["tolower"]).apply(null, arguments);
};

var __ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4findEcm = Module["__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4findEcm"] = function() {
 return (__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4findEcm = Module["__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4findEcm"] = Module["asm"]["_ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4findEcm"]).apply(null, arguments);
};

var _emscripten_bind_VoidPtr___destroy___0 = Module["_emscripten_bind_VoidPtr___destroy___0"] = function() {
 return (_emscripten_bind_VoidPtr___destroy___0 = Module["_emscripten_bind_VoidPtr___destroy___0"] = Module["asm"]["emscripten_bind_VoidPtr___destroy___0"]).apply(null, arguments);
};

var __ZdlPv = Module["__ZdlPv"] = function() {
 return (__ZdlPv = Module["__ZdlPv"] = Module["asm"]["_ZdlPv"]).apply(null, arguments);
};

var _emscripten_bind_CoreWasm_static_init_1 = Module["_emscripten_bind_CoreWasm_static_init_1"] = function() {
 return (_emscripten_bind_CoreWasm_static_init_1 = Module["_emscripten_bind_CoreWasm_static_init_1"] = Module["asm"]["emscripten_bind_CoreWasm_static_init_1"]).apply(null, arguments);
};

var __ZN4Json6ReaderC1Ev = Module["__ZN4Json6ReaderC1Ev"] = function() {
 return (__ZN4Json6ReaderC1Ev = Module["__ZN4Json6ReaderC1Ev"] = Module["asm"]["_ZN4Json6ReaderC1Ev"]).apply(null, arguments);
};

var __ZN4Json6Reader5parseERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERNS_5ValueEb = Module["__ZN4Json6Reader5parseERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERNS_5ValueEb"] = function() {
 return (__ZN4Json6Reader5parseERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERNS_5ValueEb = Module["__ZN4Json6Reader5parseERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERNS_5ValueEb"] = Module["asm"]["_ZN4Json6Reader5parseERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERNS_5ValueEb"]).apply(null, arguments);
};

var __ZNK4Json5Value8isMemberEPKc = Module["__ZNK4Json5Value8isMemberEPKc"] = function() {
 return (__ZNK4Json5Value8isMemberEPKc = Module["__ZNK4Json5Value8isMemberEPKc"] = Module["asm"]["_ZNK4Json5Value8isMemberEPKc"]).apply(null, arguments);
};

var __ZNK4Json5Value8asStringEv = Module["__ZNK4Json5Value8asStringEv"] = function() {
 return (__ZNK4Json5Value8asStringEv = Module["__ZNK4Json5Value8asStringEv"] = Module["asm"]["_ZNK4Json5Value8asStringEv"]).apply(null, arguments);
};

var __ZN4Json5ValueaSERKS0_ = Module["__ZN4Json5ValueaSERKS0_"] = function() {
 return (__ZN4Json5ValueaSERKS0_ = Module["__ZN4Json5ValueaSERKS0_"] = Module["asm"]["_ZN4Json5ValueaSERKS0_"]).apply(null, arguments);
};

var __ZNK4Json5Value5asIntEv = Module["__ZNK4Json5Value5asIntEv"] = function() {
 return (__ZNK4Json5Value5asIntEv = Module["__ZNK4Json5Value5asIntEv"] = Module["asm"]["_ZNK4Json5Value5asIntEv"]).apply(null, arguments);
};

var __ZN4Json5Value6resizeEj = Module["__ZN4Json5Value6resizeEj"] = function() {
 return (__ZN4Json5Value6resizeEj = Module["__ZN4Json5Value6resizeEj"] = Module["asm"]["_ZN4Json5Value6resizeEj"]).apply(null, arguments);
};

var __ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev = Module["__ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev"] = function() {
 return (__ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev = Module["__ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev"] = Module["asm"]["_ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev"]).apply(null, arguments);
};

var __ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev = Module["__ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev"] = function() {
 return (__ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev = Module["__ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev"] = Module["asm"]["_ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev"]).apply(null, arguments);
};

var __ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED2Ev = Module["__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED2Ev"] = function() {
 return (__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED2Ev = Module["__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED2Ev"] = Module["asm"]["_ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED2Ev"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm"]).apply(null, arguments);
};

var __ZNKSt3__221__basic_string_commonILb1EE20__throw_length_errorEv = Module["__ZNKSt3__221__basic_string_commonILb1EE20__throw_length_errorEv"] = function() {
 return (__ZNKSt3__221__basic_string_commonILb1EE20__throw_length_errorEv = Module["__ZNKSt3__221__basic_string_commonILb1EE20__throw_length_errorEv"] = Module["asm"]["_ZNKSt3__221__basic_string_commonILb1EE20__throw_length_errorEv"]).apply(null, arguments);
};

var __ZNSt3__220__throw_length_errorEPKc = Module["__ZNSt3__220__throw_length_errorEPKc"] = function() {
 return (__ZNSt3__220__throw_length_errorEPKc = Module["__ZNSt3__220__throw_length_errorEPKc"] = Module["asm"]["_ZNSt3__220__throw_length_errorEPKc"]).apply(null, arguments);
};

var __ZNSt12length_errorC2EPKc = Module["__ZNSt12length_errorC2EPKc"] = function() {
 return (__ZNSt12length_errorC2EPKc = Module["__ZNSt12length_errorC2EPKc"] = Module["asm"]["_ZNSt12length_errorC2EPKc"]).apply(null, arguments);
};

var __ZNSt12length_errorD1Ev = Module["__ZNSt12length_errorD1Ev"] = function() {
 return (__ZNSt12length_errorD1Ev = Module["__ZNSt12length_errorD1Ev"] = Module["asm"]["_ZNSt12length_errorD1Ev"]).apply(null, arguments);
};

var __ZNSt11logic_errorC2EPKc = Module["__ZNSt11logic_errorC2EPKc"] = function() {
 return (__ZNSt11logic_errorC2EPKc = Module["__ZNSt11logic_errorC2EPKc"] = Module["asm"]["_ZNSt11logic_errorC2EPKc"]).apply(null, arguments);
};

var __Znwm = Module["__Znwm"] = function() {
 return (__Znwm = Module["__Znwm"] = Module["asm"]["_Znwm"]).apply(null, arguments);
};

var __ZNSt3__28ios_base4initEPv = Module["__ZNSt3__28ios_base4initEPv"] = function() {
 return (__ZNSt3__28ios_base4initEPv = Module["__ZNSt3__28ios_base4initEPv"] = Module["asm"]["_ZNSt3__28ios_base4initEPv"]).apply(null, arguments);
};

var __ZNSt3__215basic_streambufIcNS_11char_traitsIcEEEC2Ev = Module["__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEEC2Ev"] = function() {
 return (__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEEC2Ev = Module["__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEEC2Ev"] = Module["asm"]["_ZNSt3__215basic_streambufIcNS_11char_traitsIcEEEC2Ev"]).apply(null, arguments);
};

var __ZNSt3__224__put_character_sequenceIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m = Module["__ZNSt3__224__put_character_sequenceIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m"] = function() {
 return (__ZNSt3__224__put_character_sequenceIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m = Module["__ZNSt3__224__put_character_sequenceIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m"] = Module["asm"]["_ZNSt3__224__put_character_sequenceIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m"]).apply(null, arguments);
};

var __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_ = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_"] = function() {
 return (__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_ = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_"] = Module["asm"]["_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_"]).apply(null, arguments);
};

var __ZNSt3__216__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_ = Module["__ZNSt3__216__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_"] = function() {
 return (__ZNSt3__216__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_ = Module["__ZNSt3__216__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_"] = Module["asm"]["_ZNSt3__216__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_"]).apply(null, arguments);
};

var __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev"] = function() {
 return (__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev"] = Module["asm"]["_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEmc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEmc"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEmc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEmc"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEmc"]).apply(null, arguments);
};

var __ZNKSt3__28ios_base6getlocEv = Module["__ZNKSt3__28ios_base6getlocEv"] = function() {
 return (__ZNKSt3__28ios_base6getlocEv = Module["__ZNKSt3__28ios_base6getlocEv"] = Module["asm"]["_ZNKSt3__28ios_base6getlocEv"]).apply(null, arguments);
};

var __ZNSt3__26localeD1Ev = Module["__ZNSt3__26localeD1Ev"] = function() {
 return (__ZNSt3__26localeD1Ev = Module["__ZNSt3__26localeD1Ev"] = Module["asm"]["_ZNSt3__26localeD1Ev"]).apply(null, arguments);
};

var __ZNKSt3__26locale9use_facetERNS0_2idE = Module["__ZNKSt3__26locale9use_facetERNS0_2idE"] = function() {
 return (__ZNKSt3__26locale9use_facetERNS0_2idE = Module["__ZNKSt3__26locale9use_facetERNS0_2idE"] = Module["asm"]["_ZNKSt3__26locale9use_facetERNS0_2idE"]).apply(null, arguments);
};

var __ZNSt3__28ios_base5clearEj = Module["__ZNSt3__28ios_base5clearEj"] = function() {
 return (__ZNSt3__28ios_base5clearEj = Module["__ZNSt3__28ios_base5clearEj"] = Module["asm"]["_ZNSt3__28ios_base5clearEj"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm"]).apply(null, arguments);
};

var _memchr = Module["_memchr"] = function() {
 return (_memchr = Module["_memchr"] = Module["asm"]["memchr"]).apply(null, arguments);
};

var _memcmp = Module["_memcmp"] = function() {
 return (_memcmp = Module["_memcmp"] = Module["asm"]["memcmp"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_mmRKS4_ = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_mmRKS4_"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_mmRKS4_ = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_mmRKS4_"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_mmRKS4_"]).apply(null, arguments);
};

var __ZNKSt3__220__vector_base_commonILb1EE20__throw_length_errorEv = Module["__ZNKSt3__220__vector_base_commonILb1EE20__throw_length_errorEv"] = function() {
 return (__ZNKSt3__220__vector_base_commonILb1EE20__throw_length_errorEv = Module["__ZNKSt3__220__vector_base_commonILb1EE20__throw_length_errorEv"] = Module["asm"]["_ZNKSt3__220__vector_base_commonILb1EE20__throw_length_errorEv"]).apply(null, arguments);
};

var __ZN9dynamsoft12GenerateHashEPKvjPc = Module["__ZN9dynamsoft12GenerateHashEPKvjPc"] = function() {
 return (__ZN9dynamsoft12GenerateHashEPKvjPc = Module["__ZN9dynamsoft12GenerateHashEPKvjPc"] = Module["asm"]["_ZN9dynamsoft12GenerateHashEPKvjPc"]).apply(null, arguments);
};

var _strcpy = Module["_strcpy"] = function() {
 return (_strcpy = Module["_strcpy"] = Module["asm"]["strcpy"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc"]).apply(null, arguments);
};

var __ZN9dynamsoft12DMObjectBaseC2Ev = Module["__ZN9dynamsoft12DMObjectBaseC2Ev"] = function() {
 return (__ZN9dynamsoft12DMObjectBaseC2Ev = Module["__ZN9dynamsoft12DMObjectBaseC2Ev"] = Module["asm"]["_ZN9dynamsoft12DMObjectBaseC2Ev"]).apply(null, arguments);
};

var __ZNSt3__29to_stringEi = Module["__ZNSt3__29to_stringEi"] = function() {
 return (__ZNSt3__29to_stringEi = Module["__ZNSt3__29to_stringEi"] = Module["asm"]["_ZNSt3__29to_stringEi"]).apply(null, arguments);
};

var __ZN9dynamsoft12DMObjectBaseD2Ev = Module["__ZN9dynamsoft12DMObjectBaseD2Ev"] = function() {
 return (__ZN9dynamsoft12DMObjectBaseD2Ev = Module["__ZN9dynamsoft12DMObjectBaseD2Ev"] = Module["asm"]["_ZN9dynamsoft12DMObjectBaseD2Ev"]).apply(null, arguments);
};

var _strncpy = Module["_strncpy"] = function() {
 return (_strncpy = Module["_strncpy"] = Module["asm"]["strncpy"]).apply(null, arguments);
};

var __ZN9dynamsoft18DMModuleLoaderBaseC2Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseC2Ev"] = function() {
 return (__ZN9dynamsoft18DMModuleLoaderBaseC2Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseC2Ev"] = Module["asm"]["_ZN9dynamsoft18DMModuleLoaderBaseC2Ev"]).apply(null, arguments);
};

var __ZN9dynamsoft18DMModuleLoaderBaseD2Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseD2Ev"] = function() {
 return (__ZN9dynamsoft18DMModuleLoaderBaseD2Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseD2Ev"] = Module["asm"]["_ZN9dynamsoft18DMModuleLoaderBaseD2Ev"]).apply(null, arguments);
};

var __ZN9dynamsoft18DMModuleLoaderBase18DynamicLoadDllFuncERPvPKcS4_jbS4_ = Module["__ZN9dynamsoft18DMModuleLoaderBase18DynamicLoadDllFuncERPvPKcS4_jbS4_"] = function() {
 return (__ZN9dynamsoft18DMModuleLoaderBase18DynamicLoadDllFuncERPvPKcS4_jbS4_ = Module["__ZN9dynamsoft18DMModuleLoaderBase18DynamicLoadDllFuncERPvPKcS4_jbS4_"] = Module["asm"]["_ZN9dynamsoft18DMModuleLoaderBase18DynamicLoadDllFuncERPvPKcS4_jbS4_"]).apply(null, arguments);
};

var __ZN9dynamsoft18DMModuleLoaderBaseC1Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseC1Ev"] = function() {
 return (__ZN9dynamsoft18DMModuleLoaderBaseC1Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseC1Ev"] = Module["asm"]["_ZN9dynamsoft18DMModuleLoaderBaseC1Ev"]).apply(null, arguments);
};

var __ZN9dynamsoft18DMModuleLoaderBaseD1Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseD1Ev"] = function() {
 return (__ZN9dynamsoft18DMModuleLoaderBaseD1Ev = Module["__ZN9dynamsoft18DMModuleLoaderBaseD1Ev"] = Module["asm"]["_ZN9dynamsoft18DMModuleLoaderBaseD1Ev"]).apply(null, arguments);
};

var __ZNK9dynamsoft10SyncObject4lockEv = Module["__ZNK9dynamsoft10SyncObject4lockEv"] = function() {
 return (__ZNK9dynamsoft10SyncObject4lockEv = Module["__ZNK9dynamsoft10SyncObject4lockEv"] = Module["asm"]["_ZNK9dynamsoft10SyncObject4lockEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft10SyncObject6unlockEv = Module["__ZNK9dynamsoft10SyncObject6unlockEv"] = function() {
 return (__ZNK9dynamsoft10SyncObject6unlockEv = Module["__ZNK9dynamsoft10SyncObject6unlockEv"] = Module["asm"]["_ZNK9dynamsoft10SyncObject6unlockEv"]).apply(null, arguments);
};

var ___errno_location = Module["___errno_location"] = function() {
 return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
};

var __ZNK4Json5Value7isArrayEv = Module["__ZNK4Json5Value7isArrayEv"] = function() {
 return (__ZNK4Json5Value7isArrayEv = Module["__ZNK4Json5Value7isArrayEv"] = Module["asm"]["_ZNK4Json5Value7isArrayEv"]).apply(null, arguments);
};

var __ZNK4Json5Value8isObjectEv = Module["__ZNK4Json5Value8isObjectEv"] = function() {
 return (__ZNK4Json5Value8isObjectEv = Module["__ZNK4Json5Value8isObjectEv"] = Module["asm"]["_ZNK4Json5Value8isObjectEv"]).apply(null, arguments);
};

var __ZN4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE = Module["__ZN4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"] = function() {
 return (__ZN4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE = Module["__ZN4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"] = Module["asm"]["_ZN4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"]).apply(null, arguments);
};

var __ZN4Json5ValueixEi = Module["__ZN4Json5ValueixEi"] = function() {
 return (__ZN4Json5ValueixEi = Module["__ZN4Json5ValueixEi"] = Module["asm"]["_ZN4Json5ValueixEi"]).apply(null, arguments);
};

var __ZN4Json5ValueC1ERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE = Module["__ZN4Json5ValueC1ERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"] = function() {
 return (__ZN4Json5ValueC1ERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE = Module["__ZN4Json5ValueC1ERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"] = Module["asm"]["_ZN4Json5ValueC1ERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"]).apply(null, arguments);
};

var __ZNK4Json6Reader24getFormatedErrorMessagesEv = Module["__ZNK4Json6Reader24getFormatedErrorMessagesEv"] = function() {
 return (__ZNK4Json6Reader24getFormatedErrorMessagesEv = Module["__ZNK4Json6Reader24getFormatedErrorMessagesEv"] = Module["asm"]["_ZNK4Json6Reader24getFormatedErrorMessagesEv"]).apply(null, arguments);
};

var __ZNSt3__2plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_ = Module["__ZNSt3__2plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_"] = function() {
 return (__ZNSt3__2plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_ = Module["__ZNSt3__2plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_"] = Module["asm"]["_ZNSt3__2plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_"]).apply(null, arguments);
};

var __ZNK4Json5ValueixEPKc = Module["__ZNK4Json5ValueixEPKc"] = function() {
 return (__ZNK4Json5ValueixEPKc = Module["__ZNK4Json5ValueixEPKc"] = Module["asm"]["_ZNK4Json5ValueixEPKc"]).apply(null, arguments);
};

var ___cxa_guard_acquire = Module["___cxa_guard_acquire"] = function() {
 return (___cxa_guard_acquire = Module["___cxa_guard_acquire"] = Module["asm"]["__cxa_guard_acquire"]).apply(null, arguments);
};

var ___cxa_guard_release = Module["___cxa_guard_release"] = function() {
 return (___cxa_guard_release = Module["___cxa_guard_release"] = Module["asm"]["__cxa_guard_release"]).apply(null, arguments);
};

var ___cxa_pure_virtual = Module["___cxa_pure_virtual"] = function() {
 return (___cxa_pure_virtual = Module["___cxa_pure_virtual"] = Module["asm"]["__cxa_pure_virtual"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm"]).apply(null, arguments);
};

var __ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strERKNS_12basic_stringIcS2_S4_EE = Module["__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strERKNS_12basic_stringIcS2_S4_EE"] = function() {
 return (__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strERKNS_12basic_stringIcS2_S4_EE = Module["__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strERKNS_12basic_stringIcS2_S4_EE"] = Module["asm"]["_ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strERKNS_12basic_stringIcS2_S4_EE"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm"]).apply(null, arguments);
};

var __ZNSt3__227__tree_balance_after_insertIPNS_16__tree_node_baseIPvEEEEvT_S5_ = Module["__ZNSt3__227__tree_balance_after_insertIPNS_16__tree_node_baseIPvEEEEvT_S5_"] = function() {
 return (__ZNSt3__227__tree_balance_after_insertIPNS_16__tree_node_baseIPvEEEEvT_S5_ = Module["__ZNSt3__227__tree_balance_after_insertIPNS_16__tree_node_baseIPvEEEEvT_S5_"] = Module["asm"]["_ZNSt3__227__tree_balance_after_insertIPNS_16__tree_node_baseIPvEEEEvT_S5_"]).apply(null, arguments);
};

var __ZNKSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv = Module["__ZNKSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv"] = function() {
 return (__ZNKSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv = Module["__ZNKSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv"] = Module["asm"]["_ZNKSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv"]).apply(null, arguments);
};

var __ZNSt3__2lsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_ostreamIT_T0_EES9_RKNS_12basic_stringIS6_S7_T1_EE = Module["__ZNSt3__2lsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_ostreamIT_T0_EES9_RKNS_12basic_stringIS6_S7_T1_EE"] = function() {
 return (__ZNSt3__2lsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_ostreamIT_T0_EES9_RKNS_12basic_stringIS6_S7_T1_EE = Module["__ZNSt3__2lsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_ostreamIT_T0_EES9_RKNS_12basic_stringIS6_S7_T1_EE"] = Module["asm"]["_ZNSt3__2lsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_ostreamIT_T0_EES9_RKNS_12basic_stringIS6_S7_T1_EE"]).apply(null, arguments);
};

var __ZNSt3__24endlIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_ = Module["__ZNSt3__24endlIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_"] = function() {
 return (__ZNSt3__24endlIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_ = Module["__ZNSt3__24endlIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_"] = Module["asm"]["_ZNSt3__24endlIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_"]).apply(null, arguments);
};

var __ZNK4Json5ValueeqERKS0_ = Module["__ZNK4Json5ValueeqERKS0_"] = function() {
 return (__ZNK4Json5ValueeqERKS0_ = Module["__ZNK4Json5ValueeqERKS0_"] = Module["asm"]["_ZNK4Json5ValueeqERKS0_"]).apply(null, arguments);
};

var __ZNK4Json5Value5isIntEv = Module["__ZNK4Json5Value5isIntEv"] = function() {
 return (__ZNK4Json5Value5isIntEv = Module["__ZNK4Json5Value5isIntEv"] = Module["asm"]["_ZNK4Json5Value5isIntEv"]).apply(null, arguments);
};

var __ZNK4Json5Value4sizeEv = Module["__ZNK4Json5Value4sizeEv"] = function() {
 return (__ZNK4Json5Value4sizeEv = Module["__ZNK4Json5Value4sizeEv"] = Module["asm"]["_ZNK4Json5Value4sizeEv"]).apply(null, arguments);
};

var __ZNK4Json5Value6isNullEv = Module["__ZNK4Json5Value6isNullEv"] = function() {
 return (__ZNK4Json5Value6isNullEv = Module["__ZNK4Json5Value6isNullEv"] = Module["asm"]["_ZNK4Json5Value6isNullEv"]).apply(null, arguments);
};

var __ZN4Json5ValueixEj = Module["__ZN4Json5ValueixEj"] = function() {
 return (__ZN4Json5ValueixEj = Module["__ZN4Json5ValueixEj"] = Module["asm"]["_ZN4Json5ValueixEj"]).apply(null, arguments);
};

var __ZNK4Json5ValueixEi = Module["__ZNK4Json5ValueixEi"] = function() {
 return (__ZNK4Json5ValueixEi = Module["__ZNK4Json5ValueixEi"] = Module["asm"]["_ZNK4Json5ValueixEi"]).apply(null, arguments);
};

var __ZNK4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE = Module["__ZNK4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"] = function() {
 return (__ZNK4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE = Module["__ZNK4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"] = Module["asm"]["_ZNK4Json5ValueixERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"]).apply(null, arguments);
};

var __ZN4Json5Value6appendERKS0_ = Module["__ZN4Json5Value6appendERKS0_"] = function() {
 return (__ZN4Json5Value6appendERKS0_ = Module["__ZN4Json5Value6appendERKS0_"] = Module["asm"]["_ZN4Json5Value6appendERKS0_"]).apply(null, arguments);
};

var __ZN4Json5Value6appendEOS0_ = Module["__ZN4Json5Value6appendEOS0_"] = function() {
 return (__ZN4Json5Value6appendEOS0_ = Module["__ZN4Json5Value6appendEOS0_"] = Module["asm"]["_ZN4Json5Value6appendEOS0_"]).apply(null, arguments);
};

var __ZNK4Json5Value14getMemberNamesEv = Module["__ZNK4Json5Value14getMemberNamesEv"] = function() {
 return (__ZNK4Json5Value14getMemberNamesEv = Module["__ZNK4Json5Value14getMemberNamesEv"] = Module["asm"]["_ZNK4Json5Value14getMemberNamesEv"]).apply(null, arguments);
};

var __ZNK4Json5Value8isStringEv = Module["__ZNK4Json5Value8isStringEv"] = function() {
 return (__ZNK4Json5Value8isStringEv = Module["__ZNK4Json5Value8isStringEv"] = Module["asm"]["_ZNK4Json5Value8isStringEv"]).apply(null, arguments);
};

var __ZNK4Json5Value14toStyledStringEv = Module["__ZNK4Json5Value14toStyledStringEv"] = function() {
 return (__ZNK4Json5Value14toStyledStringEv = Module["__ZNK4Json5Value14toStyledStringEv"] = Module["asm"]["_ZNK4Json5Value14toStyledStringEv"]).apply(null, arguments);
};

var _malloc = Module["_malloc"] = function() {
 return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
};

var _free = Module["_free"] = function() {
 return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
};

var __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc"] = function() {
 return (__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc"] = Module["asm"]["_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc"]).apply(null, arguments);
};

var __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv"] = function() {
 return (__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv"] = Module["asm"]["_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv"]).apply(null, arguments);
};

var __ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE21__push_back_slow_pathIS6_EEvOT_ = Module["__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE21__push_back_slow_pathIS6_EEvOT_"] = function() {
 return (__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE21__push_back_slow_pathIS6_EEvOT_ = Module["__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE21__push_back_slow_pathIS6_EEvOT_"] = Module["asm"]["_ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE21__push_back_slow_pathIS6_EEvOT_"]).apply(null, arguments);
};

var __ZN4Json5ValueC1ERKS0_ = Module["__ZN4Json5ValueC1ERKS0_"] = function() {
 return (__ZN4Json5ValueC1ERKS0_ = Module["__ZN4Json5ValueC1ERKS0_"] = Module["asm"]["_ZN4Json5ValueC1ERKS0_"]).apply(null, arguments);
};

var __ZNSt3__2eqIcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EEPKS6_ = Module["__ZNSt3__2eqIcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EEPKS6_"] = function() {
 return (__ZNSt3__2eqIcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EEPKS6_ = Module["__ZNSt3__2eqIcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EEPKS6_"] = Module["asm"]["_ZNSt3__2eqIcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EEPKS6_"]).apply(null, arguments);
};

var __ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmPKcm = Module["__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmPKcm"] = function() {
 return (__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmPKcm = Module["__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmPKcm"] = Module["asm"]["_ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmPKcm"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc"]).apply(null, arguments);
};

var _DC_IsModuleInvalid = Module["_DC_IsModuleInvalid"] = function() {
 return (_DC_IsModuleInvalid = Module["_DC_IsModuleInvalid"] = Module["asm"]["DC_IsModuleInvalid"]).apply(null, arguments);
};

var _DC_IsInstanceMode = Module["_DC_IsInstanceMode"] = function() {
 return (_DC_IsInstanceMode = Module["_DC_IsInstanceMode"] = Module["asm"]["DC_IsInstanceMode"]).apply(null, arguments);
};

var _DC_ChangeInstanceNum = Module["_DC_ChangeInstanceNum"] = function() {
 return (_DC_ChangeInstanceNum = Module["_DC_ChangeInstanceNum"] = Module["asm"]["DC_ChangeInstanceNum"]).apply(null, arguments);
};

var __ZN9dynamsoft4core10CImageDataC2Ev = Module["__ZN9dynamsoft4core10CImageDataC2Ev"] = function() {
 return (__ZN9dynamsoft4core10CImageDataC2Ev = Module["__ZN9dynamsoft4core10CImageDataC2Ev"] = Module["asm"]["_ZN9dynamsoft4core10CImageDataC2Ev"]).apply(null, arguments);
};

var __ZN9dynamsoft4core10CImageDataD2Ev = Module["__ZN9dynamsoft4core10CImageDataD2Ev"] = function() {
 return (__ZN9dynamsoft4core10CImageDataD2Ev = Module["__ZN9dynamsoft4core10CImageDataD2Ev"] = Module["asm"]["_ZN9dynamsoft4core10CImageDataD2Ev"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData8GetBytesEv = Module["__ZNK9dynamsoft4core10CImageData8GetBytesEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData8GetBytesEv = Module["__ZNK9dynamsoft4core10CImageData8GetBytesEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData8GetBytesEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData14GetBytesLengthEv = Module["__ZNK9dynamsoft4core10CImageData14GetBytesLengthEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData14GetBytesLengthEv = Module["__ZNK9dynamsoft4core10CImageData14GetBytesLengthEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData14GetBytesLengthEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData8GetWidthEv = Module["__ZNK9dynamsoft4core10CImageData8GetWidthEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData8GetWidthEv = Module["__ZNK9dynamsoft4core10CImageData8GetWidthEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData8GetWidthEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData9GetHeightEv = Module["__ZNK9dynamsoft4core10CImageData9GetHeightEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData9GetHeightEv = Module["__ZNK9dynamsoft4core10CImageData9GetHeightEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData9GetHeightEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData9GetStrideEv = Module["__ZNK9dynamsoft4core10CImageData9GetStrideEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData9GetStrideEv = Module["__ZNK9dynamsoft4core10CImageData9GetStrideEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData9GetStrideEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData19GetImagePixelFormatEv = Module["__ZNK9dynamsoft4core10CImageData19GetImagePixelFormatEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData19GetImagePixelFormatEv = Module["__ZNK9dynamsoft4core10CImageData19GetImagePixelFormatEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData19GetImagePixelFormatEv"]).apply(null, arguments);
};

var __ZNK9dynamsoft4core10CImageData14GetOrientationEv = Module["__ZNK9dynamsoft4core10CImageData14GetOrientationEv"] = function() {
 return (__ZNK9dynamsoft4core10CImageData14GetOrientationEv = Module["__ZNK9dynamsoft4core10CImageData14GetOrientationEv"] = Module["asm"]["_ZNK9dynamsoft4core10CImageData14GetOrientationEv"]).apply(null, arguments);
};

var __ZN9dynamsoft4core10CImageDataC1EiPhiii16ImagePixelFormati = Module["__ZN9dynamsoft4core10CImageDataC1EiPhiii16ImagePixelFormati"] = function() {
 return (__ZN9dynamsoft4core10CImageDataC1EiPhiii16ImagePixelFormati = Module["__ZN9dynamsoft4core10CImageDataC1EiPhiii16ImagePixelFormati"] = Module["asm"]["_ZN9dynamsoft4core10CImageDataC1EiPhiii16ImagePixelFormati"]).apply(null, arguments);
};

var __ZN9dynamsoft4core10CImageDataD1Ev = Module["__ZN9dynamsoft4core10CImageDataD1Ev"] = function() {
 return (__ZN9dynamsoft4core10CImageDataD1Ev = Module["__ZN9dynamsoft4core10CImageDataD1Ev"] = Module["asm"]["_ZN9dynamsoft4core10CImageDataD1Ev"]).apply(null, arguments);
};

var _toupper = Module["_toupper"] = function() {
 return (_toupper = Module["_toupper"] = Module["asm"]["toupper"]).apply(null, arguments);
};

var __ZNSt3__25mutexD1Ev = Module["__ZNSt3__25mutexD1Ev"] = function() {
 return (__ZNSt3__25mutexD1Ev = Module["__ZNSt3__25mutexD1Ev"] = Module["asm"]["_ZNSt3__25mutexD1Ev"]).apply(null, arguments);
};

var _fwrite = Module["_fwrite"] = function() {
 return (_fwrite = Module["_fwrite"] = Module["asm"]["fwrite"]).apply(null, arguments);
};

var __ZNSt3__25mutex4lockEv = Module["__ZNSt3__25mutex4lockEv"] = function() {
 return (__ZNSt3__25mutex4lockEv = Module["__ZNSt3__25mutex4lockEv"] = Module["asm"]["_ZNSt3__25mutex4lockEv"]).apply(null, arguments);
};

var __ZNSt3__25mutex6unlockEv = Module["__ZNSt3__25mutex6unlockEv"] = function() {
 return (__ZNSt3__25mutex6unlockEv = Module["__ZNSt3__25mutex6unlockEv"] = Module["asm"]["_ZNSt3__25mutex6unlockEv"]).apply(null, arguments);
};

var _siprintf = Module["_siprintf"] = function() {
 return (_siprintf = Module["_siprintf"] = Module["asm"]["siprintf"]).apply(null, arguments);
};

var _vsnprintf = Module["_vsnprintf"] = function() {
 return (_vsnprintf = Module["_vsnprintf"] = Module["asm"]["vsnprintf"]).apply(null, arguments);
};

var __ZN9dynamsoft5DMLog12WriteTextLogEiPKcz = Module["__ZN9dynamsoft5DMLog12WriteTextLogEiPKcz"] = function() {
 return (__ZN9dynamsoft5DMLog12WriteTextLogEiPKcz = Module["__ZN9dynamsoft5DMLog12WriteTextLogEiPKcz"] = Module["asm"]["_ZN9dynamsoft5DMLog12WriteTextLogEiPKcz"]).apply(null, arguments);
};

var __ZN9dynamsoft5DMLog17WriteFuncStartLogEiPKc = Module["__ZN9dynamsoft5DMLog17WriteFuncStartLogEiPKc"] = function() {
 return (__ZN9dynamsoft5DMLog17WriteFuncStartLogEiPKc = Module["__ZN9dynamsoft5DMLog17WriteFuncStartLogEiPKc"] = Module["asm"]["_ZN9dynamsoft5DMLog17WriteFuncStartLogEiPKc"]).apply(null, arguments);
};

var __ZN9dynamsoft5DMLog15WriteFuncEndLogEiPKci = Module["__ZN9dynamsoft5DMLog15WriteFuncEndLogEiPKci"] = function() {
 return (__ZN9dynamsoft5DMLog15WriteFuncEndLogEiPKci = Module["__ZN9dynamsoft5DMLog15WriteFuncEndLogEiPKci"] = Module["asm"]["_ZN9dynamsoft5DMLog15WriteFuncEndLogEiPKci"]).apply(null, arguments);
};

var __ZN9dynamsoft5DMLog12AllowLoggingEiNS_7LogModeE = Module["__ZN9dynamsoft5DMLog12AllowLoggingEiNS_7LogModeE"] = function() {
 return (__ZN9dynamsoft5DMLog12AllowLoggingEiNS_7LogModeE = Module["__ZN9dynamsoft5DMLog12AllowLoggingEiNS_7LogModeE"] = Module["asm"]["_ZN9dynamsoft5DMLog12AllowLoggingEiNS_7LogModeE"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKcm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKcm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKcm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKcm"]).apply(null, arguments);
};

var __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcmm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcmm"] = function() {
 return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcmm = Module["__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcmm"] = Module["asm"]["_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcmm"]).apply(null, arguments);
};

var __ZN9dynamsoft14InitLogFromDLLERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE = Module["__ZN9dynamsoft14InitLogFromDLLERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE"] = function() {
 return (__ZN9dynamsoft14InitLogFromDLLERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE = Module["__ZN9dynamsoft14InitLogFromDLLERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE"] = Module["asm"]["_ZN9dynamsoft14InitLogFromDLLERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE"]).apply(null, arguments);
};

var __ZN9dynamsoft11WriteImgLogEPFbPKvPKcEPviS3_z = Module["__ZN9dynamsoft11WriteImgLogEPFbPKvPKcEPviS3_z"] = function() {
 return (__ZN9dynamsoft11WriteImgLogEPFbPKvPKcEPviS3_z = Module["__ZN9dynamsoft11WriteImgLogEPFbPKvPKcEPviS3_z"] = Module["asm"]["_ZN9dynamsoft11WriteImgLogEPFbPKvPKcEPviS3_z"]).apply(null, arguments);
};

var __ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEPKc = Module["__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEPKc"] = function() {
 return (__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEPKc = Module["__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEPKc"] = Module["asm"]["_ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEPKc"]).apply(null, arguments);
};

var __ZNSt3__213basic_istreamIcNS_11char_traitsIcEEErsERi = Module["__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEErsERi"] = function() {
 return (__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEErsERi = Module["__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEErsERi"] = Module["asm"]["_ZNSt3__213basic_istreamIcNS_11char_traitsIcEEErsERi"]).apply(null, arguments);
};

var _acos = Module["_acos"] = function() {
 return (_acos = Module["_acos"] = Module["asm"]["acos"]).apply(null, arguments);
};

var _atan2 = Module["_atan2"] = function() {
 return (_atan2 = Module["_atan2"] = Module["asm"]["atan2"]).apply(null, arguments);
};

var _cos = Module["_cos"] = function() {
 return (_cos = Module["_cos"] = Module["asm"]["cos"]).apply(null, arguments);
};

var _cosf = Module["_cosf"] = function() {
 return (_cosf = Module["_cosf"] = Module["asm"]["cosf"]).apply(null, arguments);
};

var _expf = Module["_expf"] = function() {
 return (_expf = Module["_expf"] = Module["asm"]["expf"]).apply(null, arguments);
};

var __get_tzname = Module["__get_tzname"] = function() {
 return (__get_tzname = Module["__get_tzname"] = Module["asm"]["_get_tzname"]).apply(null, arguments);
};

var __get_daylight = Module["__get_daylight"] = function() {
 return (__get_daylight = Module["__get_daylight"] = Module["asm"]["_get_daylight"]).apply(null, arguments);
};

var __get_timezone = Module["__get_timezone"] = function() {
 return (__get_timezone = Module["__get_timezone"] = Module["asm"]["_get_timezone"]).apply(null, arguments);
};

var _fflush = Module["_fflush"] = function() {
 return (_fflush = Module["_fflush"] = Module["asm"]["fflush"]).apply(null, arguments);
};

var _memset = Module["_memset"] = function() {
 return (_memset = Module["_memset"] = Module["asm"]["memset"]).apply(null, arguments);
};

var _fiprintf = Module["_fiprintf"] = function() {
 return (_fiprintf = Module["_fiprintf"] = Module["asm"]["fiprintf"]).apply(null, arguments);
};

var _memcpy = Module["_memcpy"] = function() {
 return (_memcpy = Module["_memcpy"] = Module["asm"]["memcpy"]).apply(null, arguments);
};

var _getenv = Module["_getenv"] = function() {
 return (_getenv = Module["_getenv"] = Module["asm"]["getenv"]).apply(null, arguments);
};

var _ldexp = Module["_ldexp"] = function() {
 return (_ldexp = Module["_ldexp"] = Module["asm"]["ldexp"]).apply(null, arguments);
};

var _pthread_getspecific = Module["_pthread_getspecific"] = function() {
 return (_pthread_getspecific = Module["_pthread_getspecific"] = Module["asm"]["pthread_getspecific"]).apply(null, arguments);
};

var _pthread_setspecific = Module["_pthread_setspecific"] = function() {
 return (_pthread_setspecific = Module["_pthread_setspecific"] = Module["asm"]["pthread_setspecific"]).apply(null, arguments);
};

var _pthread_key_delete = Module["_pthread_key_delete"] = function() {
 return (_pthread_key_delete = Module["_pthread_key_delete"] = Module["asm"]["pthread_key_delete"]).apply(null, arguments);
};

var _pthread_key_create = Module["_pthread_key_create"] = function() {
 return (_pthread_key_create = Module["_pthread_key_create"] = Module["asm"]["pthread_key_create"]).apply(null, arguments);
};

var _lrint = Module["_lrint"] = function() {
 return (_lrint = Module["_lrint"] = Module["asm"]["lrint"]).apply(null, arguments);
};

var _lrintf = Module["_lrintf"] = function() {
 return (_lrintf = Module["_lrintf"] = Module["asm"]["lrintf"]).apply(null, arguments);
};

var _sin = Module["_sin"] = function() {
 return (_sin = Module["_sin"] = Module["asm"]["sin"]).apply(null, arguments);
};

var _sinf = Module["_sinf"] = function() {
 return (_sinf = Module["_sinf"] = Module["asm"]["sinf"]).apply(null, arguments);
};

var _sysconf = Module["_sysconf"] = function() {
 return (_sysconf = Module["_sysconf"] = Module["asm"]["sysconf"]).apply(null, arguments);
};

var _setThrew = Module["_setThrew"] = function() {
 return (_setThrew = Module["_setThrew"] = Module["asm"]["setThrew"]).apply(null, arguments);
};

var stackSave = Module["stackSave"] = function() {
 return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
};

var stackRestore = Module["stackRestore"] = function() {
 return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
};

var stackAlloc = Module["stackAlloc"] = function() {
 return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
};

var __ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_ = Module["__ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_"] = function() {
 return (__ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_ = Module["__ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_"] = Module["asm"]["_ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_"]).apply(null, arguments);
};

var __ZSt17rethrow_exceptionSt13exception_ptr = Module["__ZSt17rethrow_exceptionSt13exception_ptr"] = function() {
 return (__ZSt17rethrow_exceptionSt13exception_ptr = Module["__ZSt17rethrow_exceptionSt13exception_ptr"] = Module["asm"]["_ZSt17rethrow_exceptionSt13exception_ptr"]).apply(null, arguments);
};

var __ZNSt13exception_ptrD1Ev = Module["__ZNSt13exception_ptrD1Ev"] = function() {
 return (__ZNSt13exception_ptrD1Ev = Module["__ZNSt13exception_ptrD1Ev"] = Module["asm"]["_ZNSt13exception_ptrD1Ev"]).apply(null, arguments);
};

var __ZNSt13exception_ptrC1ERKS_ = Module["__ZNSt13exception_ptrC1ERKS_"] = function() {
 return (__ZNSt13exception_ptrC1ERKS_ = Module["__ZNSt13exception_ptrC1ERKS_"] = Module["asm"]["_ZNSt13exception_ptrC1ERKS_"]).apply(null, arguments);
};

var __ZNSt3__217bad_function_callD1Ev = Module["__ZNSt3__217bad_function_callD1Ev"] = function() {
 return (__ZNSt3__217bad_function_callD1Ev = Module["__ZNSt3__217bad_function_callD1Ev"] = Module["asm"]["_ZNSt3__217bad_function_callD1Ev"]).apply(null, arguments);
};

var __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi"] = function() {
 return (__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi"] = Module["asm"]["_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi"]).apply(null, arguments);
};

var __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm"] = function() {
 return (__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm = Module["__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm"] = Module["asm"]["_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm"]).apply(null, arguments);
};

var _emscripten_builtin_malloc = Module["_emscripten_builtin_malloc"] = function() {
 return (_emscripten_builtin_malloc = Module["_emscripten_builtin_malloc"] = Module["asm"]["emscripten_builtin_malloc"]).apply(null, arguments);
};

var __ZNSt9exceptionD2Ev = Module["__ZNSt9exceptionD2Ev"] = function() {
 return (__ZNSt9exceptionD2Ev = Module["__ZNSt9exceptionD2Ev"] = Module["asm"]["_ZNSt9exceptionD2Ev"]).apply(null, arguments);
};

var __ZNSt3__219__shared_weak_count14__release_weakEv = Module["__ZNSt3__219__shared_weak_count14__release_weakEv"] = function() {
 return (__ZNSt3__219__shared_weak_count14__release_weakEv = Module["__ZNSt3__219__shared_weak_count14__release_weakEv"] = Module["asm"]["_ZNSt3__219__shared_weak_count14__release_weakEv"]).apply(null, arguments);
};

var __ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info = Module["__ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info"] = function() {
 return (__ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info = Module["__ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info"] = Module["asm"]["_ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info"]).apply(null, arguments);
};

var __ZNSt3__219__shared_weak_countD2Ev = Module["__ZNSt3__219__shared_weak_countD2Ev"] = function() {
 return (__ZNSt3__219__shared_weak_countD2Ev = Module["__ZNSt3__219__shared_weak_countD2Ev"] = Module["asm"]["_ZNSt3__219__shared_weak_countD2Ev"]).apply(null, arguments);
};

var __ZNSt3__215recursive_mutex4lockEv = Module["__ZNSt3__215recursive_mutex4lockEv"] = function() {
 return (__ZNSt3__215recursive_mutex4lockEv = Module["__ZNSt3__215recursive_mutex4lockEv"] = Module["asm"]["_ZNSt3__215recursive_mutex4lockEv"]).apply(null, arguments);
};

var __ZNSt3__215recursive_mutex6unlockEv = Module["__ZNSt3__215recursive_mutex6unlockEv"] = function() {
 return (__ZNSt3__215recursive_mutex6unlockEv = Module["__ZNSt3__215recursive_mutex6unlockEv"] = Module["asm"]["_ZNSt3__215recursive_mutex6unlockEv"]).apply(null, arguments);
};

var __ZNSt3__215recursive_mutexC1Ev = Module["__ZNSt3__215recursive_mutexC1Ev"] = function() {
 return (__ZNSt3__215recursive_mutexC1Ev = Module["__ZNSt3__215recursive_mutexC1Ev"] = Module["asm"]["_ZNSt3__215recursive_mutexC1Ev"]).apply(null, arguments);
};

var __ZNSt3__215recursive_mutexD1Ev = Module["__ZNSt3__215recursive_mutexD1Ev"] = function() {
 return (__ZNSt3__215recursive_mutexD1Ev = Module["__ZNSt3__215recursive_mutexD1Ev"] = Module["asm"]["_ZNSt3__215recursive_mutexD1Ev"]).apply(null, arguments);
};

var _posix_memalign = Module["_posix_memalign"] = function() {
 return (_posix_memalign = Module["_posix_memalign"] = Module["asm"]["posix_memalign"]).apply(null, arguments);
};

var __ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi = Module["__ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi"] = function() {
 return (__ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi = Module["__ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi"] = Module["asm"]["_ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi"]).apply(null, arguments);
};

var __ZNSt3__29to_stringEl = Module["__ZNSt3__29to_stringEl"] = function() {
 return (__ZNSt3__29to_stringEl = Module["__ZNSt3__29to_stringEl"] = Module["asm"]["_ZNSt3__29to_stringEl"]).apply(null, arguments);
};

var __ZNSt3__29to_stringEx = Module["__ZNSt3__29to_stringEx"] = function() {
 return (__ZNSt3__29to_stringEx = Module["__ZNSt3__29to_stringEx"] = Module["asm"]["_ZNSt3__29to_stringEx"]).apply(null, arguments);
};

var __ZNSt3__26thread20hardware_concurrencyEv = Module["__ZNSt3__26thread20hardware_concurrencyEv"] = function() {
 return (__ZNSt3__26thread20hardware_concurrencyEv = Module["__ZNSt3__26thread20hardware_concurrencyEv"] = Module["asm"]["_ZNSt3__26thread20hardware_concurrencyEv"]).apply(null, arguments);
};

var _emscripten_builtin_free = Module["_emscripten_builtin_free"] = function() {
 return (_emscripten_builtin_free = Module["_emscripten_builtin_free"] = Module["asm"]["emscripten_builtin_free"]).apply(null, arguments);
};

var _memmove = Module["_memmove"] = function() {
 return (_memmove = Module["_memmove"] = Module["asm"]["memmove"]).apply(null, arguments);
};

var dynCall_jiji = Module["dynCall_jiji"] = function() {
 return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
};

var dynCall_viijii = Module["dynCall_viijii"] = function() {
 return (dynCall_viijii = Module["dynCall_viijii"] = Module["asm"]["dynCall_viijii"]).apply(null, arguments);
};

var dynCall_iiiiij = Module["dynCall_iiiiij"] = function() {
 return (dynCall_iiiiij = Module["dynCall_iiiiij"] = Module["asm"]["dynCall_iiiiij"]).apply(null, arguments);
};

var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = function() {
 return (dynCall_iiiiijj = Module["dynCall_iiiiijj"] = Module["asm"]["dynCall_iiiiijj"]).apply(null, arguments);
};

var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = function() {
 return (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = Module["asm"]["dynCall_iiiiiijj"]).apply(null, arguments);
};

var _orig$_ZN8corewasm19getCurrentTimeStampEv = Module["_orig$_ZN8corewasm19getCurrentTimeStampEv"] = function() {
 return (_orig$_ZN8corewasm19getCurrentTimeStampEv = Module["_orig$_ZN8corewasm19getCurrentTimeStampEv"] = Module["asm"]["orig$_ZN8corewasm19getCurrentTimeStampEv"]).apply(null, arguments);
};

var _orig$_ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi = Module["_orig$_ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi"] = function() {
 return (_orig$_ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi = Module["_orig$_ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi"] = Module["asm"]["orig$_ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi"]).apply(null, arguments);
};

var _orig$_ZNSt3__29to_stringEx = Module["_orig$_ZNSt3__29to_stringEx"] = function() {
 return (_orig$_ZNSt3__29to_stringEx = Module["_orig$_ZNSt3__29to_stringEx"] = Module["asm"]["orig$_ZNSt3__29to_stringEx"]).apply(null, arguments);
};

var __ZN8corewasm9sm_bDebugE = Module["__ZN8corewasm9sm_bDebugE"] = 31988;

var __ZN8corewasm14sm_bRuntimeKeyE = Module["__ZN8corewasm14sm_bRuntimeKeyE"] = 31989;

var __ZN8corewasm19sm_urlLicenseServerE = Module["__ZN8corewasm19sm_urlLicenseServerE"] = 31992;

var __ZN8corewasm15sm_bUnsendUsageE = Module["__ZN8corewasm15sm_bUnsendUsageE"] = 32004;

var __ZN8corewasm16sm_lLastPostTimeE = Module["__ZN8corewasm16sm_lLastPostTimeE"] = 25888;

var __ZN8corewasm16sm_iPostIntervalE = Module["__ZN8corewasm16sm_iPostIntervalE"] = 25896;

var __ZN8corewasm15sm_jvConsumePkgE = Module["__ZN8corewasm15sm_jvConsumePkgE"] = 32008;

var __ZN8corewasm13sm_iUsingTimeE = Module["__ZN8corewasm13sm_iUsingTimeE"] = 32032;

var __ZN8corewasm14sm_jvUsingTimeE = Module["__ZN8corewasm14sm_jvUsingTimeE"] = 32040;

var __ZTVNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module["__ZTVNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE"] = 27372;

var __ZTTNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module["__ZTTNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE"] = 27432;

var __ZTVNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module["__ZTVNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE"] = 27120;

var __ZTVN10__cxxabiv120__si_class_type_infoE = Module["__ZTVN10__cxxabiv120__si_class_type_infoE"] = 31784;

var __ZTVN10__cxxabiv117__class_type_infoE = Module["__ZTVN10__cxxabiv117__class_type_infoE"] = 31692;

var __ZTISt9exception = Module["__ZTISt9exception"] = 31824;

var __ZTISt12length_error = Module["__ZTISt12length_error"] = 31680;

var __ZTVSt12length_error = Module["__ZTVSt12length_error"] = 31660;

var __ZTVNSt3__29basic_iosIcNS_11char_traitsIcEEEE = Module["__ZTVNSt3__29basic_iosIcNS_11char_traitsIcEEEE"] = 28404;

var __ZTVNSt3__28ios_baseE = Module["__ZTVNSt3__28ios_baseE"] = 28432;

var __ZNSt3__25ctypeIcE2idE = Module["__ZNSt3__25ctypeIcE2idE"] = 36484;

var __ZN9dynamsoft5DMLog10m_instanceE = Module["__ZN9dynamsoft5DMLog10m_instanceE"] = 32168;

var _stderr = Module["_stderr"] = 31504;

var _stdout = Module["_stdout"] = 28252;

var __ZTVNSt3__217bad_function_callE = Module["__ZTVNSt3__217bad_function_callE"] = 31764;

var __ZTVN10__cxxabiv121__vmi_class_type_infoE = Module["__ZTVN10__cxxabiv121__vmi_class_type_infoE"] = 31576;

var __ZTVNSt3__214__shared_countE = Module["__ZTVNSt3__214__shared_countE"] = 31516;

var __ZTVNSt3__219__shared_weak_countE = Module["__ZTVNSt3__219__shared_weak_countE"] = 31428;

var __ZTINSt3__219__shared_weak_countE = Module["__ZTINSt3__219__shared_weak_countE"] = 31456;

var __ZTVSt9exception = Module["__ZTVSt9exception"] = 31740;

Module["allocate"] = allocate;

var calledRun;

function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function callMain(args) {
 var entryFunction = Module["_main"];
 if (!entryFunction) return;
 args = args || [];
 var argc = args.length + 1;
 var argv = stackAlloc((argc + 1) * 4);
 HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
 for (var i = 1; i < argc; i++) {
  HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
 }
 HEAP32[(argv >> 2) + argc] = 0;
 try {
  var ret = entryFunction(argc, argv);
  exit(ret, true);
  return ret;
 } catch (e) {
  return handleException(e);
 } finally {
  calledMain = true;
 }
}

var dylibsLoaded = false;

function run(args) {
 args = args || arguments_;
 if (runDependencies > 0) {
  return;
 }
 if (!dylibsLoaded) {
  preloadDylibs();
  dylibsLoaded = true;
  if (runDependencies > 0) {
   return;
  }
 }
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (shouldRunNow) callMain(args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
}

Module["run"] = run;

function exit(status, implicit) {
 EXITSTATUS = status;
 if (keepRuntimeAlive()) {} else {
  exitRuntime();
 }
 procExit(status);
}

function procExit(code) {
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  if (Module["onExit"]) Module["onExit"](code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

var shouldRunNow = true;

if (Module["noInitialRun"]) shouldRunNow = false;

run();

function WrapperObject() {}

WrapperObject.prototype = Object.create(WrapperObject.prototype);

WrapperObject.prototype.constructor = WrapperObject;

WrapperObject.prototype.__class__ = WrapperObject;

WrapperObject.__cache__ = {};

Module["WrapperObject"] = WrapperObject;

function getCache(__class__) {
 return (__class__ || WrapperObject).__cache__;
}

Module["getCache"] = getCache;

function wrapPointer(ptr, __class__) {
 var cache = getCache(__class__);
 var ret = cache[ptr];
 if (ret) return ret;
 ret = Object.create((__class__ || WrapperObject).prototype);
 ret.ptr = ptr;
 return cache[ptr] = ret;
}

Module["wrapPointer"] = wrapPointer;

function castObject(obj, __class__) {
 return wrapPointer(obj.ptr, __class__);
}

Module["castObject"] = castObject;

Module["NULL"] = wrapPointer(0);

function destroy(obj) {
 if (!obj["__destroy__"]) throw "Error: Cannot destroy object. (Did you create it yourself?)";
 obj["__destroy__"]();
 delete getCache(obj.__class__)[obj.ptr];
}

Module["destroy"] = destroy;

function compare(obj1, obj2) {
 return obj1.ptr === obj2.ptr;
}

Module["compare"] = compare;

function getPointer(obj) {
 return obj.ptr;
}

Module["getPointer"] = getPointer;

function getClass(obj) {
 return obj.__class__;
}

Module["getClass"] = getClass;

var ensureCache = {
 buffer: 0,
 size: 0,
 pos: 0,
 temps: [],
 needed: 0,
 prepare: function() {
  if (ensureCache.needed) {
   for (var i = 0; i < ensureCache.temps.length; i++) {
    Module["_free"](ensureCache.temps[i]);
   }
   ensureCache.temps.length = 0;
   Module["_free"](ensureCache.buffer);
   ensureCache.buffer = 0;
   ensureCache.size += ensureCache.needed;
   ensureCache.needed = 0;
  }
  if (!ensureCache.buffer) {
   ensureCache.size += 128;
   ensureCache.buffer = Module["_malloc"](ensureCache.size);
   assert(ensureCache.buffer);
  }
  ensureCache.pos = 0;
 },
 alloc: function(array, view) {
  assert(ensureCache.buffer);
  var bytes = view.BYTES_PER_ELEMENT;
  var len = array.length * bytes;
  len = len + 7 & -8;
  var ret;
  if (ensureCache.pos + len >= ensureCache.size) {
   assert(len > 0);
   ensureCache.needed += len;
   ret = Module["_malloc"](len);
   ensureCache.temps.push(ret);
  } else {
   ret = ensureCache.buffer + ensureCache.pos;
   ensureCache.pos += len;
  }
  return ret;
 },
 copy: function(array, view, offset) {
  offset >>>= 0;
  var bytes = view.BYTES_PER_ELEMENT;
  switch (bytes) {
  case 2:
   offset >>>= 1;
   break;

  case 4:
   offset >>>= 2;
   break;

  case 8:
   offset >>>= 3;
   break;
  }
  for (var i = 0; i < array.length; i++) {
   view[offset + i] = array[i];
  }
 }
};

function ensureString(value) {
 if (typeof value === "string") {
  var intArray = intArrayFromString(value);
  var offset = ensureCache.alloc(intArray, HEAP8);
  ensureCache.copy(intArray, HEAP8, offset);
  return offset;
 }
 return value;
}

function VoidPtr() {
 throw "cannot construct a VoidPtr, no constructor in IDL";
}

VoidPtr.prototype = Object.create(WrapperObject.prototype);

VoidPtr.prototype.constructor = VoidPtr;

VoidPtr.prototype.__class__ = VoidPtr;

VoidPtr.__cache__ = {};

Module["VoidPtr"] = VoidPtr;

VoidPtr.prototype.__destroy__ = function() {
 var self = this.ptr;
 _emscripten_bind_VoidPtr___destroy___0(self);
};

let corewasm = Module["CoreWasm"] = {};

corewasm.init = function(strCfg) {
 ensureCache.prepare();
 if (strCfg && typeof strCfg === "object") strCfg = strCfg.ptr; else strCfg = ensureString(strCfg);
 Module._emscripten_bind_CoreWasm_static_init_1(strCfg);
};
