import {AppG} from "../../AppG";
import {HistoryRoundData} from "../../../app/data/HistoryData";

/**
 * Extended method for char at position
 * @param {int} index
 * @returns {string}
 */
String.prototype.charAtExt = function (index) {
    var str = this;
    if (index < 0)
        index = str.length + index + str.length * parseInt(index / str.length);
    else
        index -= str.length * parseInt(index / str.length);
    return str.charAt(index);
};

export class HistoryBlockBase extends OMY.OContainer {
    constructor(soundBtn = null) {
        super();
        this._gdConf = this.json = OMY.Omy.assets.getJSON("GDHistoryBlock");
        this.HISTORY_ITEMS_NUMBER = 10;
        this.HISTORY_ACTIONS_NUMBER = 7;
        this.setXY(this._gdConf.x, this._gdConf.y);
        if (!this._gdConf["symbol"].hasOwnProperty("dx")) this._gdConf["symbol"]["dx"] = 0;

        this._isShowHistory = false;
        this._isShowView = false;
        this._soundBtn = soundBtn;

        OMY.Omy.add.createEntities(this, this._gdConf);

        /** @type {OMY.OContainer} */
        this._container = this.getChildByName("c_container");
        /**
         * List with round items
         * @type {Array.<HistoryItem>}
         * @private
         */
        this._items = [];
        for (let i = 0; i < this.HISTORY_ITEMS_NUMBER; i++) {
            let item = new HistoryItem(this._container.getChildByName("c_item_" + String(i)), i,
                this._onItemHandler.bind(this), this._onItemOverHandler.bind(this));
            this._container.getChildByName("c_item_" + String(i)).visible = false;
            this._items.push(item);
        }

        /** @type {OMY.OContainer} */
        this._containerExtra = this.getChildByName("c_extra");
        this._currViewItem = new HistoryItem(this._containerExtra.getChildByName("c_item_view"), 0);
        /**
         * List with actions items
         * @type {Array.<HistoryAction>}
         * @private
         */
        this._actions = [];
        for (let i = 0; i < this.HISTORY_ACTIONS_NUMBER; i++) {
            let item = new HistoryAction(this._containerExtra.getChildByName("c_action_item_" + String(i)), i,
                this._onActionHandler.bind(this), this._onActionOverHandler.bind(this));
            this._containerExtra.getChildByName("c_action_item_" + String(i)).visible = false;
            this._actions.push(item);
        }

        /** @type {OMY.OTextFont} */
        this._txtActionsPageNumber = this._containerExtra.getChildByName("t_page_number");
        /** @type {OMY.OButtonTween} */
        this._btnActionsNextPage = this._containerExtra.getChildByName("b_right");
        this._btnActionsNextPage.externalMethod(this._onNextActionsPage.bind(this));
        /** @type {OMY.OButtonTween} */
        this._btnActionsPrevPage = this._containerExtra.getChildByName("b_left");
        this._btnActionsPrevPage.externalMethod(this._onPrevActionsPage.bind(this));

        /** @type {OMY.OButton} */
        this._btnClose = this.getChildByName("b_close");
        this._btnClose.externalMethod(this._onCloseHandler.bind(this));

        /** @type {OMY.OContainer} */
        this._view = this._containerExtra.getChildByName("c_reels");
        this._containerExtra.kill();

        this.kill();

        AppG.serverWork.addOnGetHistory(this._onHistoryResponse, this);
    }

//---------------------------------------
/// PUBLIC
//---------------------------------------

    /**
     * Override history block revive method
     */
    revive() {
        super.revive();
        if (!this._isShowHistory) {
            this._isShowHistory = true;

            if (this._containerExtra.active)
                this._containerExtra.kill();
            this._container.visible = true;

            AppG.serverWork.getHistory(this.HISTORY_ITEMS_NUMBER);
            this._hideHistoryItems();
            this._clearHistoryActions();
            this._btnClose.visible = false;
        }
    }

    kill() {
        if (this._isShowHistory) {
            if (this._isShowView) {
                this._isShowView = false;
                this._view.canvas.callAll("destroy");
            }
            this._isShowHistory = false;
        }
        super.kill();
    }

//---------------------------------------
/// PRIVATE
//------

