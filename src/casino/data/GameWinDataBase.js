import {AppG} from "../AppG";

export class GameWinDataBase {
    constructor() {
        this._linesWin = [];
        this._step = 0;
        this._endLines = false;

        this._winSymbol = null;
        this._countSymbol = 0;
        this._line = 0;
        this._credit = 0;

        this._winsSymbolList = [];
        this._isLeftCheck = false;
        this._isScatter = false;
        this._firstTime = false;
        this._maxCountSymbol = 0;
        this._countLinesWin = 0;
        this._needToSort = true;
        this._removeScatterInRespin = true;
    }

    serverData(linesWin, reels) {
        this._step = -1;
        this._endLines = false;
        this._firstTime = true;

        this._singleWin = linesWin.length === 1;
        this._winsSymbolList.length = 0;
        let i;

        this._maxCountSymbol = 0;
        if (this._needToSort) OMY.OMath.sortNumber(linesWin, "count", false);

        let scatterBuffer;
        this._hasScatterWin = false;
        this._oneWinSymbol = true;
        let winSymbol = null;
        for (i = 0; i < linesWin.length; i++) {
            if (this._removeScatterInRespin &&
                AppG.gameHaveRespin && AppG.isBeginRespin &&
                AppG.gameConst.isScatterSymbol(linesWin[i].symbol)) {
                linesWin.splice(i, 1);
                i--;
            } else {
                if (winSymbol !== linesWin[i].symbol) {
                    if (winSymbol === null) {
                        winSymbol = linesWin[i].symbol;
                    } else {
                        this._oneWinSymbol = false;
                    }
                }
                if (!this.checkExistSymbol(linesWin[i].symbol))
                    this._winsSymbolList.push(linesWin[i].symbol);

                this._maxCountSymbol = (this._maxCountSymbol < linesWin[i].count) ? linesWin[i].count : this._maxCountSymbol;

                this._hasScatterWin = this._hasScatterWin || AppG.gameConst.isScatterSymbol(linesWin[i].symbol) || linesWin[i].isScatter;
                if (AppG.gameConst.isScatterSymbol(linesWin[i].symbol) || linesWin[i].isScatter) {
                    if (!scatterBuffer) scatterBuffer = [];
                    scatterBuffer = scatterBuffer.concat(linesWin.splice(i, 1));
                    i--;
                }
            }
        }

        if (this._oneWinSymbol)
            this._sigleSymbolInWin = winSymbol;
        if (scatterBuffer) {
            while (scatterBuffer.length) {
                linesWin.push(scatterBuffer.shift());
            }
        }

        this._linesWin = linesWin;
        this._countLinesWin = linesWin.length;

        OMY.Omy.log("Win lines", linesWin);

        if (linesWin.length === 0)
            AppG.isWin = false;
    }

    repeatWins() {
        this._step = -1;
        this._endLines = false;
        this._firstTime = false;
    }

    nextLine() {
        if (this._step + 1 >= this._linesWin.length)
            return;
        this._step++;
        if (this._step + 1 >= this._linesWin.length) {
            this._endLines = true;
        }
        this.parseLine(this._linesWin[this._step]);
    }

    /**     * @param {object}line     */
    parseLine(line) {
        this.checkData(line);
        /*        if (this._firstTime) {
                AppG.log("********************");
                AppG.log("Win symbol: " + this._winSymbol);
                AppG.log("Count win symbol: " + this._countSymbol);
                AppG.log("Win line: " + this._line);
                AppG.log("Win credit: " + this._credit);
                AppG.log("Begin from left: " + this._isLeftCheck);
                AppG.log("Is scatter symbol: " + this._isScatter);
                AppG.log("********************");
                }*/
        line = null;
    }

    /**     * @param {Array}data     */
    checkData(data) {
        this._winSymbol = data.symbol;
        this._countSymbol = data.count;
        this._line = data.lineNum;
        this._credit = data.amount / AppG.creditType;

        this._isScatter = AppG.gameConst.isScatterSymbol(this._winSymbol) || data.isScatter;
        if (this._isScatter && !AppG.gameConst.checkScatterByLine(this._winSymbol))
            this._line = 0;

        this._isLeftCheck = (data.offset == 0);
    }

    /**
     * @param {String}symbolCheck
     * @returns {boolean}
     */
    checkExistSymbol(symbolCheck) {
        return this._winsSymbolList.indexOf(symbolCheck) !== -1;
    }

    //---------------------------------------
    /// ACCESSOR
    //---------------------------------------

    get winsSymbolList() {
        return this._winsSymbolList;
    }

    get oneWinSymbol() {
        return this._oneWinSymbol;
    }

    /**     * @returns {Boolean}     */
    get endLines() {
        return this._endLines;
    }

    /**     * @returns {String}     */
    get winSymbol() {
        return this._winSymbol;
    }

    /**     * @returns {number}     */
    get countSymbol() {
        return this._countSymbol;
    }

    /**     * @returns {number}     */
    get line() {
        return this._line;
    }

    /**     * @returns {number}     */
    get credit() {
        return this._credit;
    }

    /**     * @returns {Boolean}     */
    get isLeftCheck() {
        return this._isLeftCheck;
    }

    /**     * @returns {Boolean}     */
    get isScatter() {
        return this._isScatter;
    }

    /**     * @returns {number}     */
    get step() {
        return this._step;
    }

    /**     * @returns {number}     */
    get maxCountSymbol() {
        return this._maxCountSymbol;
    }

    get countLinesWin() {
        return this._countLinesWin;
    }

    get singleWin() {
        return this._singleWin;
    }

    get hasScatterWin() {
        return this._hasScatterWin;
    }

    get isHaveData() {
        return this._linesWin.length;
    }
}
