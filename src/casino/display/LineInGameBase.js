import {AppG} from "../AppG";

export class LineInGameBase {
    constructor(graphic, activeSymbolList) {

        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._maxLine = AppG.serverWork.maxLines;
        this._activeSymbolList = activeSymbolList;

        // OMY.Omy.navigateBtn.addUpdateState(this._onUpBtnState, this);
        this._onLine = false;
        this._winAnimation = false;

        this._activeLeft = null;
        this._activeRight = null;
        this._isOverInNumber = false;
        this._haveBlockFrame = false;

        this.addNumbers();

        // AppG.emit.on(AppConst.EMIT_LINE_CHANGE, this._changeLines, this);
    }

    /** @private */
    /*_changeLines() {
        this.updateNumbers();
        this.hideWinEffect();
        if (this._timerLine) {
            this._timerLine.destroy();
            this._timerLine = null;
        }
        this._timerLine = OMY.Omy.add.timer(0.1, this._onShow, this);
        this._winLine.visible = false;
    }*/

    /*_onUpBtnState() {
        if (OMY.Omy.navigateBtn.state !== AppConst.C_NONE) {
            if (this._onLine) {
                this.updateNumbers();
                this._onLine = false;
            } else if (this._winLine && this._winLine.visible) {
                if (this._timerLine) {
                    this._timerLine.destroy();
                    this._timerLine = null;
                }
                this._winLine.visible = false;
            }
        }
    }*/

    addNumbers() {
        let buf;
        /** @type {OSprite} */
        let buf1;

        this._leftNumbers = this._graphic.getChildByName("g_numberLeft");
        if (this._leftNumbers) {
            this._leftNConf = this._leftNumbers.json;
            buf = this._leftNConf["number"];
            for (let i = 0; i < this._maxLine; i++) {
                buf = this._leftNConf["num_" + String(i + 1)];
                if (this._leftNConf["num_" + String(i + 1)]) {
                    buf = Object.assign(OMY.OMath.jsonCopy(buf), OMY.OMath.jsonCopy(this._leftNConf["num_" + String(i + 1)]));
                    buf.texture = this._leftNConf.texture + String(i + 1);
                    buf1 = OMY.Omy.add.spriteJson(this._leftNumbers, buf);
                    buf1.userData = i + 1;
                    buf1.name = "n" + String(buf1.userData);
                    if (this._leftNConf.blockTexture)
                        buf1.blockTextureFrame = this._leftNConf.blockTexture + String(i + 1);
                    buf1.textureFrame = this._leftNConf.texture + String(i + 1);
                    if (this._leftNConf.winTexture)
                        buf1.winTextureFrame = this._leftNConf.winTexture + String(i + 1);

                    /*if (OMY.Omy.isDesktop) {
                        buf1.input = true;
                        buf1.addOver(this.onOverInNumber, this);
                        buf1.addOut(this.onOutInNumber, this);
                    }*/
                }
            }
        }

        this._rightNumbers = this._graphic.getChildByName("g_numberRight");
        if (this._rightNumbers) {
            this._rightNConf = this._rightNumbers.json;
            buf = this._rightNConf["number"];
            for (let i = 0; i < this._maxLine; i++) {
                buf = this._rightNConf["num_" + String(i + 1)];
                if (this._rightNConf["num_" + String(i + 1)]) {
                    buf = Object.assign(OMY.OMath.jsonCopy(buf), OMY.OMath.jsonCopy(this._rightNConf["num_" + String(i + 1)]));
                    buf.texture = this._rightNConf.texture + String(i + 1);
                    buf1 = OMY.Omy.add.spriteJson(this._rightNumbers, buf);
                    buf1.userData = i + 1;
                    buf1.name = "n" + String(buf1.userData);
                    if (this._rightNConf.blockTexture)
                        buf1.blockTextureFrame = this._rightNConf.blockTexture + String(i + 1);
                    buf1.textureFrame = this._rightNConf.texture + String(i + 1);
                    if (this._rightNConf.winTexture)
                        buf1.winTextureFrame = this._rightNConf.winTexture + String(i + 1);

                    /*if (OMY.Omy.isDesktop) {
                        buf1.input = true;
                        buf1.addOver(this.onOverInNumber, this);
                        buf1.addOut(this.onOutInNumber, this);
                    }*/
                }
            }
        }

        buf = null;
        buf1 = null;
        this.updateNumbers();
    }

