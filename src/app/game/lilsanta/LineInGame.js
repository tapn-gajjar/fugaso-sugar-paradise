import {LineInGameBase} from "../../../casino/display/LineInGameBase";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {GameLine} from "./particles/GameLine";

export class LineInGame extends LineInGameBase {
    constructor(graphic, activeSymbolList) {
        super(graphic, activeSymbolList);
        this._haveBlockFrame = false;

        this._editMode = this._gdConf.hasOwnProperty("debug_line") && this._gdConf["debug_line"];
        /** @type {OMY.OContainer} */
        this._winLine = ((graphic.getChildByName("s_all")) ? graphic.getChildByName("s_all") : graphic);
        this._winLine.visible = this._editMode;

        this._lineEffectList = [];
        for (let i = 0; i < AppG.serverWork.maxLines; i++) {
            this._lineEffectList.push(new GameLine(graphic.json["line"]));
        }
        this._halfWidth = AppG.gameConst.symbolWidth * .5;
        this._halfHeight = AppG.gameConst.symbolHeight * .5;

        /** @type {OMY.OContainer} */
        this._winValuePanel = graphic.getChildByName("c_win_value");
        if (this._winValuePanel) {
            this._winValuePanel.kill();
            // /** @type {OMY.OSprite} */
            this._winValuePanel.bg = this._winValuePanel.getChildByName("s_win_shadow");
            if (this._winValuePanel.bg)
                this._winValuePanel.bg.saveWidth = this._winValuePanel.bg.width;
            /** @type {OMY.OTextNumberBitmap} */
            this._winValuePanel.text = this._winValuePanel.getChildByName("t_value");
            this._winValuePanel.text.showCent = true;
            AppG.emit.on(AppConst.APP_SHOW_LINE, this._onShowWinValue, this);
        }

        if (this._editMode) OMY.Omy.add.graphicJson(this._winLine, this._gdConf["edit_point"]);
    }

    showWinLineScatter() {
        this.clearNumbers();
        this._showWinValue();
        super.showWinLineScatter();
    }

    showWinAnimation() {
        this._winValue = 0;
        return super.showWinAnimation();
    }

    showWinLine(valueLine, clear = true, animNumber = false, isLoop = true, countSymbolOnLine = 0) {
        this._isLoop = isLoop;
        this._countSymbolOnLine = countSymbolOnLine;
        super.showWinLine(valueLine, clear, false);
    }

    _showLine(lineNum, clear) {
        // super._showLine(lineNum, clear);
        if (!this._winLine.visible) this._winLine.visible = true;

        let line = AppG.serverWork.getLine(lineNum);
        /** @type {Array} */
        let pos;
        let buffer = [];
        for (let i = 0; i < line.length; i++) {
            buffer.push(
                this._winLine.toLocal(this._activeSymbolList[i][line[i]].getGlobalPosition())
            );
        }
        if (this._isLoop || this._countSymbolOnLine === line.length)
            pos = buffer.concat();
        else
            pos = buffer.slice(0, this._countSymbolOnLine);
        if (this._isLoop || this._countSymbolOnLine === line.length) {
            pos.push({x: this._gdConf["end_x"], y: pos[pos.length - 1].y});
        } else {
            let halfHeight = 0;
            let halfWidth = this._halfWidth;
            if (line[pos.length - 1] > line[pos.length]) {
                halfHeight = -1 * this._halfHeight;
                halfWidth = halfWidth / Math.abs(line[pos.length - 1] - line[pos.length]);
            } else if (line[pos.length - 1] < line[pos.length]) {
                halfHeight = this._halfHeight;
                halfWidth = halfWidth / Math.abs(line[pos.length - 1] - line[pos.length]);
            }
            pos.push({x: pos[pos.length - 1].x + halfWidth, y: pos[pos.length - 1].y + halfHeight});
        }
        pos.unshift({x: this._gdConf["start_x"], y: pos[0].y});
        this._winLine.addChild(this._lineEffectList[lineNum].particle);
        this._lineEffectList[lineNum].showLine(pos, (this._isLoop) ? line.length : this._countSymbolOnLine);

        this._showWinValue();
    }

    /**     * @private     */
    _showWinValue() {
        if (this._winValue <= 0) return;
        if (!this._winValuePanel.active) this._winValuePanel.revive();
        this._showPanel = true;
        OMY.Omy.remove.tween(this._winValuePanel);
        OMY.Omy.remove.tween(this._winValuePanel.text.scale);
        this._winValuePanel.alpha = 0;
        this._winValuePanel.text.scale.set(0.7);
        OMY.Omy.add.tween(this._winValuePanel, {alpha: 1}, this._winValuePanel.json["tween_time"]);
        OMY.Omy.add.tween(this._winValuePanel.text.scale,
            {x: 1.0, y: 1.0},
            this._winValuePanel.json["tween_time"], this._tweenWilValue.bind(this));
    }

    /**     * @private     */
    _tweenWilValue() {
        if (!this._showPanel) return;
        OMY.Omy.add.tween(this._winValuePanel.text.scale,
            {x: 1.05, y: 1.05, yoyo: true, repeat: 1},
            this._winValuePanel.json["tween_scale_time"]);
    }

    _clearLines() {
        // super._clearLines();
    }

    /**     * @private     */
    _onShowWinValue(lineNumber, symbols, credit, allowArray) {
        this._winValue = credit;
        if (this._winValue <= 0) return;
        this._winValuePanel.text.setNumbers(OMY.OMath.roundNumber(credit, 100));
        if (this._winValuePanel.bg)
            this._winValuePanel.bg.width = this._winValuePanel.text.width + 20;
        const countWinSymbols = allowArray[0].countSymbol;
        let symbol;
        if (countWinSymbols <= 3) symbol = allowArray[1];
        else symbol = allowArray[2];
        symbol = this._activeSymbolList[symbol.reelId][symbol.symbolId];
        let point = this._graphic.toLocal(symbol.getGlobalPosition());
        this._winValuePanel.setXY(point.x, point.y);
    }

    hideWinEffect() {
        super.hideWinEffect();
        for (let i = 0; i < this._lineEffectList.length; i++) {
            this._lineEffectList[i].clear();
        }
        if (this._showPanel) {
            this._showPanel = false;
            OMY.Omy.remove.tween(this._winValuePanel);
            OMY.Omy.remove.tween(this._winValuePanel.text);
            OMY.Omy.add.tween(this._winValuePanel, {alpha: 0}, this._winValuePanel.json["tween_time"],
                this._winValuePanel.kill.bind(this._winValuePanel));
        }
    }
}
