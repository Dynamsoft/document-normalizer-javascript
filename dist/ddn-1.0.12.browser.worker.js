/*!
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Document Normalizer JS Edition
 * @website http://www.dynamsoft.com
 * @copyright Copyright 2023, Dynamsoft Corporation
 * @author Dynamsoft
 * @version 1.0.12 (js 20230104)
 * @fileoverview Dynamsoft JavaScript Library for Document Normalizer
 * More info on ddn JS: https://www.dynamsoft.com/document-normalizer/sdk-javascript/
 */
!function(){"use strict";const e="undefined"==typeof self,t=e?{}:self,r=e=>e&&"object"==typeof e&&"function"==typeof e.then;class n extends Promise{constructor(e){let t,n;super(((e,r)=>{t=e,n=r})),this._s="pending",this.resolve=e=>{this.isPending&&(r(e)?this.task=e:(this._s="fulfilled",t(e)))},this.reject=e=>{this.isPending&&(this._s="rejected",n(e))},this.task=e}get status(){return this._s}get isPending(){return"pending"===this._s}get isFulfilled(){return"fulfilled"===this._s}get isRejected(){return"rejected"===this._s}get task(){return this._task}set task(e){let t;this._task=e,r(e)?t=e:"function"==typeof e&&(t=new Promise(e)),t&&(async()=>{try{const r=await t;e===this._task&&this.resolve(r)}catch(t){e===this._task&&this.reject(t)}})()}get isEmpty(){return null==this._task}}let o,i,a,s,c;if("undefined"!=typeof navigator&&(o=navigator,i=o.userAgent,a=o.platform,s=o.mediaDevices),!e){const e={Edge:{search:"Edg",verSearch:"Edg"},OPR:null,Chrome:null,Safari:{str:o.vendor,search:"Apple",verSearch:["Version","iPhone OS","CPU OS"]},Firefox:null,Explorer:{search:"MSIE",verSearch:"MSIE"}},t={HarmonyOS:null,Android:null,iPhone:null,iPad:null,Windows:{str:a,search:"Win"},Mac:{str:a},Linux:{str:a}};let r="unknownBrowser",n=0,s="unknownOS";for(let t in e){const o=e[t]||{};let a=o.str||i,s=o.search||t,c=o.verStr||i,l=o.verSearch||t;if(l instanceof Array||(l=[l]),-1!=a.indexOf(s)){r=t;for(let e of l){let t=c.indexOf(e);if(-1!=t){n=parseFloat(c.substring(t+e.length+1));break}}break}}for(let e in t){const r=t[e]||{};let n=r.str||i,o=r.search||e;if(-1!=n.indexOf(o)){s=e;break}}"Linux"==s&&-1!=i.indexOf("Windows NT")&&(s="HarmonyOS"),c={browser:r,version:n,OS:s}}e&&(c={browser:"ssr",version:0,OS:"ssr"}),"undefined"!=typeof WebAssembly&&i&&(!/Safari/.test(i)||/Chrome/.test(i)||/\(.+\s11_2_([2-6]).*\)/.test(i)),s&&s.getUserMedia;const l="Chrome"===c.browser&&c.version>66||"Safari"===c.browser&&c.version>13||"OPR"===c.browser&&c.version>43||"Edge"===c.browser&&c.version>15;var d=function(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(e){return}}();function u(e,t){e=e||[],t=t||{};try{return new Blob(e,t)}catch(o){if("TypeError"!==o.name)throw o;for(var r=new("undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder),n=0;n<e.length;n+=1)r.append(e[n]);return r.getBlob(t.type)}}function f(e,t){t&&e.then((function(e){t(null,e)}),(function(e){t(e)}))}function h(e,t,r){"function"==typeof t&&e.then(t),"function"==typeof r&&e.catch(r)}function m(e){return"string"!=typeof e&&(console.warn(`${e} used as a key, but it is not a string.`),e=String(e)),e}function y(){if(arguments.length&&"function"==typeof arguments[arguments.length-1])return arguments[arguments.length-1]}const g="local-forage-detect-blob-support";let p;const v={},b=Object.prototype.toString,w="readonly",_="readwrite";function I(e){return"boolean"==typeof p?Promise.resolve(p):function(e){return new Promise((function(t){var r=e.transaction(g,_),n=u([""]);r.objectStore(g).put(n,"key"),r.onabort=function(e){e.preventDefault(),e.stopPropagation(),t(!1)},r.oncomplete=function(){var e=navigator.userAgent.match(/Chrome\/(\d+)/),r=navigator.userAgent.match(/Edge\//);t(r||!e||parseInt(e[1],10)>=43)}})).catch((function(){return!1}))}(e).then((function(e){return p=e,p}))}function S(e){var t=v[e.name],r={};r.promise=new Promise((function(e,t){r.resolve=e,r.reject=t})),t.deferredOperations.push(r),t.dbReady?t.dbReady=t.dbReady.then((function(){return r.promise})):t.dbReady=r.promise}function P(e){var t=v[e.name].deferredOperations.pop();if(t)return t.resolve(),t.promise}function x(e,t){var r=v[e.name].deferredOperations.pop();if(r)return r.reject(t),r.promise}function k(e,t){return new Promise((function(r,n){if(v[e.name]=v[e.name]||{forages:[],db:null,dbReady:null,deferredOperations:[]},e.db){if(!t)return r(e.db);S(e),e.db.close()}var o=[e.name];t&&o.push(e.version);var i=d.open.apply(d,o);t&&(i.onupgradeneeded=function(t){var r=i.result;try{r.createObjectStore(e.storeName),t.oldVersion<=1&&r.createObjectStore(g)}catch(r){if("ConstraintError"!==r.name)throw r;console.warn('The database "'+e.name+'" has been upgraded from version '+t.oldVersion+" to version "+t.newVersion+', but the storage "'+e.storeName+'" already exists.')}}),i.onerror=function(e){e.preventDefault(),n(i.error)},i.onsuccess=function(){var t=i.result;t.onversionchange=function(e){e.target.close()},r(t),P(e)}}))}function C(e){return k(e,!1)}function N(e){return k(e,!0)}function M(e,t){if(!e.db)return!0;var r=!e.db.objectStoreNames.contains(e.storeName),n=e.version<e.db.version,o=e.version>e.db.version;if(n&&(e.version!==t&&console.warn('The database "'+e.name+"\" can't be downgraded from version "+e.db.version+" to version "+e.version+"."),e.version=e.db.version),o||r){if(r){var i=e.db.version+1;i>e.version&&(e.version=i)}return!0}return!1}function R(e){var t=function(e){for(var t=e.length,r=new ArrayBuffer(t),n=new Uint8Array(r),o=0;o<t;o++)n[o]=e.charCodeAt(o);return r}(atob(e.data));return u([t],{type:e.type})}function B(e){var t=this,r=t._initReady().then((function(){var e=v[t._dbInfo.name];if(e&&e.dbReady)return e.dbReady}));return h(r,e,e),r}function D(e,t,r,n){void 0===n&&(n=1);try{var o=e.db.transaction(e.storeName,t);r(null,o)}catch(o){if(n>0&&(!e.db||"InvalidStateError"===o.name||"NotFoundError"===o.name))return Promise.resolve().then((()=>{if(!e.db||"NotFoundError"===o.name&&!e.db.objectStoreNames.contains(e.storeName)&&e.version<=e.db.version)return e.db&&(e.version=e.db.version+1),N(e)})).then((()=>function(e){S(e);for(var t=v[e.name],r=t.forages,n=0;n<r.length;n++){const e=r[n];e._dbInfo.db&&(e._dbInfo.db.close(),e._dbInfo.db=null)}return e.db=null,C(e).then((t=>(e.db=t,M(e)?N(e):t))).then((n=>{e.db=t.db=n;for(var o=0;o<r.length;o++)r[o]._dbInfo.db=n})).catch((t=>{throw x(e,t),t}))}(e).then((function(){D(e,t,r,n-1)})))).catch(r);r(o)}}var E={_driver:"asyncStorage",_initStorage:function(e){var t=this,r={db:null};if(e)for(var n in e)r[n]=e[n];var o=v[r.name];o||(o={forages:[],db:null,dbReady:null,deferredOperations:[]},v[r.name]=o),o.forages.push(t),t._initReady||(t._initReady=t.ready,t.ready=B);var i=[];function a(){return Promise.resolve()}for(var s=0;s<o.forages.length;s++){var c=o.forages[s];c!==t&&i.push(c._initReady().catch(a))}var l=o.forages.slice(0);return Promise.all(i).then((function(){return r.db=o.db,C(r)})).then((function(e){return r.db=e,M(r,t._defaultConfig.version)?N(r):e})).then((function(e){r.db=o.db=e,t._dbInfo=r;for(var n=0;n<l.length;n++){var i=l[n];i!==t&&(i._dbInfo.db=r.db,i._dbInfo.version=r.version)}}))},_support:function(){try{if(!d||!d.open)return!1;var e="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),t="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return(!e||t)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(e){return!1}}(),getItem:function(e,t){var r=this;e=m(e);var n=new Promise((function(t,n){r.ready().then((function(){D(r._dbInfo,w,(function(o,i){if(o)return n(o);try{var a=i.objectStore(r._dbInfo.storeName).get(e);a.onsuccess=function(){var e=a.result;void 0===e&&(e=null),function(e){return e&&e.__local_forage_encoded_blob}(e)&&(e=R(e)),t(e)},a.onerror=function(){n(a.error)}}catch(e){n(e)}}))})).catch(n)}));return f(n,t),n},setItem:function(e,t,r){var n=this;e=m(e);var o=new Promise((function(r,o){var i;n.ready().then((function(){return i=n._dbInfo,"[object Blob]"===b.call(t)?I(i.db).then((function(e){return e?t:(r=t,new Promise((function(e,t){var n=new FileReader;n.onerror=t,n.onloadend=function(t){var n=btoa(t.target.result||"");e({__local_forage_encoded_blob:!0,data:n,type:r.type})},n.readAsBinaryString(r)})));var r})):t})).then((function(t){D(n._dbInfo,_,(function(i,a){if(i)return o(i);try{var s=a.objectStore(n._dbInfo.storeName);null===t&&(t=void 0);var c=s.put(t,e);a.oncomplete=function(){void 0===t&&(t=null),r(t)},a.onabort=a.onerror=function(){var e=c.error?c.error:c.transaction.error;o(e)}}catch(e){o(e)}}))})).catch(o)}));return f(o,r),o},removeItem:function(e,t){var r=this;e=m(e);var n=new Promise((function(t,n){r.ready().then((function(){D(r._dbInfo,_,(function(o,i){if(o)return n(o);try{var a=i.objectStore(r._dbInfo.storeName).delete(e);i.oncomplete=function(){t()},i.onerror=function(){n(a.error)},i.onabort=function(){var e=a.error?a.error:a.transaction.error;n(e)}}catch(e){n(e)}}))})).catch(n)}));return f(n,t),n},clear:function(e){var t=this,r=new Promise((function(e,r){t.ready().then((function(){D(t._dbInfo,_,(function(n,o){if(n)return r(n);try{var i=o.objectStore(t._dbInfo.storeName).clear();o.oncomplete=function(){e()},o.onabort=o.onerror=function(){var e=i.error?i.error:i.transaction.error;r(e)}}catch(e){r(e)}}))})).catch(r)}));return f(r,e),r},length:function(e){var t=this,r=new Promise((function(e,r){t.ready().then((function(){D(t._dbInfo,w,(function(n,o){if(n)return r(n);try{var i=o.objectStore(t._dbInfo.storeName).count();i.onsuccess=function(){e(i.result)},i.onerror=function(){r(i.error)}}catch(e){r(e)}}))})).catch(r)}));return f(r,e),r},keys:function(e){var t=this,r=new Promise((function(e,r){t.ready().then((function(){D(t._dbInfo,w,(function(n,o){if(n)return r(n);try{var i=o.objectStore(t._dbInfo.storeName).openKeyCursor(),a=[];i.onsuccess=function(){var t=i.result;t?(a.push(t.key),t.continue()):e(a)},i.onerror=function(){r(i.error)}}catch(e){r(e)}}))})).catch(r)}));return f(r,e),r},dropInstance:function(e,t){t=y.apply(this,arguments);var r=this.config();(e="function"!=typeof e&&e||{}).name||(e.name=e.name||r.name,e.storeName=e.storeName||r.storeName);var n,o=this;if(e.name){const t=e.name===r.name&&o._dbInfo.db?Promise.resolve(o._dbInfo.db):C(e).then((t=>{const r=v[e.name],n=r.forages;r.db=t;for(var o=0;o<n.length;o++)n[o]._dbInfo.db=t;return t}));n=e.storeName?t.then((t=>{if(!t.objectStoreNames.contains(e.storeName))return;const r=t.version+1;S(e);const n=v[e.name],o=n.forages;t.close();for(let e=0;e<o.length;e++){const t=o[e];t._dbInfo.db=null,t._dbInfo.version=r}const i=new Promise(((t,n)=>{const o=d.open(e.name,r);o.onerror=e=>{o.result.close(),n(e)},o.onupgradeneeded=()=>{o.result.deleteObjectStore(e.storeName)},o.onsuccess=()=>{const e=o.result;e.close(),t(e)}}));return i.then((e=>{n.db=e;for(let t=0;t<o.length;t++){const r=o[t];r._dbInfo.db=e,P(r._dbInfo)}})).catch((t=>{throw(x(e,t)||Promise.resolve()).catch((()=>{})),t}))})):t.then((t=>{S(e);const r=v[e.name],n=r.forages;t.close();for(var o=0;o<n.length;o++){n[o]._dbInfo.db=null}const i=new Promise(((t,r)=>{var n=d.deleteDatabase(e.name);n.onerror=()=>{const e=n.result;e&&e.close(),r(n.error)},n.onblocked=()=>{console.warn('dropInstance blocked for database "'+e.name+'" until all open connections are closed')},n.onsuccess=()=>{const e=n.result;e&&e.close(),t(e)}}));return i.then((e=>{r.db=e;for(var t=0;t<n.length;t++){P(n[t]._dbInfo)}})).catch((t=>{throw(x(e,t)||Promise.resolve()).catch((()=>{})),t}))}))}else n=Promise.reject("Invalid arguments");return f(n,t),n}};const F=new Map;function O(e,t){let r=e.name+"/";return e.storeName!==t.storeName&&(r+=e.storeName+"/"),r}var T={_driver:"tempStorageWrapper",_initStorage:async function(e){const t={};if(e)for(let r in e)t[r]=e[r];const r=t.keyPrefix=O(e,this._defaultConfig);this._dbInfo=t,F.has(r)||F.set(r,new Map)},getItem:function(e,t){e=m(e);const r=this.ready().then((()=>F.get(this._dbInfo.keyPrefix).get(e)));return f(r,t),r},setItem:function(e,t,r){e=m(e);const n=this.ready().then((()=>(void 0===t&&(t=null),F.get(this._dbInfo.keyPrefix).set(e,t),t)));return f(n,r),n},removeItem:function(e,t){e=m(e);const r=this.ready().then((()=>{F.get(this._dbInfo.keyPrefix).delete(e)}));return f(r,t),r},clear:function(e){const t=this.ready().then((()=>{const e=this._dbInfo.keyPrefix;F.has(e)&&F.delete(e)}));return f(t,e),t},length:function(e){const t=this.ready().then((()=>F.get(this._dbInfo.keyPrefix).size));return f(t,e),t},keys:function(e){const t=this.ready().then((()=>[...F.get(this._dbInfo.keyPrefix).keys()]));return f(t,e),t},dropInstance:function(e,t){if(t=y.apply(this,arguments),!(e="function"!=typeof e&&e||{}).name){const t=this.config();e.name=e.name||t.name,e.storeName=e.storeName||t.storeName}let r;return r=e.name?new Promise((t=>{e.storeName?t(O(e,this._defaultConfig)):t(`${e.name}/`)})).then((e=>{F.delete(e)})):Promise.reject("Invalid arguments"),f(r,t),r}};const A=(e,t)=>{const r=e.length;let n=0;for(;n<r;){if((o=e[n])===(i=t)||"number"==typeof o&&"number"==typeof i&&isNaN(o)&&isNaN(i))return!0;n++}var o,i;return!1},j=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},U={},G={},J={INDEXEDDB:E,TEMPSTORAGE:T},z=[J.INDEXEDDB._driver,J.TEMPSTORAGE._driver],W=["dropInstance"],H=["clear","getItem","keys","length","removeItem","setItem"].concat(W),$={description:"",driver:z.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1};function L(e,t){e[t]=function(){const r=arguments;return e.ready().then((function(){return e[t].apply(e,r)}))}}function V(){for(let e=1;e<arguments.length;e++){const t=arguments[e];if(t)for(let e in t)t.hasOwnProperty(e)&&(j(t[e])?arguments[0][e]=t[e].slice():arguments[0][e]=t[e])}return arguments[0]}class K{constructor(e){for(let e in J)if(J.hasOwnProperty(e)){const t=J[e],r=t._driver;this[e]=r,U[r]||this.defineDriver(t)}this._defaultConfig=V({},$),this._config=V({},this._defaultConfig,e),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch((()=>{}))}config(e){if("object"==typeof e){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(let t in e){if("storeName"===t&&(e[t]=e[t].replace(/\W/g,"_")),"version"===t&&"number"!=typeof e[t])return new Error("Database version must be a number.");this._config[t]=e[t]}return!("driver"in e)||!e.driver||this.setDriver(this._config.driver)}return"string"==typeof e?this._config[e]:this._config}defineDriver(e,t,r){const n=new Promise((function(t,r){try{const n=e._driver,o=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!e._driver)return void r(o);const i=H.concat("_initStorage");for(let t=0,n=i.length;t<n;t++){const n=i[t];if((!A(W,n)||e[n])&&"function"!=typeof e[n])return void r(o)}const a=function(){const t=function(e){return function(){const t=new Error(`Method ${e} is not implemented by the current driver`),r=Promise.reject(t);return f(r,arguments[arguments.length-1]),r}};for(let r=0,n=W.length;r<n;r++){const n=W[r];e[n]||(e[n]=t(n))}};a();const s=function(r){U[n]&&console.info(`Redefining LocalForage driver: ${n}`),U[n]=e,G[n]=r,t()};"_support"in e?e._support&&"function"==typeof e._support?e._support().then(s,r):s(!!e._support):s(!0)}catch(e){r(e)}}));return h(n,t,r),n}driver(){return this._driver||null}getDriver(e,t,r){const n=U[e]?Promise.resolve(U[e]):Promise.reject(new Error("Driver not found."));return h(n,t,r),n}ready(e){const t=this,r=t._driverSet.then((()=>(null===t._ready&&(t._ready=t._initDriver()),t._ready)));return h(r,e,e),r}setDriver(e,t,r){const n=this;j(e)||(e=[e]);const o=this._getSupportedDrivers(e);function i(){n._config.driver=n.driver()}function a(e){return n._extend(e),i(),n._ready=n._initStorage(n._config),n._ready}const s=null!==this._driverSet?this._driverSet.catch((()=>Promise.resolve())):Promise.resolve();return this._driverSet=s.then((()=>{const e=o[0];return n._dbInfo=null,n._ready=null,n.getDriver(e).then((e=>{n._driver=e._driver,i(),n._wrapLibraryMethodsWithReady(),n._initDriver=function(e){return function(){let t=0;return function r(){for(;t<e.length;){let o=e[t];return t++,n._dbInfo=null,n._ready=null,n.getDriver(o).then(a).catch(r)}i();const o=new Error("No available storage method found.");return n._driverSet=Promise.reject(o),n._driverSet}()}}(o)}))})).catch((()=>{i();const e=new Error("No available storage method found.");return n._driverSet=Promise.reject(e),n._driverSet})),h(this._driverSet,t,r),this._driverSet}supports(e){return!!G[e]}_extend(e){V(this,e)}_getSupportedDrivers(e){const t=[];for(let r=0,n=e.length;r<n;r++){const n=e[r];this.supports(n)&&t.push(n)}return t}_wrapLibraryMethodsWithReady(){for(let e=0,t=H.length;e<t;e++)L(this,H[e])}createInstance(e){return new K(e)}}var Z=new K;Date.prototype.kUtilFormat=function(e){const t={"M+":this.getUTCMonth()+1,"d+":this.getUTCDate(),"H+":this.getUTCHours(),"h+":this.getUTCHours()%12||12,"m+":this.getUTCMinutes(),"s+":this.getUTCSeconds(),"q+":Math.floor((this.getUTCMonth()+3)/3),"S+":this.getUTCMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(this.getUTCFullYear()+"").substr(4-RegExp.$1.length)));for(let r in t)new RegExp("("+r+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?t[r]:("000"+t[r]).substr(("000"+t[r]).length-RegExp.$1.length)));return e};let q=e=>{let r,o,i,a,s,c,d,u,f,h=t.btoa,m=t.atob,y=e.bd,g=e.dm;const p=["https://mlts.dynamsoft.com/","https://slts.dynamsoft.com/"];let v,b,w,_,I,S,P,x,k,C,N,M,R,B,D=p,E=!1,F=Promise.resolve(),O=e.log&&((...t)=>{try{e.log.apply(null,t)}catch(e){setTimeout((()=>{throw e}),0)}})||(()=>{}),T=y&&O||(()=>{}),A=e=>e.join(""),j={a:[80,88,27,82,145,164,199,211],b:[187,87,89,128,150,44,190,213],c:[89,51,74,53,99,72,82,118],d:[99,181,118,158,215,103,76,117],e:[99,51,86,105,100,71,120,108],f:[97,87,49,119,98,51,74,48,83,50,86,53],g:[81,85,86,84,76,85,100,68,84,81,32,32],h:[90,87,53,106,99,110,108,119,100,65,32,32],i:[90,71,86,106,99,110,108,119,100,65,32,32],j:[97,88,89,32],k:[29,83,122,137,5,180,157,114],l:[100,71,70,110,84,71,86,117,90,51,82,111]},U=()=>t[A(j.c)][A(j.e)][A(j.f)]("raw",new Uint8Array(j.a.concat(j.b,j.d,j.k)),A(j.g),!0,[A(j.h),A(j.i)]),G=e=>m(m(e.replace(/\n/g,"+").replace(/\s/g,"=")).substring(1)),J=e=>h(String.fromCharCode(97+25*Math.random())+h(e)).replace(/\+/g,"\n").replace(/=/g," "),z=()=>{if(t.crypto){let e=new Uint8Array(36);t.crypto.getRandomValues(e);let r="";for(let t=0;t<36;++t){let n=e[t]%36;r+=n<10?n:String.fromCharCode(n+87)}return r}return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)}))};const W="Failed to connect to the Dynamsoft License Server: ",H={dlsErrorAndCacheExpire:W+"The cached license has expired. Please get connected to the network as soon as possible or contact the site administrator for more information.",publicTrialNetworkTimeout:W+"network timed out. Check your Internet connection or [contact Dynamsoft](https://www.dynamsoft.com/company/contact/) for more information.",networkTimeout:W+"network timed out. Check your Internet connection or contact the site administrator for more information.",publicTrialFailConnect:W+"network connection error. Check your Internet connection or [contact Dynamsoft](https://www.dynamsoft.com/company/contact/) for more information.",failConnect:W+"network connection error. Check your Internet connection or contact the site administrator for more information.",checkLocalTime:"Your system date and time appear to have been changed, causing the license to fail. Please correct the system data and time and try again.",idbTimeout:"Failed to open indexedDB: Timeout."};let $,L,V,K=async()=>{if($)return $;$=new n,await(async()=>{S||(S=Z)})(),await Promise.race([(async()=>{let e=await S.createInstance({name:"dynamjssdkhello"});await e.setItem("dynamjssdkhello","available")})(),new Promise(((e,t)=>{setTimeout((()=>t(new Error(H.idbTimeout))),5e3)}))]),x=await S.createInstance({name:"dynamdlsinfo"}),k=h(h("v2")+String.fromCharCode(g.charCodeAt(g.length/2)+1)+h(g));try{let e=await x.getItem(k);e&&([d,_]=JSON.parse(await G(e)))}catch(e){}try{null==d&&(d=z(),x.setItem(k,await J(JSON.stringify([d,null]))))}catch(e){}$.resolve()},q=async()=>{C=h(String.fromCharCode(a.charCodeAt(0)+10)+h(r)+h(a)+i+h(""+c)),P=await S.createInstance({name:"dynamdlsuns"+h(h("v2"))+h(String.fromCharCode(a.charCodeAt(0)+10)+h(r)+h(a)+i+h(""+c))});try{s=await x.getItem(C)}catch(e){}A=e=>m(String.fromCharCode.apply(null,e).replace(/\n/g,"+").replace(/\s/g,"="))},Q=async e=>{if(L)return L;L=new n;try{let t={pd:r,vm:i,v:o,dt:c||"browser",ed:"javascript",cu:d,ad:g,os:u,fn:f};w&&(t.rmk=w),a&&(t=-1!=a.indexOf("-")?{...t,hs:a}:{...t,og:a});let n={};if(_){let e=await x.getItem(k);e&&([d,_]=JSON.parse(await G(e))),n["lts-time"]=_}b&&(t.sp=b);let l=await Promise.race([(async()=>{let r,o=(new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ");_&&(x.setItem(k,await J(JSON.stringify([d,o]))),_=o);let i,a="auth/?ext="+encodeURIComponent(h(JSON.stringify(t))),c=!1,l=!1,u=async e=>{if(e&&!e.ok)try{let t=await e.text();if(t){let e=JSON.parse(t);e.errorCode&&(i=e,e.errorCode>100&&e.errorCode<200&&(s=null,c=!0,l=!0))}}catch(e){}};try{r=await Promise.race([fetch(D[0]+a,{headers:n,cache:e?"reload":"default",mode:"cors"}),new Promise(((e,t)=>setTimeout(t,1e4)))]),await u(r)}catch(e){}if(!(s||r&&r.ok||c))try{r=await Promise.race([fetch(D[1]+a,{headers:n,mode:"cors"}),new Promise(((e,t)=>setTimeout(t,3e4)))]),await u(r)}catch(e){}if(!(s||r&&r.ok||c))try{r=await Promise.race([fetch(D[0]+a,{headers:n,mode:"cors"}),new Promise(((e,t)=>setTimeout(t,3e4)))]),await u(r)}catch(e){}i&&151==i.errorCode&&(x.removeItem(k),x.removeItem(C),d=z(),t.cu=d,_=void 0,a="auth/?ext="+encodeURIComponent(h(JSON.stringify(t))),r=await Promise.race([fetch(D[0]+a,{headers:n,mode:"cors"}),new Promise(((e,t)=>setTimeout(t,3e4)))]),await u(r));(()=>{if(!r||!r.ok){let e;l&&x.setItem(C,""),i?111==i.errorCode?e=i.message:(e=i.message.trim(),e.endsWith(".")||(e+="."),e=v?`An error occurred during authorization: ${e} [Contact Dynamsoft](https://www.dynamsoft.com/company/contact/) for more information.`:`An error occurred during authorization: ${e} Contact the site administrator for more information.`):e=v?H.publicTrialFailConnect:H.failConnect;let t=Error(e);throw i&&i.errorCode&&(t.ltsErrorCode=i.errorCode),t}})();let f=await r.text();try{_||(x.setItem(k,await J(JSON.stringify([d,o]))),_=o),x.setItem(C,f)}catch(e){}return f})(),new Promise(((e,t)=>{let r;r=v?H.publicTrialNetworkTimeout:H.networkTimeout,setTimeout((()=>t(new Error(r))),s?3e3:15e3)}))]);s=l}catch(e){y&&console.error(e),I=e}L.resolve(),L=null},X=async()=>{V||(V=(async()=>{if(T(d),!s){if(!E)throw O(I.message),I;return}let e={dm:g};y&&(e.bd=!0),e.brtk=!0,e.ls=D[0],a&&(-1!=a.indexOf("-")?e.hs=a:e.og=a),e.cu=d,f&&(e.fn=f),r&&(e.pd=r),o&&(e.v=o),c&&(e.dt=c),u&&(e.os=u),w&&(e.rmk=w),T(s);try{let r=JSON.parse(await(async e=>{if(t[A(j.c)]&&t[A(j.c)][A(j.e)]&&t[A(j.c)][A(j.e)][A(j.f)]){let r=m(e),n=new Uint8Array(r.length);for(let e=0;e<r.length;++e)n[e]=r.charCodeAt(e);let o=n.subarray(0,12),i=n.subarray(o.length);B||(B=await U());let a=await t[A(j.c)][A(j.e)][A(j.i)]({name:A(j.g),[A(j.j)]:o,[A(j.l)]:128},B,i);return String.fromCharCode.apply(null,new Uint8Array(a))}})(s));r.ba&&(e.ba=r.ba),r.usu&&(e.usu=r.usu),r.trial&&(e.trial=r.trial),r.its&&(e.its=r.its),1==e.trial&&r.msg?e.msg=r.msg:I?e.msg=I.message||I:r.msg&&(e.msg=r.msg),e.ar=r.in,e.bafc=!!I}catch(e){}T(e);try{await N(e)}catch(e){T("error updl")}await Y(),E||(E=!0),V=null})()),await V},Y=async()=>{let e=(new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ"),t=await R();if(T(t),t&&t<e)throw I?new Error(H.dlsErrorAndCacheExpire):new Error(H.checkLocalTime)};const ee=new n;let te=null,re=async(e,t)=>(F=F.then((async()=>{try{let r=await P.keys();if(t||(ee.isFulfilled?e&&(r=r.filter((t=>t<e))):e&&r.includes(e)?r=[e]:(r=[],T("Unexpected null key"))),!r.length)return;for(let e=0;e<r.length/1e3;++e){let t=r.slice(1e3*e,1e3*(e+1)),n=[];for(let e=0;e<t.length;++e)n.push(await P.getItem(t[e]));_=(new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ");{let e=await x.getItem(k);e&&([d]=JSON.parse(await G(e))),x.setItem(k,await J(JSON.stringify([d,_])))}try{let e,r=D[0]+"verify/v2";_&&(r+="?ltstime="+encodeURIComponent(_));try{e=fetch(r,{method:"POST",body:n.join(";"),keepalive:!0})}catch(e){throw e}finally{!ee.isFulfilled&&l&&ee.resolve()}let o=await e;if(ee.isFulfilled||ee.resolve(),!o.ok)throw new Error("verify failed. Status Code: "+o.status);for(let e=0;e<t.length;++e)await P.removeItem(t[e])}catch(e){throw ee.isFulfilled||ee.resolve(),e}}}catch(e){}})),await F);return{i:async e=>{r=e.pd,o=e.v,i=o.split(".")[0],e.dt&&(c=e.dt),a=e.l||"",u="string"!=typeof e.os?JSON.stringify(e.os):e.os,f=e.fn,"string"==typeof f&&(f=f.substring(0,50)),e.ls&&e.ls.length&&(D=e.ls,1==D.length&&D.push(D[0])),v=p===D&&(!a||"200001"===a||a.startsWith("200001-")),b=e.sp,w=e.rmk,N=e.updl,M=e.mnet,R=e.mxet,await K(),await q(),await Q(),await X(),(!I||I.ltsErrorCode>=102&&I.ltsErrorCode<=120)&&re(null,!0)},c:async()=>{let e=new Date,t=e.kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ"),r=await M(),n=await R();if(n&&n<t)await Q(!0),await X();else if(r&&r<t){e.setMinutes(e.getMinutes()-6);let t=e;e=null;let r=t.kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ");_<r&&Q().then((()=>X()))}},s:async(e,r,n,o)=>{try{let e;e=r.startsWith("{")&&r.endsWith("}")?await(async e=>{if(t[A(j.c)]&&t[A(j.c)][A(j.e)]&&t[A(j.c)][A(j.e)][A(j.f)]){let r=new Uint8Array(e.length);for(let t=0;t<e.length;++t)r[t]=e.charCodeAt(t);let n=t.crypto.getRandomValues(new Uint8Array(12));B||(B=await U());let o=await t[A(j.c)][A(j.e)][A(j.h)]({name:A(j.g),[A(j.j)]:n,[A(j.l)]:128},B,r),i=new Uint8Array(o),a=new Uint8Array(n.length+i.length);return a.set(n),a.set(i,n.length),h(String.fromCharCode.apply(null,a))}})(r):r,e?(T("bs "+n),await P.setItem(n,e),T("ss "+n)):T("ept ecpt")}catch(e){}o&&(T("bd "+n),await re(n),T("sd "+n)),te&&clearTimeout(te),te=setTimeout((async()=>{await re()}),36e4)},p:ee,u:async()=>(await K(),d)}};const Q=t;let X;const Y={};let ee,te,re,ne;const oe=[],ie=(e,t=0,r=0,n=0)=>{r&&(e=n?e.subarray(r,n):e.subarray(r));let o=oe[t]=oe[t]||{ptr:0,size:0,maxSize:0};return e.length>o.maxSize&&(o.ptr&&Module._free(o.ptr),o.ptr=Module._malloc(e.length),o.maxSize=e.length),Module.HEAPU8.set(e,o.ptr),o.size=e.length,o.ptr};t.KModule=t.Module={print:e=>{ye(e)},printErr:e=>{console.error(e),ye(e)}};const ae=[],se=new n;let ce=!1;const le=async e=>{await se,te=e.trial,re=e.msg,Module.CoreWasm.init(JSON.stringify(e))},de=()=>{let e=Module.CoreWasm.getMinExpireTime;return e?e():null},ue=()=>{let e=Module.CoreWasm.getMaxExpireTime;return e?e():null},fe=async()=>{ee&&ne&&await ne.c()},he={loadWasm:async(e,r,n,o)=>{try{X=e.bd;for(let t in e.mapProductInfo){let r=e.mapProductInfo[t];r.engineResourcePath.endsWith("/")||(r.engineResourcePath+="/"),Y[t]=r}let r=e.dm,n=e.l;ee=e.brtk;let o,i=e.bptk;(async()=>{if(ce)throw"can't load wasm twice";ce=!0;for(let e of ae)await e();let e;for(let t in Y){let r=Y[t];e=r.engineResourcePath+(r.wasmJsName||t+"-"+r.version+".wasm.js");break}ye("wasm loading...");let t=Date.now();await new Promise((async t=>{Module.onRuntimeInitialized=t,importScripts(e),Module=KModule}));for(let e in Y){let t=Y[e];if("@null"===t.wasmJsGlueName)continue;let r=t.engineResourcePath+t.wasmJsGlueName;importScripts(r)}ye("wasm initialized, cost "+(Date.now()-t)+" ms"),se.resolve()})();let a=async()=>{try{ne=q({log:ye,bd:X,dm:r}),t.scsd=ne.s;let n=[],o=[];for(let e in Y)n.push(e),o.push(Y[e].version);e.pd=n.join("|"),e.v=o.join("|"),e.updl=le,e.mnet=de,e.mxet=ue,await ne.i(e)}catch(e){if(!i)throw e;ee=!1,await s(),o=e.ltsErrorCode,re=e.message||e}},s=async()=>{let e={pk:n,dm:r};X&&(e.bd=!0),await le(e)};ee?await a():await s(),Q.postMessage({type:"load",success:!0,version:Module.DocumentNormalizerWasm.getVersion(),mapProductInfo:Y,trial:te,ltsErrorCode:o,message:re})}catch(e){let t=e&&e.message;Q.postMessage({type:"load",success:!1,ltsErrorCode:e&&e.ltsErrorCode,message:t,trial:te,stack:X&&e?e.stack:null})}}},me=function(e){const t=e.data?e.data:e,r=t.body,n=t.id,o=t.instanceID;let i=he[t.type];he[t.type]?i(t,r,n,o):console.warn("Unmatched task: ",e)};Q.onmessage=me;const ye=e=>{Q.postMessage({type:"log",message:e})},ge=(e,t)=>{Q.postMessage({type:"task",id:t,body:{success:!1,message:e.message,stack:e.stack}}),setTimeout((()=>{throw e}),0)};var pe;!function(e){e[e.IPF_Binary=0]="IPF_Binary",e[e.IPF_BinaryInverted=1]="IPF_BinaryInverted",e[e.IPF_GrayScaled=2]="IPF_GrayScaled",e[e.IPF_NV21=3]="IPF_NV21",e[e.IPF_RGB_565=4]="IPF_RGB_565",e[e.IPF_RGB_555=5]="IPF_RGB_555",e[e.IPF_RGB_888=6]="IPF_RGB_888",e[e.IPF_ARGB_8888=7]="IPF_ARGB_8888",e[e.IPF_RGB_161616=8]="IPF_RGB_161616",e[e.IPF_ARGB_16161616=9]="IPF_ARGB_16161616",e[e.IPF_ABGR_8888=10]="IPF_ABGR_8888",e[e.IPF_ABGR_16161616=11]="IPF_ABGR_16161616",e[e.IPF_BGR_888=12]="IPF_BGR_888"}(pe||(pe={}));ae.push((()=>{let e=Y.ddn.engineResourcePath;Y.ddn.wasmJsGlueName="ddn_wasm_glue.js",Y.ddn.wasmJsName="core.js",Module.locateFile=function(t,r){return e+t},Module.dynamicLibraries=[e+"image-process.wasm",e+"intermediate-result.wasm",e+"ddn.wasm"]}));const ve=new Map;let be=0;const we=e=>{if(!ve.get(e))throw new Error("Instance does not exist.")},_e={createInstance:async(e,t,r)=>{const n=be++;let o;try{let e=new Module.DocumentNormalizerWasm;ve.set(n,e),o=JSON.parse(e.outputRuntimeSettingsToString()),o.NormalizerParameterArray[0].ColourMode="ICM_COLOUR",o.ImageParameterArray[0].ScaleDownThreshold=512,o.ImageParameterArray[0].BinarizationModes[0].ThresholdCompensation=7,e.initRuntimeSettingsFromString(JSON.stringify(o))}catch(e){return void ge(e,r)}Q.postMessage({type:"task",id:r,body:{success:!0,instanceID:n,defaultSettings:JSON.stringify(o)}})},outputRuntimeSettingsToString:(e,t,r,n)=>{let o;try{we(n),o=ve.get(n).outputRuntimeSettingsToString()}catch(e){return void ge(e,r)}Q.postMessage({type:"task",id:r,body:{success:!0,results:o}})},initRuntimeSettingsFromString:(e,t,r,n)=>{let o;try{we(n),o=ve.get(n).initRuntimeSettingsFromString(e.settings)}catch(e){return void ge(e,r)}Q.postMessage({type:"task",id:r,body:{success:!0,returnResult:o}})},detectQuad:async(e,t,r,n)=>{await fe();let o=null;try{we(n);let e="grey"===t.colorMode?t.width:4*t.width,r="grey"===t.colorMode?pe.IPF_GrayScaled:pe.IPF_ABGR_8888,i={bytes:{ptr:ie(t.imgData),length:t.imgData.length},width:t.width,height:t.height,stride:e,format:r};o=JSON.parse(ve.get(n).detectQuad(JSON.stringify(i),""))}catch(e){return void ge(e,r)}Q.postMessage({type:"task",id:r,body:{success:!0,buffer:t.imgData,decodeReturn:o}},[t.imgData.buffer])},normalize:async(e,t,r,n)=>{let o,i;await fe();try{we(n);let r="grey"===t.colorMode?t.width:4*t.width,a="grey"===t.colorMode?pe.IPF_GrayScaled:pe.IPF_ABGR_8888,s=JSON.stringify({bytes:{ptr:ie(t.imgData),length:t.imgData.length},width:t.width,height:t.height,stride:r,format:a});if(o=JSON.parse(ve.get(n).normalize(s,"",e.quad?JSON.stringify(e.quad):"")),0!==o.exception)throw new Error(`${o.description}${-10057===o.exception?"(coordinates may be out of bounds).":""}`);i=o.result.image.bytes,i=new Uint8Array(new Uint8Array(Module.HEAP8.buffer,i.ptr,i.length)),o.result.image.bytes=i,ve.get(n).freeNormalizeResult()}catch(e){return void ge(e,r)}Q.postMessage({type:"task",id:r,body:{success:!0,resultNormalize:o}},[i.buffer])},destroyContext:(e,t,r,n)=>{try{we(n),Module.destroy(ve.get(n)),ve.delete(n)}catch(e){return void ge(e,r)}Q.postMessage({type:"task",id:r,body:{success:!0}})}};for(let e in _e){he[e]=_e[e]}}();
