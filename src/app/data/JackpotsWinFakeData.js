export class JackpotsWinFakeData {
    constructor(data) {
        this._rawData = data;

        this._id = 0x102;
        this._kind = 'JACKPOTS_WIN';

        this._winValue = OMY.OMath.randomRangeInt(10000, 40000);

        this._winType = 'maxi';
        if (this._winValue < 20000) {
            this._winType = 'mini';
        } else if(this._winValue < 30000) {
            this._winType = 'midi';
        }
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
}
