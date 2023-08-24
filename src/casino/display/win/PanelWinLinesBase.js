import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class PanelWinLinesBase {
    /**
     * @param{OMY.OContainer} container
     */
    constructor(container) {
        /** @type {OMY.OContainer} */
        this._container = container;
        this._gdConf = this._container.json;

        /** @type {OMY.OContainer} */
        this._canvas = this._container.getChildByName("c_centered");
        /** @type {OMY.OContainer} */
        this._dataBlock = this._canvas.getChildByName("c_data");

        this._configGraphic();

        /** @type {OMY.OTextBitmap} */
        this._txtLine = this._dataBlock.getChildByName("t_line");
        this._getLineText(20);
        /** @type {OMY.OTextNumberBitmap} */
        this._txtWin = this._dataBlock.getChildByName("t_win");
        this._txtWin.firstText = OMY.Omy.loc.getText("panel_line_2");
        this._txtWin.setNumbers(9999999);

        /** @type {OMY.OContainer} */
        this._cSymbols = this._dataBlock.getChildByName("c_symbols");
        this._checkPosition();

        AppG.emit.on(AppConst.APP_SHOW_LINE, this._updateLineInfo, this);
        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this._hidePanel, this);
        AppG.emit.on(AppConst.APP_HIDE_WIN_LINE_PANEL, this._hidePanel, this);

        OMY.Omy.viewManager.addCreateWindow(this._onCreateWindow, this);
    }

    _configGraphic() {
        this._downY = this._gdConf["hide_y"];
        this._upY = this._gdConf["show_y"];

        if (!this._gdConf["debug"] && !this._gdConf["view"]) {
            this._canvas.y = this._downY;
            this._canvas.alpha = 0;
        }
    }

    /** @private */
    _getLineText(line) {
        if (line === -1)
            this._txtLine.text = OMY.Omy.loc.getText("panel_line_3");
        else
            this._txtLine.text = OMY.Omy.loc.getText("panel_line_1") + String(line + 1) + ":";
    }

    /** @private */
    _checkPosition() {
        // this._cSymbols.x = this._txtLine.x + this._txtLine.width + this._dataBlock.json.dx;
        // this._txtWin.x = this._cSymbols.x + this._cSymbols.width + this._dataBlock.json.dx;
        // this._dataBlock.x = -this._dataBlock.width * .5;
        this._cSymbols.x = -this._cSymbols.width * .5;
    }

    /**
     * @param {Number}line
     * @param {Array}symbols
     * @param {Number}winValue
     * @private
     */
    _updateLineInfo(line, symbols, winValue) {
        if (AppG.gameConst.isScatterSymbol(symbols[0])) {
            this._getLineText(-1);
        } else {
            this._getLineText(line);
        }
        symbols = symbols.reverse();
        this._txtWin.setNumbers(winValue);
        for (let i = 0; i < this._cSymbols.children.length; i++) {
            /** @type {OMY.OSprite} */
            const s = this._cSymbols.children[i];
            if (i < symbols.length) {
                s.visible = true;
                s.texture = this._gdConf["s_texture"] + AppG.gameConst.symbolID(symbols[i]);
            } else {
                s.visible = false;
            }
        }
        this._checkPosition();

        this._animateBlock();
    }

    _animateBlock() {
        OMY.Omy.remove.tween(this._canvas);
        if (this._upY !== this._canvas.y) {
            this._canvas.alpha = 0;
            OMY.Omy.add.tween(this._canvas,
                {
                    alpha: 1,
                    y: this._upY,
                    ease: "bounce.out",
                },
                0.3);
        } else {
            OMY.Omy.add.tween(this._canvas,
                {
                    scaleX: .95,
                    scaleY: .95,
                    alpha: .9,
                    yoyo: true,
                    repeat: 1,
                    ease: "circ.out",
                },
                0.1);
        }
    }

    _hidePanel() {
        if (this._downY !== this._canvas.y) {
            OMY.Omy.remove.tween(this._canvas);
            OMY.Omy.add.tween(this._canvas,
                {
                    alpha: 0,
                    y: this._downY,
                    ease: "none",
                },
                0.1);
        }
    }

    _onCreateWindow(wName) {
        switch (wName) {
            case AppConst.W_BET_SETTINGS:
            case AppConst.W_PAY: {
                this._hidePanel();
                break;
            }
        }
    }
}
