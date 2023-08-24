import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {GameConstStatic} from "../../GameConstStatic";

export class WinGroup {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;

        /** @type {GameWinData} */
        this._winData = AppG.dataWins
        this._winsAdd = [];

        /** @type {OMY.OButton} */
        this._bUp = this._graphic.getChildByName("b_up");
        this._bUp.isBlock = true;
        this._bUp.externalMethod(this._onUpHandler.bind(this));
        /** @type {OMY.OButton} */
        this._bDown = this._graphic.getChildByName("b_down");
        this._bDown.isBlock = true;
        this._bDown.externalMethod(this._onDownHandler.bind(this));
        this._bUp.alpha = 0;
        this._bDown.alpha = 0;

        /** @type {OMY.OSprite} */
        this._sLine1 = this._graphic.getChildByName("s_line1");
        /** @type {OMY.OSprite} */
        this._sLine2 = this._graphic.getChildByName("s_line2");
        /** @type {OMY.OActorSpine} */
        this._aLight = this._graphic.getChildByName("a_light");
        this._aLight.gotoAndStop(0);
        this._timerLight = OMY.Omy.add.timer(this.timeForLight, this._startPlayLight, this);

        /** @type {OMY.OContainer} */
        this._canvas = this._graphic.getChildByName("c_wins");
        if (!this._graphic.getChildByName("r_mask").json["debug"])
            this._canvas.mask = this._graphic.getChildByName("r_mask");
        this._blockJson = this._gdConf["block"];
        this._countMax = this._gdConf["count_max"];
        this._stepH = this._gdConf["step_h"];
        this._countActive = 0;
        this._showPosition = 0;

        if (this._gdConf["edit_block"]) {
            let blck = this._createBlock(this.testData);
        } else if (this._gdConf["edit_count"]) {
            for (let i = this._gdConf["edit_count"] - 1; i >= 0; i--) {
                let blck = this._createBlock(this.testData);
                if (this._gdConf["edit_count"] > this._countMax)
                    blck.y = this._stepH * i;
                else
                    blck.y = this._stepH * (this._countMax - 1 - i);
                this._countActive++;
            }
            this._checkButtonState();
        }
        if (this._gdConf["edit_add"]) {
            for (let i = 0; i < this._gdConf["edit_add"]; i++) {
                OMY.Omy.add.timer(this._gdConf["timer_debug"] * (i + 1), () => {
                    this._createTestData();
                    this._showNewBlocks();
                }, this);
            }
        }
        if (this._gdConf["edit_clear"]) {
            OMY.Omy.add.timer(this._gdConf["timer_clear"], this.clear, this);
        }

