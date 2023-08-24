import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class WinMessageBase {
    constructor(graphic) {
        this.C_TYPE_WIN = "none";
        this.C_TYPE_BIG = "big";
        this.C_TYPE_EPIC = "epic";
        this.C_TYPE_MEGA = "mega";
        this.C_TYPE_SUPER = "super";

        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;

        /** @type {OMY.OActorSpine} */
        this._aEffect = null;

        if (this._graphic.getChildByName("t_win"))
            this.txtWin = this._graphic.getChildByName("t_win");

        this._graphic.visible = false;
        this._debugMessage = false;

        this._skipTime = (this._gdConf.hasOwnProperty("skip_win_time")) ? this._gdConf["skip_win_time"] : 0.5;

        AppG.emit.on(AppConst.APP_SHOW_MESSAGE_WIN, this._showSimpleWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN, this._showBigWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_EPIC_WIN, this._showEpicWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_MEGA_WIN, this._showMegaWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_SUPER_MEGA_WIN, this._showSuperMegaWinMessage, this);

        // AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, () => AppG.updateGameSize(this._graphic));
        // AppG.updateGameSize(this._graphic);

        if (this._gdConf["show_debug"]) {
            OMY.Omy.add.timer(0.5, this._showBigWinMessage, this);
            this._debugMessage = true;
        }
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _showSimpleWinMessage() {
        this._showWinMessage(this.C_TYPE_WIN);
    }

    _showBigWinMessage() {
        this._showWinMessage(this.C_TYPE_BIG);
    }

    _showMegaWinMessage() {
        this._showWinMessage(this.C_TYPE_MEGA);
    }

    _showSuperMegaWinMessage() {
        this._showWinMessage(this.C_TYPE_SUPER);
    }

    _showEpicWinMessage() {
        this._showWinMessage(this.C_TYPE_EPIC);
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        OMY.Omy.info('win message. show. Type:', winSize);
        AppG.emit.once(AppConst.APP_EMIT_SKIP_WIN, this._skipWinAnimations, this);
        this._graphic.visible = true;

        if (this._aEffect) {
            this._aEffect.play(false, "start");
            this._aEffect.setSkin(winSize);
            this._aEffect.addComplete(this._onShowWinValue, this, true);
        }

        this._timerForceSkip?.destroy();
        this._timerForceSkip = null;
        if (AppG.skippedWin)
            this._timerForceSkip = OMY.Omy.add.timer(this._skipTime, this._skipWinAnimations, this);
    }

    _onShowWinValue() {
        const winMultiplier = AppG.serverWork.winMultiplier || 1;
        const winValue = AppG.winCredit * winMultiplier;
        const incSec = AppG.getTimeByWinValue(winValue, AppG.gameConst.getData("gui_inc_conf"));

        this._txtWin.visible = true;
        this._txtWin.incSecond = incSec;
        this._txtWin.setNumbers(0, false);
        this._txtWin.setNumbers(winValue, true);

        AppG.emit.emit(AppConst.EMIT_INC_INFO_LINE);

        OMY.Omy.add.timer(AppG.gameConst.getData("win_message_sec"), this._hideWinMessage, this);
    }

    _onCompleteIncWin() {
        this._timerForceSkip?.destroy();
        this._timerForceSkip = null;
    }

    _skipWinAnimations() {
        this._timerForceSkip?.destroy();
        this._timerForceSkip = null;
    }

    _hideWinMessage() {
        if (this._debugMessage) return;
        OMY.Omy.info('win message. hide');
        AppG.emit.removeListener(AppConst.APP_EMIT_SKIP_WIN, this._skipWinAnimations, this);
        AppG.emit.emit(AppConst.APP_HIDE_MESSAGE_WIN);
        this._txtWin.visible = false;
        this._graphic.visible = false;
        this._timerForceSkip?.destroy();
        this._timerForceSkip = null;
    }

    set txtWin(value) {
        /** @type {OMY.OTextNumberBitmap} */
        this._txtWin = value;
        this._txtWin.incSecond = AppG.gameConst.getData("timeShowWinLine");
        this._txtWin.onCompleteInc = this._onCompleteIncWin.bind(this);
        this._txtWin.showCent = true;
        this._txtWin.visible = false;
    }
}
