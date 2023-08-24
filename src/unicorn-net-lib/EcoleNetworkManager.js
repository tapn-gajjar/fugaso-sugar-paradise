import {Event} from './events/Event'
import {SlotNetworkManager} from './SlotNetworkManager'
import {PacketGambleLadder} from './packets/client/ecole/PacketGambleLadder'
import {PacketGambleLadderPlay} from './packets/client/ecole/PacketLadderPlay'
import {PacketGameDataRs} from './packets/server/PacketGameDataRs'
import {PacketGambleRate} from "./packets/client/ecole/PacketGambleRate";
import {PacketGambleRatePlay} from "./packets/client/ecole/PacketGambleRatePlay";
import {PacketFeature} from "./packets/client/ecole/PacketFeature";
import {PacketBonus} from "./packets/client/PacketBonus";

export class EcoleNetworkManager extends SlotNetworkManager {

    gambleLadder() {
        var packet = new PacketGambleLadder();
        this.socket.send(packet);
    }

    ladderPlay(){
        var packet = new PacketGambleLadderPlay();
        this.socket.send(packet);
    }

    gambleRate(){
        let packet = new PacketGambleRate();
        this.socket.send(packet);
    }

    gambleRatePlay(position){
        let packet = new PacketGambleRatePlay(position);
        this.socket.send(packet);
    }

    feature(position){
        let packet = new PacketFeature(position);
        this.socket.send(packet);
    }

    bonus(){
        let packet = new PacketBonus();
        this.socket.send(packet);
    }

    onmessage(event) {
        var input = JSON.parse(event.data);
        var packet = new PacketGameDataRs(input);
        var event = new Event(packet.kind, packet);
        this.fireEvent(event);
    }
}