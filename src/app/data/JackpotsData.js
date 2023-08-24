
export class JackpotsData {
    constructor(data) {
        this._rawData = data;

        this._id = this._rawData['id'];
        this._kind = this._rawData['kind'];

        this._jackpots = this._rawData['jackpots'];
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
    get gold() {
        return this._jackpots['maxi'] || 0;
    }

    /**
     * @return {number}
     */
    get silver() {
        return this._jackpots['midi'] || 0;
    }

    /**
     * @return {number}
     */
    get bronze() {
        return this._jackpots['mini'] || 0;
    }
}
