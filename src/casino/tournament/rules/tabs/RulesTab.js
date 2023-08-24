import TabBase from "./TabBase";
import {AppG} from "../../../AppG";

export default class RulesTab extends TabBase {
    constructor(conf) {
        super(conf);
    }

    _createGraphic() {
        /** @type {OMY.OTextBitmap} */
        this._tMinBet = this.getChildByName("t_tournament_rules_rules_1");
        /** @type {OMY.OTextBitmap} */
        this._tMinBet2 = this._cContent.getChildByName("t_tournament_rules_rules_5");
        /** @type {OMY.OTextBitmap} */
        this._tPoints = this._cContent.getChildByName("t_tournament_rules_rules_7");
        /** @type {OMY.OTextBitmap} */
        this._tPoints2 = this._cContent.getChildByName("t_tournament_rules_rules_8");
        /** @type {OMY.OTextBitmap} */
        this._tCashier = this._cContent.getChildByName("t_tournament_rules_rules_11");
        /** @type {OMY.OTextBitmap} */
        this._tCashier2 = this._cContent.getChildByName("t_tournament_rules_rules_21");
        /** @type {OMY.OTextBitmap} */
        this._tRules4 = this._cContent.getChildByName("t_tournament_rules_rules_4");
        OMY.Omy.loc.addUpdate(this._onLocChange, this, false);
        this._onLocChange();
        super._createGraphic();
    }

    _updateGameSize() {
        if (!this.active) return;
        if (!OMY.Omy.isDesktop) {
            let child;
            for (let i = 0; i < this._cContent.numChildren; i++) {
                /** @type {OMY.OSprite | OMY.OTextBitmap} */
                child = this._cContent.children[i];
                if (child.oType === OMY.OmyConst.OMY_TEXT_BITMAP) {
                    if (!child.json.save_width) {
                        child.json.save_width = child.json.width;
                        if (child.json.v_width) child.json.v_save_width = child.json.v_width;
                        if (child.json.hin) {
                            child.json.hin.save_width = child.json.hin.width;
                            if (child.json.hin.v_width) child.json.hin.v_save_width = child.json.hin.v_width;
                        }
                    }
                    child.json.width = child.json.save_width + AppG.dx;
                    if (child.json.v_width) child.json.v_width = child.json.v_save_width + AppG.dx;
                    if (child.json.hin) {
                        child.json.hin.width = child.json.hin.save_width + AppG.dx;
                        if (child.json.hin.v_width) child.json.hin.v_width = child.json.hin.v_save_width + AppG.dx;
                    }
                }
            }
        }
        super._updateGameSize();
    }

    _formatContent() {
        this._onLocChange();
        super._formatContent();
    }

    /**     * @private     */
    _onLocChange() {
        this._tMinBet.text = OMY.StringUtils.findAndReplace(
            OMY.Omy.loc.getText("tournament_rules_rules_1"), ["%s", "%e"],
            this._formatCurrencyValue(AppG.tournament.minBet, true, true), AppG.currency);
        this._tMinBet2.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_rules_5"),
            this._formatCurrencyValue(AppG.tournament.minBetEuro, true));

        this._tPoints.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_rules_7"),
            AppG.tournament.rate, AppG.tournament.rate);
        this._tPoints2.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_rules_8"),
            AppG.tournament.rate, String(AppG.tournament.rate * 10));

        if(AppG.language == "deu") {
            this._tCashier.text = OMY.StringUtils.sprintf(
                OMY.Omy.loc.getText("tournament_rules_rules_11"),
                this._formatCurrencyValue(AppG.tournament.share, false, true), AppG.tournament.maxWinPlace);
        } else {
            this._tCashier.text = OMY.StringUtils.sprintf(
                OMY.Omy.loc.getText("tournament_rules_rules_11"),
                AppG.tournament.maxWinPlace, this._formatCurrencyValue(AppG.tournament.share, false, true));
        }
        
        this._tCashier2.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_rules_21"),
            this._formatCurrencyValue(AppG.tournament.share, false, true));

        this._tRules4.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_rules_4"),
           String(AppG.tournament.tournamentName));

        OMY.Omy.add.formatObjectsByY(this._cContent);
        this._cContent.y = this._cContent.json.y;
        this._cContent.emit("content_update");
    }

    revive() {
        super.revive();
        this._onLocChange();
    }

    destroy(options) {
        this._tMinBet = null;
        this._tMinBet2 = null;
        this._tPoints = null;
        this._tPoints2 = null;
        this._tCashier = null;
        this._tCashier2 = null;
        this._tRules4 = null;
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);
        super.destroy(options);
    }
}