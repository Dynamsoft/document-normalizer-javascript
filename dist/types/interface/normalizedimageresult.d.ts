import { DDNImage } from "./ddnimage";
export interface NormalizedImageResult {
    image: DDNImage;
    saveToFile: (name: string, download?: boolean) => Promise<File>;
}
//# sourceMappingURL=normalizedimageresult.d.ts.map