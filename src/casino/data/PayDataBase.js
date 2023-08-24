import {AppG} from "../AppG";

export class PayDataBase {
    /**
     * @param {Number}tableCash
     * @param {String}symbol
     */
    constructor(tableCash, symbol) {
        this._symbol = symbol;
        this._cash = tableCash;
        this._isScatter = AppG.gameConst.isScatterSymbol(this._symbol);
    }

    /**     * @returns {String}     */
    get symbol() {
        return this._symbol;
    }

    /**
     * @returns {Number}
     */
    get cash() {
        return this._cash;
    }

    /**
     * @returns {Boolean}
     */
    get isScatter() {
        return this._isScatter;
    }
}