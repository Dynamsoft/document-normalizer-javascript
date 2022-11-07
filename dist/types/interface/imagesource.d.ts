import { DSImage } from "./dsimage";
export interface ImageSource {
    getImage(index?: number): Promise<DSImage> | DSImage;
}
//# sourceMappingURL=imagesource.d.ts.map