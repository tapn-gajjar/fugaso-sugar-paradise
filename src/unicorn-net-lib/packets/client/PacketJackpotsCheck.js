/**
 * Created by boria on 04.07.17.
 */
import {PacketBase} from './PacketBase';

export class PacketJackpotsCheck extends PacketBase{
    constructor() {
        super();
        this.kind = 'JACKPOTS_CHECK';
    }
}