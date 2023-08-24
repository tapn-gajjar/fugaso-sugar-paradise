import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnStartFree extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_START_FREE_GAME,
        );

        this._onCanStartFree = false;
        AppG.emit.on(AppConst.EMIT_CAN_START_FREE, () => {
            this._onCanStartFree = true;
            this.onActive();
        }, this);
        this.updateState(this._btnManager.state);
    }

    onHide() {
        OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this.onKeyHandler, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        super.onHide();
    }

    onBlock() {
        OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this.onKeyHandler, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        super.onBlock();
    }

    onActive() {
        if(!this._onCanStartFree){
            this.onBlock();
            return;
        }
        OMY.Omy.keys.registerFunction(OMY.Key.ENTER, this.onKeyHandler, this);
        OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        super.onActive();
    }

    onDoAction() {
        this._onCanStartFree = false;
        OMY.Omy.sound.play(GameConstStatic.S_btn_reveal);
        if (OMY.Omy.viewManager.getView(AppConst.W_FREE_GAME_BEGIN).isOpen) {
            OMY.Omy.viewManager.getView(AppConst.W_FREE_GAME_BEGIN)._hideWindow();
        } else if (OMY.Omy.viewManager.getView(AppConst.W_FREE_IN_FREE).isOpen) {
            OMY.Omy.viewManager.getView(AppConst.W_FREE_IN_FREE)._hideWindow();
        }
    }
}
