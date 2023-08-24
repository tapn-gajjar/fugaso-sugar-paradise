import {AppG} from "../../AppG";
import {JpCounter} from "./JpCounter";

export class JackpotsPanel {
    constructor(graphic) {
        this._gdConf = graphic.json;
        this._graphic = graphic;

        /** @type {JpCounter} */
        this._counterMaxi = null;
        /** @type {JpCounter} */
        this._counterMidi = null;
        /** @type {JpCounter} */
        this._counterMini = null;
        /** @type {OMY.OTextNumberFont} */
        this._txtMaxi = null;
        /** @type {OMY.OTextNumberFont} */
        this._txtMidi = null;
        /** @type {OMY.OTextNumberFont} */
        this._txtMini = null;

        this._createJpField("_txtMaxi", "_counterMaxi", "_loseLineMaxi", this._graphic.getChildByName("c_maxi"));
        this._createJpField("_txtMidi", "_counterMidi", "_loseLineMidi", this._graphic.getChildByName("c_midi"));
        this._createJpField("_txtMini", "_counterMini", "_loseLineMini", this._graphic.getChildByName("c_mini"));

        this._txtMaxi.incSecond = 0.1;
        this._txtMaxi.onStepInc = this._onStepIncMaxi.bind(this);
        this._txtMidi.incSecond = 0.1;
        this._txtMidi.onStepInc = this._onStepIncMidi.bind(this);
        this._txtMini.incSecond = 0.1;
        this._txtMini.onStepInc = this._onStepIncMini.bind(this);
        this._firstInc = true;

        AppG.serverWork.addOnJackpots(this._updateTexts, this);
        AppG.serverWork.on(AppG.serverWork.JACKPOT_LOSE, this._loseJackpot, this);
        AppG.serverWork.getJackpots();
        if (this._gdConf["test_lose"]) {
            OMY.Omy.add.timer(4, this._loseJackpot, this);
        }
    }

//---------------------------------------
// ACCESSOR
//---------------------------------------

//---------------------------------------
// PRIVATE
//---------------------------------------
    /**     * @private     */
    _createJpField(tField, counter, tLoseLine, graphic) {
        this[counter] = new JpCounter(graphic.getChildByName("c_canvas").getChildByName("c_jp_counter"));
        this[tField] = graphic.getChildByName("c_canvas").getChildByName("t_jp");
        this[tField].showCent = true;
        this[tLoseLine] = graphic.getChildByName("c_canvas").getChildByName("t_lose");
        if (!graphic.getChildByName("r_mask").json["debug"])
            graphic.getChildByName("c_canvas").mask = graphic.getChildByName("r_mask");
        graphic.getChildByName("r_mask").scale.x = 0;

        this[tLoseLine].visible = false;
        this[tLoseLine].startX = graphic.width + 5;
        this[tLoseLine].tValue = graphic.getChildByName("c_canvas").getChildByName("c_jp_counter");
    }

    _updateTexts() {
        let jackpotData = AppG.serverWork.jackpotsData;
        // console.warn("TODO::JackpotsPanel ==> _updateTexts :58: " + "jackpotData.gold", jackpotData.gold);
        // console.warn("TODO::JackpotsPanel ==> _updateTexts :60: " + "jackpotData.silver", jackpotData.silver);
        // console.warn("TODO::JackpotsPanel ==> _updateTexts :62: " + "jackpotData.bronze", jackpotData.bronze);

        let inc = !this._firstInc && Number(jackpotData.gold) > this._txtMaxi.value;
        this._txtMaxi.setNumbers(Number(jackpotData.gold), inc, "none");
        if (!inc) this._counterMaxi.jpData(this._txtMaxi.text, true);

        inc = !this._firstInc && Number(jackpotData.silver) > this._txtMidi.value;
        this._txtMidi.setNumbers(Number(jackpotData.silver), inc, "none");
        if (!inc) this._counterMidi.jpData(this._txtMidi.text, true);

        inc = !this._firstInc && Number(jackpotData.bronze) > this._txtMini.value;
        this._txtMini.setNumbers(Number(jackpotData.bronze), inc, "none");
        if (!inc) this._counterMini.jpData(this._txtMini.text, true);

        if (this._firstInc) this._firstInc = false;
    }

    // region update value:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _onStepIncMaxi(value) {
        this._counterMaxi.jpData(Number(value).toFixed(2));
    }

    /**     * @private     */
    _onStepIncMidi(value) {
        this._counterMidi.jpData(Number(value).toFixed(2));
    }

    /**     * @private     */
    _onStepIncMini(value) {
        this._counterMini.jpData(Number(value).toFixed(2));
    }

    //-------------------------------------------------------------------------
    //endregion

    // region LOSE:
    //-------------------------------------------------------------------------

    /**     * @private     */
    _loseJackpot() {
        let serverData = AppG.serverWork.jackpotsLoseData;
        /** @type {OMY.OTextFont} */
        let loseText = null;
        switch (serverData?.winType || "maxi") {
            case "maxi": {
                loseText = this._loseLineMaxi;
                break;
            }
            case "midi": {
                loseText = this._loseLineMidi;
                break;
            }
            case "mini": {
                loseText = this._loseLineMini;
                break;
            }
        }
        if (!loseText.visible) {
            OMY.Omy.remove.tween(loseText.tValue);
            OMY.Omy.add.tween(loseText.tValue, {alpha: 0}, this._gdConf["time_hide_alpha"], this._onHidetValue.bind(this),
                {
                    onCompleteParams: [loseText],
                });
        }

        // this._textLose.text += AntMath.roundNumber(((this._isDebug) ? 10000 : serverData.collected), 100) + " €";
    }

    _onHidetValue(loseText) {
        loseText.visible = true;
        loseText.x = loseText.startX;
        const percent = loseText.width / this._gdConf["def_width"];
        OMY.Omy.remove.tween(loseText);
        OMY.Omy.add.tween(loseText, {
                x: -loseText.width - 20,
                ease: "none",
            }, this._gdConf["time_lose_move"] * percent, this._onLoseShowed.bind(this),
            {
                onCompleteParams: [loseText],
            });
    }

    /**     * @private     */
    _onLoseShowed(loseText) {
        loseText.visible = false;
        AppG.serverWork.getJackpots();
        OMY.Omy.remove.tween(loseText.tValue);
        OMY.Omy.add.tween(loseText.tValue, {alpha: 1}, this._gdConf["time_hide_alpha"], null);
    }

    //-------------------------------------------------------------------------
    //endregion

}