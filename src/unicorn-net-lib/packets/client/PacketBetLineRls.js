/**
 * Created by boria on 11.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketBetLineRls extends PacketBase{
    constructor(bet, line, reels) {
        super();
        this.bet = Number.parseInt(bet);
        this.line = Number.parseInt(line);
        this.reels = Number.parseInt(reels);
        this.kind = 'BET_LINE_REELS';
    }
}