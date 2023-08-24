/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackTakeOne extends PacketBase{
    constructor() {
        super();
        this.kind = 'TAKE_ONE';
    }
}