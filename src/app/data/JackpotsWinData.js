export class JackpotsWinData {
    constructor(data) {
        this._rawData = data;

        this._id = this._rawData["id"];
        this._kind = this._rawData["kind"];

        // maxi|midi|mini
        if (this._rawData["jackpots"]) {
            /*{
                //test
                this._rawData["jackpots"] = {"maxi": 86.86, "mini": 30.01, "midi": 1000.50};
            }*/
            this._jpList = [];
            for (let obj in this._rawData["jackpots"]) {
                this._jpList.push({winValue: this._rawData["jackpots"][obj], name: obj});
            }
            this._isShowed = false;
            this.checkJackpot();
        } else {
            this._winValue = 0;
            this._winType = "mini";
        }
    }

    checkJackpot() {
        let data = this._jpList.shift();
        this._winValue = data.winValue;
        this._winType = data.name;
        this._isShowed = this._jpList.length === 0;
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * Return id
     * @returns {int}
     */
    get id() {
        return this._id;
    }

    /**
     * Return 'HISTORY' kind
     * @returns {string}
     */
    get kind() {
        return this._kind;
    }

    /**
     * @return {number}
     */
    get winValue() {
        return this._winValue;
    }

    /**
     * @return {number}
     */
    get winType() {
        return this._winType;
    }

    get isShowed() {
        return this._isShowed;
    }
}