        AppG.emit.on(AppConst.APP_START_INC_WIN, this._onAddWins, this);
        AppG.emit.on(GameConstStatic.WIN_MAX_VALUE, this._onAddWinMax, this);
        if (!OMY.Omy.isDesktop) AppG.emit.on(AppConst.APP_DEFAULT_STATE, this._checkButtonState, this);
        OMY.Omy.loc.addUpdate(this._updateText, this);
        if (AppG.serverWork.recoverMode) this._recoverWinGroup();
    }

    /**     * @private     */
    _createTestData() {
        for (let i = 0; i < this._gdConf["by_one"]; i++) {
            this._winsAdd.push(this.testData);
        }
    }

    /**     * @private     */
    _startPlayLight() {
        this._timerLight?.destroy();
        this._aLight.gotoAndPlay(0);
        this._timerLight = OMY.Omy.add.timer(this.timeForLight, this._startPlayLight, this);
    }

    /** @public */
    startFree() {
        if (!AppG.serverWork.recoverMode) this.clear();
        this._sLine1.renderable = false;
        this._sLine2.renderable = false;
    }

    /** @public */
    endFree() {
        this.clear();
        this._sLine1.renderable = true;
        this._sLine2.renderable = true;
    }

    /**     * @private     */
    _recoverWinGroup() {
        /** @type {Array} */
        const prevWins = AppG.serverWork.previousGains;
        if (prevWins.length) {
            for (let i = 0; i < prevWins.length; i++) {
                for (let j = 0; j < prevWins[i].length; j++) {
                    let o = {
                        countSymbol: prevWins[i][j].count,
                        winSymbol: prevWins[i][j].symbol,
                        multi: prevWins[i][j].multi,
                        credit: prevWins[i][j].amount / AppG.creditType,
                    }
                    this._winsAdd.push(o);
                }
            }
        }
        this._winData.repeatWins();
        while (!this._winData.endLines) {
            this._winData.nextLine();
            let o = {
                countSymbol: this._winData.countSymbol,
                winSymbol: this._winData.winSymbol,
                multi: this._winData.multi,
                credit: this._winData.credit,
            }
            this._winsAdd.push(o);
        }
        for (let i = this._winsAdd.length - 1; i >= 0; i--) {
            let blck = this._createBlock(this._winsAdd[i]);
            if (this._winsAdd.length > this._countMax)
                blck.y = this._stepH * i;
            else
                blck.y = this._stepH * (this._countMax - 1 - i);
            this._countActive++;
        }
        this._winsAdd.length = 0;
        this._checkButtonState();
    }

    /**     * @private     */
    _onAddWinMax(value) {
        let o = {
            credit: value,
            isMaxWin: true,
        }
        this._winsAdd.push(o);
        if (this._winsAdd.length && !this._moving)
            this._showNewBlocks();
    }

    /**     * @private     */
    _onAddWins() {
        this._winData.repeatWins();
        while (!this._winData.endLines) {
            this._winData.nextLine();
            let o = {
                countSymbol: this._winData.countSymbol,
                winSymbol: this._winData.winSymbol,
                multi: this._winData.multi,
                credit: this._winData.credit,
            }
            this._winsAdd.push(o);
        }

        if (this._winsAdd.length && !this._moving)
            this._showNewBlocks();
    }

    /**     * @private     */
    _showNewBlocks() {
        this._moving = true;
        this._countFree = (this._countActive < this._countMax) ? this._countMax - this._countActive : 0;
        this._countAdd = (this._winsAdd.length < this._countMax) ? this._winsAdd.length : this._countMax;
        if (this._countFree < this._countAdd) {
            const countDown = this._countAdd - this._countFree;
            this._countFree += countDown;
            let time = this._gdConf["time_tween_down"] + this._gdConf["time_tween_down"] * (1 - 1 / countDown);
            for (let i = 0; i < this._canvas.numChildren; i++) {
                let block = this._canvas.children[i];
                let moveY = block.y + this._stepH * countDown;
                OMY.Omy.add.tween(block, {
                    y: moveY,
                    ease: "none"
                }, time);
            }
            this._timer = OMY.Omy.add.timer(time - this._gdConf["time_down_delay"], this._moveNewBlock, this);
            return;
        }
        this._moveNewBlock();
    }

    /**     * @private     */
    _moveNewBlock() {
        let movePos = this._countFree - 1;
        for (let i = 0; i < this._countAdd; i++) {
            let block = this._createBlock(this._winsAdd.shift());
            let moveY = this._stepH * movePos;
            movePos--;
            block.y = moveY - this._stepH * this._countMax;
            let time = this._gdConf["time_tween"];
            OMY.Omy.add.tween(block, {
                y: moveY,
                delay: this._gdConf["delay"] * i,
                ease: "none"
            }, time);
            OMY.Omy.add.tween(block, {
                y: moveY - this._gdConf["up_dy"],
                delay: this._gdConf["delay"] * i + time,
                ease: "none",
                yoyo: true,
                repeat: 1
            }, this._gdConf["time_inner"]);
            this._countActive++;
        }
        if (this._winsAdd.length) {
            this._timer = OMY.Omy.add.timer(this._gdConf["delay"] * (this._countFree * 2) + this._gdConf["time_tween"],
                this._showNewBlocks, this);
            return;
        }
        this._moving = false;
        this._checkButtonState();
    }

    /**     * @private     */
    _checkButtonState() {
        if (!OMY.Omy.isDesktop && (AppG.isPLayReSpins || AppG.isPLayFreeSpins)) return;
        if (this._countActive > this._countMax) {
            if (this._showPosition !== 0 && this._bUp.isBlock) {
                OMY.Omy.add.tween(this._bUp, {alpha: 1}, 0.1);
                this._bUp.isBlock = false;
            } else if (this._showPosition === 0 && !this._bUp.isBlock) {
                OMY.Omy.add.tween(this._bUp, {alpha: .6}, 0.1);
                this._bUp.isBlock = true;
            } else if (this._bUp.alpha === 0) {
                OMY.Omy.add.tween(this._bUp, {alpha: .6}, 0.1);
            }
            if ((this._showPosition + this._countMax) < this._countActive && this._bDown.isBlock) {
                OMY.Omy.add.tween(this._bDown, {alpha: 1}, 0.1);
                this._bDown.isBlock = false;
            } else if ((this._showPosition + this._countMax) >= this._countActive && !this._bDown.isBlock) {
                OMY.Omy.add.tween(this._bDown, {alpha: .6}, 0.1);
                this._bDown.isBlock = true;
            } else if (this._bDown.alpha === 0) {
                OMY.Omy.add.tween(this._bDown, {alpha: .6}, 0.1);
            }
        }
    }

    /**     * @private     */
    _onUpHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._showPosition--;
        this._canvas.y += this._stepH;
        this._checkButtonState();
    }

    /**     * @private     */
    _onDownHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._showPosition++;
        this._canvas.y -= this._stepH;
        this._checkButtonState();
    }

    clear() {
        this._tMaxWin = null;
        OMY.Omy.add.tween(this._bUp, {alpha: 0}, 0.1);
        this._bUp.isBlock = true;
        OMY.Omy.add.tween(this._bDown, {alpha: 0}, 0.1);
        this._bDown.isBlock = true;
        this._showPosition = 0;
        this._canvas.y = this._canvas.json.y;
        this._moving = false;
        this._winsAdd.length = 0;
        this._countActive = 0;
        this._timer?.destroy();
        this._timer = null;
        if (!this._canvas.numChildren) return;
        for (let i = 0; i < this._canvas.numChildren; i++) {
            let block = this._canvas.children[i];
            let moveY = block.y + this._stepH * this._countMax;
            let time = this._gdConf["time_tween_hide"];
            OMY.Omy.add.tween(block, {
                y: moveY,
                delay: this._gdConf["delay_hide"] * i,
                ease: "none"
            }, time, block.destroy.bind(block));
        }
    }

    /**     * @private     */
    _createBlock(data) {
        const result = OMY.Omy.add.containerJson(this._canvas, this._blockJson);
        if (data.isMaxWin) {
            result.getChildByName("t_count").destroy();
            result.getChildByName("t_multi").destroy();
            result.getChildByName("t_win").destroy();
            result.getChildByName("s_symb").destroy();
            this._tMaxWin = OMY.Omy.add.textJson(result, this._gdConf["t_win_max"], OMY.Omy.loc.getText("max_win_block") + " "
                + OMY.OMath.getCashString(data.credit, true));
            this._tMaxWin.winValue = data.credit;
            return result;
        }
        result.getChildByName("t_count").text = String(data.countSymbol);
        if (data.multi > 1)
            result.getChildByName("t_multi").text = "x" + String(data.multi);
        else
            result.getChildByName("t_multi").destroy();
        result.getChildByName("t_win").text = OMY.OMath.getCashString(data.credit, true) + String(AppG.currency);
        result.getChildByName("s_symb").texture = result.getChildByName("s_symb").json["t_name"]
            + String(AppG.gameConst.symbolID(data.winSymbol));
        if (AppG.serverWork.isMaxWin)
            result.getChildByName("t_win").destroy();
        return result;
    }

    /**     * @private     */
    _updateText() {
        if (this._tMaxWin) {
            this._tMaxWin.text = OMY.Omy.loc.getText("max_win_block") + " " + OMY.OMath.getCashString(this._tMaxWin.winValue, true);
        }
    }

    get graphic() {
        return this._graphic;
    }

    get timeForLight() {
        return OMY.OMath.randomRangeNumber(this._aLight.json["time"][0], this._aLight.json["time"][1]);
    }

    get testData() {
        return {
            countSymbol: OMY.OMath.randomRangeInt(3, 49),
            winSymbol: OMY.OMath.getRandomItem(["I", "F", "C", "H", "D", "G", "E", "A"]),
            multi: OMY.OMath.randomRangeInt(2, 245),
            credit: OMY.OMath.randomRangeNumber(30.00, 990000.00),
        };
    }
}