    /**
     * On get response from server
     * @param {HistoryData} historyData
     * @private
     */
    _onHistoryResponse(historyData) {
        if (!this._isShowHistory)
            return;

        let rounds = historyData.rounds;
        for (let i = 0; i < this.HISTORY_ITEMS_NUMBER; i++) {
            /**
             * @type {HistoryItem}
             */
            let item = this._items[i];
            if (!item)
                continue;

            let round = rounds[i];
            if (!round)
                continue;

            item.graphic.visible = true;
            item.date = new Date(round.date).toLocaleString("en-GB", {dateStyle: 'short'});
            item.type = round.type;
            item.roundId = String(round.roundId);
            item.bet = [round.bet.toFixed(2), AppG.currency].join(" ");
            item.win = [round.win.toFixed(2), AppG.currency].join(" ");
            item.balance = [round.balance.toFixed(2), AppG.currency].join(" ");
            item.data = round;
        }
    }

    _onActionOverHandler() {

    }

    /**
     * On click to action item
     * @param {HistoryAction} item
     * @private
     */
    _onActionHandler(item) {
        if (!this._isShowView)
            return;

        this._currAction !== item && OMY.Omy.sound.play(this._soundBtn);
        if (this._currAction)
            this._currAction.highlight = false;

        this._currAction = item;
        this._currAction.highlight = true;
        this._view.canvas.callAll("destroy");

        switch (this._currAction.data.description) {
            case HistoryRoundData.ACTION_JACKPOT: {
                this._drawJackpot(this._currAction.data);
                break;
            }

            case HistoryRoundData.ACTION_TOURNAMENT: {
                this._drawTournament(this._currAction.data);
                break;
            }

            case HistoryRoundData.ACTION_GAMBLE_PLAY: {
                this._drawGamble(this._currAction.data);
                break;
            }

            default: {
                this._drawSymbols(this._currAction.data);
                break;
            }
        }

        this._pageWithActiveAction = this._currPageNumber;
    }

    _onItemOverHandler() {

    }

    /**
     * On click to history item
     * @param {HistoryItem} item
     * @private
     */
    _onItemHandler(item) {
        if (this._isShowView)
            return;

        OMY.Omy.sound.play(this._soundBtn);
        let round = item.data;
        this._currViewItem.date = new Date(round.date).toLocaleString("en-GB", {dateStyle: 'short'});
        this._currViewItem.type = round.type;
        this._currViewItem.roundId = String(round.roundId);
        this._currViewItem.bet = [round.bet.toFixed(2), AppG.currency].join(" ");
        this._currViewItem.win = [round.win.toFixed(2), AppG.currency].join(" ");
        this._currViewItem.balance = [round.balance.toFixed(2), AppG.currency].join(" ");
        this._currViewItem.data = round;

        this._containerExtra.revive();
        this._btnClose.visible = true;

        this._currPageNumber = 1;
        this._totalPageNumbers = Math.ceil(this._currViewItem.data.actionsList.length / this._actions.length);
        this._txtActionsPageNumber.visible = this._totalPageNumbers > 1;
        this._btnActionsNextPage.visible = this._totalPageNumbers > 1;
        this._btnActionsPrevPage.visible = this._totalPageNumbers > 1;
        this._onSetActionsPage(this._currPageNumber);

        this._isShowView = true;
        this._container.visible = false;
        this._clearHistoryActions();
        this._fillActions();

        this._pageWithActiveAction = 1;
        this._currAction = this._actions[0];
        this._currAction.highlight = true;
        this._view.canvas.callAll("destroy");

        if (!this._currAction.data) return;
        switch (this._currAction.data.description) {
            case HistoryRoundData.ACTION_JACKPOT: {
                this._drawJackpot(this._currAction.data);
                break;
            }
            case HistoryRoundData.ACTION_TOURNAMENT: {
                this._drawTournament(this._currAction.data);
                break;
            }

            case HistoryRoundData.ACTION_GAMBLE_PLAY: {
                this._drawGamble(this._currAction.data);
                break;
            }

            default: {
                this._drawSymbols(this._currAction.data);
                break;
            }
        }
    }

    /**
     * Fill view with actions
     * @private
     */
    _fillActions() {
        if (!this._isShowHistory)
            return;

        let actions = this._currViewItem.data.actionsList;
        for (let i = 0; i < this.HISTORY_ITEMS_NUMBER; i++) {
            /**
             * @type {HistoryAction}
             */
            let item = this._actions[i];
            if (!item)
                continue;

            let action = actions[this._actionsOffset + i];
            if (!action) {
                item.graphic.visible = false;
                item.actionId = null;
                item.description = null;
                item.data = null;
                continue;
            }
            item.graphic.visible = true;
            item.actionId = String(action.actionId);
            item.description = String(action.langKey);
            item.data = action;
        }
    }

