import {AppG} from "../../../AppG";
import {MenuPageBase} from "./MenuPageBase";
import {HistoryBlock} from "../../../../app/display/HistoryBlock";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class HistoryPageBase extends MenuPageBase {
    constructor(source) {
        super(source);

        if (!AppG.playingForFun && !HistoryPageBase.dataBlock) {
            /** @type {HistoryBlock} */
            HistoryPageBase.dataBlock = new HistoryBlock(GameConstStatic.S_btn_any);
            HistoryPageBase.dataBlock.kill();
        }
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    updateGameSize() {
        super.updateGameSize();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _onCheckGraphic() {
        super._onCheckGraphic();
        if (!AppG.playingForFun) this._source.getChildByName("t_free2play").destroy();
    }

    onShow() {
        if (HistoryPageBase.dataBlock) {
            if (HistoryPageBase.dataBlock.active) HistoryPageBase.dataBlock.kill();
            HistoryPageBase.dataBlock.revive();
            this._cPageContent.getChildByName("c_history_block").addChild(HistoryPageBase.dataBlock);
        }
        super.onShow();
    }

    destroy() {
        if (HistoryPageBase.dataBlock && HistoryPageBase.dataBlock.active) {
            HistoryPageBase.dataBlock.kill();
            this._cPageContent.getChildByName("c_history_block").removeChild(HistoryPageBase.dataBlock);
        }
        super.destroy();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}

HistoryPageBase.dataBlock = null;