    /*onOverInNumber(sprite) {
        if (this._winAnimation)
            return;

        if (OMY.Omy.navigateBtn.state === AppConst.C_NONE) {

            if (sprite.userData > AppG.serverWork.currLines) return;

            this._isOverInNumber = true;
            if (this._activeLeft)
                this._activeLeft.texture = this._activeLeft.textureFrame;
            if (this._activeRight)
                this._activeRight.texture = this._activeRight.textureFrame;

            sprite.texture = sprite.winTextureFrame;
            if (sprite.parent === this._leftNumbers) {
                this._activeLeft = sprite;
                for (let i = 0; i < this._rightNumbers.numChildren; i++) {
                    if (this._rightNumbers.children[i].userData === sprite.userData) {
                        this._activeRight = this._rightNumbers.children[i];
                        this._rightNumbers.children[i].texture = this._rightNumbers.children[i].winTextureFrame;
                        break;
                    }
                }
            } else {
                this._activeRight = sprite;
                for (let i = 0; i < this._leftNumbers.numChildren; i++) {
                    if (this._leftNumbers.children[i].userData === sprite.userData) {
                        this._activeLeft = this._leftNumbers.children[i];
                        this._leftNumbers.children[i].texture = this._leftNumbers.children[i].winTextureFrame;
                        break;
                    }
                }
            }

            this._showLine(sprite.userData - 1, true);
        }
    }

    onOutInNumber(sprite) {
        if (this._winAnimation)
            return;
        if (this._isOverInNumber || this._winLine.visible) {
            this._isOverInNumber = false;
            if (sprite !== this._activeLeft && sprite !== this._activeRight) return;
            if (this._activeLeft)
                this._activeLeft.texture = this._activeLeft.textureFrame;
            if (this._activeRight)
                this._activeRight.texture = this._activeRight.textureFrame;
            this._activeLeft = null;
            this._activeRight = null;
            this._winLine.visible = false;
        }
    }*/

    updateNumbers() {
        let buf;
        if (this._leftNumbers) {
            for (let i = 0; i < this._leftNumbers.numChildren; i++) {
                buf = this._leftNumbers.children[i];
                if (buf.blockTextureFrame) {
                    if (buf.userData <= AppG.serverWork.currLines) {
                        if (buf.texture !== buf.textureFrame) {
                            buf.texture = buf.textureFrame;
                        }
                    } else if (buf.texture !== buf.blockTextureFrame) {
                        buf.texture = buf.blockTextureFrame;
                    }
                } else {
                    if (buf.userData <= AppG.serverWork.currLines) {
                        if (!buf.visible) {
                            buf.visible = true;
                        }
                    } else if (buf.visible) {
                        buf.visible = false;
                    }
                }
            }

        }

        if (this._rightNumbers) {
            for (let i = 0; i < this._rightNumbers.children.length; i++) {
                buf = this._rightNumbers.children[i];
                if (buf.blockTextureFrame) {
                    if (buf.userData <= AppG.serverWork.currLines) {
                        if (buf.texture !== buf.textureFrame) {
                            buf.texture = buf.textureFrame;
                        }
                    } else if (buf.texture !== buf.blockTextureFrame) {
                        buf.texture = buf.blockTextureFrame;
                    }
                } else {
                    if (buf.userData <= AppG.serverWork.currLines) {
                        if (!buf.visible) {
                            buf.visible = true;
                        }
                    } else if (buf.visible) {
                        buf.visible = false;
                    }
                }
            }
        }

        buf = null;
    }

    show() {
        this.setLinesCount();
        if (!this._winLine) return;
        this._winLine.visible = true;
    }

    /** @private */

    _onShow() {
        this.updateNumbers();
        this.show();
        this._timerLine = null;
    }

    hide() {
        if (this._isOverInNumber) {
            this._isOverInNumber = false;
            if (this._activeLeft)
                this._activeLeft.texture = this._activeLeft.textureFrame;
            if (this._activeRight)
                this._activeRight.texture = this._activeRight.textureFrame;
            this._activeLeft = null;
            this._activeRight = null;
            this._winLine.visible = false;
        }
        if (this._winLine && this._winLine.visible) {
            if (this._timerLine) {
                this._timerLine.destroy();
                this._timerLine = null;
            }
            this._winLine.visible = false;
        }
    }

    showWinAnimation() {
        if (this._winAnimation) return;
        this._winAnimation = true;
        this._winLine.visible = true;
        this._clearLines();
        if (this._haveBlockFrame) this.blockAllNumbers();
    }

    hideWinEffect() {
        this.clearNumbers();
        this._winAnimation = false;
        this._winLine.visible = false;
        if (this._haveBlockFrame) this.normalAllNumbers();
    }

    /** @public */
    clearNumbers() {
        if (this._activeLeft) {
            this._activeLeft = null;
        }
        if (this._activeRight) {
            this._activeRight = null;
        }
    }

