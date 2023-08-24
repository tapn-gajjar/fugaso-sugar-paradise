import {PacketBase} from '../PacketBase';

export class PacketBonus extends PacketBase{
    constructor(index) {
        super();
        this.kind = 'BONUS';
    }
}