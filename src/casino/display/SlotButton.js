export class SlotButton {
    /**
     * @param{OMY.OButton||OMY.OButtonTween} graphic
     * @param{function} onClick
     * @param{Array} param
     */
    constructor(graphic, onClick = null, param = null) {
        /** @type {OMY.OButton||OMY.OButtonTween} */
        this._graphic = graphic;
        this._graphic.addDestroy(this._destroy, this);
        this._graphic.addKill(this._kill, this);
        this._graphic.addRevive(this._revive, this);
        this._graphic.addUp(this.onDoAction, this);
        this._graphic.slotButton = this;
        if (onClick)
            this._graphic.externalMethod(onClick, param);

        this._btnGameState = 0;
        this._activeStateList = [];
        this._noActiveStateList = [];
        this._alwaysAvailable = false;

        this._btnManager = OMY.Omy.navigateBtn;
        this._btnManager.addBtn(this, this.updateState, this.updateBlocking);
        this._buttonSound = null;

        this._ico = this._graphic.getChildByName("s_ico");
        if (this._ico) {
            this._graphic.addDown(this._onDownHandler, this);
            this._graphic.addUp(this._onUpHandler, this);
            this._graphic.addOut(this._onUpHandler, this);
            this._graphic.addOver(this._onOverHandler, this);
        }
    }

    _regActiveStates() {
        for (let i = 0; i < arguments.length; i++) {
            this._activeStateList.push(arguments[i]);
        }
    }

    _regNoActiveStates() {
        for (let i = 0; i < arguments.length; i++) {
            this._noActiveStateList.push(arguments[i]);
        }
    }

    updateState(state) {
        this._btnGameState = state;
        this.onStateUpdate();
    }

    updateBlocking(value) {
        if (this._alwaysAvailable) return;
        this._graphic.isBlock = value;
        if (!value) this.onStateUpdate();
    }

    onDoAction() {

    }

    onStateUpdate() {
        if (this._alwaysAvailable) return;
        if (this._activeStateList.indexOf(this._btnGameState) !== -1) {
            this.onActive();
        } else if (this._noActiveStateList.indexOf(this._btnGameState) !== -1) {
            this.onBlock();
        } else {
            this.onHide();
        }
    }

    onActive() {
        if (!this._btnManager.isScreenBlock) {
            if (this._ico && this._ico.json["out"]) this._ico.texture = this._ico.json["out"];
            this._graphic.isBlock = false;
        }
        if (!this._graphic.visible) this._graphic.visible = true;
    }

    onBlock() {
        if (this._ico && this._ico.json["block"]) this._ico.texture = this._ico.json["block"];
        this._graphic.isBlock = true;
        if (!this._graphic.visible) this._graphic.visible = true;
    }

    onHide() {
        this._graphic.isBlock = true;
        this._graphic.visible = false;
    }

    onKeyHandler() {
        this._graphic._inDown = true;
        this._graphic._up();
    }

    destroy() {
        this._graphic.destroy();
    }

    kill() {
        this._graphic.kill();
    }

    revive() {
        this._graphic.revive();
    }

    _destroy() {
        this._graphic.slotButton = null;
        this._graphic = null;
        this._btnManager.removeBtn(this, this.updateState, this.updateBlocking);
        this._btnManager = null;
        this._activeStateList.length = 0;
        this._noActiveStateList = null;
        this._ico = null;
    }

    _kill() {

    }

    _revive() {

    }

    /**     * @private     */
    _onDownHandler() {
        if (this._ico && this._ico.json["down"]) this._ico.texture = this._ico.json["down"];
    }

    /**     * @private     */
    _onUpHandler() {
        if (this._ico && this._ico.json["out"]) this._ico.texture = this._ico.json["out"];
    }

    /**     * @private     */
    _onOverHandler() {
        if (this._ico && this._ico.json["over"]) this._ico.texture = this._ico.json["over"];
    }

    set alwaysAvailable(value) {
        this._alwaysAvailable = value;
        this.onActive();
    }

    get graphic() {
        return this._graphic;
    }

    set buttonSound(value) {
        this._buttonSound = value;
    }

    get isBlock() {
        if (this._graphic)
            return this._graphic.isBlock;
        return false;
    }

    set isBlock(value) {
        if (this._graphic)
            this._graphic.isBlock = value;
    }
}