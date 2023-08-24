import {PacketBase} from './PacketBase';

export class PacketTournamentInfo extends PacketBase {
    constructor() {
        super();
        this.kind = 'TOURNAMENT_INFO';
    }
}
