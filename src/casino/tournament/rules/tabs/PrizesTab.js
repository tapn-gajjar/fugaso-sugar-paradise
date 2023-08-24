import TabBase from "./TabBase";
import {AppG} from "../../../AppG";
import PrizeElement from "../elements/PrizeElement";

export default class PrizesTab extends TabBase {
    constructor(conf) {
        super(conf);
    }

    _createGraphic() {
        /** @type {OMY.OTextBitmap} */
        this._tCashier = this.getChildByName("t_cashier");
        this._tRulesPrize1 = this.getChildByName("t_tournament_rules_prize_1");
        this._isEditMode = Boolean(this._gdConf["debug_count"]);
        this._createElements();
        OMY.Omy.loc.addUpdate(this._onLocChange, this, false);
        this._onLocChange();
        super._createGraphic();
    }

    /**     * @private     */
    _createElements() {
        const rewards = AppG.tournament.rewards;
        if (rewards.length > 3) {
            /** @type {OMY.OContainer} */
            let element;
            this._elJson = this._gdConf["element"];
            let max = ((this._isEditMode) ? this._gdConf["debug_count"] + 3 : rewards.length);
            for (let i = 3; i < max; i++) {
                element = OMY.Omy.add.containerJson(this._cContent, this._elJson);
                element.name += String(i + 1);
                element.json.y += this._gdConf["step"] * (i - 3);
                element.y = element.json.y;
                if (!OMY.Omy.isDesktop) {
                    element.json.v_y += this._gdConf["v_step"] * (i - 3);
                    element.y = element.json.v_y;
                }
                new PrizeElement(element, rewards[i], this._formatCurrencyValue.bind(this), this._isEditMode);
            }
            if (!OMY.Omy.isDesktop) {
                element = OMY.Omy.add.containerJson(this._cContent, this._elJson);
                element.json.y += this._gdConf["step"] * (max - 3);
                element.y = element.json.y;
                element.json.v_y += this._gdConf["v_step"] * (max - 3);
                element.y = element.json.v_y;
                element.alpha = 0;
            }
        } else {
            this._cContent.getChildByName("t_tournament_rules_prize_5").destroy();
            this._cContent.getChildByName("t_tournament_rules_prize_6").destroy();
        }
    }

    /**     * @private     */
    _onLocChange() {
        this._tCashier.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_prize_3"),
            this._formatCurrencyValue(AppG.tournament.share));
        this._tRulesPrize1.text = OMY.StringUtils.sprintf(
            OMY.Omy.loc.getText("tournament_rules_prize_1"),
            String(AppG.tournament.tournamentName)
        );

        const rewards = AppG.tournament.rewards;
        let m = Math.min(3, rewards.length);
        for (let i = 0; i < m; i++) {
            if (this._cContent.getChildByName("t_" + rewards[i].place))
                this._cContent.getChildByName("t_" + rewards[i].place).text = OMY.StringUtils.sprintf(
                    OMY.Omy.loc.getText("tournament_rules_prize_10"),
                    this._formatCurrencyValue(rewards[i].reward));
        }
    }

    destroy(options) {
        this._elJson = null;
        this._tCashier = null;
        this._tRulesPrize1 = null;
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);
        super.destroy(options);
    }
}