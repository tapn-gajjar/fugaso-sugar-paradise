import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";
import {GameConstStatic} from "../GameConstStatic";
import {BonusWindowBase} from "../../casino/gui/windows/BonusWindowBase";

export class BonusWheelWindow extends BonusWindowBase {
    constructor() {
        super();

        this.PI_2 = Math.PI * 2;
        this._sectorsList = this._gdConf["sectors_list"];
        this._sectorSize = this.PI_2 / this._sectorsList.length;
    }

    //-------------------------------------------------------------------------
    // OVERRIDE
    //-------------------------------------------------------------------------

    _showDebug() {
        AppG.state.mainView._startBonusGame();
        // super._showDebug();
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._showWheel();
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    _updateLoc() {
        super._updateLoc();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _createGraphic() {
        super._createGraphic();
        AppG.state.mainView.changeBgMusic(GameConstStatic.S_game_bg, GameConstStatic.S_wheel_bg);

        this._loopRotate = false;

        this._cWheel = this.getChildByName("c_wheel");

        // this._sWheelGlow = this._cWheel.getChildByName("s_wheel_glow");
        //
        // this._sWheelWinGlow = this._cWheel.getChildByName("s_wheel_win_glow");
        // this._sWheelWinGlow.alpha = 0;

        this._cWheelCenter = this._cWheel.getChildByName("c_wheel_center");
        this._cWheelCenter.rotation = 0;

        if (this._cWheelCenter.getChildByName("c_values"))
            this._txtBlock = this._cWheelCenter.getChildByName("c_values");
        //
        // this._sWinSector = this._cWheelCenter.getChildByName("s_yellow");
        // this._sWinSector.visible = false;
        //
        //
        if (this._txtBlock) {
            for (let i = 0, l = this._sectorsList.length; i < l; ++i) {
                const txtSector = this._txtBlock.getChildByName("t_sector_" + i);
                txtSector.text = String(this._sectorsList[i] * AppG.serverWork.totalBet);
            }
        }

        this._cWheel.getChildByName("a_frame").gotoAndStop(0);
        /** @type {OMY.OActorSpine} */
        this._aFrame = this._cWheel.getChildByName("a_Ramka");
        this._aFrame.gotoAndStop(0);
        /** @type {OMY.OActorSpine} */
        this._aWinSector = this._cWheel.getChildByName("a_Win_baraban");
        this._aWinSector.stop();
        this._aWinSector.visible = false;
        /** @type {OMY.OActorSpine} */
        this._aCarrot = this._cWheel.getChildByName("a_Morkov");
        this._aCarrot.gotoAndStop(0);
        /** @type {OMY.OActorSpine} */
        this._aWin = this._cWheel.getChildByName("a_Win");
        this._aWin.stop();
        this._aWin.visible = false;

        // OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this._onKeyHandler, this);
    }

    _clearGraphic() {
        super._clearGraphic();

        this._loopRotate = false;
        this._sWheelGlow?.tweenScale?.kill();

        this._cWheel = null;
        this._sWheelGlow = null;
        this._sWheelWinGlow = null;
        this._cWheelCenter = null;
        this._txtBlock = null;
        this._sWinSector = null;
        this._aFrame = null;
        this._aWinSector = null;
        this._aCarrot = null;
        this._aWin = null;
    }

    // /** @private */
    // _onKeyHandler() {
    //     this._startRotation();
    // }

    /**     * @private     */
    _showWheel() {
        OMY.Omy.sound.play(GameConstStatic.S_wheel_start_vocal);
        this._cWheel.alpha = 0;
        this._cWheel.scale.set(5);
        const finishPos = this._cWheel.y;
        this._cWheel.y += this._cWheel.json["tween_dy"];
        OMY.Omy.add.timer(this._cWheel.json["delay"], () => {
            OMY.Omy.sound.play(GameConstStatic.S_wheel_start);
        }, this);
        OMY.Omy.add.tween(this._cWheel, {alpha: 1, delay: this._cWheel.json["delay"]}, .2);
        OMY.Omy.add.tween(this._cWheel, {
                delay: this._cWheel.json["delay"],
                y: finishPos,
                scaleX: 1,
                scaleY: 1,
            },
            this._cWheel.json["time_tween"],
            this._onShowWheel.bind(this));
    }

    /**     * @private     */
    _onShowWheel() {
        OMY.Omy.add.timer(this._gdConf["time_delay_rotation"], this._startRotation, this);
    }

    _startRotation() {
        this._aFrame.gotoAndPlay(0, true);

        this._cWheelCenter.rotation = OMY.OMath.normAngle(this._cWheelCenter.rotation % this.PI_2);

        OMY.Omy.sound.play(GameConstStatic.S_start_move_wheel);
        OMY.Omy.sound.play(GameConstStatic.S_move_wheel, true);
        /*OMY.Omy.sound.addPlayEndEvent(GameConstStatic.S_start_move_wheel, () => {
            OMY.Omy.sound.play(GameConstStatic.S_move_wheel, true);
        }, this, true);*/

        this._stopMult = AppG.serverWork.spinBonus?.shift() ?? 5;
        const targetValue = this._stopMult;
        AppG.winCredit = AppG.serverWork.bonusTotalWin ?? 1;

        const listIndexes = [];
        for (let i = 0; i < this._sectorsList.length; i++) {
            if (targetValue === this._sectorsList[i]) {
                listIndexes.push(i);
            }
        }
        !listIndexes.length && listIndexes.push(0);
        this._targetIndex = OMY.OMath.getRandomItem(listIndexes);

        this.isUpdate = true;
        this._loopRotate = true;
        this._rSpeed = 0;
        this._canShowWin = false;
        OMY.Omy.add.timer(this._gdConf["time_wait_for_r"], this._onTimerMoveComplete, this);
        OMY.Omy.add.tween(this, {
            _rSpeed: this._gdConf["max_speed"],
            ease: "none",
        }, this._gdConf["grow_speed_time"]);
    }

    /**     * @private     */
    _onTimerMoveComplete() {
        OMY.Omy.remove.tween(this);
        this._canShowWin = true;
    }

    update() {
        super.update();
        if (this._loopRotate) {
            this._cWheelCenter.rotation += this._rSpeed;
            if (this._canShowWin) {
                this.isUpdate = false;
                this._loopRotate = false;

                const targetAngle = this.PI_2 + (this._sectorsList.length - this._targetIndex) * this._sectorSize;
                let count_PI = Math.floor(this._cWheelCenter.rotation / this.PI_2);
                this._cWheelCenter.rotation = this._cWheelCenter.rotation - this.PI_2 * count_PI;

                OMY.Omy.add.tween(this._cWheelCenter, {
                        rotation: targetAngle,
                        ease: "power2.out",
                    }, this._gdConf["rotation_sec"], this._endRotation.bind(this),
                );
            }
        }
    }

    _endRotation() {
        OMY.Omy.sound.stop(GameConstStatic.S_move_wheel);
        OMY.Omy.sound.play((this._stopMult === 10) ? GameConstStatic.S_wheel_x10 : GameConstStatic.S_wheel_sector);

        this._aWinSector.visible = true;
        this._aWinSector.gotoAndPlay(0, true);
        /*this._sWheelWinGlow.tweenAlpha = OMY.Omy.add.tween(this._sWheelWinGlow, {
            alpha: 1,
        }, this._sWheelWinGlow.json["alpha_sec"]);

        this._sWinSector.angle = this._sWinSector.json["rotate"][this._targetIndex];
        this._sWinSector.timerBlink = OMY.Omy.add.timer(0.15, () => {
            this._sWinSector.visible = !this._sWinSector.visible;
        }, this, 5, false);

        this._sWinSector.timerBlink = OMY.Omy.add.timer(0.15, () => {
            this._sWinSector.visible = !this._sWinSector.visible;
        }, this, 6, false, true, 1.5);
*/
        OMY.Omy.add.timer(this._gdConf["delay_win_message_sec"], this._showWinMessage, this);
    }

    _showWinMessage() {
        this._aWin.visible = true;
        this._aWin.alpha = 0;
        this._aWin.gotoAndPlay(0);
        OMY.Omy.add.tween(this._aWin, {alpha: 1}, 0.2);
        OMY.Omy.sound.play(GameConstStatic.S_wheel_light);

        if (this._gdConf["show_debug"]) return;
        OMY.Omy.sound.fadeOut(GameConstStatic.S_game_bg, 0.1);
        AppG.serverWork.updateBonusWin();
        AppG.autoGameRules.updateRule3(AppG.serverWork.bonusWin / AppG.creditType);
        AppG.autoGameRules.updateWins(AppG.serverWork.bonusWin / AppG.creditType);

        AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("show_win_conf"), true);
        // AppG.emit.emit(AppConst.APP_WIN_PARTICLES, AppG.winCredit);

        if (AppG.winCoef >= AppG.gameConst.getData("game_const")["bonus_epic_win_rate"]) {
            AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("game_const")["bonus_big_win_rate"]) {
            AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN, AppG.winCredit);
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_BONUS_WIN, AppG.winCredit);
        }
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._hideWinMess, this);

        // AppG.emit.emit(AppConst.EMIT_SHOW_WHEEL_WIN);

        // OMY.Omy.sound.play(AppConst.S_bonus_end);
        // OMY.Omy.sound.play(GameConstStatic.S_bigwin);
    }

    /**     * @private     */
    _hideWinMess() {
        if (!this._gdConf["show_debug"]) {
            OMY.Omy.add.tween(this._aWin, {alpha: 0}, 0.2);
            OMY.Omy.add.timer(this._gdConf["delay_win_message_hide_sec"], this._endShowBonus, this);
        }
    }

    _endShowBonus() {
        OMY.Omy.add.tween(this._cWheel, {
                alpha: 0,
            },
            this._cWheel.json["time_tween"],
            this._hideWindow.bind(this));
        // super._endShowBonus();
    }

    _hideWindow() {
        // OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this._onKeyHandler, this);
        AppG.isBonusGame = false;
        this._hideMe();
        AppG.emit.emit(AppConst.APP_BONUS_CLOSE);
        AppG.state.mainView.changeBgMusic(GameConstStatic.S_game_bg, GameConstStatic.S_bg);
        if (AppG.needCollect) {
            AppG.state.collectWin();
        } else {
            AppG.state.startNewSession();
        }
    }
}
