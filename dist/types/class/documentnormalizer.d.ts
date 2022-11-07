import { DSImage } from '../interface/dsimage';
import { DetectedQuadResult } from '../interface/detectedquadresult';
import { NormalizedImageResult } from "../interface/normalizedimageresult";
import { NormalizeImageDate } from "../interface/normalizeImageDate";
import { Quadrilateral } from '../interface/quadrilateral';
import { ScanSettings } from "../interface/scansettings";
import { ImageSource } from "../interface/imagesource";
import { CameraEnhancer, DCEFrame } from 'dynamsoft-camera-enhancer';
import { Howl } from 'dm-howler';
export default class DocumentNormalizer {
    private static _jsVersion;
    private static _jsEditVersion;
    protected static _version: string;
    /**
      * Get the current version.
    */
    static getVersion(): string;
    protected static _license: string;
    static get license(): string;
    /**
     * Get or set the Dynamsoft Document Normalizer SDK product keys.
     * ```js
     * Dynamsoft.DDN.DocumentNormalizer.license = "PRODUCT-KEYS";
     * ```
     * For convenience, you can set `license` in `script` tag instead.
     * ```html
     * <script src="https://cdn.jsdelivr.net/npm/dynamsoft-document-normalizer@1.0.10/dist/ddn.js" data-license="PRODUCT-KEYS"></script>
     * ```
    */
    static set license(license: string);
    static _workerName: string;
    static _bWasmDebug: boolean;
    static _onLog: any;
    private static _pLoad;
    static _bNeverShowDialog: boolean;
    protected static _sessionPassword: string;
    /**
     * Specify a password to protect the `online key` from abuse.
     * ```js
     * Dynamsoft.DDN.DocumentNormalizer.license = "123****-mytest";
     * Dynamsoft.DDN.DocumentNormalizer.sessionPassword = "@#$%****";
     * ```
     * Since js in the browser is plaintext, it is not safe to set a password. It is recommended that you bind the `domain` as `Validation field` in the [handshake settings in dynamsoft website](https://www.dynamsoft.com/lts/index.html#/handshakeCodes) or your self-hosted license server.
     *
     * In nodejs, password is meaningful.
     * @see [[license]]
     */
    static set sessionPassword(value: string);
    static get sessionPassword(): string;
    /**
      * @ignore
    */
    static browserInfo: {
        browser: string;
        version: number;
        OS: string;
    };
    /**
    * Detect environment and get a report.
    * ```js
    * console.log(await Dynamsoft.DDN.DocumentNormalizer.detectEnvironment());
    * // {"wasm":true, "worker":true, "getUserMedia":true, "camera":true, "browser":"Chrome", "version":90, "OS":"Windows"}
    * ```
    */
    static detectEnvironment(): Promise<any>;
    private static _deviceFriendlyName;
    static get deviceFriendlyName(): string;
    static set deviceFriendlyName(value: string);
    protected static _taskCallbackMap: Map<number, (body: any) => void>;
    _instanceID: number;
    static _ddnWorker: Worker;
    protected static _nextTaskID: number;
    _lastInnerParseDuration: number;
    /**
      * Indicates whether the instance has been destroyed.
    */
    protected bDestroyed: boolean;
    get disposed(): boolean;
    /** @ignore */
    protected static _engineResourcePath?: string;
    static get engineResourcePath(): string;
    /**
     * Specify the Code Parser SDK engine (WASM) url. The SDK tries to automatically explore the engine location.
     * If the auto-explored engine location is incorrect, you can manually specify the engine location.
     * The property needs to be set before [[loadWasm]].
     * ```js
     * Dynamsoft.DDN.DocumentNormalizer.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-document-normalizer@1.0.10/dist/";
     * await Dynamsoft.DDN.DocumentNormalizer.loadWasm();
     * ```
    */
    static set engineResourcePath(value: string);
    /** @ignore */
    protected static _licenseServer?: string[];
    static get licenseServer(): string[] | string;
    /**
    * Specify the license server URL.
    */
    static set licenseServer(value: string[] | string);
    private _dce;
    private set dce(value);
    private get dce();
    private _drawingItemNamespace;
    private _imgSource;
    /** @ignore */
    private _intervalGetVideoFrame;
    protected _ddnDrawingLayer: any;
    protected _arrPolygons: any;
    dceFrame: DCEFrame;
    dsImage: DSImage;
    quadResults: Array<DetectedQuadResult>;
    static defaultTemplate: string;
    /**
      * Check if the decoding module is loaded.
      * @category Initialize and Destroy
    */
    static isWasmLoaded(): boolean;
    /** @ignore */
    static isDSImage(value: any): boolean;
    /** @ignore */
    static isImageSource(value: any): boolean;
    /** @ignore */
    static isDCEFrame(value: any): boolean;
    private callbackCameraChange?;
    private callbackResolutionChange?;
    private callbackCameraClose?;
    private callbackSingleFrameAcquired?;
    private _registerDCEControler;
    private _logoutDCEControler;
    setImageSource(imgSource: ImageSource | CameraEnhancer, options?: any): Promise<void>;
    /**
     * The event is triggered after a frame has been detected.
     * The results object contains all the quad results in this frame.
     * ```js
     * normalize.onQuadDetected = (results, soueceImage) => {
     *     for(let result of results){
     *         console.log(result);
     *     }
     * };
     * onQuadDetected.startScanning();
     * ```
     * @event onQuadDetected
    */
    onQuadDetected: (results: Array<DetectedQuadResult>, sourceImage: Blob | DSImage | DCEFrame | HTMLImageElement | HTMLCanvasElement) => void;
    private _dceControler;
    protected _maxCvsSideLength: number;
    /** @ignore */
    set maxCvsSideLength(value: number);
    get maxCvsSideLength(): number;
    private canvas;
    private _loopReadVideoTimeoutId;
    private _intervalDetectVideoPause;
    protected _bPauseScan: boolean;
    _bOnlyDrawOneQuad: boolean;
    /** @ignore */
    intervalTime: number;
    /**
     * Before most operations, `loadWasm` needs to be excuted firstly.
     * Most time, you do not need excute `loadWasm` manually. Because when you excute [[createInstance]], `loadWasm` will be excuted implicitly.
     * Some properties can't be changed after `loadWasm`.
     * Calling `loadWasm` in advance can avoid the long wait when `createInstance`.
     * ```js
     * window.addEventListener('DOMContentLoaded', (event) => {
     *   Dynamsoft.DDN.DocumentNormalizer.loadWasm();
     * });
     * ```
     * @category Initialize and Destroy
    */
    static loadWasm(): Promise<void>;
    protected static showDialog(type: string, content: string): Promise<void>;
    /**
     * Create a wasm instance on the worker thread
    */
    protected static createInstanceInWorker(): Promise<number>;
    /**
    * Create a `DocumentNormalizer` instance.
    * ```
    * let pNormalizer = null;
    * (async()=>{
    *     let normalizer = await (pNormalizer = pNormalizer || Dynamsoft.DDN.DocumentNormalizer.createInstance());
    * })();
    * ```
      * @category Initialize and Destroy
    */
    static createInstance(): Promise<DocumentNormalizer>;
    /**
      * Output runtime settings to a string.
      * ```js
      * let strSettings = await normalizer.getRuntimeSettings();
      * ```
      * @ignore
      * @category Runtime Settings
      */
    getRuntimeSettings(): Promise<object>;
    /**
     * Initialize runtime settings with the settings in given JSON string.
     * ```js
     * await normalizer.setRuntimeSettings("{\"Version\":\"3.0\", \"ImageParameter\":{\"Name\":\"IP1\"}");
     * ```
     * @ignore
     * @category Runtime Settings
    */
    setRuntimeSettings(settings: string | object): Promise<void>;
    /**
     * Resetting template Settings.
     * ```js
     * await normalizer.resetRuntimeSettings();
     * ```
     * @ignore
     * @category Runtime Settings
    */
    resetRuntimeSettings(): Promise<void>;
    /**
     * Set html element containing the `DocumentNormalizer` instance.
     * ```html
     * <div class="dce-video-container" style="position:relative;width:100%;height:500px;"></div>
     * <script>
     *     let pNormalizer = null;
     *     (async()=>{
     *         let normalizer = await (pNormalizer = pNormalizer || Dynamsoft.DDN.DocumentNormalizer.createInstance());
     *         await normalizer.setUIElement(document.getElementsByClassName("dce-video-container")[0]);
     *         await normalizer.startScanning();
     *     })();
     * </script>
     * ```
     * @param elementOrUrl
     * @category UI
    */
    setUIElement(elementOrUrl: HTMLElement | string): Promise<void>;
    private _quadFilterFun;
    setQuadResultFilter(filter: (quad: DetectedQuadResult) => boolean): void;
    /**
     * Detect quadrilaterals which are object boundaries found on the source image.
     * @param source Specifies the image to process. If passed a string, it means a URL.
    */
    detectQuad(source: Blob | DSImage | DCEFrame | HTMLImageElement | HTMLCanvasElement | string): Promise<Array<DetectedQuadResult>>;
    /**
     * @param blob
     * @ignore
    */
    private _detectQuad_Blob;
    /**
     * @param dsImage
     * @ignore
    */
    private _detectQuad_DSImage;
    /**
     * @param image
     * @ignore
    */
    private _detectQuad_Image;
    /**
     * @param canvas
     * @ignore
    */
    private _detectQuad_Canvas;
    /**
     * @param dceFrame
     * @ignore
    */
    private _detectQuad_DCEFrame;
    /**
     * @param url
     * @ignore
    */
    private _detectQuad_Url;
    /** @ignore */
    private _detectQuad_Worker;
    /**
     * Normalize the source image based on the settings in options.
     * @param source Specifies the image to process. If passed a string, it means a URL.
     * @param options Specifies how normalization should be done. If "quad" is passed, it means that the image should be cropped according to the quad,
     * and the resulting image should also be "deskewed" and "perspective corrected".
     * In the future, we will add more options for the normalization.
    */
    normalize(source: Blob | DSImage | DCEFrame | HTMLImageElement | HTMLCanvasElement | string, options?: {
        quad?: Quadrilateral;
    }): Promise<NormalizedImageResult>;
    /**
     * @param blob
     * @ignore
    */
    private _normalize_Blob;
    /**
     * @param dsImage
     * @ignore
    */
    private _normalize_DSImage;
    /**
     * @param dceFrame
     * @ignore
    */
    private _normalize_DCEFrame;
    /**
     * @param image
     * @ignore
    */
    private _normalize_Image;
    /**
     * @param canvas
     * @ignore
    */
    private _normalize_Canvas;
    /**
     * @param url
     * @ignore
    */
    private _normalize_Url;
    /** @ignore */
    private _normalize_Worker;
    _handleImageData(retImageData: NormalizeImageDate, format: number): NormalizedImageResult;
    private _toBlob;
    private _toImage;
    private _toCanvas;
    private _saveToFile;
    /**
     * @ignore
     * Get normalize image data
    */
    private _getNorImgeData;
    getUIElement(): HTMLElement;
    private _tempSolutionStatus;
    startScanning(appendOrShowUI?: boolean): Promise<void>;
    stopScanning(hideUI?: boolean): void;
    /** @ignore */
    _bindUI(): void;
    /** @ignore */
    _unbindUI(): void;
    /**
     * Pause the scanning process.
     * @category Pause and Resume
    */
    pauseScanning(options?: any): void;
    /**
     * Pause the Scanning process.
     * @category Pause and Resume
    */
    resumeScanning(): void;
    private bPlaySoundOnSuccessfulRead;
    private set whenToPlaySound(value);
    private get whenToPlaySound();
    /** @ignore */
    private _soundSource;
    beepSound: Howl;
    private get soundSource();
    private set soundSource(value);
    private bVibrateOnSuccessfulRead;
    private set whenToVibrate(value);
    /**
      * Get or set how long (ms) the vibration lasts.
      * @see [[whenToVibrate]]
    */
    private vibrateDuration;
    private get whenToVibrate();
    /**
     * Get current scan settings.
     * ```js
     * let scanSettings = await normalizer.getScanSettings();
     * scanSettings.intervalTime = 100;
     * await normalizer.updateScanSettings(scanSettings);
     * ```
     * Temporarily defined as an asynchronous method !!!
    */
    getScanSettings(): Promise<ScanSettings>;
    /**
     * Update ScanSettings by specify parameter values.
     * ```js
     * let scanSettings = await normalizer.getScanSettings();
     * scanSettings.intervalTime = 50;
     * scanSettings.whenToPlaySound = "quadDetected";
     * await normalizer.updateScanSettings(scanSettings);
     * ```
     * Temporarily defined as an asynchronous method !!!
     * @param settings
    */
    updateScanSettings(settings: ScanSettings): Promise<void>;
    /** @ignore */
    private _loopReadVideo;
    /** @ignore */
    static recalculateResultLocation(results: any, sx: number, sy: number, sWidth: number, sHeight: number, dWidth: number, dHeight: number): void;
    /** @ignore */
    static reverseRecalculateResultLocation(results: any, sx: number, sy: number, sWidth: number, sHeight: number, dWidth: number, dHeight: number): void;
    _drawResults(results: any): void;
    /** @ignore */
    _cloneDecodeResults(results: any): any;
    /**
     * start dce fetching frame loop, and get frame from frame queue
     * @ignore
    */
    private _getVideoFrame;
    /**
     * Pause video, let DCE enter edit mode so that users can select a quad and edit.
    */
    confirmQuadForNormalization(): void;
    /**
     * This method requires that the user selects only one quad out of many or there is only one quad. Only return one normalized image.
    */
    normalizeWithConfirmedQuad(): Promise<NormalizedImageResult>;
    /**
      * Destroy the `DocumentNormalizer` instance. If your page needs to create new instances from time to time, don't forget to destroy unused old instances, otherwise it will cause memory leaks.
      * @category Initialize and Destroy
    */
    dispose(): void;
}
//# sourceMappingURL=documentnormalizer.d.ts.map