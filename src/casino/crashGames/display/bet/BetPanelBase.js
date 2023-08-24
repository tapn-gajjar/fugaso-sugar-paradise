import {AppG} from "../../../AppG";
import BetBlock from "../../../../app/display/bet/BetBlock";

export class BetPanelBase {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;

        this._createGraphic();

        // AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _createGraphic() {
        /** @type {OMY.OButton} */
        this._btnOneBet = this._graphic.getChildByName("b_close");
        this._btnOneBet.externalMethod(this._togglePanel.bind(this), [true]);
        this._btnOneBet.kill();
        /** @type {OMY.OButton} */
        this._btnMoreBet = this._graphic.getChildByName("b_more");
        this._btnMoreBet.externalMethod(this._togglePanel.bind(this), [false]);
        this._btnMoreBet.kill();

        /** @type {OMY.OContainer} */
        this._canvasBet1 = this._graphic.getChildByName("c_bet_1");
        /** @type {BetBlock} */
        this._bet1 = new BetBlock(this._graphic.getChildByName("c_bet_1"));
        this._canvasBet1.kill();
        /** @type {OMY.OContainer} */
        this._canvasBet2 = this._graphic.getChildByName("c_bet_2");
        /** @type {BetBlock} */
        this._bet2 = new BetBlock(this._graphic.getChildByName("c_bet_2"));
        this._canvasBet2.kill();
        this._bet2.on(this._bet2.LOCK_EMIT, this._onSecondBetLock, this);

        this._checkRecover();
    }

    /**     * @private     */
    _checkRecover() {
        let userBets = AppG.serverWork.userBets;
        let isHaveSecondBet = false;
        if (userBets.length) {
            for (let i = 0; i < userBets.length; i++) {
                if (userBets[i].index === 1) {
                    isHaveSecondBet = true;
                    break
                }
            }
        }
        if (BetPanelBase.isHaveSecondBet) {
            BetPanelBase.isHaveSecondBet = false;
            isHaveSecondBet = true;
        }
        this._togglePanel(null, !isHaveSecondBet);
    }

    _togglePanel(btn, one) {
        if (one) {
            this._btnOneBet.kill();
            this._btnMoreBet.revive();

            this._canvasBet2.kill();
            this._bet2.clearBet();
        } else {
            this._btnOneBet.revive();
            this._btnMoreBet.kill();

            this._canvasBet2.revive();
        }
    }

    /**     * @private     */
    _onSecondBetLock(lock) {
        this._btnOneBet.isBlock = lock;
    }

    /**     * @private     */
    _updateGameSize() {
        this._windowSizeUpdate();
    }

    _windowSizeUpdate() {

    }

    destroy() {
        BetPanelBase.isHaveSecondBet = this._canvasBet2.active;
        this._graphic = null;
        this._gdConf = null;
        this._btnOneBet = null;
        this._btnMoreBet = null;
        this._canvasBet1 = null;
        this._bet1.destroy();
        this._bet1 = null;
        this._canvasBet2 = null;
        this._bet2.off(this._bet2.LOCK_EMIT, this._onSecondBetLock, this);
        this._bet2.destroy();
        this._bet2 = null;
    }
}
BetPanelBase.isHaveSecondBet = false;
