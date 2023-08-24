import {PacketBase} from './PacketBase';

export class PacketRouletteStats extends PacketBase{
    constructor() {
        super();
        this.kind = 'STATISTICS';
    }
}