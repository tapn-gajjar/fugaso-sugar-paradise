import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";

export class HintArea {
    constructor(graphic, symbolsList) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._symbolsList = symbolsList;

        /** @type {OMY.OGraphic} */
        let hintRect = null;
        let point = null;
        for (let i = 0; i < this._symbolsList.length; i++) {
            for (let j = 0; j < this._symbolsList[i].length; j++) {
                hintRect = OMY.Omy.add.rectJson(this._graphic, this._gdConf["rect"]);
                hintRect.name = "rect_" + String(i) + "_" + String(j);
                point = this._graphic.toLocal(this._symbolsList[i][j].getGlobalPosition());
                hintRect.setXY(point.x, point.y);
                hintRect.pivot.set(hintRect.width * .5, hintRect.height * .5);
            }
        }

        if (!this._gdConf["construct_mode"]) {
            OMY.Omy.navigateBtn.addUpdateState(this._onUpdateBtnStates, this);
            OMY.Omy.navigateBtn.addBlockState(this._onUpdateBlockBtn, this);
            this._graphic.setAll("alpha", 0);
        }
        AppG.emit.on(AppConst.APP_EMIT_HINT_HIDE, this._onHideHint, this);
    }

    /**     * @private     */
    _onHideHint() {
        this._activeOpenHint = null;
    }

    /**     * @private     */
    _onUpdateBtnStates(state) {
        this._graphic.callAll("removeDown", [this._onSymbolDown, this]);
        switch (state) {
            case AppConst.C_NONE: {
                this._graphic.callAll("addDown", [this._onSymbolDown, this]);
                break;
            }

            default: {
                AppG.emit.emit(AppConst.APP_EMIT_HINT_HIDE);
                break;
            }
        }
    }

    /**     * @private     */
    _onUpdateBlockBtn(state) {
        if (state) {
            this._graphic.callAll("removeDown", [this._onSymbolDown, this]);
        } else {
            this._onUpdateBtnStates(OMY.Omy.navigateBtn.state);
        }
    }

    /**     * @private     */
    _onSymbolDown(hint) {
        if (AppG.isScreenPortrait) return;
        if (this._activeOpenHint !== hint) {
            this._activeOpenHint = hint;
            const split = hint.name.split("_");
            const reel = Number(split[1]);
            const symbol = Number(split[2]);
            // console.warn("intArea ==> _onSymbolDown :59: " + "",reel,symbol, this._symbolsList[reel][symbol].textureName);
            AppG.emit.emit(AppConst.APP_EMIT_HINT_DOWN, reel, symbol, hint.getGlobalPosition(), this._symbolsList[reel][symbol].textureName, this._symbolsList[reel][symbol].symbolName);
        } else {
            AppG.emit.emit(AppConst.APP_EMIT_HINT_HIDE);
        }
    }

    updateGameSize() {
        if (!AppG.isScreenPortrait) {
            this._timer && this._timer.destroy();
            this._updatePos();
            this._timer = OMY.Omy.add.timer(0.1, this._updatePos, this, 3);
        }
    }

    /**     * @private     */
    _updatePos() {
        let point = null;
        for (let i = 0; i < this._symbolsList.length; i++) {
            for (let j = 0; j < this._symbolsList[i].length; j++) {
                let hintRect = this._graphic.getChildByName("rect_" + String(i) + "_" + String(j));
                point = this._graphic.toLocal(this._symbolsList[i][j].getGlobalPosition());
                hintRect.setXY(point.x, point.y);
            }
        }
    }
}