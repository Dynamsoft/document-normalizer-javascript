/*!
* Dynamsoft JavaScript Library
* @product Dynamsoft Document Normalizer JS Edition
* @website http://www.dynamsoft.com
* @copyright Copyright 2024, Dynamsoft Corporation
* @author Dynamsoft
* @version 2.0.21
* @fileoverview Dynamsoft JavaScript Library for Document Normalizer
* More info on ddn JS: https://www.dynamsoft.com/document-normalizer/docs/web/programming/javascript/
*/
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports,require("dynamsoft-core")):"function"==typeof define&&define.amd?define(["exports","dynamsoft-core"],n):n(((e="undefined"!=typeof globalThis?globalThis:e||self).Dynamsoft=e.Dynamsoft||{},e.Dynamsoft.DDN={}),e.Dynamsoft.Core)}(this,(function(e,n){"use strict";const s="undefined"==typeof self,t=(()=>{if(!s&&document.currentScript){let e=document.currentScript.src,n=e.indexOf("?");if(-1!=n)e=e.substring(0,n);else{let n=e.indexOf("#");-1!=n&&(e=e.substring(0,n))}return e.substring(0,e.lastIndexOf("/")+1)}return"./"})(),o=e=>{if(null==e&&(e="./"),s);else{let n=document.createElement("a");n.href=e,e=n.href}return e.endsWith("/")||(e+="/"),e};null==n.engineResourcePaths.ddn&&(n.engineResourcePaths.ddn=t),n.workerAutoResources.ddn={js:!1,wasm:!0},n.mapPackageRegister.ddn={};const r="1.0.0";n.engineResourcePaths.std.version&&n.compareVersion(n.engineResourcePaths.std.version,r)<0&&(n.engineResourcePaths.std.version=r,n.engineResourcePaths.std.path=o(t+`../../dynamsoft-capture-vision-std@${r}/dist/`));const i="2.0.30";n.engineResourcePaths.dip.version&&n.compareVersion(n.engineResourcePaths.dip.version,i)<0&&(n.engineResourcePaths.dip.version=i,n.engineResourcePaths.dip.path=o(t+`../../dynamsoft-image-processing@${i}/dist/`));e.DocumentNormalizerModule=class{static getVersion(){const e=n.innerVersions.ddn&&n.innerVersions.ddn.wasm,s=n.innerVersions.ddn&&n.innerVersions.ddn.worker;return`2.0.21(Worker: ${s||"Not Loaded"}, Wasm: ${e||"Not Loaded"})`}},Object.defineProperty(e,"__esModule",{value:!0})}));
