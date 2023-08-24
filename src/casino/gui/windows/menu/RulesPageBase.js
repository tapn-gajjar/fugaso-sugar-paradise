import {AppG} from "../../../AppG";
import {MenuPageBase} from "./MenuPageBase";

export class RulesPageBase extends MenuPageBase {
    constructor(source) {
        super(source);
    }

    _onCheckGraphic() {
        super._onCheckGraphic();
        this._isHavePortRtp = OMY.Omy.loc.getText("paytable_rtp_2_v") !== "!paytable_rtp_2_v";

        if (!AppG.isHaveJackpot) {
            this._cPageContent.removeChild(this._cPageContent.getChildByName("c_jackpot"));
        }
        /** @type {OMY.OTextBitmap} */
        this._tRtp = this._cPageContent.getChildByName("t_rtp");
        this._rptNameString = "paytable_rtp_2";
        this._updateRtp();
    }

    /**     * @private     */
    _updateRtp() {
        if (this._tRtp) {
            const rptLocString = OMY.Omy.loc.getText(this._rptNameString);
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

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    updateGameSize() {
        if (this._isHavePortRtp) {
            this._rptNameString = (AppG.isScreenPortrait) ? "paytable_rtp_2_v" : "paytable_rtp_2";
            this._tRtp && this._updateRtp();
        }
        super.updateGameSize();
    }

    destroy() {
        this._tRtp = null;
        super.destroy();
    }

    onShow() {
        this._updateRtp();
        super.onShow();
    }

//-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}
