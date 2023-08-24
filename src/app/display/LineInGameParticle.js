import {LineInGameBase} from "../../casino/display/LineInGameBase";
import {AppG} from "../../casino/AppG";
import {GameLine} from "./effects/particles/GameLine";

export class LineInGameParticle extends LineInGameBase {
    constructor(graphic, activeSymbolList) {
        super(graphic, activeSymbolList);

        this._lineEffectList = [];
        for (let i = 0; i < AppG.serverWork.maxLines; i++) {
            this._lineEffectList.push(new GameLine(graphic.json["line"]));
        }
        this._halfSWidth = AppG.gameConst.symbolWidth * .5;
        this._halfSHeight = AppG.gameConst.symbolHeight * .5;
        this._activeSymbolList = activeSymbolList;
    }

    clearNumbers() {
        if (this._activeLeft) {
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
        }
        super.clearNumbers();
    }

    hide() {
        super.hide();
        if (this._getSpriteLines) {
            this._winLine.callAll("destroy")
            this._getSpriteLines = false;
        }
    }

    hideWinEffect() {
        super.hideWinEffect();
        for (let i = 0; i < this._lineEffectList.length; i++) {
            this._lineEffectList[i].clear();
        }
    }

    showWinLineScatter() {
        this.clearNumbers();
        super.showWinLineScatter();
    }

    _showLine(lineNum, clear) {
        // super._showLine(lineNum, clear);
        if (!this._winLine.visible) this._winLine.visible = true;

        let line = AppG.serverWork.getLine(lineNum);
        let pos = [];
        for (let i = 0; i < line.length; i++) {
            if (!(i % 2))
                pos.push(
                    this._winLine.toLocal(this._activeSymbolList[i][line[i]].getGlobalPosition())
                );
        }
        this._winLine.addChild(this._lineEffectList[lineNum].particle);
        this._lineEffectList[lineNum].showLine(pos);
    }

    _animateWinNumber(valueLine) {
        this.clearNumbers();
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
        }
    }

    set linesGraphic(value) {
        super.linesGraphic = value;
        this._getSpriteLines = true;
    }
}
