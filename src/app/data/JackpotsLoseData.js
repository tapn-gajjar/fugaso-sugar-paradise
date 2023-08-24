export class JackpotsLoseData {
    constructor(data) {
        this._rawData = data;

        for (let obj in this._rawData['collected']) {
            this._collected = this._rawData['collected'][obj];
            this._winType = obj;
        }
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * @return {number}
     */
    get winType() {
        return this._winType;
    }

    /**
     * @return {number}
     */
    get collected() {
        return this._collected;
    }
}