    /**
     * Hide history items
     * @private
     */
    _hideHistoryItems() {
        for (let i = 0; i < this.HISTORY_ITEMS_NUMBER; i++) {
            /**
             * @type {HistoryItem}
             */
            let item = this._items[i];
            if (!item)
                continue;

            item.graphic.visible = false;
        }
    }

    /**
     * Hide history items
     * @private
     */
    _clearHistoryActions() {
        for (let i = 0; i < this.HISTORY_ACTIONS_NUMBER; i++) {
            /**
             * @type {HistoryAction}
             */
            let item = this._actions[i];
            if (!item)
                continue;

            item.graphic.visible = false;
            item.highlight = false;
        }
    }

    /**
     * Click next page with actions
     * @private
     */
    _onNextActionsPage() {
        OMY.Omy.sound.play(this._soundBtn);
        this._currPageNumber++;
        if (this._currPageNumber > this._totalPageNumbers) {
            // this._currPageNumber = 1;
            this._currPageNumber = this._totalPageNumbers;
            return;
        }
        this._onSetActionsPage(this._currPageNumber);
    }

    /**
     * Click previous page with actions
     * @private
     */
    _onPrevActionsPage() {
        OMY.Omy.sound.play(this._soundBtn);
        this._currPageNumber--;
        if (this._currPageNumber < 1) {
            // this._currPageNumber = this._totalPageNumbers;
            this._currPageNumber = 1;
            return;
        }
        this._onSetActionsPage(this._currPageNumber);
    }

    /**
     * Set custom page with actions
     * @param {int} pageNumber
     * @private
     */
    _onSetActionsPage(pageNumber) {
        this._actionsOffset = (pageNumber - 1) * this._actions.length;
        this._txtActionsPageNumber.text = String(pageNumber);
        this._btnActionsPrevPage.isBlock = this._currPageNumber <= 1;
        this._btnActionsNextPage.isBlock = this._currPageNumber >= this._totalPageNumbers;
        this._clearHistoryActions();
        this._fillActions();

        if (this._currAction)
            this._currAction.highlight = this._currPageNumber == this._pageWithActiveAction;
    }

    /**
     * Handler click by close button
     * @private
     */
    _onCloseHandler() {
        if (this._isShowView) {
            OMY.Omy.sound.play(this._soundBtn);
            this._isShowView = false;
            this._view.canvas.callAll("destroy");
            if (this._containerExtra.active)
                this._containerExtra.kill();
            this._container.visible = true;
            this._btnClose.visible = false;
        }
    }

    /**
     * Draw win symbols at history view block
     * @param {HistoryActionData} data
     */
    _drawSymbols(data) {
        let stopList = data.stopList;
        let category = data.category;
        let special = data.special;
        if (!stopList || !stopList.length) {
            return;
        }

        let totalReel = AppG.totalReel;
        let countSlot = AppG.gameConst.countSlot;
        let symbolWidth = AppG.gameConst.symbolWidth;
        let symbolHeight = AppG.gameConst.symbolHeight;
        let reels = AppG.serverWork.getReelsByCategory(category);

        for (let i = 0; i < totalReel; i++) {
            /**
             * @type {string}
             */
            let reel = reels[i];
            let stopIndex = stopList[i];
            for (let j = 0; j < countSlot; j++) {
                let symbolKey = reel.charAtExt(stopIndex + j);
                let symbolIndex = AppG.gameConst.symbolID(symbolKey);
                /** @type {OMY.OSprite} */
                let symbol = OMY.Omy.add.spriteJson(this._view.canvas, this._gdConf["symbol"]);
                symbol.texture = this._gdConf["texture"] + String(symbolIndex);
                symbol.x = i * (symbolWidth + symbol.json.dx);
                symbol.y = j * symbolHeight;
                symbol.name = "s_" + String(i) + "_" + String(j);
                symbol.userData = symbolKey;
            }
        }
        this._view.alignContainer();
    }

