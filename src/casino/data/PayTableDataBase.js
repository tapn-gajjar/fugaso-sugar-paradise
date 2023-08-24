import {PayData} from "../../app/data/PayData";
import {AppG} from "../AppG";

export class PayTableDataBase {
    constructor(data) {
        this._data = {};
        this._listPayTable = [];

        let n = data.length;
        let i;
        let temp;
        let _name;
        for (i = 0; i < n; i++) {
            temp = data[i];
            _name = AppG.gameConst.convertChar(temp.symbol) + "_" + String(temp.count);
            this._data[_name] = new PayData(Math.abs(temp.factor), temp.symbol);
            this._listPayTable.push(_name);
        }
        temp = null;
        _name = null;
    }

    /**
     * @param {String}namePosition
     * @returns {PayData}
     */
    getPayTableData(namePosition) {
        return this._data[namePosition];
    }

    //---------------------------------------
    /// ACCESSOR
    //---------------------------------------
    /**
     * @returns {Array}
     */
    get listPayTable() {
        return this._listPayTable;
    }
}