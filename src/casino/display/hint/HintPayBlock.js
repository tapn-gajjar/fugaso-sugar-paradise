import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class HintPayBlock {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;

        this._paytable = AppG.serverWork.paytable;

        /** @type {OMY.OContainer} */
        this._hint = this._graphic.getChildByName("c_panel_hint");
        if (!this._gdConf["construct_mode"]) {
            this._graphic.interactChild = false;
            this._hint.visible = false;
        }
        AppG.emit.on(AppConst.APP_EMIT_HINT_DOWN, this._onDownHint, this);
        AppG.emit.on(AppConst.APP_EMIT_HINT_HIDE, this._onHide, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this._updateBet, this);
    }

    /**     * @private     */
    _onDownHint(reelId, symbolId, posPoint, textureName, symbol) {
        this._hint.setAll("visible", false);

        const side = (OMY.OMath.inArray(this._gdConf["left_side"], reelId)) ? "left" : "right";
        let point = this._graphic.toLocal(posPoint);
        this._hint.setXY(point.x, point.y);
        this._hint.visible = true;

        let buffer = this._hint.getChildByName("s_panel_hint");
        buffer.visible = true;
        buffer.setXY(buffer.json[side][0], buffer.json[side][1]);
        buffer.scaleX = buffer.json["scale_" + side];

        buffer = this._hint.getChildByName("s_symbol");
        buffer.visible = true;
        buffer.texture = textureName;

        let countPay = 0;
        for (let i = 1; i <= AppG.totalReel; i++) {
            if (this._paytable.getPayTableData(symbol + "_" + String(i))) countPay++;
        }
        buffer = this._hint.getChildByName("c_data_" + String(countPay));
        if (buffer) {
            OMY.Omy.sound.play(AppConst.S_btn_any);
            buffer.visible = true;
            buffer.setXY(buffer.json[side][0], buffer.json[side][1]);
            /** @type {OMY.OContainer} */
            this._activePayBlock = buffer;
            this._symbol = symbol;

            this._updatePayData();
        } else {
            this._activePayBlock = null;
            this._onHide();
        }
    }

    /**     * @private     */
    _onHide() {
        this._hint.visible = false;
    }

    /**     * @private     */
    _updatePayData() {
        if (!this._activePayBlock) return;
        let payData = null;
        for (let i = 1; i <= AppG.totalReel; i++) {
            payData = this._paytable.getPayTableData(this._symbol + "_" + String(i));
            /** @type {OMY.OTextNumberFont} */
            let text = this._activePayBlock.getChildByName("_" + String(i));
            if (payData && text) {
                let multy = (payData.isScatter) ? AppG.serverWork.lineForBet : 1;
                text.setNumbers(OMY.OMath.roundNumber(multy * AppG.serverWork.currBet/*AppG.serverWork.currBetFromList*/
                    * payData.cash, 100));
            }
        }

        /*if (text.userData.indexOf("_all") !== -1) {
            let symb = text.userData.split("all")[0] + String(AppG.totalReel);
            payData = this._paytable.getPayTableData(symb);
            if (payData) {
                multy = (payData.isScatter) ? AppG.serverWork.lineForBet : 1;
                text.setNumbers(OMY.OMath.roundNumber(multy * AppG.serverWork.currBet/!*AppG.serverWork.currBetFromList*!/
                    * payData.cash * AppG.serverWork.maxLines * 2, 100));
            } else {
                OMY.Omy.warn("Not found pay data: ", text.userData);
            }
        }*/

    }

    /**     * @private     */
    _updateBet() {
        if (this._graphic.visible)
            this._updatePayData();

    }
}