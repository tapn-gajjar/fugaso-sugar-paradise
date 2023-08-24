import {AppG} from "../AppG";

export class WinEffectBase extends OMY.OContainer {
    constructor(symbList) {
        super();
        this._gdConf = OMY.Omy.assets.getJSON("GDWinEffect");
        this._reelSymbList = symbList;
        this._actorList = [];
        this._animLayerActive = OMY.Omy.add.container(this);
        this._animLayerActive.interactChild = false;
        this._animLayerActive.autoReviveChildren = false;

        if (this._gdConf["debugSymbolAnim"].length) {
            OMY.Omy.add.timer(1, this._debugAnimSymbols, this, 0, false, true, 0, [this._gdConf["debugSymbolAnim"]]);
        }

        this.interactChild = false;
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    /** @private */
    updateGameSize() {
        if (!this._active) return;

        for (let i = 0; i < this._animLayerActive.children.length; i++) {
            let actor = this._animLayerActive.children[i];
            if (actor && actor.userData) {
                let point = this._animLayerActive.toLocal(actor.userData.getGlobalPosition());
                actor.x = point.x + (actor.json?.dx || 0);
                actor.y = point.y + (actor.json?.dy || 0);
            }
        }
    }

    show() {
        if (this._active) return;

        this.revive();
        this._animLayerActive.revive();
    }

    hide() {
        if (!this._active) return;

        this.clearEffect();
        this.kill();
    }

    clearEffect() {
        this._actorList.length = 0;
        this._animLayerActive.callAll("kill");
    }

    showWinSymbol(winsList, isSkiped = false, isLoop = false) {
        this._isSkiped = isSkiped;
        this._isLoop = isLoop;
        OMY.OMath.sortNumber(winsList, "reelId");
        this._normalSymbol(winsList);
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _normalSymbol(winsList) {
        for (let i = 0; i < winsList.length; i++) {
            /** @type {WinSymbolD} */
            let winSymbolData = winsList[i];
            if (!winSymbolData || !winSymbolData.isWin) continue;
            let reelId = winSymbolData.reelId;
            let symbolId = winSymbolData.symbolId;
            let symbolChar = winSymbolData.symbol;

            const symbolIndex = AppG.convertID(reelId, symbolId);

            if (this._actorList[symbolIndex]) continue;

            let symbol = this._reelSymbList[reelId][symbolId];
            let point = this._animLayerActive.toLocal(symbol.getGlobalPosition());
            let xPos = point.x;
            let yPos = point.y;

            let actor;
            if (this._gdConf[symbolChar]) {
                actor = OMY.Omy.add.actorJson(this._animLayerActive, this._gdConf[symbolChar]);
                actor.gotoAndPlay(0, true, actor.json["custom_a_name"] ?? "animation");
                actor.x += xPos;
                actor.y += yPos;
                actor.symbolChar = winSymbolData.winSymbol;
            } else {
                actor = OMY.Omy.add.spriteJson(this._animLayerActive, this._gdConf["s_symbol"]);
                actor.texture = this._gdConf["symbol_texture"] + String(AppG.gameConst.symbolID(symbolChar));
                actor.x = xPos;
                actor.y = yPos;
            }

            this._actorList[symbolIndex] = actor;
            actor.userData = symbol;
        }
    }

    /**     * @public     */
    _debugAnimSymbols(needSymbol = "all") {
        // this.updateGameSize();
        let symbol;
        let actor;
        let symbolChar;

        for (let i = 0; i < this._reelSymbList.length; i++) {
            for (let j = 0; j < this._reelSymbList[i].length; j++) {
                symbol = this._reelSymbList[i][j];
                symbolChar = symbol.symbolName;

                if ((needSymbol === "all" || String(needSymbol) === symbolChar) &&
                    this._gdConf[symbolChar]) {
                    OMY.Omy.info('win effect:', symbolChar);
                    let point = this._animLayerActive.toLocal(symbol.getGlobalPosition());
                    actor = OMY.Omy.add.actorJson(this._animLayerActive, this._gdConf[symbolChar]);
                    actor.x += point.x;
                    actor.y += point.y;
                    actor.gotoAndPlay(0, true);
                    actor.userData = symbol;
                } else {
                    console.error("not exists", symbolChar, needSymbol);
                }
            }
        }
    }
}
