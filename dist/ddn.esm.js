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
import{engineResourcePaths as e,workerAutoResources as t,mapPackageRegister as n,compareVersion as d,innerVersions as s}from"dynamsoft-core";const r="undefined"==typeof self,i=(()=>{if(!r&&document.currentScript){let e=document.currentScript.src,t=e.indexOf("?");if(-1!=t)e=e.substring(0,t);else{let t=e.indexOf("#");-1!=t&&(e=e.substring(0,t))}return e.substring(0,e.lastIndexOf("/")+1)}return"./"})(),o=e=>{if(null==e&&(e="./"),r);else{let t=document.createElement("a");t.href=e,e=t.href}return e.endsWith("/")||(e+="/"),e};null==e.ddn&&(e.ddn=i),t.ddn={js:!1,wasm:!0},n.ddn={};const c="1.0.0";e.std.version&&d(e.std.version,c)<0&&(e.std.version=c,e.std.path=o(i+`../../dynamsoft-capture-vision-std@${c}/dist/`));const a="2.0.30";e.dip.version&&d(e.dip.version,a)<0&&(e.dip.version=a,e.dip.path=o(i+`../../dynamsoft-image-processing@${a}/dist/`));class u{static getVersion(){const e=s.ddn&&s.ddn.wasm,t=s.ddn&&s.ddn.worker;return`2.0.21(Worker: ${t||"Not Loaded"}, Wasm: ${e||"Not Loaded"})`}}export{u as DocumentNormalizerModule};
