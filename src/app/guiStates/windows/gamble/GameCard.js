import {GameCardBase} from "../../../../casino/gui/windows/gamble/GameCardBase";

export class GameCard extends GameCardBase {
    /**
     * @param {OMY.OContainer}graphic
     */
    constructor(graphic) {
        super(graphic);

        this._cardSuit = this._graphic.canvas.getChildByName("s_card").getChildByName("s_suit");
    }
}