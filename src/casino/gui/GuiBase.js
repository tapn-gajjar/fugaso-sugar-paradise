import {AppG} from "../AppG";
import {AppConst} from "../AppConst";
import {HintPayBlock} from "../display/hint/HintPayBlock";
import {BtnAutoStart} from "../display/buttons/BtnAutoStart";
import {BtnAutoStop} from "../display/buttons/BtnAutoStop";
import {BtnStart} from "../display/buttons/BtnStart";
import {InfoLine} from "../../app/display/InfoLine";
import {InfoLineV} from "../../app/display/InfoLineV";
import {GameConstStatic} from "../../app/GameConstStatic";
import {WinMessage} from "../../app/display/effects/WinMessage";
import {JackpotMessage} from "../display/jackpot/JackpotMessage";
import {RichFreeSpins} from "./windows/richSpins/RichFreeSpins";
import {SkipBlink} from "../display/effects/SkipBlink";
import {BtnTake} from "../display/buttons/BtnTake";
import {BtnPlayGamble} from "../display/buttons/BtnPlayGamble";
import {BtnSuperTurbo} from "../display/buttons/BtnSuperTurbo";
import {WinMessageTurbo} from "../../app/display/effects/WinMessageTurbo";

export class GuiBase extends OMY.OContainer {
    constructor() {
        super();

        this._onlyBetOne = AppG.gameConst.onlyBetOne;
        this._winValue = 0;
        this._totalWin = 0;
        this._coinDropMult = AppG.gameConst.game_const["coin_drop_X"];

        this._createGraphic();

        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.updateBet, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_CREDIT, this.updateBalance, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_WIN, this.updateWin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_BEGIN, this._freeGameBegin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_END, this._freeGameEnd, this);

        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this.sendSpin, this);
        AppG.emit.on(AppConst.APP_REELBLOCK_END, this._onEndSpin, this);

        OMY.Omy.viewManager.addCreateWindow(this._onCreateWindow, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onRemoveWindow, this);

        AppG.emit.on(AppConst.APP_SHOW_WIN, this._updateOnWin, this);
        AppG.emit.on(AppConst.APP_WIN_PARTICLES, this._winParticles, this);
        AppG.emit.on(AppConst.APP_GAMBLE_LOSE, this._loseGamble, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        // OMY.Omy.add.timer(1, this._freeGameBegin, this);
        // OMY.Omy.add.timer(5, this._freeGameEnd, this);
    }

    _updateGameSize() {
        AppG.updateGameSize(this);
    }

    _createGraphic() {
        if (this.getChildByName("c_hint"))
            this._hint = new HintPayBlock(this.getChildByName("c_hint"));

        if (this.getChildByName("t_clock")) {
            OMY.Omy.game.addGameActive(this._updateTime, this, false);
            this._clock();
        }
        if (this.getChildByName("t_round_id")) AppG.createTxtRound(this.getChildByName("t_round_id"));
        if (!AppG.playingForFun) this.removeChild(this.getChildByName("t_play_for_fun"));

        this._windowsLayer = this.getChildByName("c_windows_layer");
        if (this.getChildByName("c_info_line")) this._infoLine = new InfoLine(this.getChildByName("c_info_line"));
        if (this.getChildByName("c_info_line_v")) this._infoLineV = new InfoLineV(this.getChildByName("c_info_line_v"));

        if (this.getChildByName("c_win_message")) {
            new WinMessage(this.getChildByName("c_win_message"));
        }
        if (this.getChildByName("c_jack_message")) {
            if (AppG.isHaveJackpot)
                new JackpotMessage(this.getChildByName("c_jack_message"));
            else
                this.getChildByName("c_jack_message").destroy();
        }
        if (this.getChildByName("c_rich")) {
            new RichFreeSpins(this.getChildByName("c_rich"));
        }

        if (this.getChildByName("r_blink_skip")) {
            new SkipBlink(this.getChildByName("r_blink_skip"));
        }

        /** @type {OMY.ORevoltParticleEmitter} */
        this._coins = this.getChildByName("re_coins");
        this._isHaveCoins = Boolean(this._coins);
        if (this._isHaveCoins) {
            this._coins.kill();
            AppG.emit.on(AppConst.APP_STOP_WIN_PARTICLES, this._stopWinParticles, this);
        }

        /** @type {OMY.ONeutrinoParticles} */
        this._npCoins = this.getChildByName("np_coins");
        this._isHaveNPCoins = Boolean(this._npCoins);
        if (this._isHaveNPCoins) {
            AppG.emit.on(AppConst.APP_STOP_WIN_PARTICLES, this._stopWinNPParticles, this);
        }
    }

    _createButtons() {
        if (!this._btnStart)
            this._btnStart = new BtnStart(this.getChildByName("b_start"));
        if (this.getChildByName("b_super_turbo")) {
            new BtnSuperTurbo(this.getChildByName("b_super_turbo"));
            this.getChildByName("c_win_message") && new WinMessageTurbo(this.getChildByName("c_win_message"));
        }
        if (AppG.gameHaveGamble) {
            new BtnTake(this.getChildByName("b_take"));
            new BtnPlayGamble(this.getChildByName("b_gamble"));
        }

        if (AppG.isHaveAuto) {
            new BtnAutoStart(this.getChildByName("b_auto_start"));
            new BtnAutoStop(this.getChildByName("b_auto_stop"));
        } else {
            this.getChildByName("b_auto_start").destroy();
            this.getChildByName("b_auto_stop").destroy();
            if (this.getChildByName("b_start").json["de"])
                this.getChildByName("b_start").json["y"] = this.getChildByName("b_start").json["de"]["y"];
        }

    }

    _createTexts() {
        /** @type {OMY.OContainer} */
        let container;
        container = this.getChildByName("t_credit");
        /** @type {OMY.OTextNumberBitmap} */
        this._txtBalance = container.canvas.getChildByName("t_value");
        this._txtBalance.lastText = AppG.currency;
        this._txtBalance.showCent = true;
        this._txtBalance.addTextUpdate(container.alignContainer, container);
        container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);

        container = this.getChildByName("t_bet");
        /** @type {OMY.OTextNumberBitmap} */
        this._txtBet = container.canvas.getChildByName("t_value");
        this._txtBet.lastText = AppG.currency;
        this._txtBet.showCent = true;
        this._txtBet.addTextUpdate(container.alignContainer, container);
        container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);

        container = this.getChildByName("t_win");
        /** @type {OMY.OTextNumberBitmap} */
        this._txtWin = container.canvas.getChildByName("t_value");
        this._txtWin.lastText = AppG.currency;
        this._txtWin.showCent = true;
        this._txtWin.onCompleteInc = this._onFinishIncWin.bind(this);
        this._txtWin.setNumbers(0);
        container.alignContainer();
        this._txtWin.addTextUpdate(container.alignContainer, container);
        container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
    }

    updateWin() {
    }

    updateBalance() {
        this._txtBalance.visible = !isNaN(AppG.serverWork.playerBalance);
        this._txtBalance.setNumbers(AppG.serverWork.playerBalance);
    }

    updateBet() {
        this._txtBet.setNumbers((this._onlyBetOne) ? AppG.serverWork.currBet : AppG.serverWork.totalBet);
    }

    _updateOnWin(value, skip = false) {
        if (AppG.winCredit !== 0) {
            if (skip) {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_take_end))
                    OMY.Omy.sound.play(GameConstStatic.S_take_end);
                this._txtWin.stopInctAnimation();
                this._txtWin.setNumbers(value, false);
            } else {
                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(value, true);
            }
        }
    }

    /**     * @private     */
    _loseGamble() {
        this._txtWin.setNumbers(0);
    }

    // region particles:
    //-------------------------------------------------------------------------
    _winParticles(value, skip = false) {
        if (this._isHaveCoins) {
            if (AppG.winCredit !== 0) {
                if (skip) {
                    if (this._coins.active)
                        this._coins?.stop();
                } else {
                    if (this._coins.active) this._coins.kill();
                    if ((value / AppG.serverWork.betForLimit) >= this._coinDropMult) {
                        this._coins.revive();
                        this._settingCoins(value);
                        this._coins.addCompleted(this._needClearCoin, this, false);
                        this._coins.start();
                    }
                }
            }
        }
        if (this._isHaveNPCoins) {
            if (AppG.winCredit !== 0) {
                if (skip) {
                    if (this._npCoins.playing())
                        this._npCoins.pauseGenerators();
                } else {
                    if ((value / AppG.serverWork.betForLimit) >= this._coinDropMult) {
                        this._npCoins.reset();
                        // this._settingCoins(value);
                        // this._npCoins.addComplete(this._needClearCoin, this);
                        this._npCoins.play();
                    }
                }
            }
        }
    }

    _settingCoins(value) {
        if (this._isHaveCoins) {
            this._coins.particle.settings.duration = AppG.incTimeTake;
            let newSetting = this.getCoinsConfig(value);
            this._coins.particle.settings.gravity = newSetting.gravity;
            this._coins.particle.settings.spawnFrequencyMin = newSetting.spawnFrequency;
            this._coins.particle.settings.spawnFrequencyMax = newSetting.spawnFrequency;
        }
    }

    getCoinsConfig(win) {
        const config = AppG.gameConst.getData("coins_conf");

        win = win / AppG.serverWork.betForLimit;
        let percent = OMY.OMath.toPercent(win, config.total);
        percent = ((percent > 100) ? 100 : percent);
        const result = {};
        let value, partData;
        for (let configKey in config.data) {
            partData = config.data[configKey];
            if (partData.min < partData.max)
                value = ((percent * (partData.max - partData.min) / 100) + partData.min);
            else
                value = (partData.min - (percent * (partData.min - partData.max) / 100));
            result[configKey] = value;
        }
        // console.error("AppG ==> getTimeByWinValue: " + "", time);
        return result;
    }

    _needClearCoin() {
        this._isHaveCoins && this._coins.kill();
        this._isHaveNPCoins && this._npCoins.playing() && this._npCoins.pauseGenerators();
    }

    _stopWinParticles() {
        if (this._coins.active) this._coins.stop(true);
    }

    /**     * @private     */
    _stopWinNPParticles() {
        this._npCoins.playing() && this._npCoins.pauseGenerators();
    }

    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _onFinishIncWin() {
        this._coins?.stop();
    }

    _freeGameBegin() {
    }

    _freeGameEnd() {
    }

    /**     * @public     */
    sendSpin() {
    }

    /**     * @private     */
    _onEndSpin() {
        if (!AppG.isRespin)
            this._txtWin.setNumbers(0);
    }

    /**     * @private     */
    _onCreateWindow(window) {
    }

    _onRemoveWindow(window) {
    }

    _hideGUI() {
    }

    _showGUI() {
    }

    _getLocText(stringKey) {
        return OMY.Omy.loc.getText(stringKey);
    }

    /**
     * Full code flow for clock
     * @private
     */
    _clock() {
        this._txtLocalTime = this.getChildByName("t_clock");
        this._updateTime();
    }

    /**     * @private
     * Update time
     * */
    _updateTime() {
        const date = new Date();
        this._txtLocalTime.text = this._formatTime(date);
        this._clockTimer?.destroy();
        let time = 60 - date.getSeconds();
        if (time > 0)
            this._clockTimer = OMY.Omy.add.timer(time, this._updateTime, this);
        else
            this._clockTimer = OMY.Omy.add.timer(2, this._updateTime, this);
    }

    /**
     * Format new Date() to hh:mm
     * @param {Date} localIsoDate
     * @return {string}
     */
    _formatTime(localIsoDate) {
        const z = (n) => {
            return (n < 10 ? "0" : "") + n;
        };
        const hh = localIsoDate.getHours();
        const mm = localIsoDate.getMinutes();
        return z(hh) + ":" + z(mm);
    }

    getWindowLayer(layerName = null) {
        if (layerName)
            return this.getChildByName(layerName);
        else
            return this._windowsLayer;
    }
}
