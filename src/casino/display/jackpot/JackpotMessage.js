import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class JackpotMessage {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;

        /** @type {OMY.OActorSpine} */
        this._aEffect = this._graphic.getChildByName("a_chest");
        this._aEffect.addComplete(this._onShowWinValue, this);

        /** @type {OMY.OTextNumberBitmap} */
        this._txtWin = this._graphic.getChildByName("t_win");
        this._txtWin.onCompleteInc = this._onCompleteInc.bind(this);
        this._txtWin.showCent = true;
        this._txtWin.lastText = " €";

        /** @type {OMY.OTextBitmap} */
        this._tLabel = this._graphic.getChildByName("t_label_loc");
        /** @type {OMY.OGraphic} */
        this._tint = this._graphic.getChildByName("r_tint");
        this._tint.input = true;

        this._graphic.visible = false;

        AppG.emit.on(AppConst.APP_EMIT_WIN_JACKPOT, this._showWinMessage, this);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        if (this._gdConf["show_debug"]) {
            OMY.Omy.add.timer(0.5, this._showWinMessage, this);
        }
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _updateGameSize() {
        if (!this._graphic.visible) return;
        AppG.updateGameSize(this._graphic);
        this._tint.width = OMY.Omy.WIDTH;
        this._tint.height = OMY.Omy.HEIGHT;
    }

    _showWinMessage() {
        AppG.jacpotIsShowing = true;
        AppG.serverWork.clearWinJPValue();
        OMY.Omy.navigateBtn.blockingScreen();

        let serverData = AppG.serverWork.jackpotsWinData;
        this._winType = serverData?.winType || "maxi";
        this._balance = serverData?.jackpotBalans;
        AppG.serverWork.getJackpots();

        this._graphic.visible = true;
        this._updateGameSize();
        this._graphic.alpha = 1;
        this._jackPotValue = serverData?.winValue || this._gdConf["debug_win"];

        this._tLabel.text = this._tLabel.json["loc_data"][this._winType];

        this._aEffect.gotoAndPlay(0, false, this._aEffect.json["anim_start"]);
        this._tint.alpha = 0;
        OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.2);
        OMY.Omy.add.timer(0.3, this._tweenTexts, this);

        this._txtWin.alpha = 0;
        this._txtWin.scale.set(0);
        this._txtWin.setNumbers(0, false);

        this._tLabel.alpha = 0;
        this._tLabel.scale.set(0);

        OMY.Omy.sound.play(GameConstStatic.S_JPWin);
        OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.5, 1, 0.3);
    }

    /**     * @private     */
    _tweenTexts() {
        AppG.getTimeByWinValue(this._jackPotValue, AppG.gameConst.getData("jp_conf"), true);
        this._txtWin.incSecond = AppG.incTimeTake;
        this._txtWin.setNumbers(this._jackPotValue, true);
        OMY.Omy.add.tween(this._txtWin, {
            alpha: 1,
            scaleX: 1, scaleY: 1,
            ease: "elastic.out(1, 0.3)",
        }, this._gdConf["time_show"], null);

        OMY.Omy.add.tween(this._tLabel, {
            alpha: 1,
            scaleX: 1, scaleY: 1,
            onCompleteParams: [this._tLabel],
            ease: "elastic.out(1, 0.3)",
        }, this._gdConf["time_show"], (animate) => {
            OMY.Omy.add.tween(animate, {
                alpha: 0.5,
                repeat: -1,
                yoyo: true,
            }, this._gdConf["label_loop"]);

        });
    }

    _onShowWinValue() {
        this._aEffect.gotoAndPlay(0, true, this._aEffect.json["anim_idle"]);
    }

    _onCompleteInc() {
        OMY.Omy.sound.stop(GameConstStatic.S_JPWin);

        this._tLabel.alpha = 1;
        OMY.Omy.remove.tween(this._tLabel);
        OMY.Omy.add.tween(this._txtWin.scale, {
            x: 1.1, y: 1.1, repeat: 3, yoyo: true,
        }, 0.2);

        this._graphic.addUp(this._hideWinMessage, this, true);

    }

    _hideWinMessage() {
        OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.5, 0.3, 1);

        OMY.Omy.navigateBtn.unBlockingScreen();

        OMY.Omy.add.tween(this._graphic, {
            alpha: 0,
            ease: "none",
        }, 0.3, this._messageClear.bind(this));
    }

    _messageClear() {
        AppG.jacpotIsShowing = false;
        this._graphic.visible = false;
        if (AppG.serverWork.jackpotsWinData.isShowed) {
            AppG.serverWork.winJackpot = false;
            AppG.serverWork.collectJackpots(this._balance);
            AppG.serverWork.getJackpots();
        }else {
            AppG.serverWork.jackpotsWinData.checkJackpot();
        }

        AppG.emit.emit(AppConst.APP_EMIT_END_JACKPOT);
    }
}
