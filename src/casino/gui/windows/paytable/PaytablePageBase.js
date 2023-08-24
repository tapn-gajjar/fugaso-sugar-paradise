import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";

export class PaytablePageBase extends OMY.OContainer {
    constructor(gd) {
        super();

        this.json = this._gdConf = gd;
        this._checkBetOnPaytable = AppG.gameConst.getData("checkBetOnPaytable");
        this._paytableDenomination = AppG.gameConst.paytableDenomination;

        this._textList = [];
        this._paytable = AppG.serverWork.paytable;

        OMY.Omy.add.createEntities(this, gd);
        this.setXY(gd.x || 0, gd.y || 0);
        this._createTexts();
        for (let i = 0; i < this.numChildren; i++) {
            if(this.children[i].json["texts_1"])
                this._createTexts(this.children[i], this.children[i].json);
        }
        /** @type {OMY.OTextBitmap} */
        this._tRtp = this.getChildByName("t_rtp");

        if (this.getChildByName("c_lines_render"))
            this._renderLines(this.getChildByName("c_lines_render"));

        if (!AppG.isHaveJackpot) {
            this._checkForJpElements(this);
        }

        if (this._gdConf.cacheAsBitmap) {
            this.cacheAsBitmap = true;
        }
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this._updateBet, this);
        this._updateData();
    }

    /**     * @private     */
    _checkForJpElements(container) {
        if (!container.children) return;
        let child;
        for (let i = 0; i < container.children.length; i++) {
            child = container.getChildAt(i);
            if (child?.json) {
                if (child.json.hasOwnProperty("isJackpot") && child.json["isJackpot"])
                    child.visible = false;
            }
            this._checkForJpElements(child);
        }
    }

    revive() {
        super.revive();
        if (this._tRtp) {
            const rptLocString = OMY.Omy.loc.getText("paytable_rtp_2");
            let rtpPercent = "paytable_rtp_3";
            switch (AppG.country) {
                case "de": {
                    rtpPercent = "paytable_rtp_5_de";
                    break;
                }
            }
            let rtpString = OMY.StringUtils.sprintf(rptLocString,
                (AppG.isHaveJackpot) ? OMY.Omy.loc.getText("paytable_rtp_4") : OMY.Omy.loc.getText(rtpPercent));
            this._tRtp.text = rtpString;
        }
    }

    _updateBet() {
        this._updateData();
    }

    destroy(apt) {
        AppG.emit.removeListener(AppConst.APP_EMIT_ON_BET, this._updateBet, this);
        this._gdConf = null;
        this._textList = null;
        this._paytable = null;
        this._tRtp = null;
        super.destroy(apt);
    }

    _createTexts(parent = null, json = null) {
        parent = parent || this;
        json = json || this._gdConf;
        let i = 0;
        while (json["t_copy_" + String(++i)]) {
            this._textSizing(parent, json["texts_" + String(i)], json["t_copy_" + String(i)]);
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
            index = 0, lineConfig = AppG.serverWork.lines, x, y, line, bg, point, text,
            pointX = json["point_x"], pointY = json["point_y"];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (index >= lineConfig.length) return;
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
            canvas.destroy();
        }
    }
}
