/**
 * Created by boria on 10.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketGambleChoice extends PacketBase {
    constructor(color) {
        super();
        this.color = color;
        this.kind = 'GAMBLE_CHOICE';
    }
}