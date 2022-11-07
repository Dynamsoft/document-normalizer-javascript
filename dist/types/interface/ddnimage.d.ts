import { DSImage } from "./dsimage";
export interface DDNImage extends DSImage {
    toBlob: (type?: "image/png" | "image/jpeg") => Promise<Blob>;
    toImage: (type?: "image/png" | "image/jpeg") => HTMLImageElement;
    toCanvas: () => HTMLCanvasElement;
}
//# sourceMappingURL=ddnimage.d.ts.map