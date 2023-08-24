import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {GameConstStatic} from "../../GameConstStatic";

export class BuyFreeButton {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._isBlock = false;
        this._notGoodBalance = false;
        this._isPlayFree = false;

        /** @type {OMY.OActorSpine} */
        this._aSpine = graphic.getChildByName("s_bg");
        /** @type {OMY.OSprite} */
        this._btnBg = OMY.Omy.add.spriteJson(this._aSpine.getSpineChildByName("bonus_buy"), this._gdConf["btn"]);

        this._locTexture = this._gdConf["locTexture"];
        // OMY.Omy.loc.addUpdate(this._updateLoc, this);
        // this._updateLoc();

        this._updateBet();

        /** @type {OMY.OGraphic} */
        this._rHint = this._graphic.getChildByName("r_input");
        this._rHint.input = true;
        this._rHint.addUp(this._onUpHandler, this, false);
        this._rHint.addDown(this._onDownHandler, this, false);
        if (OMY.Omy.isDesktop) {
            this._rHint.addOver(this._onOverHandler, this, false);
            this._rHint.addOut(this._onOutHandler, this, false);
            this._rHint.addUpOutSide(this._onOutHandler, this, false);
        }

        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this._updateBet, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_CREDIT, this._updateBet, this);
        AppG.emit.on(GameConstStatic.E_ON_BUY_FREE, this._onBuyFree, this);
        AppG.emit.on(GameConstStatic.E_ON_CANCEL_BUY_FREE, this._onCancelBuyFree, this);

        this._btnManager = OMY.Omy.navigateBtn;
        this._btnManager.addBtn(this, this._updateState, this._updateBlocking);
        this._btnGameState = this._btnManager.state;

        this._checkBlock();
    }

    _updateLoc() {
        this._localMask = null;
        for (let locTextureKey in this._locTexture) {
            if (locTextureKey.indexOf(OMY.Omy.language) > -1) {
                this._localMask = this._locTexture[locTextureKey];
                break;
            }
        }
        // this._label.texture = this._localMask + String(this._btnState);
    }

    /**     * @private     */
    _updateBet() {
        this._notGoodBalance = !AppG.serverWork.isUserHasCashForBuy;
        this._checkBlock();
    }

    /**     * @private     */
    _updateState(state) {
        this._btnGameState = state;
        this._checkBlock();
    }

    /**     * @private     */
    _updateBlocking(value) {
        this._isBlock = value;
        this._checkBlock();
    }

    /**     * @private     */
    _onBuyFree() {
    }

    /**     * @private     */
    _onCancelBuyFree() {
        this._isPlayFree = false;
    }

    /** @public */
    startFree() {
        if (!this._isPlayFree) this._onBuyFree();
    }

    /** @public */
    endFree() {
        this._isPlayFree = false;
        this._checkBlock();
    }

    /**     * @private     */
    _onDownHandler() {
        if (this.isBlock) return;
        OMY.Omy.add.tween(this._btnBg, {
            scaleX: this._btnBg.scaleX - 0.02, scaleY: this._btnBg.scaleY - 0.02, yoyo: true, repeat: 1
        }, 0.2);
        this._btnBg.texture = this._btnBg.json["down"];
    }

    /**     * @private     */
    _onUpHandler() {
        if (this.isBlock) return;

        this._isPlayFree = true;
        this._checkBlock();
        AppG.emit.emit(AppConst.APP_AUTO_PANEL, true);
        OMY.Omy.sound.play(GameConstStatic.S_free_buy);
        OMY.Omy.viewManager.showWindow(AppConst.W_BUY_FREE, false,
            OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**     * @private     */
    _onOverHandler() {
        if (this.isBlock) return;
        OMY.Omy.sound.play(GameConstStatic.S_btn_over_on);
        OMY.Omy.add.tween(this._btnBg.scale, {x: 0.99, y: 0.99}, 0.2);
        this._btnBg.texture = this._btnBg.json["over"];
    }

    /**     * @private     */
    _onOutHandler() {
        if (this.isBlock) return;
        OMY.Omy.add.tween(this._btnBg.scale, {x: 1.0, y: 1.0}, 0.2);
        this._btnBg.texture = this._btnBg.json["out"];
    }

    /**     * @private     */
    _checkBlock() {
        if (this.isBlock || this._notGoodBalance) {
            this._aSpine.gotoAndStop(0);
            this._btnBg.texture = this._btnBg.json["block"];
        } else {
            this._aSpine.gotoAndPlay(0, true);
            this._btnBg.texture = this._btnBg.json["out"];
        }
    }

    get isBlock() {
        return this._isBlock || this._notGoodBalance || this._btnGameState !== AppConst.C_NONE || AppG.isRichSpin || this._isPlayFree;
    }
}
