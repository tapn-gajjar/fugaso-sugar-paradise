import {PacketBase} from '../PacketBase';

export class PacketFeature extends PacketBase{
    constructor(index) {
        super();
        this.kind = 'FEATURE';
        this.index = index;
    }
}