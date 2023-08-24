import {AppG} from "../../../AppG";

export class CardHistoryBase {
    constructor(graphic) {
        this._gdConf = graphic.json;
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._graphic.addDestroy(this.destroy, this, true);
        this._cardList = [];
        for (let i = 0; i < this._graphic.numChildren; i++) {
            this._cardList.push(this._graphic.getChildByName("c_card_" + String(i)));
        }
        this._tweenTime = this._gdConf["time_tween"];
    }

    destroy() {
        this._gdConf = null;
        this._graphic = null;
        this._cardList.lengt = 0;
        this._cardList = null;
    }

    onUpdateHistory() {
        let i;
        let m = this._cardList.length;
        for (i = 0; i < m; i++) {
            OMY.Omy.remove.tween(this._cardList[i]);
            this._cardList[i].alpha = 1;
            this._cardList[i].x = this._cardList[i].json.x;
        }
        this.updateData();
    }

    updateData() {
        /** @type {OMY.OSprite} */
        let card;
        for (let i = 0; i < this._cardList.length; i++) {
            card = this._cardList[i];
            card.visible = i < AppG.lastCards.length;
            if (card.visible)
                card.getChildByName("s_suit").texture = this._gdConf[AppG.lastCards[AppG.lastCards.length - i - 1].suit];
        }
        card = null;
    }

    startMoveAnimation() {
        /** @type {OMY.OSprite} */
        let card;
        let moveX;
        for (let i = 0; i < this._cardList.length; i++) {
            card = this._cardList[i];
            if (this._cardList[i + 1])
                moveX = this._cardList[i + 1].json.x;
            else
                moveX = card.json.x + (card.json.x - this._cardList[i - 1].json.x);
            OMY.Omy.add.tween(card, {
                x: moveX,
                alpha: (i >= (this._cardList.length - 1)) ? 0 : 1,
                ease: "none"
            }, this._tweenTime);
        }
        card = null;
    }
}