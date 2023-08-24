import {WinMessageBase} from "../../../casino/display/win/WinMessageBase";
import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

let _incAnim = false;

export class WinMessage extends WinMessageBase {
    constructor(graphic) {
        super(graphic);

        this._timeForLineValue = AppG.gameConst.getData("timeShowWinLine");
        this._effectIndex = this._graphic.getChildIndex(this._graphic.getChildByName("re_coins_top"));

        /** @type {OMY.OContainer} */
        this._canvasShine = this._graphic.getChildByName("c_shine");
        /** @type {OMY.OContainer} */
        this._canvasLabel = this._graphic.getChildByName("c_label");

        /** @type {OMY.OTextNumberBitmap} */
        this._txtLittleWin = this._graphic.getChildByName("t_win_little");
        this._txtLittleWin.incSecond = AppG.gameConst.getData("timeShowWinLine");
        this._txtLittleWin.onCompleteInc = this._onCompleteIncWin.bind(this);
        this._txtLittleWin.showCent = true;
        this._txtLittleWin.visible = false;
        this._txtLittleWin.lastText = ",";

        /** @type {OMY.ORevoltParticleEmitter} */
        this._coins = graphic.getChildByName("re_coins_top");
        this._coins.kill();
        this._activeSound = null;

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._resize, this);
        this._txtWin.lastText = ",";

        // AppG.emit.on(AppConst.APP_SHOW_BONUS_WIN, this._showBonusWinMessage, this);
        // OMY.Omy.addUpdater(this._update, this);
        this._txtWin.onStepInc = this._update.bind(this);
        this._winCoef = 0;

        if (this._gdConf.hasOwnProperty("active_debug")) {
            this._debugMessage = true;
            const debConst = this._gdConf["active_debug"].split(":");
            AppG.winCredit = debConst[1];
            AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
            AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
            switch (debConst[0]) {
                case this.C_TYPE_BIG: {
                    OMY.Omy.add.timer(0.6, this._showBigWinMessage, this);
                    break;
                }
                case this.C_TYPE_EPIC: {
                    OMY.Omy.add.timer(0.6, this._showEpicWinMessage, this);
                    break;
                }
                case this.C_TYPE_MEGA: {
                    OMY.Omy.add.timer(0.6, this._showMegaWinMessage, this);
                    break;
                }
                case this.C_TYPE_SUPER: {
                    OMY.Omy.add.timer(0.6, this._showSuperMegaWinMessage, this);
                    break;
                }

                default: {
                    OMY.Omy.add.timer(0.6, this._showSimpleWinMessage, this);
                    break;
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------
    /**     * @private     */
    _resize() {
        if (this._coins.active) {
            this._coins.particle.settings.floorY = OMY.Omy.HEIGHT * 1.5;
        }
    }

    _showBonusWinMessage() {
        this._showWinMessage("bonus");
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        this._resize();
        super._showWinMessage(winSize);
        this._skiping = false;
        this._txtWin.visible = false;
        this._txtLittleWin.visible = false;

        // AppG.emit.emit(AppConst.APP_START_INC_WIN, AppG.winCredit, AppG.incTimeTake);
        _incAnim = false;
        this._isCheckLimits = false;
        this._checkPartCount = 1;
        this._maxWinType = winSize;
        this._jsonTxt = this._gdConf["pos"];
        let pos;

        let winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        this._bigWin = false;

        OMY.Omy.sound.play(GameConstStatic.S_take_take, true);
        switch (this._maxWinType) {
            case this.C_TYPE_BIG: {
                pos = this._jsonTxt["txt"]["big"];
                this._currentWinLvl = this.C_TYPE_BIG;
                AppG.showWinTime = AppG.incTimeTake;

                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(AppG.winCredit, true);

                this._txtWin.scale.set(1);
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                }, this._gdConf["time_show_txt"], null);

                this._screenDelay = this._gdConf["screen_delay"];
                break;
            }
            case this.C_TYPE_SUPER:
            case this.C_TYPE_MEGA:
            case this.C_TYPE_EPIC: {
                if (OMY.Omy.sound.getSoundVolume(GameConstStatic.S_bg_rs) > 0) {
                    this._playRsMusic = true;
                    this._rsVolume = OMY.Omy.sound.getSoundVolume(GameConstStatic.S_bg_rs);
                    OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.1, 0);
                }
                if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg) > 0) {
                    this._playWinMusic = true;
                    this._winVolume = OMY.Omy.sound.getSoundVolume(GameConstStatic.S_game_bg);
                    OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.1, 0);
                }
                this._txtWin.visible = true;
                this._txtWin.alpha = 0;
                this._txtWin.setNumbers(0, false);
                OMY.Omy.remove.tween(this._txtWin);

