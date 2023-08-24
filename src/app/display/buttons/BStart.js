import {BtnStart} from "../../../casino/display/buttons/BtnStart";
import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";

export class BStart extends BtnStart {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);
    }

    onDoAction() {
        /*if (AppG.isFreeGame)
            OMY.Omy.sound.play(GameConstStatic.S_btn_free_reveal);
        else*/
            OMY.Omy.sound.play(GameConstStatic.S_btn_reveal);
        AppG.serverWork.sendSpin();
    }
}
