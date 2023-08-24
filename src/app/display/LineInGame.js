import {LineInGameBase} from "../../casino/display/LineInGameBase";
import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";
import {GameConstStatic} from "../GameConstStatic";

export class LineInGame extends LineInGameBase {
    constructor(graphic, activeSymbolList) {
        super(graphic, activeSymbolList);
        this._haveBlockFrame = false;

        /** @type {OMY.OContainer} */
        this._winValuePanel = graphic.getChildByName("c_win_value");
        if (this._winValuePanel) {
            this._winValuePanel.kill();
            /** @type {OMY.OSprite} */
            // this._winValuePanel.bg = this._winValuePanel.getChildByName("s_win_shadow");
            // this._winValuePanel.bg.saveWidth = this._winValuePanel.bg.width;
            /** @type {OMY.OTextNumberBitmap} */
            this._winValuePanel.text = this._winValuePanel.getChildByName("t_value");
            this._winValuePanel.text.showCent = true;
            AppG.emit.on(AppConst.APP_SHOW_LINE, this._onShowWinValue, this);

        }
    }

    clearNumbers() {
        /*if (this._activeLeft) {
            OMY.Omy.add.tween(this._activeLeft.scale, {
                x: 1,
                y: 1
            }, AppG.gameConst.getData("scaleNumberTimeHide"));
        }
        if (this._activeRight) {
            OMY.Omy.add.tween(this._activeRight.scale, {
                x: 1,
                y: 1
            }, AppG.gameConst.getData("scaleNumberTimeHide"));
        }*/
        super.clearNumbers();
    }

    showWinLineScatter() {
        this.clearNumbers();
        super.showWinLineScatter();
    }

    _animateWinNumber(valueLine) {
        super._animateWinNumber(valueLine);
        /*this.clearNumbers();
        this._activeLeft = this._leftNumbers.getChildByName('n' + String(valueLine + 1));
        this._activeRight = this._rightNumbers.getChildByName('n' + String(valueLine + 1));
        if (this._activeLeft) {
            OMY.Omy.add.tween(this._activeLeft.scale, {
                x: AppG.gameConst.getData("scaleNumberLevel"),
                y: AppG.gameConst.getData("scaleNumberLevel")
            }, AppG.gameConst.getData("scaleNumberTime"));
            this._leftNumbers.addChild(this._activeLeft);
        }
        if (this._activeRight) {
            OMY.Omy.add.tween(this._activeRight.scale, {
                x: AppG.gameConst.getData("scaleNumberLevel"),
                y: AppG.gameConst.getData("scaleNumberLevel")
            }, AppG.gameConst.getData("scaleNumberTime"));
            this._rightNumbers.addChild(this._activeRight);
        }*/
    }

    showWinAnimation() {
        this._winValue = 0;
        return super.showWinAnimation();
    }

    _showLine(lineNum, clear) {
        super._showLine(lineNum, clear);
        if (this._winLine.children[lineNum] && this._winLine.children[lineNum].visible) {
            this._winLine.children[lineNum].gotoAndPlay(0);
        }
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
        super._clearLines();
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
        if (this._showPanel) {
            this._showPanel = false;
            OMY.Omy.remove.tween(this._winValuePanel);
            OMY.Omy.remove.tween(this._winValuePanel.text);
            OMY.Omy.add.tween(this._winValuePanel, {alpha: 0}, this._winValuePanel.json["tween_time"],
                this._winValuePanel.kill.bind(this._winValuePanel));
        }
    }
}
