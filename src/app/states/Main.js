import {MainBase} from "../../casino/states/MainBase";
import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";

export class Main extends MainBase {
    constructor() {
        super();

        this._locateGraphic = OMY.Omy.add.containerJson(null, AppG.gameConst.getData("loc_graphic"));
        this._locateGraphic.input = true;
        this._locateGraphic.bg = this._locateGraphic.getChildByName("r_bg");
        this._locateGraphic.logo = this._locateGraphic.getChildByName("s_game_logo_small");
        OMY.Omy.loc.addGraphic(this._locateGraphic);
        OMY.Omy.loc.addTintWorkCallback(this._onChangeLocate, this);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    /**     * @private     */
    _onChangeLocate(state) {
        this._onShowLocate = state;
        this._updateGameSize(AppG.dx, AppG.dy, AppG.isScreenPortrait);
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        if (!this._onShowLocate) return;
        this._locateGraphic.x = OMY.Omy.WIDTH * .5;
        this._locateGraphic.y = OMY.Omy.HEIGHT * .5;
        if (this._locateGraphic.logo) {
            this._locateGraphic.logo.scale.set((isScreenPortrait) ? this._locateGraphic.logo.json["v_scale"] :
                this._locateGraphic.logo.json["scale"] || 1);
        }
        if (this._locateGraphic.bg) {
            this._locateGraphic.bg.x = -this._locateGraphic.x;
            this._locateGraphic.bg.y = -this._locateGraphic.y;
            this._locateGraphic.bg.width = OMY.Omy.WIDTH;
            this._locateGraphic.bg.height = OMY.Omy.HEIGHT;
        }
    }
}