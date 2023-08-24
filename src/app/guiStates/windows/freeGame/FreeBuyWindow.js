import {GameConstStatic} from "../../../GameConstStatic";
import {AppG} from "../../../../casino/AppG";
import {WindowsBase} from "../../../../casino/gui/WindowsBase";
import {AppConst} from "../../../../casino/AppConst";

export class FreeBuyWindow extends WindowsBase {
    constructor() {
        super();
        this._wName = AppConst.W_BUY_FREE;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDFreeBuy");
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._isOpen = false;
        this._isEditMode = this._gdConf["debug"] || this._gdConf["show_debug"];
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        this._gdConf["debug"] && OMY.Omy.add.regDebugMode(this);
        this._isEditMode && OMY.Omy.add.timer(0.5, this._showDebug, this);
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    _updateGameSize() {
        if (!this._isOpen) return;
        AppG.updateGameSize(this);
        if (this._bonusTint) {
            this._bonusTint.x = -this.x * (1 / this.scale.x);
            this._bonusTint.y = -this.y * (1 / this.scale.y);
            this._bonusTint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
            this._bonusTint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
        }
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);

        if (!this._isOpen)
            this._createGraphic();

        OMY.Omy.loc.addUpdate(this._updateLoc, this);
        this._updateLoc();

        this._updateGameSize();
        this.alpha = 0;
    }

    _createGraphic() {
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        OMY.Omy.add.createEntities(this, this._gdConf);
        this._isOpen = true;

        this._bonusTint = this.getChildByName("r_bonus_tint");

        /** @type {OMY.OActorSpine} */
        this._windowBg = this.getChildByName("s_free_bg");
        this._windowBg.getSpineChildByName("bonus_opoup").texture = OMY.Omy.assets.getTexture("pop_up_buy_frame");
        /** @type {OMY.OSprite} */
        this._head = this.getChildByName("s_head");
        this._locTexture = this._gdConf["locTexture"];
        if (this._bonusTint) this._bonusTint.input = true;
        /** @type {OMY.OTextNumberBitmap} */
        this._tCost = this.getChildByName("t_cost");
        this._tCost.showCent = true;
        this._tCost.setNumbers(AppG.serverWork.costBuyFree);
        this._tCost.lastText = AppG.currency;

        /** @type {OMY.OButton} */
        this._bYes = this.getChildByName("b_yes");
        this._bYes.externalMethod(this._onUpYesHandler.bind(this));
        /** @type {OMY.OButton} */
        this._bNo = this.getChildByName("b_no");
        this._bNo.externalMethod(this._onUpNoHandler.bind(this));
    }

    kill(onComplete = null) {
        OMY.Omy.loc.removeUpdate(this._updateLoc, this);

        if (this._isOpen)
            this._clearGraphic();

        super.kill(onComplete);
        this.callAll("destroy");
    }

    _clearGraphic() {
        this._windowBg = null;
        this._locTexture = null;
        this._tCost = null;
        this._head = null;
        this._isOpen = false;
        this._bonusTint = null;
        this._bYes = null;
        this._bNo = null;
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _updateLoc() {
        let localMask;
        for (let locTextureKey in this._locTexture) {
            if (locTextureKey.indexOf(OMY.Omy.language) > -1) {
                localMask = this._locTexture[locTextureKey];
                break;
            }
        }
        if (this._head)
            this._head.texture = localMask;
    }

    _onRevive() {
        super._onRevive();
        this._needToBuyFree = false;

        OMY.Omy.sound.play(GameConstStatic.S_open_free_buy);
        // this._updateLoc();
        OMY.Omy.add.tween(this, {
            alpha: 1,
        }, this._gdConf["time_alpha"]);
    }

    /**     * @private     */
    _onUpYesHandler() {
        if (AppG.isWarning) return;
        OMY.Omy.sound.play(GameConstStatic.S_free_buy);
        AppG.emit.emit(GameConstStatic.E_ON_BUY_FREE);
        this._needToBuyFree = true;
        this._startHideWindow();
    }

    /**     * @private     */
    _onUpNoHandler() {
        if (AppG.isWarning) return;
        OMY.Omy.sound.play(GameConstStatic.S_not_want_free_buy);
        AppG.emit.emit(GameConstStatic.E_ON_CANCEL_BUY_FREE);
        this._startHideWindow();
    }

    /**     * @private     */
    _startHideWindow() {
        this._bYes.isBlock = true;
        this._bNo.isBlock = true;
        OMY.Omy.add.tween(this, {
            alpha: 0,
        }, this._gdConf["time_alpha"]);
        OMY.Omy.sound.play(GameConstStatic.S_close_free_buy);

        OMY.Omy.add.timer(0.2, this._closeWindow, this);
    }

    _closeWindow() {
        this._hideMe();
        if (this._needToBuyFree)
            AppG.serverWork.sendSpin(true);
        else
            AppG.state.startNewSession();
    }

    get isOpen() {
        return this._isOpen;
    }

    get isEditMode() {
        return this._isEditMode;
    }
}
