export class WinSymbolDBase {
    constructor() {
        this._reelId = -1;
        this._symbolId = -1;
        this.clear();
    }

    clear() {
        this._lineNumber = -1;
        this._countSymbol = -1;
        this._symbol = null;
        this._winSymbol = null;
        this._type = null;
        this._isScatter = false;
        this._isWild = false;
        this._isWin = false;
        this._credit = 0;

    }

    get reelId() {
        return this._reelId;
    }

    set reelId(value) {
        this._reelId = value;
    }

    get symbolId() {
        return this._symbolId;
    }

    set symbolId(value) {
        this._symbolId = value;
    }

    get lineNumber() {
        return this._lineNumber;
    }

    set lineNumber(value) {
        this._lineNumber = value;
    }

    get countSymbol() {
        return this._countSymbol;
    }

    set countSymbol(value) {
        this._countSymbol = value;
    }

    get symbol() {
        return this._symbol;
    }

    set symbol(value) {
        this._symbol = value;
    }

    get isScatter() {
        return this._isScatter;
    }

    set isScatter(value) {
        this._isScatter = value;
    }

    get isWin() {
        return this._isWin;
    }

    set isWin(value) {
        this._isWin = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get winSymbol() {
        return this._winSymbol;
    }

    set winSymbol(value) {
        this._winSymbol = value;
    }

    get credit() {
        return this._credit;
    }

    set credit(value) {
        this._credit = value;
    }

    get isWild() {
        return this._isWild;
    }

    set isWild(value) {
        this._isWild = value;
    }
}