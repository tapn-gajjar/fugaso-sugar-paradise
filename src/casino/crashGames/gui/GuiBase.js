import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {CrashConst} from "../CrashConst";
import WinPopup from "../../../app/display/win/WinPopup";

export class GuiBase extends OMY.OContainer {
    constructor() {
        super();

        this._winValue = 0;
        this._totalWin = 0;

        this._createGraphic();

        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.updateBet, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_CREDIT, this.updateBalance, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_WIN, this.updateWin, this);

        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this.sendSpin, this);

        OMY.Omy.viewManager.addCreateWindow(this._onCreateWindow, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onRemoveWindow, this);

        AppG.emit.on(AppConst.APP_SHOW_WIN, this._updateOnWin, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        AppG.emit.on(CrashConst.G_START_RECONNECT, this._reConnectStart, this);
        AppG.emit.on(CrashConst.G_END_RECONNECT, this._reConnectEnd, this);
    }

    _updateGameSize() {
        AppG.updateGameSize(this);
        this._connectCanvas?.bg && this._updateSizeConnect();
    }

    _createGraphic() {
        if (this.getChildByName("t_clock")) {
            OMY.Omy.game.addGameActive(this._updateTime, this, false);
            this._clock();
        }
        if (this.getChildByName("t_round_id")) AppG.createTxtRound(this.getChildByName("t_round_id"));
        if (!AppG.playingForFun) this.removeChild(this.getChildByName("t_play_for_fun"));
        if (this.getChildByName("c_win_popup"))
            /** @type {WinPopup} */
            this._winPopup = new WinPopup(this.getChildByName("c_win_popup"));

        this._windowsLayer = this.getChildByName("c_windows_layer");
    }

    _createButtons() {
    }

    _createTexts() {
        /** @type {OMY.OTextNumberBitmap} */
        this._txtBalance = this.getChildByName("t_credit");
        this._txtBalance.lastText = AppG.currency;
        this._txtBalance.showCent = true;

        /** @type {OMY.OTextNumberBitmap} */
        this._txtBet = this.getChildByName("t_bet");
        this._txtBet.lastText = AppG.currency;
        this._txtBet.showCent = true;

        /** @type {OMY.OTextNumberBitmap} */
        this._txtWin = this.getChildByName("t_win");
        this._txtWin.lastText = AppG.currency;
        this._txtWin.showCent = true;
        // this._txtWin.onCompleteInc = this._onFinishIncWin.bind(this);
        this._txtWin.setNumbers(0);
    }

    updateWin(winValue) {
        this._txtWin.setNumbers(winValue);
    }

    updateBalance() {
        this._txtBalance.visible = !isNaN(AppG.serverWork.playerBalance);
        this._txtBalance.setNumbers(AppG.serverWork.playerBalance);
    }

    updateBet() {
        this._txtBet.setNumbers(AppG.serverWork.totalBet);
    }

    _updateOnWin(value, skip = false) {
        if (AppG.winCredit !== 0) {
            if (skip) {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_take_end)) OMY.Omy.sound.play(GameConstStatic.S_take_end);
                this._txtWin.stopInctAnimation();
                this._txtWin.setNumbers(value, false);
            } else {
                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(value, true);
            }
        }
    }

    /**     * @public     */
    sendSpin() {
        if (!AppG.isRespin) this._txtWin.setNumbers(0);
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

    /**     * @private     */
    _reConnectStart() {
        if (this._connectCanvas) return;
        this._connectCanvas = OMY.Omy.add.containerJson(this.getWindowLayer("c_inet_layer"),
            AppG.gameConst.getData("loc_graphic"));
        this._connectCanvas.input = true;
        this._connectCanvas.bg = this._connectCanvas.getChildByName("r_bg");
        this._updateSizeConnect();
    }

    /**     * @private     */
    _updateSizeConnect() {
        this._connectCanvas.bg.x = -OMY.Omy.WIDTH * .5;
        this._connectCanvas.bg.y = -OMY.Omy.HEIGHT * .5;
        this._connectCanvas.bg.width = OMY.Omy.WIDTH;
        this._connectCanvas.bg.height = OMY.Omy.HEIGHT;
    }

    /**     * @private     */
    _reConnectEnd() {
        this._connectCanvas.destroy();
        this._connectCanvas = null;
    }

    getWindowLayer(layerName = null) {
        if (layerName) return this.getChildByName(layerName); else return this._windowsLayer;
    }
}
