import {WindowsBase} from "../WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {SlotButton} from "../../display/SlotButton";

export class BetWindowBase extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_BET_SETTINGS;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDBet");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);

        if (!OMY.Omy.isDesktop) {
            AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
            this._updateGameSize();
        }
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._bg) {
            this._bg.x = -this.x;
            this._bg.y = -this.y;
            this._bg.width = OMY.Omy.WIDTH;
            this._bg.height = OMY.Omy.HEIGHT;
            this.getChildByName("s_buttom").width = OMY.Omy.WIDTH;
        }
        if (this._btnLayer) {
            let colum = (isScreenPortrait) ? this._countCollumV : this._countCollum;
            const dx = this._btnLayer.json["step_x"];
            const dy = this._btnLayer.json["step_y"];
            for (let i = 0; i < this._btnLayer.children.length; i++) {
                this._btnLayer.children[i].x = i % colum * dx;
                this._btnLayer.children[i].y = Math.floor(i / colum) * dy;
            }
        }

        if (this.getChildByName("s_bar_side2")) {
            this.getChildByName("s_bar_side2").width = this.getChildByName("s_bar_side2").saveW + AppG.dx;
            this.getChildByName("s_bar_side1").width = this.getChildByName("s_bar_side1").saveW + AppG.dx;

            this.getChildByName("s_panel_header").width = OMY.Omy.WIDTH;
            this.getChildByName("s_buttom").width = OMY.Omy.WIDTH;
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);

        if (!AppG.playingForFun) this.removeChild(this.getChildByName("t_play_for_fun"));
        if (this.getChildByName("t_clock")) this._clock();

        this.getChildByName("s_bar_side1").saveW = this.getChildByName("s_bar_side1").width;
        this.getChildByName("s_bar_side2").saveW = this.getChildByName("s_bar_side2").width;

        /** @type {OMY.OSprite} */
        this._bg = this.getChildByName("s_bg");
        this._bg.input = true;

        /** @type {OMY.OContainer} */
        this._btnLayer = this.getChildByName("c_btn_layer");
        this._countBet = AppG.serverWork.possBets.length;
        this._countCollum = this._btnLayer.json["collum"];
        this._countCollumV = this._btnLayer.json["v_collum"];
        this._navigateList = [];
        for (let i = 0; i < this._countBet; i++) {
            /** @type {OMY.OButton} */
            let button = OMY.Omy.add.buttonJson(this._btnLayer, this._btnLayer.json["btn_bet"]);
            button.userData = AppG.serverWork.possBets[i];
            let betValue = button.userData / AppG.creditType;
            if (AppG.isGameDrop || AppG.gameConst.betWithDenomination)
                betValue *= AppG.serverWork.currDenom;
            button.externalMethod(this._onChangeBet.bind(this));
            button.label.lastText = AppG.currency;
            button.label.showCent = true;
            button.label.setNumbers(betValue);
            this._navigateList.push(button);
            if (AppG.serverWork.getBetPos() === i) {
                /** @type {OMY.OButton} */
                this._activeBtn = button;
                button.isBlock = true;
            }

        }

        if (this.getChildByName("c_line")) {
            this.getChildByName("c_line").getChildByName("t_line").canvas.getChildByName("t_value").text = String(AppG.serverWork.currLines);
            this.getChildByName("c_line").getChildByName("t_line").alignContainer();
            this.getChildByName("c_line").getChildByName("t_max").text = String(AppG.serverWork.maxLines);
        }

        this._bClose = new SlotButton(this.getChildByName("b_close"), this._onClose.bind(this));
        this._bClose.alwaysAvailable = true;

        OMY.Omy.navigateBtn.addBlockState(this._onBlockBtn, this);

        this._updateGameSize(AppG.dx, AppG.dy, AppG.isScreenPortrait);
    }

    /** @private */
    _onBlockBtn(value) {
        if (!this._isGraphic) return;
        if (this._bClose) this._bClose.graphic.isBlock = value;
    }

    _onChangeBet(button) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._activeBtn.isBlock = false;
        this._activeBtn = button;
        this._activeBtn.isBlock = true;
        AppG.serverWork.checkBet(AppG.serverWork.possBets.indexOf(button.userData), true);
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
        OMY.Omy.navigateBtn.removeBlockState(this._onBlockBtn, this);
        this._txtLocalTime = null;
        this._isGraphic = false;
        this._btnLayer = null;
        this._activeBtn = null;
        this._navigateList.length = 0;
        this._navigateList = null;
        if (this._bg)
            this._bg = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
        this._isOpen = true;
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
        }
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }

        super._onKill();
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.graphic.isBlock = true;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.graphic.isBlock = false;
        }
    }

    /**
     * Full code flow for clock
     * @private
     */
    _clock() {
        /**
         * Format new Date() to hh:mm
         * @param {Date} localIsoDate
         * @return {string}
         */
        const formatTime = (localIsoDate) => {
            const z = (n) => {
                return (n < 10 ? "0" : "") + n;
            };
            const hh = localIsoDate.getHours();
            const mm = localIsoDate.getMinutes();
            return z(hh) + ":" + z(mm);
        };

        /**
         * Update time
         */
        const updateTime = () => {
            const date = new Date();
            if (this._txtLocalTime) {
                this._txtLocalTime.text = formatTime(date);
                OMY.Omy.add.timer(60 - date.getSeconds(), updateTime, this);
            }
        };

        this._txtLocalTime = this.getChildByName("t_clock");
        updateTime();
    }

    get isOpen() {
        return this._isOpen;
    }
}
