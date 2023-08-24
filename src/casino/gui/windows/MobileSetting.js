import {WindowsBase} from "../WindowsBase";
import {FullScreenAndroid} from "./mobileSetting/FullScreenAndroid";

export class MobileSetting extends WindowsBase {
    constructor() {
        super();

        this.C_SOUND = 0;

        this._firstInit = false;

        this.C_MOBILE = 1;
        this.C_SAFARI = 2;
        this.C_IOS_CHROME = 3;
        this.isRotateMissing = false;
        this._state = 0;
        this._firstShow = false;

        if (!PIXI.utils.isMobile.apple.device) {
            this._state = this.C_MOBILE;
        } else if ((OMY.Omy.browser.mobileSafari || OMY.Omy.browser.safari) && !OMY.Omy.browser.chrome && !/CriOS/.test(navigator.userAgent)) {
            this._state = this.C_SAFARI;
        } else {
            this._state = this.C_IOS_CHROME;
        }
        switch (this._state) {
            case this.C_SAFARI: {
                // this._fullScreenCheck = new FullScreenIOS(this._onCompleteHandler.bind(this));
                break;
            }
            case this.C_IOS_CHROME: {
                // OMY.Omy.game.renderer.plugins.interaction.autoPreventDefault = false;
                // this._fullScreenCheck = new FullScreenChrome(this._onCompleteHandler.bind(this));
                break;
            }

            default: {
                this._fullScreenCheck = new FullScreenAndroid(this._onCompleteHandler.bind(this));
                break;
            }
        }
        if (this._fullScreenCheck)
            this._fullScreenCheck.kill();

        this.revive();
    }

    revive(onComplete = null) {
        OMY.Omy.stage.addChild(this);
        super.revive(onComplete);
    }

    _onRevive() {
        super._onRevive();

        if (this._fullScreenCheck && (!OMY.Omy.scaleManager.isFullScreen || this._state === this.C_IOS_CHROME)) {
            this._showfullScreen();
        } else {
            this._onCompleteHandler();
        }

        if (!this._firstShow) {
            this._firstShow = true;

            if (this._fullScreenCheck)
                OMY.Omy.scaleManager.addFullChange(this._isFullChange, this);
        }
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
        OMY.Omy.stage.removeChild(this);
    }

    /**     * @private     */
    _isFullChange() {
        if (!OMY.Omy.scaleManager.isFullScreen && !this.active) {
            this.revive();
        }
    }

    _showfullScreen() {
        this.addChild(this._fullScreenCheck);
        this._fullScreenCheck.revive();
        this._fullScreenCheck.init();
    }

    _onCompleteHandler() {
        if (this._fullScreenCheck && this._fullScreenCheck.parent) {
            this.removeChild(this._fullScreenCheck);
            this._fullScreenCheck.kill();
        }

        if (!this._firstInit) {
            this._firstInit = true;
            // OMY.Omy.viewManager.showWindow(AppConst.W_SOUND);
        }
        this.kill();
    }
}