    showWinLine(valueLine, clear = true, animNumber = false) {
        this._showLine(valueLine, clear);

        if (animNumber) {
            this._animateWinNumber(valueLine);
        }
    }

    _animateWinNumber(valueLine) {
        this.clearNumbers();
        this._activeLeft = this._leftNumbers.getChildByName("n" + String(valueLine + 1));
        this._activeRight = this._rightNumbers.getChildByName("n" + String(valueLine + 1));
        if (this._activeLeft) {
            this._leftNumbers.addChild(this._activeLeft);
        }
        if (this._activeRight) {
            this._rightNumbers.addChild(this._activeRight);
        }
        if (this._haveBlockFrame) {
            if (this._activeLeft && this._activeLeft.winTextureFrame) this._activeLeft.texture = this._activeLeft.winTextureFrame;
            if (this._activeRight && this._activeRight.winTextureFrame) this._activeRight.texture = this._activeRight.winTextureFrame;
        }
    }

    showWinLineScatter() {
        this._clearLines();
        // this._winLine.visible = false;
    }

    setLinesCount() {
        if (!this._winLine) return;
        let buf;
        for (let i = 0; i < this._winLine.children.length; i++) {
            buf = this._winLine.children[i];

            if (i < AppG.serverWork.currLines) {
                if (!buf.visible)
                    buf.visible = true;
            } else if (buf.visible) {
                buf.visible = false;
            }
        }
    }

    blockAllNumbers() {
        let buf;
        if (this._leftNumbers) {
            for (let i = 0; i < this._leftNumbers.numChildren; i++) {
                buf = this._leftNumbers.children[i];
                if (buf.blockTextureFrame) buf.texture = buf.blockTextureFrame;
            }

        }

        if (this._rightNumbers) {
            for (let i = 0; i < this._rightNumbers.children.length; i++) {
                buf = this._rightNumbers.children[i];
                if (buf.blockTextureFrame) buf.texture = buf.blockTextureFrame;
            }
        }

        buf = null;
    }

    normalAllNumbers() {
        this.updateNumbers();
    }

    cleanNumber() {
        if (this._haveBlockFrame) this.blockAllNumbers();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _showLine(lineNum, clear) {
        if (clear)
            this._clearLines();

        if (this._winLine.children[lineNum]) {
            this._winLine.visible = true;
            this._winLine.children[lineNum].visible = true;
        }
    }

    _clearLines() {
        for (let i = 0; i < this._winLine.numChildren; i++) {
            this._winLine.children[i].visible = false;
        }
    }

    _drawWinLineByConf(config) {
        const n = AppG.serverWork.maxLines;
        const lines = AppG.serverWork.lines;
        for (let i = 0; i < n; i++) {
            const graphic = OMY.Omy.add.graphic(this._winLine);
            graphic.name = "s_winline_" + String(i + 1);
            if (config["stroke"]) {
                graphic.lineStyle(config["stroke"].width, config["stroke"].fill);
                this._drawLine(graphic, config, lines[i]);
            }
            graphic.lineStyle(config.width, config.fill);
            this._drawLine(graphic, config, lines[i]);
        }
        if (config.hasOwnProperty("debug_point") && config["debug_point"]) {
            const graphic = OMY.Omy.add.graphic(this._winLine);
            graphic.beginFill(0x000000);
            graphic.drawCircle(-1, -1, 2);
            graphic.endFill();
            OMY.Omy.add.regDebugMode(graphic);
        }
    }

    /**     * @private     */
    _drawLine(graphic, config, line) {
        let activeList = AppG.activeSymbolList;
        let point = this._winLine.toLocal(activeList[0][line[0]].getGlobalPosition());

        graphic.moveTo((config["start_point"]) ? config["start_point"][line[0]] : point.x, point.y);
        for (let j = 0; j < line.length; j++) {
            point = this._winLine.toLocal(activeList[j][line[j]].getGlobalPosition());
            graphic.lineTo(point.x, point.y);
        }
        graphic.lineTo((config["end_point"]) ? config["end_point"][line[line.length - 1]] : point.x, point.y);
    }

    set linesGraphic(value) {
        /** @type {OMY.OContainer} */
        this._winLine = ((value.getChildByName("s_all")) ? value.getChildByName("s_all") : value);
        this._winLine.visible = value.json.hasOwnProperty("debug_line") && value.json["debug_line"];
        /*let gdLines = this._gdConf['winLines'];
        this._winLine = OMY.Omy.add.container(this,
            gdLines.x,
            gdLines.y,
            gdLines['debug'],
            false);
        for (let i = 1; i < this._maxLine + 1; i++) {
            OMY.Omy.add.sprite(this._winLine, 0, 0, gdLines['texture'] + String(i));
        }*/
    }
}
