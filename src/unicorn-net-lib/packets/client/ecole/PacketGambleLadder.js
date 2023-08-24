import {PacketBase} from '../PacketBase';

export class PacketGambleLadder extends PacketBase{
    constructor() {
        super();
        this.kind = 'GAMBLE_LADDER';
    }
}