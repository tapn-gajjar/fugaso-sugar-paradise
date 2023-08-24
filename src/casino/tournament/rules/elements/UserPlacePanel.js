import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";

export default class UserPlacePanel {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._editMode = this._graphic.json.editMode;

        /** @type {OMY.OTextFont} */
        this._tUser = this._graphic.getChildByName("t_name");
        /** @type {OMY.OTextBitmap} */
        this._tPoints = this._graphic.getChildByName("t_points");
        /** @type {OMY.OTextBitmap} */
        this._tPlace = this._graphic.getChildByName("t_place");
        if (this._editMode) return;
        this._checkUserNameLength();
        this.updateData();
        if (!OMY.Omy.isDesktop) AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._checkUserNameLength, this);
    }

    _checkUserNameLength() {
        let name = AppG.serverWork.userName;
        this._maxLength = ((AppG.isScreenPortrait) ? this._tUser.json.v_maxLength : this._tUser.json.maxLength) ?? 10;
        if (name.length > this._maxLength) {
            let countSymbol = this._maxLength - 3;
            countSymbol = Math.floor(countSymbol / 2);
            name = name.slice(0, countSymbol) + "..." + name.slice(name.length - countSymbol);
        }
        this._tUser.text = name;
    }

    updateData() {
        this._tPoints.text = String(AppG.tournament.userBalance);
        this._tPlace.text = String((AppG.tournament.userPlace > 0) ? AppG.tournament.userPlace : "-");
    }

    destroy() {
        if (!OMY.Omy.isDesktop) AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._checkUserNameLength, this);
        this._graphic = null;
        this._gdConf = null;
        this._tUser = null;
        this._tPoints = null;
        this._tPlace = null;
    }
}
