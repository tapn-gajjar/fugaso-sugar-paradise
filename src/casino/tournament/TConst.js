import md5 from "md5";

export class TConst {
    constructor() {
        this._version = null;
    }

    /**     * @public     */
    getData(name) {
        return this._data[name];
    }

    onLoad() {
        this._data = OMY.Omy.assets.getJSON("TConst");
    }

    setTVersion(date) {
        this._version = String(md5(date));
    }

    get test() {
        return (this._data.hasOwnProperty("betWithDenomination")) ? this._data["betWithDenomination"] : false;
    }

    get version() {
        return this._version;
    }
}
