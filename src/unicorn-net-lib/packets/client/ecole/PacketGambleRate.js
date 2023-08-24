import {PacketBase} from '../PacketBase';

export class PacketGambleRate extends PacketBase{
    constructor() {
        super();
        this.kind = 'GAMBLE_RATE';
    }
}