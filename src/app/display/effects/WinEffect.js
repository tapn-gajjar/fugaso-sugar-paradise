import {AppG} from "../../../casino/AppG";
import {WinEffectBase} from "../../../casino/display/WinEffectBase";
import {SymbolEffect} from "./SymbolEffect";

export class WinEffect extends WinEffectBase {
    constructor(symbList) {
        super(symbList);
        this._pool = new OMY.SimpleCache(SymbolEffect, 3);
        this._sHeight = AppG.gameConst.symbolHeight * .5;
        this.kill();
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    /** @private */
    updateGameSize() {
        // if (!this._active) return;
        // super.updateGameSize();
    }

    show() {
        if (this._active) return;
        super.show();
    }

    hide() {
        if (!this._active) return;
        super.hide();
    }

    clearEffect() {
        super.clearEffect();
        while (this._animLayerActive.children.length) {
            this._pool.set(this._animLayerActive.removeChildAt(0));
        }
    }

    showWinSymbol(winsList, isSkiped = false, isLoop = false) {
        super.showWinSymbol(winsList, isSkiped, isLoop);
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _normalSymbol(winsList) {
        let actor;
        let symbol;
        let reelId, symbolId;
        let symbolChar;

        /**
         * @type {WinSymbolD}
         */
        let winSymbolData = null;

        for (let i = 0; i < winsList.length; i++) {
            winSymbolData = winsList[i];
            if (!winSymbolData) continue;
            reelId = winSymbolData.reelId;
            symbolId = winSymbolData.symbolId;
            symbolChar = winSymbolData.winSymbol;

            if (this._actorList[AppG.convertID(reelId, symbolId)]) continue;

            symbol = this._reelSymbList[reelId][symbolId];

            if (this._gdConf[symbolChar]) {
                if(winSymbolData.symbol === "A"){
                    continue;
                }
                let point = this._animLayerActive.toLocal(symbol.getGlobalPosition());
                actor = this._pool.get();
                actor.x = point.x;
                actor.y = point.y;
                actor.userData = symbol;
                this._actorList[AppG.convertID(reelId, symbolId)] = actor;
                this._animLayerActive.addChild(actor);
                actor.showSymbol(winSymbolData, i, this._isSkiped, this._isLoop);
            }
        }

        actor = null;
        winsList = null;
        winSymbolData = null;
        symbol = null;
    }

    _debugAnimSymbols(needSymbol = "all") {
        this.revive();
        super._debugAnimSymbols(needSymbol);
    }
}
