import {FreeCounterBase} from "../../casino/display/FreeCounterBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";

export class FreeCounter extends FreeCounterBase {
    constructor(graphic) {
        super(graphic);

        /** @type {OMY.OSprite} */
        this._symbolSprite = this._graphic.getChildByName("s_symb");

        OMY.Omy.viewManager.addOpenWindow(AppConst.W_FREE_GAME_BEGIN, this.startFree, this);
        OMY.Omy.viewManager.addOpenWindow(AppConst.W_FREE_GAME_END, this.endFree, this);
        OMY.Omy.loc.addUpdate(this._updateText, this);
    }

    _updateText(countFreeGame) {
        countFreeGame = countFreeGame || AppG.countFreeGame;
        let text = OMY.Omy.loc.getText("free_game_1");
        this._tField.text = OMY.StringUtils.sprintf(text, String(countFreeGame), String(AppG.totalFreeGame));
        /*super._updateText();*/
    }

    /** @public */
    startFree() {
        super.startFree();
        this._symbolSprite.texture = this._symbolSprite.json["textures"][AppG.serverWork.freeBonusSymbol || "G"];
    }

    /** @public */
    endFree() {
        super.endFree();
    }
}
