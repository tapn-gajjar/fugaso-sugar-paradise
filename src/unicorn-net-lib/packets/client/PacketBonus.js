import {PacketBase} from './PacketBase';

export class PacketBonus extends PacketBase{
    constructor(position) {
        super();
        this.position = Number.parseInt(position);
        this.kind = 'BONUS';
    }
}