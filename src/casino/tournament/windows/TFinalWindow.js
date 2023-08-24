import {TStaticConst} from "../TStaticConst";
import {WindowsBase} from "../../gui/WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import TweenClose from "./effects/TweenClose";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class TFinalWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = TStaticConst.W_FINAL_TOURNAMENT;
        this.json = this._gdConf = AppG.tournament.elementsJson["final_window"];

        this._isGraphic = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._editMode = this._gdConf["edit"];
        if (this._editMode) {
            OMY.Omy.add.timer(10.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);
        if (this._tint) {
            this._tint.x = -this.x * (1 / this.scale.x);
            this._tint.y = -this.y * (1 / this.scale.y);
            this._tint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
            this._tint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
        if (AppG.isGameCrash) {
            /** @type {OMY.OGraphic} */
            this._tint = this.getChildByName("r_tint");
            this._tint.input = true;
        } else {
            this.getChildByName("r_tint")?.destroy();
        }
        this._saveBtnState = OMY.Omy.navigateBtn.state;
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        OMY.Omy.navigateBtn.addUpdateState(this._onChangeBtnState, this);
        /** @type {OMY.OContainer} */
        this._canvas = this.getChildByName("c_canvas");

        /** @type {OMY.OButton} */
        this._bClose = this._canvas.getChildByName("b_close");
        this._bClose.externalMethod(this._onClose.bind(this));

        /** @type {OMY.OTextBitmap} */
        this._tWinShare = this._canvas.getChildByName("tournament_finaly_2");
        OMY.Omy.loc.addUpdate(this._onLocChange, this, false);
        this._onLocChange();

        this._saveVolume = OMY.Omy.sound.getSoundVolume(GameConstStatic.S_game_bg);
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
            OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.1, 0);
        OMY.Omy.sound.play(TStaticConst.S_t_win, true);

        this._updateGameSize();
        this._animateShow();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        OMY.Omy.navigateBtn.removeUpdateState(this._onChangeBtnState, this);
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);

        this._bClose = null;
        this._tWinShare = null;
        this._canvas = null;
        this._tint = null;
        this._isGraphic = false;
        this.callAll("destroy");

        AppG.emit.emit(TStaticConst.E_END_WINNER);
        if (AppG.isGameCrash)
            OMY.Omy.navigateBtn.updateState(this._saveBtnState);
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }
        super._onKill();
    }

    /**     * @private     */
    _onChangeBtnState(state) {
        if (state !== AppConst.C_BLOCK) {
            this._saveBtnState = state;
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        }
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.sound.stop(TStaticConst.S_t_win);
        OMY.Omy.sound.play(TStaticConst.S_t_win_END);
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg)) {
            OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.1, this._saveVolume);
        }

        this._tweenLine?.kill();
        this._tweenLine = null;
        OMY.Omy.navigateBtn.updateState(this._saveBtnState);
        AppG.serverWork.clearWinTournament();
        this._animateHide();
    }

    /**     * @private     */
    _onLocChange() {
        let winValue = AppG.formatCurrency(AppG.tournament.winAmount);
        winValue = OMY.StringUtils.replaceAll(winValue, " ", " ");
        winValue = OMY.StringUtils.replaceAll(winValue, " ", " ");
        let place = String(AppG.tournament.winPlace);
        switch (AppG.language) {
            case "gb":
            case "can":
            case "eng": {
                if (place.charAt(place.length - 1) === "1") {
                    if (place.length > 1 && place.charAt(place.length - 2) === "1")
                        place += "TH"
                    else
                        place += "ST";
                } else if (place.charAt(place.length - 1) === "2") {
                    if (place.length > 1 && place.charAt(place.length - 2) === "1")
                        place += "TH"
                    else
                        place += "ND";
                } else if (place.charAt(place.length - 1) === "3") {
                    if (place.length > 1 && place.charAt(place.length - 2) === "1")
                        place += "TH"
                    else
                        place += "RD";
                } else {
                    place += "TH"
                }
                break;
            }
            case "fra": {
                if (Number(place) === 1)
                    place += "ER"
                else
                    place += "E";
                break;
            }
            case "rus": {
                if (place.charAt(place.length - 1) === "3" && place.charAt(place.length - 2) !== "1")
                    place += "ИМ"
                else
                    place += "ЫМ";
                break;
            }
            case "swe": {
                if (Number(place) === 1 || Number(place) === 2)
                    place += ":a"
                else
                    place += ":e";
                break;
            }
            case "ukr": {
                if (place.charAt(place.length - 1) === "3")
                    place += "ІМ"
                else
                    place += "ИМ";
                break;
            }
        }
        let locText = OMY.StringUtils.sprintfCustom(OMY.Omy.loc.getText("tournament_finaly_2"), "%e", AppG.currency);
        this._tWinShare.text = OMY.StringUtils.sprintf(locText, place, String(winValue));
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.isBlock = true;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.isBlock = false;
        }
    }

    /**     * @private     */
    _animateShow() {
        let data = this._gdConf["animate_setting"];
        this._canvas.scale.set(data["start_scale"]);
        this._tweenLine = OMY.Omy.add.tweenTimeline(
            {
                onComplete: this._onShowWindow.bind(this)
            }
        );
        OMY.Omy.add.tween(this._canvas.scale, {x: 1, y: 1, ease: data["ease"]},
            data["time_window"], null,
            null, this._tweenLine, 0);

        let obj = this._canvas.getChildByName("a_TCubk");
        obj.x = data["prize_x"];
        obj.y = data["prize_y"];
        OMY.Omy.add.tween(obj,
            {x: obj.json.x, y: obj.json.y},
            data["time_prize"], null,
            null, this._tweenLine, 0);

        obj = this._canvas.getChildByName("b_close");
        obj.x = data["close_x"];
        obj.y = data["close_y"];
        OMY.Omy.add.tween(obj,
            {x: obj.json.x, y: obj.json.y},
            data["time_prize"], null,
            null, this._tweenLine, 0);

        obj = this._canvas.getChildByName("a_TShine_start");
        OMY.Omy.add.tween(obj,
            {alpha: 0},
            data["shine_time"], null,
            null, this._tweenLine, data["shine_delay"]);
    }

    /**     * @private     */
    _onShowWindow() {
        this._tweenLine = null;
        new TweenClose(this._bClose);
    }

    /**     * @private     */
    _animateHide() {
        this._bClose.isBlock = true;
        let data = this._gdConf["animate_setting"];
        OMY.Omy.add.tween(this._canvas,
            {alpha: 0},
            data["time_hide"], this._onHideWindow.bind(this));
    }

    updateNewTournamentData() {
        this._onLocChange();
    }

    /**     * @private     */
    _onHideWindow() {
        OMY.Omy.viewManager.hideWindow(this._wName);
    }
}
