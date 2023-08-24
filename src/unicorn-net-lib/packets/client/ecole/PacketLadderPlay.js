import {PacketBase} from '../PacketBase';

export class PacketGambleLadderPlay extends PacketBase{
    constructor() {
        super();
        this.kind = 'GAMBLE_LADDER_PLAY';
    }
}