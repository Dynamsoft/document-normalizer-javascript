declare const parentPort: any;
declare const mapProductInfo: {
    [key: string]: {
        version: string;
        engineResourcePath: string;
        wasmJsName?: string;
        wasmJsGlueName?: string;
        innerVersion?: string;
    };
};
declare const getCstrFromString: (str: string, start?: number, end?: number) => Promise<Uint8Array>;
declare const setBufferIntoWasm: (data: Uint8Array, idx?: number, start?: number, end?: number) => number;
declare const freeBufferInWasm: (idx?: number) => void;
declare const functionsAfterLoadWorker: (() => any)[];
declare const checkAndReauth: () => Promise<void>;
declare const mapController: {
    [key: string]: ((data: any, body: any, taskID: number, instanceID: number) => any);
};
declare const log: (message: string) => void;
declare const debugLog: (message: string) => void;
declare const handleErr: (ex: Error, taskID: number) => void;
export { parentPort, mapProductInfo, getCstrFromString, setBufferIntoWasm, freeBufferInWasm, functionsAfterLoadWorker, checkAndReauth, mapController, log, debugLog, handleErr, };
//# sourceMappingURL=core.worker.d.ts.map