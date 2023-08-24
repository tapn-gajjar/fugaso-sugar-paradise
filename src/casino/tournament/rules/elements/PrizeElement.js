export default class PrizeElement {
    constructor(graphic, data, formatCurrencyValue, editMode) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._graphic.addDestroy(this._destroy, this, true);
        this._gdConf = this._graphic.json;
        this._editMode = editMode;
        this._formatCurrencyValue = formatCurrencyValue;
        this._data = data;

        /** @type {OMY.OTextBitmap} */
        this._tPlace = this._graphic.getChildByName("t_place");
        /** @type {OMY.OTextBitmap} */
        this._tValue = this._graphic.getChildByName("t_value");

        if (this._editMode) return;
        OMY.Omy.loc.addUpdate(this._updateData, this, false);
        this._updateData();
    }

    _updateData() {
        this._tPlace.text = this._data.place + ".";
        this._tValue.text = OMY.StringUtils.sprintf(OMY.Omy.loc.getText("tournament_rules_prize_10"),
            this._formatCurrencyValue(this._data.reward));
    }

    _destroy() {
        OMY.Omy.loc.removeUpdate(this._updateData, this);
        this._graphic = null;
        this._gdConf = null;
        this._tPlace = null;
        this._tValue = null;
        this._formatCurrencyValue = null;
        this._data = null;
    }
}