    /**
     * Draw win tournament at history view block
     * @param {HistoryActionData} data
     */
    _drawTournament(data) {
        if (!data.haveTournament) return;
        OMY.Omy.add.createEntities(this._view.canvas, this._gdConf["tournament"]);
        this._updateWinPlace(this._view.canvas.getChildByName("tournament_finaly_2"), data.tournamentWin, data.tournamentPlace + 1);
        this._view.alignContainer();
    }

    /**     * @private     */
    _updateWinPlace(textField, amount, place) {
        let winValue = AppG.formatCurrency(amount);
        winValue = OMY.StringUtils.replaceAll(winValue, " ", " ");
        winValue = OMY.StringUtils.replaceAll(winValue, " ", " ");
        place = String(place);
        switch (AppG.language) {
            case "gb":
            case "can":
            case "eng": {
                if (place.charAt(place.length - 1) === "1") {
                    if (place.length > 1 && place.charAt(place.length - 2) === "1")
                        place += "TH"
                    else
                        place += "ST";
                } else if (place.charAt(place.length - 1) === "2") {
                    if (place.length > 1 && place.charAt(place.length - 2) === "1")
                        place += "TH"
                    else
                        place += "ND";
                } else if (place.charAt(place.length - 1) === "3") {
                    if (place.length > 1 && place.charAt(place.length - 2) === "1")
                        place += "TH"
                    else
                        place += "RD";
                } else {
                    place += "TH"
                }
                break;
            }
            case "fra": {
                if (Number(place) === 1)
                    place += "ER"
                else
                    place += "E";
                break;
            }
            case "rus": {
                if (place.charAt(place.length - 1) === "3" && place.charAt(place.length - 2) !== "1")
                    place += "ИМ"
                else
                    place += "ЫМ";
                break;
            }
            case "swe": {
                if (Number(place) === 1 || Number(place) === 2)
                    place += ":a"
                else
                    place += ":e";
                break;
            }
            case "ukr": {
                if (place.charAt(place.length - 1) === "3")
                    place += "ІМ"
                else
                    place += "ИМ";
                break;
            }
        }
        let locText = OMY.StringUtils.sprintfCustom(OMY.Omy.loc.getText("tournament_finaly_2"), "%e", AppG.currency);
        textField.text = OMY.StringUtils.sprintf(locText, place, String(winValue));
    }

    /**
     * Draw win jackpot at history view block
     * @param {HistoryActionData} data
     */
    _drawJackpot(data) {
        if (!data.haveJackpot) return;
        OMY.Omy.add.createEntities(this._view.canvas, this._gdConf["jackpot"]);
        /** @type {OMY.OTextNumberBitmap} */
        let buffer = this._view.canvas.getChildByName("t_win");
        buffer.showCent = true;
        buffer.lastText = " " + AppG.currency;
        buffer.setNumbers(data.mJackpotWin);
        /** @type {OMY.OTextBitmap} */
        buffer = this._view.canvas.getChildByName("t_label_loc");
        buffer.text = buffer.json["loc_data"][data.mJackpotName];
        this._view.alignContainer();
    }

    /**
     * @param {HistoryActionData}data
     * @private
     */
    _drawGamble(data) {
        let cards = data.cards;
        let playerChoice = data.choice;
        if (!cards || !cards.length || !playerChoice)
            return;

        OMY.Omy.add.createEntities(this._view.canvas, this._gdConf["gamble"]["entities"]);
        let frame;
        /** @type {OMY.OContainer} */
        let cardCanvas = this._view.canvas.getChildByName("c_history");
        for (let i = 0; i < cardCanvas.numChildren; i++) {
            if (i < cards.length) {
                frame = this._gdConf["gamble"][cards[cards.length - i - 1]];
            }
            this._changeGambleCard(cardCanvas.children[i], frame);
        }

        /** @type {OMY.OSprite} */
        let colorChoice = this._view.canvas.getChildByName("s_color");
        colorChoice.texture = colorChoice.json[playerChoice];

        this._view.alignContainer();
    }

