import {PacketBase} from '../PacketBase';

export class PacketGambleRatePlay extends PacketBase{
    constructor(position) {
        super();
        this.kind = 'GAMBLE_RATE_PLAY';
        this.position = position;
    }
}