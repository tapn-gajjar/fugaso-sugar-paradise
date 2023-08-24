import {AppConst} from "../../../AppConst";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {CrashWBase} from "../CrashWBase";
import {HistoryElement} from "../../display/history/HistoryElement";

export class HistoryWBase extends CrashWBase {
    constructor() {
        super();
    }

    _settingWindow() {
        this._heightMaskLimit = 0;
        this._wName = AppConst.W_HISTORY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDHistory");
        super._settingWindow();
    }

    _windowSizeUpdate() {
        super._windowSizeUpdate();
        if (this._data)
            this._tHTitle.text = OMY.Omy.loc.getText("history_handle") + " " + this._data.roundId;
    }

    _createElements() {
        super._createElements();
        /** @type {OMY.OTextFont} */
        this._tHTitle = this.getChildByName("t_title");
        this._tHTitle.text = OMY.Omy.loc.getText("history_handle") + " " + this._data.roundId;
        /** @type {OMY.OTextFont} */
        this._tTime = this._cPageContent.getChildByName("c_5").getChildByName("t_time");
        this._tTime.text = OMY.OMath.getCashString(this._data.multiplier, true) + "x";
        /** @type {OMY.OTextFont} */
        this._tRoundKey = this._cPageContent.getChildByName("c_2").getChildByName("t_id");
        this._tRoundKey.text = String(this._data.roundId) + "_" +
            OMY.OMath.getCashString(this._data.multiplier, true) + "_" + this._data.key;
        /** @type {OMY.OButton} */
        let btn = this._cPageContent.getChildByName("c_2").getChildByName("b_history_copy");
        btn.userData = this._tRoundKey;
        btn.externalMethod(this._onBtnCopyHandler.bind(this));
        /** @type {OMY.OTextFont} */
        this._tResult = this._cPageContent.getChildByName("c_4").getChildByName("t_id");
        this._tResult.text = this._data.result;
        btn = this._cPageContent.getChildByName("c_4").getChildByName("b_history_copy");
        btn.userData = this._tResult;
        btn.externalMethod(this._onBtnCopyHandler.bind(this));

        /** @type {OMY.OTextFont} */
        this._linkTxt = this._cPageContent.getChildByName("c_5").getChildByName("t_id");
        this._bLink = this._cPageContent.getChildByName("c_5").getChildByName("b_link");
        this._bLink.externalMethod(this._onTextClick.bind(this));
        this._bLink.addOver(this._onTextOver, this);
        this._bLink.addOut(this._onTextOut, this);

        this._underline = this._cPageContent.getChildByName("c_5").getChildByName("r_line");
        this._underline.alpha = 0;
        OMY.Omy.navigateBtn.updateState(AppConst.C_PAYTABLE);

        /** @type {OMY.OContainer} */
        this._copy1 = this._cPageContent.getChildByName("c_2").getChildByName("c_copy");
        /** @type {OMY.OTextFont} */
        this._copy1.text = this._copy1.canvas.getChildByName("t_field");
        /** @type {OMY.OGraphic} */
        this._copy1.bg = this._copy1.canvas.getChildByName("g_bg");

        /** @type {OMY.OContainer} */
        this._copy2 = this._cPageContent.getChildByName("c_4").getChildByName("c_copy");
        /** @type {OMY.OTextFont} */
        this._copy2.text = this._copy2.canvas.getChildByName("t_field");
        /** @type {OMY.OGraphic} */
        this._copy2.bg = this._copy2.canvas.getChildByName("g_bg");

        /** @type {OMY.OContainer} */
        this._copy3 = this._cPageContent.getChildByName("c_5").getChildByName("c_copy");
        /** @type {OMY.OTextFont} */
        this._copy3.text = this._copy3.canvas.getChildByName("t_field");
        /** @type {OMY.OGraphic} */
        this._copy3.bg = this._copy3.canvas.getChildByName("g_bg");
    }

    _clearElements() {
        super._clearElements();
        this._tHTitle = null;
        this._tTime = null;
        this._tRoundKey = null;
        this._tResult = null;
        this._data = null;
        this._linkTxt = null;
        this._bLink = null;
        this._underline = null;
        OMY.Omy.remove.tween(this._copy1);
        this._copy1 = null;
        OMY.Omy.remove.tween(this._copy2);
        this._copy2 = null;
        OMY.Omy.remove.tween(this._copy3);
        this._copy3 = null;
        HistoryElement.open_round_id = 0;
        OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
    }

    _onClose() {
        OMY.Omy.sound.play(GameConstStatic.S_help_close || GameConstStatic.S_btn_any);
    }

    updateData(data, time) {
        this._data = data;
        this._time = time;
    }

    /**     * @private     */
    _onTextClick() {
        if (this._underline)
            this._underline.alpha = 0;
        if (!OMY.Omy.isDesktop && (OMY.Omy.OS.iOS || OMY.Omy.OS.iPhone || OMY.Omy.OS.iPad)) {
            this._onCopyRoundKey(this._linkTxt);
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_btn_any);
            window.open(this._linkTxt.text, "_blank");
        }
    }

    /**     * @private     */
    _onTextOver() {
        if (this._underline)
            this._underline.alpha = 1;
    }

    /**     * @private     */
    _onTextOut() {
        if (this._underline)
            this._underline.alpha = 0;
    }

    /**     * @private     */
    _onBtnCopyHandler(btn) {
        this._onCopyRoundKey(btn.userData);
    }

    /**     * @private     */
    _onCopyRoundKey(text) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        Clipboard.copy(text.text);

        /** @type {OMY.OContainer} */
        let active = null;
        switch (text) {
            case this._tRoundKey: {
                active = this._copy1;
                break;
            }
            case this._tResult: {
                active = this._copy2;
                break;
            }
            case this._linkTxt: {
                active = this._copy3;
                break;
            }
        }
        OMY.Omy.remove.tween(active);
        active.visible = true;
        active.alpha = 0;
        active.bg.json.width = active.text.width + 13;
        active.bg.json.height = active.text.height + 5;
        active.bg.drawByJson(true);
        active.alignContainer();
        OMY.Omy.add.tween(active, {alpha: 1}, 0.3, (tween) => {
                tween.visible = false;
            },
            {
                // delay:0
                // ease:''  like "back.easeOut"
                // paused:false
                // onStart:Function
                // onUpdate:Function
                // onRepeat:Function
                repeat: 1,
                repeatDelay: 1,
                yoyo: true,
                onCompleteParams: [active]
                // startAt:null TweenMax.to(mc, 2, {x:500, startAt:{x:0}});
            });
    }
}
