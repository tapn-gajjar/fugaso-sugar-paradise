import {ReelDropBase} from "../../../../casino/display/reels/drop/ReelDropBase";
import {AppG} from "../../../../casino/AppG";
import {GameConstStatic} from "../../../GameConstStatic";

export class ReelDrop extends ReelDropBase {
    constructor(conf, index, initCombination) {
        super(conf, index, initCombination);
        AppG.emit.on(GameConstStatic.E_CATCH_WILD, this._onCatchWild, this);
    }

    createSymbols() {
        super.createSymbols();
        if (!AppG.serverWork.recoverMode) {
            let multi = (AppG.serverWork.crashMulti?.length) ?
                AppG.serverWork.crashMulti[this.index].concat()
                : (AppG.serverWork.positionsMulti?.length) ?
                    AppG.serverWork.positionsMulti[this.index].concat()
                    : OMY.OMath.createRandomArrayInt(0, 0, this._countSymb);
            for (let i = 0; i < this.symbolsCount; i++) {
                if (this.symbols[i].symbolName === "B")
                    this.symbols[i].hardSetSymbol("B", multi[i]);
            }
        }
    }

    recoverSymbols() {
        let symbolList = AppG.serverWork.winMatrix[this.index].concat();
        let multi = (AppG.serverWork.winMulti?.length) ?
            AppG.serverWork.winMulti[this.index].concat()
            : (AppG.serverWork.positionsMulti?.length) ?
                AppG.serverWork.positionsMulti[this.index].concat()
                : OMY.OMath.createRandomArrayInt(0, 0, this._countSymb);
        for (let i = this._countSymb - 1; i >= 0; i--) {
            if (symbolList[i] === "-") {
                this.symbols[i].recoverWin();
            } else if (symbolList[i] === "B") {
                this.symbols[i].hardSetSymbol("B", multi[i]);
            }
        }
    }

    _settingCrashReel() {
        super._settingCrashReel();

        let symbolList = AppG.serverWork.winMatrix[this.index].concat();
        let crashMatrix = AppG.serverWork.crashReels[this.index].concat();
        let multi = (AppG.serverWork.winMulti.length) ?
            AppG.serverWork.winMulti[this.index].concat()
            : OMY.OMath.createRandomArrayInt(0, 0, this._countSymb);
        for (let i = this._countSymb - 1; i >= 0; i--) {
            this.symbols[i].clearForAll();
            this.symbols[i].speed = this.otherVector * this.maxSpeed;
        }
        let index = -1;
        let indexSymbol = this._countSymb - 1;
        for (let i = this._countSymb - 1; i >= 0; i--) {
            if (symbolList[i] !== "-") {
                this.symbols[indexSymbol].y = this._symbolHeight * i;
                this.symbols[indexSymbol].hardSetSymbol(symbolList[i], multi[i]);
                if (indexSymbol === i) {
                    this.symbols[indexSymbol].lock();
                } else {
                    this.symbols[indexSymbol].dropSpin();
                    this.symbols[indexSymbol].isDrop = false;
                    this.symbols[indexSymbol].stopLimit = this._symbolHeight * indexSymbol;
                }
                indexSymbol--;
            }
        }
        for (let i = indexSymbol; i >= 0; i--) {
            this.symbols[i].y = this._symbolHeight * index;
            this.symbols[i].resetSymbol();
            this.symbols[i].stopLimit = this._symbolHeight * i;
            index--;
        }
    }

    /**     * @private     */
    _onCatchWild(reel, symbol, multi) {
        if (this.index === reel)
            this.symbols[symbol].setMulti(multi);
    }
}
