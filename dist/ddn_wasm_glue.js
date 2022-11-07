
// DocumentNormalizerWasm
function DocumentNormalizerWasm() {
  this.ptr = Module._emscripten_bind_DocumentNormalizerWasm_DocumentNormalizerWasm_0();
  getCache(DocumentNormalizerWasm)[this.ptr] = this;
};
DocumentNormalizerWasm.prototype = Object.create(WrapperObject.prototype);
DocumentNormalizerWasm.prototype.constructor = DocumentNormalizerWasm;
DocumentNormalizerWasm.prototype.__class__ = DocumentNormalizerWasm;
DocumentNormalizerWasm.__cache__ = {};
Module['DocumentNormalizerWasm'] = DocumentNormalizerWasm;

DocumentNormalizerWasm.getVersion = function() {
  return UTF8ToString(Module._emscripten_bind_DocumentNormalizerWasm_getVersion_0());
};

DocumentNormalizerWasm.prototype.initRuntimeSettingsFromString = function(content) {
  var self = this.ptr;
  ensureCache.prepare();
  if (content && typeof content === 'object') content = content.ptr;
  else content = ensureString(content);
  return UTF8ToString(Module._emscripten_bind_DocumentNormalizerWasm_initRuntimeSettingsFromString_1(self, content));
};

DocumentNormalizerWasm.prototype.outputRuntimeSettingsToString = function() {
  var self = this.ptr;
  return UTF8ToString(Module._emscripten_bind_DocumentNormalizerWasm_outputRuntimeSettingsToString_0(self));
};

DocumentNormalizerWasm.prototype.detectQuad = function(strSourceImage, templateName) {
  var self = this.ptr;
  ensureCache.prepare();
  if (strSourceImage && typeof strSourceImage === 'object') strSourceImage = strSourceImage.ptr;
  else strSourceImage = ensureString(strSourceImage);
  if (templateName && typeof templateName === 'object') templateName = templateName.ptr;
  else templateName = ensureString(templateName);
  return UTF8ToString(Module._emscripten_bind_DocumentNormalizerWasm_detectQuad_2(self, strSourceImage, templateName));
};

DocumentNormalizerWasm.prototype.normalize = function(strSourceImage, templateName, strQuad) {
  var self = this.ptr;
  ensureCache.prepare();
  if (strSourceImage && typeof strSourceImage === 'object') strSourceImage = strSourceImage.ptr;
  else strSourceImage = ensureString(strSourceImage);
  if (templateName && typeof templateName === 'object') templateName = templateName.ptr;
  else templateName = ensureString(templateName);
  if (strQuad && typeof strQuad === 'object') strQuad = strQuad.ptr;
  else strQuad = ensureString(strQuad);
  return UTF8ToString(Module._emscripten_bind_DocumentNormalizerWasm_normalize_3(self, strSourceImage, templateName, strQuad));
};

DocumentNormalizerWasm.prototype.freeNormalizeResult = function() {
  var self = this.ptr;
  Module._emscripten_bind_DocumentNormalizerWasm_freeNormalizeResult_0(self);
};

DocumentNormalizerWasm.prototype.__destroy__ = function() {
  var self = this.ptr;
  Module._emscripten_bind_DocumentNormalizerWasm___destroy___0(self);
};