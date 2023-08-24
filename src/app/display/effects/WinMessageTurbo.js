import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export class WinMessageTurbo {
    constructor(graphic) {
        this.C_TYPE_WIN = "none";
        this.C_TYPE_BIG = "big";
        this.C_TYPE_EPIC = "epic";
        this.C_TYPE_MEGA = "mega";
        this.C_TYPE_SUPER = "super";

        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._graphic.visible = false;

        /** @type {OMY.OActorSpine} */
        this._aEffect = null;

        AppG.emit.on(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, this._showSimpleWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN_TURBO, this._showBigWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_EPIC_WIN_TURBO, this._showEpicWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_MEGA_WIN_TURBO, this._showMegaWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, this._showSuperMegaWinMessage, this);

        this._effectIndex = this._graphic.getChildIndex(this._graphic.getChildByName("re_coins_top"));
        /** @type {OMY.OTextNumberBitmap} */
        this._txtLittleWin = this._graphic.getChildByName("t_win_little");
        this._txtLittleWin.showCent = true;
        this._txtLittleWin.lastText = ",";

        this._activeSound = null;

        // AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._resize, this);
        this._txtWin = this._graphic.getChildByName("t_win");
        this._txtWin.showCent = true;
        this._txtWin.lastText = ",";

        /** @type {OMY.OContainer} */
        this._canvasShine = this._graphic.getChildByName("c_shine");
        /** @type {OMY.OContainer} */
        this._canvasLabel = this._graphic.getChildByName("c_label");

        if (this._gdConf.hasOwnProperty("active_turbo_debug")) {
            this._debugMessage = true;
            const debConst = this._gdConf["active_turbo_debug"].split(":");
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

    /**     * @private     */
    // _resize() {
    //
    // }

    _showBonusWinMessage() {
        this._showWinMessage("bonus");
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        OMY.Omy.info('win message on turbo. show. Type:', winSize);
        this._currentWinLvl = this._maxWinType = winSize;
        if (this._graphic.visible) {
            OMY.Omy.sound.stop(GameConstStatic.S_big_win_show);
            OMY.Omy.sound.stop(GameConstStatic.S_mega_win_show);
            OMY.Omy.sound.stop(GameConstStatic.S_epic_win_show);
            this._activeSound = null;
            this._lineTimer?.destroy();
            this._lineTimer = null;
            this._timerHideDelay?.destroy();
            this._timerHideDelay = null;
            OMY.Omy.remove.tween(this._txtWin);
            OMY.Omy.remove.tween(this._txtLittleWin);
            if (this._txtWin.visible && this._maxWinType !== this.C_TYPE_EPIC && this._maxWinType !== this.C_TYPE_MEGA && this._maxWinType !== this.C_TYPE_SUPER) {
                this._txtWin.visible = false;
                if (this._aEffect) {
                    OMY.Omy.remove.tween(this._aEffect);
                    this._aEffect.destroy();
                    this._aEffect = null;
                }
                if (this._playRsMusic) {
                    this._playRsMusic = false;
                    OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.1, this._rsVolume);
                }
                if (this._playWinMusic) {
                    this._playWinMusic = false;
                    OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.1, this._winVolume);
                }
            }
            if (this._txtLittleWin.visible && this._maxWinType !== this.C_TYPE_BIG && this._maxWinType !== this.C_TYPE_WIN) {
                this._txtLittleWin.visible = false;
                if (this._shine) {
                    OMY.Omy.remove.tween(this._shine);
                    this._shine.kill();
                    this._shine = null;
                }
            }
        } else {
            this._graphic.visible = true;
            this._txtWin.visible = false;
            this._txtLittleWin.visible = false;
        }
        OMY.Omy.sound.play(GameConstStatic.S_cash);
        this._jsonTxt = this._gdConf["pos"];
        let pos;

        switch (this._maxWinType) {
            case this.C_TYPE_SUPER:
            case this.C_TYPE_MEGA:
            case this.C_TYPE_EPIC: {
                this._txtWin.setNumbers(AppG.winCredit, false);
                AppG.forceIncTimeTake = AppG.gameConst.forceTurboBigWin;
                AppG.showWinTime = AppG.gameConst.forceTurboBigWin;
                this._screenDelay = this._gdConf["screen_big_turbo_delay"];

                if (OMY.Omy.sound.getSoundVolume(GameConstStatic.S_bg_rs) > 0 && !this._playRsMusic) {
                    this._playRsMusic = true;
                    this._rsVolume = OMY.Omy.sound.getSoundVolume(GameConstStatic.S_bg_rs);
                    OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.1, 0);
                }
                if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg) > 0 && !this._playWinMusic) {
                    this._playWinMusic = true;
                    this._winVolume = OMY.Omy.sound.getSoundVolume(GameConstStatic.S_game_bg);
                    OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.1, 0);
                }
                OMY.Omy.sound.play(GameConstStatic.S_change_mess);

                pos = this._jsonTxt["txt"]["big"];
                OMY.OMath.objectCopy(this._txtWin.json, pos);

                this._aEffect?.destroy();
                this._aEffect = OMY.Omy.add.actorJson(this._canvasLabel, this._gdConf["spine"]);
                this._aEffect.speed = 1.5;
                switch (this._maxWinType) {
                    case this.C_TYPE_EPIC: {
                        OMY.Omy.sound.play(GameConstStatic.S_big_win_show, false);
                        this._activeSound = GameConstStatic.S_big_win_show;
                        this._aEffect.setMixByName(this._aEffect.json["show_big"], this._aEffect.json["loop_big"], 0.2);
                        this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_big"]);
                        this._aEffect.addComplete(() => {
                            this._aEffect.gotoAndPlay(0, true, this._aEffect.json["loop_big"]);
                            this._aEffect.speed = 1;
                        }, this, true);
                        break;
                    }
                    case this.C_TYPE_MEGA: {
                        OMY.Omy.sound.play(GameConstStatic.S_mega_win_show, false);
                        this._activeSound = GameConstStatic.S_mega_win_show;
                        this._aEffect.setMixByName(this._aEffect.json["show_mega"], this._aEffect.json["loop_mega"], 0.2);
                        this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_mega"]);
                        this._aEffect.addComplete(() => {
                            this._aEffect.gotoAndPlay(0, true, this._aEffect.json["loop_mega"]);
                            this._aEffect.speed = 1;
                        }, this, true);
                        break;
                    }
                    case this.C_TYPE_SUPER: {
                        OMY.Omy.sound.play(GameConstStatic.S_epic_win_show, false);
                        this._activeSound = GameConstStatic.S_epic_win_show;
                        this._aEffect.setMixByName(this._aEffect.json["show_epic"], this._aEffect.json["loop_mega"], 0.2);
                        this._aEffect.gotoAndPlay(0, false, this._aEffect.json["show_epic"]);
                        this._aEffect.addComplete(() => {
                            this._aEffect.gotoAndPlay(0, true, this._aEffect.json["loop_epic"]);
                            this._aEffect.speed = 1;
                        }, this, true);
                        break;
                    }
                }
                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_SHOW);

                if (this._txtWin.visible) {
                    this._txtWin.alpha = 1;
                    this._txtWin.scale.set(1);
                    OMY.Omy.add.tween(this._txtWin, {
                        scaleX: 1.2,
                        scaleY: 1.2,
                        repeat: 1,
                        yoyo: true
                    }, 0.2);
                } else {
                    this._txtWin.visible = true;
                    this._txtWin.alpha = 0;
                    OMY.Omy.remove.tween(this._txtWin);
                    this._txtWin.scale.set(1);
                    const timeLine = OMY.Omy.add.tweenTimeline();
                    OMY.Omy.add.tween(this._txtWin, {
                        alpha: 1,
                    }, AppG.showWinTime * .3, null, null, timeLine);
                    OMY.Omy.add.tween(this._txtWin, {
                        scaleX: 1.2,
                        scaleY: 1.2,
                        repeat: 1,
                        yoyo: true
                    }, 0.2, null, null, timeLine);
                }
                break;
            }

            default: {
                this._txtLittleWin.setNumbers(AppG.winCredit, false);
                AppG.forceIncTimeTake = AppG.gameConst.forceTurboWin;
                AppG.showWinTime = AppG.gameConst.forceTurboWin;
                this._screenDelay = this._gdConf["screen_turbo_delay"];

                // if (this._maxWinType===this.C_TYPE_BIG) pos = this._jsonTxt["txt"]["big"];
                // else pos = this._jsonTxt["t_little"][(AppG.isFreeGame) ? "free" : "normal"];
                pos = this._jsonTxt["t_little"][(AppG.isFreeGame) ? "free" : "normal"];

                if (this._txtLittleWin.visible) {
                    this._txtLittleWin.alpha = 1;
                    this._txtLittleWin.scale.set(1);
                    OMY.Omy.add.tween(this._txtLittleWin, {
                        scaleX: 1.2,
                        scaleY: 1.2,
                        repeat: 1,
                        yoyo: true
                    }, 0.2);
                } else {
                    this._txtLittleWin.visible = true;
                    this._txtLittleWin.alpha = 0;
                    const timeLine = OMY.Omy.add.tweenTimeline();
                    OMY.Omy.add.tween(this._txtLittleWin, {
                        alpha: 1,
                    }, AppG.showWinTime * .3, null, null, timeLine);
                    OMY.Omy.add.tween(this._txtLittleWin, {
                        scaleX: 1.2,
                        scaleY: 1.2,
                        repeat: 1,
                        yoyo: true
                    }, 0.2, null, null, timeLine);
                    OMY.OMath.objectCopy(this._txtLittleWin.json, pos);

                    /** @type {OMY.OActorSpine} */
                    this._shine = OMY.Omy.add.actorJson(this._canvasShine, this._gdConf["shine"]);
                    this._shine.gotoAndPlay(0, true);
                    this._shine.alpha = 0;
                    this._shine.setXY(this._txtLittleWin.json.x, this._txtLittleWin.json.y);
                    this._shine.json.x = this._txtLittleWin.json.x;
                    this._shine.json.y = this._txtLittleWin.json.y;
                    OMY.Omy.add.tween(this._shine, {alpha: 1,}, AppG.showWinTime * .3);
                }

                this._txtLittleWin.textMaxWidth = this._txtLittleWin.json.width;
            }
        }

        if (!this._debugMessage)
            this._lineTimer = OMY.Omy.add.timer(AppG.showWinTime, this._hideWinMessage, this);

        AppG.updateGameSize(this._graphic);
        AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
    }

    _hideWinMessage() {
        this._lineTimer?.destroy();
        this._lineTimer = null;
        this._timerHideDelay = OMY.Omy.add.timer(this._screenDelay, this._delayHideMess, this);
    }

    /**     * @private     */
    _delayHideMess() {
        this._timerHideDelay = null;
        this._aEffect && OMY.Omy.add.tween(this._aEffect, {
            alpha: 0,
            ease: "none",
        }, .1);
        this._txtWin.visible && OMY.Omy.add.tween(this._txtWin, {
            alpha: 0,
            ease: "none",
        }, .1, this._messageClear.bind(this));
        this._shine && OMY.Omy.add.tween(this._shine, {
            alpha: 0,
            ease: "none",
        }, .1);
        this._txtLittleWin.visible && OMY.Omy.add.tween(this._txtLittleWin, {
            alpha: 0,
            ease: "none",
        }, .1, this._messageClear.bind(this));
        AppG.emit.emit(AppConst.APP_HIDE_MESSAGE_WIN);
        AppG.emit.emit(AppConst.APP_STOP_WIN_PARTICLES);
        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_HIDE);
    }

    _messageClear() {
        OMY.Omy.info('win message turbo. hide');
        if (this._activeSound && OMY.Omy.sound.isSoundPlay(this._activeSound)) {
            OMY.Omy.sound.stop(this._activeSound);
            OMY.Omy.sound.play(GameConstStatic.S_big_win_END);
        }
        if (this._playRsMusic) {
            this._playRsMusic = false;
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.8, this._rsVolume);
        }
        if (this._playWinMusic) {
            this._playWinMusic = false;
            OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.8, this._winVolume);
        }
        this._activeSound = null;

        OMY.Omy.remove.tween(this._txtWin);
        if (this._aEffect) {
            OMY.Omy.remove.tween(this._aEffect);
            this._aEffect.destroy();
            this._aEffect = null;
        }
        OMY.Omy.remove.tween(this._txtLittleWin);
        if (this._shine) {
            OMY.Omy.remove.tween(this._shine);
            this._shine.kill();
            this._shine = null;
        }
        this._graphic.visible = false;
    }
}
