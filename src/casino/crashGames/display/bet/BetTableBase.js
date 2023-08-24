import {TableBase} from "../TableBase";
import {AppG} from "../../../AppG";
import {CrashConst} from "../../CrashConst";
import {BetElement} from "./BetElement";

export class BetTableBase extends TableBase {
    constructor(graphic) {
        super(graphic);
    }

    _createGraphic() {
        this._tableType = CrashConst.T_BET;
        /** @type {PIXI.utils.EventEmitter} */
        this._emit = new OMY.OmyConst.Emit();
        this._emit.on("update_element_size", this._onOpenMoreInfo, this);
        this._newElements = false;
        this._countActive = 0;
        super._createGraphic();
    }

    _createElements() {
        if (!super._createElements()) return false;
        /** @type {Array.<BetElement>} */
        this._elements = [];
        for (let i = 0; i < this._cPageContent.numChildren; i++) {
            this._elements.push(new BetElement(this._cPageContent.children[i], this._emit, this._isEditMode));
        }
        this._activeDataList = null;
        AppG.emit.on(CrashConst.EMIT_ON_BETS_UPDATE, this._onBetsUpdate, this);
        /** @type {OMY.OTextFont} */
        this._tWinLabel = this._graphic.getChildByName("t_win_label");
    }

    /**     * @private     */
    _updateBetsData() {
        if (this._isEditMode || !this._graphic.active) return;
        let activeWinField = false;
        let _haveMoreInfo = false;
        let _haveWinInfo = false;
        switch (this._listId) {
            case this.ID_ALL_BETS: {
                activeWinField = true;
                this._activeDataList = AppG.serverWork.bets;
                break;
            }
            case this.ID_USER_BETS: {
                _haveMoreInfo = true;
                this._activeDataList = AppG.serverWork.userBetsData;
                break;
            }
            case this.ID_TOP_BETS: {
                _haveMoreInfo = true;
                _haveWinInfo = true;
                this._activeDataList = AppG.serverWork.betsTopData;
                break;
            }
        }
        this._tWinLabel.x = (_haveMoreInfo) ? this._tWinLabel.json["user_x"] : this._tWinLabel.json.x;
        const m = this._activeDataList.length;
        /** @type {OMY.OContainer} */
        let element;
        for (let i = 0; i < m; i++) {
            if (i >= this._cPageContent.numChildren) {
                element = OMY.Omy.add.containerJson(this._cPageContent, this._elJson);
                element.y = i * this._gdConf["step"];
                element.name += String(i);
                this._elements.push(new BetElement(element, this._emit));
            }
            this._elements[i].updateData(this._activeDataList[m - 1 - i], activeWinField, _haveMoreInfo, _haveWinInfo);
        }
        if (this._elements.length > this._activeDataList.length) {
            for (let i = this._activeDataList.length; i < this._elements.length; i++) {
                this._elements[i].clear();
            }
        }
        let activeEl = 0;
        for (let i = 0; i < this._cPageContent.numChildren; i++) {
            if (this._cPageContent.children[i].visible) activeEl++
        }
        if (activeEl !== this._countActive) {
            this._countActive = activeEl;
            this._newElements = true;
        }
    }

    /**     * @private     */
    _onBetsUpdate(force = false) {
        this._updateBetsData();
        if (this._newElements || force) {
            this._newElements = false;
            this._windowSizeUpdate();
        }
    }

    _onFilterOpen(btnId) {
        super._onFilterOpen(btnId);
    }

    _openList(listId) {
        super._openList(listId);
        this._listId = listId;
        this._emit.emit("open_new");
        BetElement.openList.length = 0;
        this._onBetsUpdate(true);
    }

    _windowSizeUpdate() {
        this._updateSizeElements();
        super._windowSizeUpdate();
    }

    /**     * @private     */
    _updateSizeElements() {
        let stepY = 0;
        for (let i = 0; i < this._cPageContent.numChildren; i++) {
            /** @type {OMY.OContainer} */
            let element = this._cPageContent.children[i];
            element.y = stepY;
            stepY += element.height + this._gdConf["step"];
        }
    }

    /**     * @private     */
    _onOpenMoreInfo() {
        this._windowSizeUpdate();
    }

    destroy() {
        this._emit.off("update_element_size", this._onOpenMoreInfo, this);
        this._emit.removeAllListeners("open_new");
        this._emit.removeAllListeners("force_close");
        this._emit = null;
        for (let i = 0; i < this._elements.length; i++) {
            this._elements[i].destroy();
        }
        this._elements.length = 0;
        this._elements = null;
        this._activeDataList = null;
        AppG.emit.off(CrashConst.EMIT_ON_BETS_UPDATE, this._onBetsUpdate, this);
        this._tWinLabel = null;
        BetElement.openList.length = 0;

        super.destroy();
    }

    get ID_ALL_BETS() {
        return 0;
    }

    get ID_USER_BETS() {
        return 1;
    }

    get ID_TOP_BETS() {
        return 2;
    }
}
