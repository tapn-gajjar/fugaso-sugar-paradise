import {BootBase} from "../../casino/states/BootBase";

export class Boot extends BootBase {
    constructor() {
        super();
    }

    addAssetsResolution() {
        if (!OMY.Omy.browser.isWebpSupported) {
            OMY.Omy.assets.addResolution([
                {resolution: "@0.375", size: [320, 180]},
                {resolution: "@0.75", size: [640, 360]},
                {resolution: "@1.125", size: [960, 540]},
                {resolution: "@1.5", size: [1280, 720]},
            ]);
        } else {
            OMY.Omy.assets.addResolution([
                {resolution: "@0.375", size: [320, 180]},
                {resolution: "@0.75", size: [640, 360]},
                {resolution: "@1.125", size: [960, 540]},
                {resolution: "@1.5", size: [1280, 720]},
            ]);
        }
    }
}
