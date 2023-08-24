import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {SlotButton} from "../../SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnStartSkipMobile extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_PLAY,
            AppConst.C_WIN,
            AppConst.C_AUTO_GAME,
            AppConst.C_FREE_GAME,
        );
        this._regNoActiveStates(
        );

        this._ignoreAutoGame = true;
        this.updateState(this._btnManager.state);
        this._delaySkip = AppG.gameConst.getData("delaySkipSpin");
        AppG.emit.on(AppConst.APP_EMIT_SKIP_BLOCK, this.onHide, this);
    }

    onHide() {
        if (this._timer) {
            this._timer.destroy();
            this._timer = null;
        }
        OMY.Omy.mouse.removeDownMouse(this.onDoAction, this);
        if (OMY.Omy.isDesktop) {
            OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this.onKeyHandler, this);
            OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        }
        super.onHide();
    }

    onBlock() {
        if (this._timer) {
            this._timer.destroy();
            this._timer = null;
        }
        OMY.Omy.mouse.removeDownMouse(this.onDoAction, this);
        if (OMY.Omy.isDesktop) {
            OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this.onKeyHandler, this);
            OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        }
        super.onBlock();
    }

    onActive() {
        if (AppG.isGameDrop) {
            if ((AppG.isTurbo || AppG.isPLayReSpins) && this._btnGameState === AppConst.C_PLAY) {
                this.onHide();
                return;
            }
        }
        if (AppG.isSuperTurbo) {
            this.onBlock();
            return;
        }
        this._timer?.destroy();
        let timeDelaySkip = this._delaySkip;
        switch (this._btnGameState) {
            case AppConst.C_WIN: {
                timeDelaySkip = this._delaySkipWin;
                break;
            }
        }
        this._timer = OMY.Omy.add.timer(timeDelaySkip, this.canSkipPlay, this);

        OMY.Omy.mouse.addDownMouse(this.onDoAction, this);
        if (OMY.Omy.isDesktop) {
            OMY.Omy.keys.registerFunction(OMY.Key.ENTER, this.onKeyHandler, this);
            // OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        }
        OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        this._onSkipped = false;

        super.onActive();
    }

    canSkipPlay() {
        this._timer = null;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) {
            return;
        }
        if (this._onSkipped)
            this._onDoSkip();
    }

    onDoAction() {
        this._graphic.isBlock = true;
        if (this._onSkipped) return;
        this._onSkipped = true;
        this._onDoSkip();
    }

    /**     * @private     */
    _onDoSkip() {
        if (this._timer) return;
        switch (this._btnGameState) {
            case AppConst.C_WIN: {
                OMY.Omy.info('btn skip. skip win');
                AppG.skippedWin = true;
                AppG.emit.emit(AppConst.APP_EMIT_SKIP_WIN);
                break;
            }

            default: {
                OMY.Omy.sound.play(GameConstStatic.S_quickStop);
                OMY.Omy.viewManager.getView(AppConst.P_VIEW_MAIN).skipSpin();
                break;
            }
        }
    }
}
