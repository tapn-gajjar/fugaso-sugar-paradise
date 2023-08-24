/**
 * Created by boria on 24.01.17.
 */
import {PacketBase} from './PacketBase';

export class PacketDrop extends PacketBase{
    constructor() {
        super();
        this.kind = 'DROP';
    }
}