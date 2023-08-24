import {PacketBase} from './PacketBase';

export class PacketRoulettePlay extends PacketBase{
    constructor(bets) {
        super();
        this.kind = 'PLAY';
        this.bets = bets;
    }
}