import {AppG} from "../../../AppG";
import {MenuPageBase} from "./MenuPageBase";
import {AppConst} from "../../../AppConst";

export class GameinfoPageBase extends MenuPageBase {
    constructor(source) {
        super(source);
        this._checkBetOnPaytable = AppG.gameConst.getData("checkBetOnPaytable");
        this._paytableDenomination = AppG.gameConst.paytableDenomination;
        this._textList = [];
        this._paytable = AppG.serverWork.paytable;
        this._createTexts();
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this._updateData, this);
        this._updateData();
    }

    _onCheckGraphic() {
        super._onCheckGraphic();
    }

    /**
     * @param {OMY.OContainer}parent
     */
    _createTexts(parent) {
        parent = parent || this._cPageContent;
        let child;
        for (let j = 0; j < parent.numChildren; j++) {
            child = parent.children[j];
            if (child.json["t_copy_1"]) {
                let i = 0;
                while (child.json["t_copy_" + String(++i)]) {
                    this._textSizing(child, child.json["texts_" + String(i)], child.json["t_copy_" + String(i)]);
                }
            }
            if (child.json["havePayData"]) this._createTexts(child);
        }
    }

    _textSizing(bufEntity, data, copy) {
        for (let str in data) {
            copy = Object.assign(OMY.OMath.jsonCopy(copy), OMY.OMath.jsonCopy(data[str]));
            copy.name = str;

            /** @type {OMY.OTextNumberFont} */
            let text = OMY.Omy.add.textJson(bufEntity, copy);
            text.userData = str;
            this._textList.push(text);

            text.setNumbers(1000);
        }
    }

    _updateData() {
        for (let i = 0, n = this._textList.length; i < n; i++) {
            /** @type {OMY.OTextNumberFont} */
            let text = this._textList[i];
            let payKey = text.userData;
            let payData = this._paytable.getPayTableData(payKey);
            let multy;
            if (!payData) {
                OMY.Omy.warn("Not found pay data:", payKey);
                continue;
            }
            if (AppG.isGameDrop || this._paytableDenomination) {
                text.showCent = true;
                text.setNumbers(OMY.OMath.roundNumber(payData.cash / AppG.serverWork.currDenom, 100));
            } else if (!this._checkBetOnPaytable) {
                text.simpleZero = true;
                text.setNumbers(OMY.OMath.roundNumber(payData.cash, 100));
            } else {
                multy = (payData.isScatter) ? AppG.serverWork.currLines : 1;
                text.setNumbers(OMY.OMath.roundNumber(multy * AppG.serverWork.currBet * payData.cash, 100));
            }
        }
    }

    /**
     * @param {OMY.OContainer}canvas
     */
    _renderLines(canvas) {
        const json = canvas.json;
        let col = json["colum"], row = json["row"], stepX = json["step_x"], stepY = json["step_y"],
            index = (json.hasOwnProperty("lines_number")) ? json["lines_number"][0] : 0,
            lineConfig = AppG.serverWork.lines, x, y, line, bg, point, text,
            pointX = json["point_x"], pointY = json["point_y"];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (json["lines_number"] && index > json["lines_number"][1]) continue;
                if (index >= lineConfig.length) continue;
                x = j * stepX;
                y = i * stepY;
                line = lineConfig[index];
                index++;
                bg = OMY.Omy.add.spriteJson(canvas, json["bg"]);
                bg.name += String(index);
                bg.x += x;
                bg.y += y;
                text = OMY.Omy.add.textJson(canvas, json["t_number"]);
                text.name += String(index);
                text.text = String(index);
                text.x += x;
                text.y += y;
                for (let k = 0; k < line.length; k++) {
                    point = OMY.Omy.add.spriteJson(canvas, json["active"]);
                    point.name += "_" + String(index) + "_" + String(k);
                    point.x += x + pointX * k;
                    point.y += y + pointY * line[k];
                }
            }
        }

        if (!Boolean(json["edit"])) {
            let sprite = OMY.Omy.add.sprite(canvas.parent, canvas.x, canvas.y, OMY.Omy.add.generateTextureFrom(canvas, null, null, true));
            sprite.name = canvas.name;
            sprite.json = canvas.json;
            canvas.destroy();
        }
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    updateGameSize() {
        super.updateGameSize();
    }

    destroy() {
        AppG.emit.removeListener(AppConst.APP_EMIT_ON_BET, this._updateData, this);
        this._textList = null;
        this._paytable = null;
        super.destroy();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}
