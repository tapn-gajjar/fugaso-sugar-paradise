/**
 * Created by boria on 24.09.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBingoAskDraw extends PacketBase {
    constructor() {
        super();
        this.kind = 'ASK_DRAW';
    }
}