    /**
     * @param {OMY.OContainer}card
     * @param {object}cardData
     * @private
     */
    _changeGambleCard(card, cardData) {
        if (!cardData) {
            card.setAll("visible", false);
            card.getChildByName("s_card_back").visible = true;
            card.getChildByName("s_card_back").texture = this._gdConf["gamble"]["close"];
            return;
        }
        /** @type {OMY.OSprite} */
        let img = card.getChildByName("s_suit");
        img.texture = cardData;
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------
}

class HistoryItem {
    /**
     * @param {OMY.OContainer}graphic
     * @param {Number}index
     * @param {Function}onUpCallback
     * @param {Function}onOverCallback
     */
    constructor(graphic, index, onUpCallback, onOverCallback) {
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._index = index;
        this._onOverCallback = onOverCallback;

        this._data = null;

        this._txtDate = this._graphic.getChildByName("t_date");
        this._txtType = this._graphic.getChildByName("t_type");
        this._txtRoundId = this._graphic.getChildByName("t_round_id");
        this._txtBet = this._graphic.getChildByName("t_bet");
        this._txtWin = this._graphic.getChildByName("t_win");
        this._txtBalance = this._graphic.getChildByName("t_balance");

        if (onUpCallback) {
            this._graphic.input = true;
            this._graphic.externalMethod(onUpCallback, [this]);
            this._onOverCallback && this._graphic.addOver(this._onOverGraphic, this);
        }
    }

    /**     * @private     */
    _onOverGraphic() {
        this._onOverCallback();
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * Set date
     * @param {string} value
     */
    set date(value) {
        if (!this._txtDate)
            return;

        this._txtDate.text = value;
    }

    /**
     * Set type
     * @param {string} value
     */
    set type(value) {
        if (!this._txtType)
            return;

        this._txtType.text = value;
    }

    /**
     * Set game name
     * @param {string} value
     */
    set roundId(value) {
        if (!this._txtRoundId)
            return;

        this._txtRoundId.text = value;
    }

    /**
     * Set bet
     * @param {string} value
     */
    set bet(value) {
        if (!this._txtBet)
            return;

        this._txtBet.text = value;
    }

    /**
     * Set win
     * @param {string} value
     */
    set win(value) {
        if (!this._txtWin)
            return;

        this._txtWin.text = value;
    }

    /**
     * Set balance
     * @param {string} value
     */
    set balance(value) {
        if (!this._txtBalance)
            return;

        this._txtBalance.text = value;
    }

    /**
     * Set round data
     * @param {HistoryRoundData|null} value
     */
    set data(value) {
        this._data = value;
    }

    /**
     * Get round data
     * @returns {HistoryRoundData|null}
     */
    get data() {
        return this._data;
    }

    /**
     * @returns {OMY.OContainer}
     */
    get graphic() {
        return this._graphic;
    }
}

class HistoryAction {
    /**
     * @param {OMY.OContainer}graphic
     * @param {Number}index
     * @param {Function}onUpCallback
     * @param {Function}onOverCallback
     */
    constructor(graphic, index, onUpCallback, onOverCallback) {
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._index = index;
        this._onOverCallback = onOverCallback;

        this._data = null;
        this._isHighlighted = false;

        /** @type {OMY.OSprite} */
        this._iHighlight = this._graphic.getChildByName("i_highlight");
        this.highlight = false;

        this._txtActionId = this._graphic.getChildByName("t_action");
        this._txtDescription = this._graphic.getChildByName("t_desk");

        if (onUpCallback) {
            this._graphic.input = true;
            this._graphic.externalMethod(onUpCallback, [this]);
            this._onOverCallback && this._graphic.addOver(this._onOverGraphic, this);
        }
    }

    /**     * @private     */
    _onOverGraphic() {
        this._onOverCallback();
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * Get highlighted state of history action
     * @returns {boolean}
     */
    get highlight() {
        return this._isHighlighted;
    }

    /**
     * Set highlighted state for history action
     * @param {boolean} value
     */
    set highlight(value) {
        this._isHighlighted = value;

        this._iHighlight.visible = this._isHighlighted;
    }

    /**
     * Set action id
     * @param {string} value
     */
    set actionId(value) {
        if (!this._txtActionId)
            return;

        this._txtActionId.text = value;
    }

    /**
     * Set description
     * @param {string} value
     */
    set description(value) {
        if (!this._txtDescription)
            return;
        value = value || "";
        this._txtDescription.text = value;
    }

    /**
     * Set round data
     * @param {HistoryActionData|null} value
     */
    set data(value) {
        this._data = value;
    }

    /**
     * Get round data
     * @returns {HistoryActionData|null}
     */
    get data() {
        return this._data;
    }

    /**
     * @returns {OMY.OContainer}
     */
    get graphic() {
        return this._graphic;
    }
}