                this._bigWin = true;
                OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
                pos = this._jsonTxt["txt"]["none"];
                this._currentWinLvl = this.C_TYPE_BIG;
                switch (this._maxWinType) {
                    case this.C_TYPE_EPIC: {
                        this._checkPartCount = 2;
                        break;
                    }
                    case this.C_TYPE_MEGA: {
                        this._checkPartCount = 3;
                        break;
                    }
                    case this.C_TYPE_SUPER: {
                        this._checkPartCount = 4;
                        break;
                    }
                }
                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_SHOW);
                this._txtWin.scale.set(0.5);
                this._screenDelay = this._gdConf["screen_delay"];
                AppG.showWinTime = AppG.incTimeTake + this._gdConf["bonus_delay"];
                this._isCheckLimits = true;
                this._needCoefLimit = (1 / this._checkPartCount) * AppG.winCoef;

                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(AppG.winCredit, true);
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                    ease: "back.out(1.7)",
                }, this._gdConf["time_show_txt"], null);

                OMY.OMath.objectCopy(this._txtWin.json, pos);
                break;
            }

            default: {
                this._txtLittleWin.visible = true;
                this._txtLittleWin.alpha = 0;
                this._txtLittleWin.setNumbers(0, false);
                OMY.Omy.remove.tween(this._txtLittleWin);

                pos = this._jsonTxt["t_little"][(AppG.isFreeGame) ? "free" : "normal"];
                AppG.showWinTime = AppG.incTimeTake;
                this._currentWinLvl = this.C_TYPE_WIN;
                this._txtLittleWin.incSecond = AppG.incTimeTake;
                this._txtLittleWin.setNumbers(AppG.winCredit, true);
                OMY.Omy.add.tween(this._txtLittleWin, {
                    alpha: 1,
                }, this._gdConf["time_show_txt"], null);
                this._screenDelay = this._gdConf["screen_delay"];

                OMY.OMath.objectCopy(this._txtLittleWin.json, pos);
                this._txtLittleWin.textMaxWidth = this._txtLittleWin.json.width;
                /** @type {OMY.OActorSpine} */
                this._shine = OMY.Omy.add.actorJson(this._canvasShine, this._gdConf["shine"]);
                this._shine.gotoAndPlay(0, true);
                this._shine.alpha = 0;
                this._shine.setXY(this._txtLittleWin.json.x, this._txtLittleWin.json.y);
                this._shine.json.x = this._txtLittleWin.json.x;
                this._shine.json.y = this._txtLittleWin.json.y;
                OMY.Omy.add.tween(this._shine, {alpha: 1,}, this._gdConf["time_show_txt"]);
                if(AppG.winCredit > AppG.serverWork.betForLimit){
                    OMY.Omy.add.timer(AppG.incTimeTake, () => {                        
                        this._winNumberCoin = OMY.Omy.add.actorJson(this._canvasShine, this._gdConf["shine"]);
                        this._winNumberCoin.gotoAndPlay(0, false, this._winNumberCoin.json["coin_animation"]);
                        this._winNumberCoin.alpha = 0;
                        this._winNumberCoin.setXY(this._txtLittleWin.json.x, this._txtLittleWin.json.y);
                        this._winNumberCoin.json.x = this._txtLittleWin.json.x;
                        this._winNumberCoin.json.y = this._txtLittleWin.json.y;
                        OMY.Omy.add.tween(this._winNumberCoin, {alpha: 1,}, this._gdConf["time_show_txt"]);
                    }, this);                    
                }
            }
        }

        this._timeHideMessage = this._gdConf["time_hide_mess"];
        if (!this._debugMessage)
            this._lineTimer = OMY.Omy.add.timer(AppG.showWinTime, this._hideWinMessage, this);

        AppG.updateGameSize(this._graphic);
        this._startHide = false;
        _incAnim = true;

        this._timerForceSkip?.destroy();
        /*if (AppG.skippedWin &&
            (this._maxWinType === this.C_TYPE_BIG || this._maxWinType === this.C_TYPE_EPIC) &&
            this._timerForceSkip) {
            this._timerForceSkip.destroy();
            this._timerForceSkip = OMY.Omy.add.timer(this._gdConf["skip_big_win_time"], this._skipWinAnimations, this);
        }*/
    }

    /**     * @private     */
    _update(value) {
        if (this._isCheckLimits) {
            this._winCoef = value / AppG.serverWork.betForLimit;
            if (this._winCoef >= this._needCoefLimit) {
                this._changeWinLimit();
            }
        }
    }

    /**     * @private     */
    _changeWinLimit() {
        let pos = null;
        switch (this._currentWinLvl) {
            case this.C_TYPE_BIG: {
                if (this._maxWinType === this.C_TYPE_EPIC) {
                    this._isCheckLimits = false;
                    this._needCoefLimit = Number.MAX_VALUE;
                } else {
                    this._needCoefLimit = (2 / this._checkPartCount) * AppG.winCoef;
                }
                this._currentWinLvl = this.C_TYPE_EPIC;
                OMY.Omy.sound.play(GameConstStatic.S_big_win_show, false);
                this._activeSound = GameConstStatic.S_big_win_show;

                this._aEffect = OMY.Omy.add.actorJson(this._canvasLabel, this._gdConf["spine"]);
                this._aEffect.setMixByName(this._aEffect.json["show_big"], this._aEffect.json["loop_big"], 0.2);
                this._aEffect.setMixByName(this._aEffect.json["loop_big"], this._aEffect.json["show_mega"], 0.3);
                this._aEffect.setMixByName(this._aEffect.json["show_mega"], this._aEffect.json["loop_mega"], 0.2);
                this._aEffect.setMixByName(this._aEffect.json["loop_mega"], this._aEffect.json["show_epic"], 0.3);
                this._aEffect.setMixByName(this._aEffect.json["show_epic"], this._aEffect.json["loop_mega"], 0.2);
                this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_big"]);
                this._aEffect.addComplete(this._onCompleteBigWin, this, true);
                OMY.Omy.sound.play(GameConstStatic.S_change_mess);

                this._coins.revive();
                this._coins.particle.settings.floorY = OMY.Omy.HEIGHT * 1.5;
                this._coins.addCompleted(this._needClearCoin, this, false);
                this._coins.start();

                pos = this._jsonTxt["txt"]["big"];
                OMY.OMath.objectCopy(this._txtWin.json, pos);
                OMY.Omy.add.tween(this._txtWin, {
                    x: pos["x"],
                    y: pos["y"],
                    ease: "none"
                }, pos["m_time"]);
                break;
            }
            case this.C_TYPE_EPIC: {
                if (this._maxWinType === this.C_TYPE_MEGA) {
                    this._isCheckLimits = false;
                    this._needCoefLimit = Number.MAX_VALUE;
                } else {
                    this._needCoefLimit = (3 / this._checkPartCount) * AppG.winCoef;
                }
                this._currentWinLvl = this.C_TYPE_MEGA;
                OMY.Omy.sound.play(GameConstStatic.S_mega_win_show, false);
                OMY.Omy.sound.stop(GameConstStatic.S_big_win_show);
                this._activeSound = GameConstStatic.S_mega_win_show;

                this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_mega"]);
                this._aEffect.addComplete(this._onCompleteMegaWin, this, true);
                OMY.Omy.sound.play(GameConstStatic.S_change_mess);
                break;
            }
            case this.C_TYPE_MEGA: {
                this._isCheckLimits = false;
                this._needCoefLimit = Number.MAX_VALUE;
                this._currentWinLvl = this.C_TYPE_SUPER;
                OMY.Omy.sound.play(GameConstStatic.S_epic_win_show, false);
                OMY.Omy.sound.stop(GameConstStatic.S_mega_win_show);
                this._activeSound = GameConstStatic.S_epic_win_show;

                this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_epic"]);
                this._aEffect.addComplete(() => {
                    this._aEffect.gotoAndPlay(0, true, this._aEffect.json["loop_epic"]);
                }, this, true);
                OMY.Omy.sound.play(GameConstStatic.S_change_mess);
                break;
            }
        }
    }

    /**     * @private     */
    _onCompleteBigWin() {
        this._aEffect.gotoAndPlay(0, true, this._aEffect.json["loop_big"]);
    }

    /**     * @private     */
    _onCompleteMegaWin() {
        this._aEffect.gotoAndPlay(0, true, this._aEffect.json["loop_mega"]);

    }

    /**     * @private     */
    _onCompleteEpicWin() {

    }

    _onCompleteIncWin() {
        this._isCheckLimits = false;
        if (_incAnim) {
            _incAnim = false;
            OMY.Omy.sound.stop(GameConstStatic.S_take_take);
            if (this._maxWinType === this.C_TYPE_WIN)
                OMY.Omy.sound.play(GameConstStatic.S_cash);
            else
                OMY.Omy.sound.play(GameConstStatic.S_big_win_END);
            if (this._activeSound && OMY.Omy.sound.isSoundPlay(this._activeSound))
                OMY.Omy.sound.stop(this._activeSound);

            if (this._txtWin.visible) {
                OMY.Omy.remove.tween(this._txtWin);
                OMY.Omy.add.tween(this._txtWin, {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    repeat: 1,
                    yoyo: true
                }, 0.2);
                this._txtWin.stopInctAnimation();
                this._txtWin.setNumbers(this._txtWin.value);
            }
            if (this._txtLittleWin.visible) {
                OMY.Omy.remove.tween(this._txtLittleWin);
                this._txtLittleWin.alpha = 1;
                OMY.Omy.add.tween(this._txtLittleWin, {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    repeat: 1,
                    yoyo: true
                }, 0.2);
                this._txtLittleWin.stopInctAnimation();
                this._txtLittleWin.setNumbers(this._txtLittleWin.value);
            }

            // this._bigWin && OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);

            this._coins.active && this._coins.stop();
            AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
            super._onCompleteIncWin();
        }
    }

    /**     * @private     */
    _skipWinAnimations() {
        if (this._debugMessage) return;
        if (!this._graphic.visible) return;
        if (this._skiping) return;

        this._lineTimer?.destroy();
        this._skiping = true;
        let forceEnd = true;

        if (this._currentWinLvl === this.C_TYPE_EPIC || this._currentWinLvl === this.C_TYPE_BIG) {
            OMY.Omy.remove.tween(this._txtWin);
            let pos = this._jsonTxt["txt"]["big"];
            OMY.OMath.objectCopy(this._txtWin.json, pos);
            this._txtWin.setXY(pos["x"], pos["y"]);
        }
        if (this._maxWinType !== this._currentWinLvl) {
            forceEnd = true;
            if (!this._aEffect) {
                this._aEffect = OMY.Omy.add.actorJson(this._canvasLabel, this._gdConf["spine"]);
                this._aEffect.setMixByName(this._aEffect.json["show_big"], this._aEffect.json["loop_big"], 0.2);
                this._aEffect.setMixByName(this._aEffect.json["loop_big"], this._aEffect.json["show_mega"], 0.3);
                this._aEffect.setMixByName(this._aEffect.json["show_mega"], this._aEffect.json["loop_mega"], 0.2);
                this._aEffect.setMixByName(this._aEffect.json["loop_mega"], this._aEffect.json["show_epic"], 0.3);
                this._aEffect.setMixByName(this._aEffect.json["show_epic"], this._aEffect.json["loop_mega"], 0.2);
                this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_big"]);
                OMY.Omy.sound.play(GameConstStatic.S_change_mess);
            } else {
                this._aEffect.removeComplete(this._onCompleteBigWin, this);
                this._aEffect.removeComplete(this._onCompleteMegaWin, this);
            }
            switch (this._maxWinType) {
                case this.C_TYPE_EPIC: {
                    OMY.Omy.sound.play(GameConstStatic.S_big_win_show, false);
                    this._activeSound = GameConstStatic.S_big_win_show;
                    break;
                }
                case this.C_TYPE_MEGA: {
                    OMY.Omy.sound.play(GameConstStatic.S_mega_win_show, false);
                    OMY.Omy.sound.stop(this._activeSound);
                    this._activeSound = GameConstStatic.S_mega_win_show;

                    this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_mega"]);
                    OMY.Omy.sound.play(GameConstStatic.S_change_mess);
                    break;
                }
                case this.C_TYPE_SUPER: {
                    OMY.Omy.sound.play(GameConstStatic.S_epic_win_show, false);
                    OMY.Omy.sound.stop(this._activeSound);
                    this._activeSound = GameConstStatic.S_epic_win_show;

                    this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_epic"]);
                    OMY.Omy.sound.play(GameConstStatic.S_change_mess);
                    break;
                }
            }
        }
        this._currentWinLvl = this._maxWinType;
        this._onCompleteIncWin();
        this._screenDelay = this._gdConf["screen_delay"];
        if (!this._startHide) {
            // OMY.Omy.remove.tween(this._txtWin);
            this._txtWin.alpha = 1;
            // this._txtWin.scale.set(1);
            if (this._maxWinType === this.C_TYPE_WIN) forceEnd = false;
            if (forceEnd) OMY.Omy.add.timer(this._gdConf["skip_bigWin_delay"], this._hideWinMessage, this);
            else this._hideWinMessage();
        }/* else {
            this._messageClear();
        }*/
    }

    /**     * @private     */
    _needClearCoin() {
        this._coins.kill();
    }

    _hideWinMessage() {
        this._onCompleteIncWin();

        this._isCheckLimits = false;
        this._lineTimer?.destroy();
        this._startHide = true;
        // OMY.Omy.remove.tween(this._txtWin);
        this._timerHideDelay = OMY.Omy.add.timer(this._screenDelay, this._delayHideMess, this);
    }

    /**     * @private     */
    _delayHideMess() {
        this._timerHideDelay = null;
        switch (this._maxWinType) {
            case this.C_TYPE_WIN:
            case this.C_TYPE_BIG: {
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 0,
                    ease: "none",
                }, this._timeHideMessage, this._messageClear.bind(this));
                if (this._aEffect) {
                    OMY.Omy.add.tween(this._aEffect, {
                        alpha: 0,
                        ease: "none",
                    }, this._timeHideMessage);
                }
                break;
            }

            default: {
                if (this._shine) {
                    OMY.Omy.add.tween(this._shine, {
                        alpha: 0,
                        ease: "none",
                    }, this._timeHideMessage);
                }
                if (this._winNumberCoin) {
                    OMY.Omy.add.tween(this._winNumberCoin, {
                        alpha: 0,
                        ease: "none",
                    }, this._timeHideMessage);
                }
                OMY.Omy.add.tween(this._txtLittleWin, {
                    alpha: 0,
                    ease: "none",
                }, this._timeHideMessage, this._messageClear.bind(this));
            }
        }

        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_HIDE);
    }

    _messageClear() {
        if (this._playRsMusic) {
            this._playRsMusic = false;
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.1, this._rsVolume);
        }
        if (this._playWinMusic) {
            this._playWinMusic = false;
            OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.1, this._winVolume);
        }
        this._activeSound = null;
        this._timerHideDelay?.destroy();
        this._timerHideDelay = null;
        this._lineTimer?.destroy();
        OMY.Omy.remove.tween(this._txtWin);
        if (this._aEffect) {
            OMY.Omy.remove.tween(this._aEffect);
            this._aEffect.destroy();
            this._aEffect = null;
        }
        OMY.Omy.remove.tween(this._txtLittleWin);
        this._txtLittleWin.visible = false;
        if (this._shine) {
            OMY.Omy.remove.tween(this._shine);
            this._shine.kill();
            this._shine = null;
        }
        if (this._winNumberCoin) {
            OMY.Omy.remove.tween(this._winNumberCoin);
            this._winNumberCoin.kill();
            this._winNumberCoin = null;
        }
        AppG.emit.emit(AppConst.APP_STOP_WIN_PARTICLES);
        super._hideWinMessage();
    }

    static get incAnim() {
        return _incAnim;
    }
}
