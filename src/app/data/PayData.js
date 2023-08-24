import {PayDataBase} from "../../casino/data/PayDataBase";

export class PayData extends PayDataBase {
    /**
     * @param {Number}tableCash
     * @param {String}symbol
     */
    constructor(tableCash, symbol) {
        super(tableCash, symbol);
    }
}