export class PageBase extends OMY.OContainer {
    constructor() {
        super();
        this._wName = null;
    }

    get wName() {
        return this._wName;
    }
}