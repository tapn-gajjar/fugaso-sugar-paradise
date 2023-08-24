import {WindowsBase} from "../../casino/gui/WindowsBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";
import {HistoryBlock} from "../display/HistoryBlock";

export class HistoryWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_HISTORY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDHistory");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (!AppG.playingForFun) {
            /** @type {HistoryBlock} */
            this._dataBlock = new HistoryBlock(GameConstStatic.S_btn_any);
            this._dataBlock.kill();
        }

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.navigateBtn.blockingScreen();

        this._tint = this.addChild(OMY.Omy.add.tint(((this._gdConf.hasOwnProperty("tintAlpha")) ? this._gdConf["tintAlpha"] : 0.1),
            (this._gdConf.hasOwnProperty("tintColor")) ? this._gdConf["tintColor"] : 0xffffff));
        this._tint.input = true;

        OMY.Omy.add.createEntities(this, this._gdConf);
        if (!AppG.playingForFun) this.getChildByName("t_free2play").destroy();
        this.getChildByName("b_close").externalMethod(this._onClose.bind(this));

        if (this._dataBlock) {
            this._dataBlock.revive();
            this.getChildByName("c_history_block").addChild(this._dataBlock);
        }

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        OMY.Omy.navigateBtn.unBlockingScreen();

        this._isGraphic = false;
        if (this._dataBlock) {
            this.getChildByName("c_history_block").removeChild(this._dataBlock);
            this._dataBlock.kill();
        }

        if (this._tint)
            this._tint = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
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
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = false;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = true;
        }
    }
}
