import {GameConstStatic} from "../../../../app/GameConstStatic";
import {AppG} from "../../../AppG";

export class RichBegin {
    constructor(graphic, onComplete) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._onComplete = onComplete;

        /** @type {OMY.OButton} */
        this._btnStart = this._graphic.getChildByName("b_yes");
        this._btnStart.externalMethod(this._startRichGame.bind(this));

        /** @type {OMY.OTextFont} */
        this._tCount = this._graphic.getChildByName("t_count");
        /** @type {OMY.OTextFont} */
        this._tMulti = this._graphic.getChildByName("t_multi");
    }

    show() {
        OMY.Omy.navigateBtn.blockingScreen();
        this._graphic.revive();
        this._tCount.text = String(AppG.serverWork.countRichSpins);
        this._tMulti.text = String(AppG.serverWork.multyRichSpins);
    }

    /**     * @private     */
    _startRichGame() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._graphic.kill();
        // AppG.serverWork.setToMinBet();
        this._onComplete();

        OMY.Omy.navigateBtn.unBlockingScreen();
        AppG.state.startNewSession();
    }
}