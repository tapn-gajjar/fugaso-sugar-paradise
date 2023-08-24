import TabBase from "./TabBase";
import UserElement from "../elements/UserElement";
import {AppG} from "../../../AppG";
import UserPlacePanel from "../elements/UserPlacePanel";

export default class LeadersTab extends TabBase {
    constructor(conf) {
        super(conf);
    }

    _createGraphic() {
        super._createGraphic();
        this._isEditMode = Boolean(this._gdConf["debug_count"]);
        this._createElements();
        if (this.getChildByName("c_user_place")) {
            /** @type {UserPlacePanel} */
            this._userPlacePanel = new UserPlacePanel(this.getChildByName("c_user_place"));
            this._userPlacePanel.updateData();
        }
    }

    /**     * @private     */
    _createElements() {
        const countMax = this._gdConf["countMax"];
        const players = AppG.tournament.places
        /** @type {OMY.OContainer} */
        let element;
        this._elJson = this._gdConf["element"];
        let max = ((this._isEditMode) ? this._gdConf["debug_count"] : players.length);
        /** @type {Array.<UserElement>} */
        this._elements = [];
        for (let i = 0; i < max; i++) {
            element = OMY.Omy.add.containerJson(this._cContent, this._elJson);
            element.name += String(i);
            this._elements.push(new UserElement(element, players[i], i + 1, this._isEditMode));
            if (i + 1 >= countMax)
                break;
        }
    }

    _formatContent() {
        for (let i = 1; i < this._cContent.numChildren; i++) {
            if (i > 1)
                this._cContent.children[i].y = this._cContent.children[i - 1].y + this._gdConf["step"];
        }
        super._formatContent();
    }

    destroy(options) {
        for (let i = 0; i < this._elements.length; i++) {
            this._elements[i].destroy();
        }
        this._elements.length = 0;
        this._elements = null;
        this._elJson = null;
        this._userPlacePanel?.destroy();
        this._userPlacePanel = null;
        super.destroy(options);
    }
}