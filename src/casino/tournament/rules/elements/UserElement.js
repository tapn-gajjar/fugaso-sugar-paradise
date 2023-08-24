import {AppG} from "../../../AppG";
import {TStaticConst} from "../../TStaticConst";

export default class UserElement {
    constructor(graphic, data, place, editMode, cashing = true) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._editMode = editMode;
        this._cashing = cashing;

        /** @type {OMY.OContainer} */
        this._cCache = this._graphic.getChildByName("c_cache") || this._graphic;
        /** @type {OMY.OTextFont} */
        this._tUser = this._cCache.getChildByName("t_name");
        /** @type {OMY.OTextBitmap} */
        this._tPoints = this._cCache.getChildByName("t_points");
        /** @type {OMY.OSprite} */
        this._sPlace = this._cCache.getChildByName("s_place");
        /** @type {OMY.OTextBitmap} */
        this._tPlace = this._sPlace.getChildByName("t_number");
        /** @type {OMY.OSprite} */
        this._sUserActive = this._cCache.getChildByName("s_user");

        this._tPlace.text = String(place);
        this._tPlace.visible = place > 3;
        this._sPlace.texture = (this._sPlace.json["places"][String(place)]) ?
            this._sPlace.json["places"][String(place)] : this._sPlace.json["places"]["-"];
        AppG.emit.on(TStaticConst.ON_SHOW_T_RULES, this._caching, this);

        if (this._editMode) return;
        this._userName = data["name"];
        this._checkUserNameLength(this._userName);
        this._tPoints.text = data["balance"];
        this._sUserActive.visible = this._userName === AppG.serverWork.userName;
    }

    /**     * @private     */
    _caching() {
        if (!this._cashing)  return;
        this._cCache.cacheAsBitmap = false;
        if (!OMY.Omy.isDesktop) this._checkUserNameLength(this._userName);
        this._cCache.cacheAsBitmap = true;
    }

    /**
     * @param {String}name
     * @private
     */
    _checkUserNameLength(name) {
        if (!name) return;
        this._maxLength = ((AppG.isScreenPortrait) ? this._tUser.json.v_maxLength : this._tUser.json.maxLength) ?? 10;
        if (name.length > this._maxLength) {
            let countSymbol = this._maxLength - 3;
            countSymbol = Math.floor(countSymbol / 2);
            name = name.slice(0, countSymbol) + "..." + name.slice(name.length - countSymbol);
        }
        this._tUser.text = name;
    }

    updateData(data) {
        this._userName = data["name"];
        this._checkUserNameLength(this._userName);
        this._tPoints.text = data["balance"];
        this._sUserActive.visible = this._userName === AppG.serverWork.userName;
        if (this._gdConf["user_color"]) {
            if (this._sUserActive.visible) {
                this._tUser.setColor(this._gdConf["user_color"]);
                this._tPoints.setColor(this._gdConf["user_color"]);
                this._graphic.getChildByName("t_tournament_rules_player_4")
                    .setColor(this._gdConf["user_color"]);
            } else {
                this._tUser.setColor(this._tUser.json["fill"]);
                this._tPoints.setColor(this._tPoints.json["fill"]);
                this._graphic.getChildByName("t_tournament_rules_player_4")
                    .setColor(this._graphic.getChildByName("t_tournament_rules_player_4").json["fill"]);
            }
        }
    }

    destroy() {
        AppG.emit.off(TStaticConst.ON_SHOW_T_RULES, this._caching, this);
        this._graphic = null;
        this._cCache = null;
        this._gdConf = null;
        this._sUserActive = null;
        this._tUser = null;
        this._tPoints = null;
        this._sPlace = null;
        this._tPlace = null;
    }

    set visible(value) {
        this._graphic.visible = value;
    }
}
