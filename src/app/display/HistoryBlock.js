import {HistoryBlockBase} from "../../casino/display/gui/HistoryBlockBase";
import {AppG} from "../../casino/AppG";

export class HistoryBlock extends HistoryBlockBase {
    constructor(soundBtn = null) {
        super(soundBtn);
    }

    /**
     * Draw win symbols at history view block
     * @param {HistoryActionData} data
     */
    _drawSymbols(data) {
        let stopList = data.stopList;
        if (!stopList || !stopList.length) {
            return;
        }

        let category = data.category;
        // let serverData = data.rawData;
        let totalReel = AppG.totalReel;
        let countSlot = AppG.gameConst.countSlot;
        let dx = this._gdConf["symbol_dx"];
        let dy = this._gdConf["symbol_dy"];
        let reels = AppG.serverWork.getReelsByCategory(category);

        for (let i = 0; i < totalReel; i++) {
            let reel = reels[i];
            let stopIndex = stopList[i];
            for (let j = 0; j < countSlot; j++) {
                let symbolKey = reel.charAtExt(stopIndex + j);
                /*if (serverData.special?.feature === "W" && i === 1 && j === 1)
                    symbolKey = "H";*/
                let symbolIndex = AppG.gameConst.symbolID(symbolKey);
                /** @type {OMY.OSprite} */
                let symbol = OMY.Omy.add.spriteJson(this._view.canvas, this._gdConf["symbol"]);
                symbol.texture = this._gdConf["texture"] + String(symbolIndex);
                symbol.updateTransform();
                symbol.x = i * (symbol.width + dx);
                symbol.y = j * (symbol.height + dy);
                symbol.name = "s_" + String(i) + "_" + String(j);
                symbol.userData = symbolKey;
            }
        }
        this._view.alignContainer();
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------
}
