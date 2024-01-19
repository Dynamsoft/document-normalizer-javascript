import { CapturedResult, ImageTag } from "dynamsoft-core";
import { DetectedQuadResultItem } from "./DetectedQuadResultItem";
export interface DetectedQuadsResult extends CapturedResult {
    readonly originalImageHashId: string;
    readonly originalImageTag: ImageTag;
    quadsResultItems: Array<DetectedQuadResultItem>;
}
declare module "dynamsoft-capture-vision-router" {
    interface CapturedResultReceiver {
        onDetectedQuadsReceived?: (result: DetectedQuadsResult) => void;
    }
    interface CapturedResultFilter {
        onDetectedQuadsReceived?: (result: DetectedQuadsResult) => void;
    }
}
