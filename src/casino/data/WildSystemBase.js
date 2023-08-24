export class WildSystemBase {
    constructor(data) {
        this._dataWild = {};
        this._listOfWild = [];

        for (let nameField in data) {
            this._dataWild[nameField] = data[nameField];
            this._listOfWild.push(nameField);
        }
    }

    /**
     * @param {string}wildSymbol
     * @param {string}winSymbol
     * @returns {boolean}
     */
    inWild(wildSymbol, winSymbol) {
        for (let dataName in this._dataWild) {
            if (String(wildSymbol) === dataName && OMY.OMath.inArray(this._dataWild[dataName], String(winSymbol)))
                return true;
        }
        return false
    }

    isWild(checkSymbol) {
        for (let dataName in this._dataWild) {
            if (String(checkSymbol) === dataName)
                return true;
        }
        return false
    }

    /*@type {Array} */
    get listOfWild() {
        return this._listOfWild;
    }
}