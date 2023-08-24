import {InfoLineBase} from "./InfoLineBase";

export class InfoLineV extends InfoLineBase {
    /**
     * @param {OMY.OContainer} container
     */
    constructor(container) {
        super(container);
    }

    _create() {
        super._create();

        /** @type {OMY.OSprite} */
        this._panel = this._graphic.getChildByName("s_panel_win");
    }

    _clear() {
        super._clear();
        if (this._editMode) return;
        this._panel.kill();
    }

    _onStartIncWin(winValue, icnTime) {
        super._onStartIncWin(winValue, icnTime);
        this._panel.revive();
    }
}
