/**
 * Created by boria on 09.08.16.
 */
import {PacketBaseRs} from './PacketBaseRs'

export const PacketGameDataType = {
    TYPE_INITIAL: 0,
    TYPE_PAYIN: 1,
    TYPE_SPIN: 2,
    TYPE_COLLECT: 3,
    TYPE_GAMBLE: 4,
    TYPE_REPLAY: 5,
    TYPE_EXTRA_SPIN: 10,
    TYPE_FREE_SPIN:11,

    GAMEMODE_QUESTION: 11,
    GAMEMODE_NORMAL: 1,
    GAMEMODE_FREE: 5,
    GAMEMODE_GAMBLE: 3
};

export class PacketGameDataRs extends PacketBaseRs{
    constructor(data) {
        super(data);
        /*var arr = data.substr(1);
        var split = data.split(Packets.SPLITTER);
        var pos = 0;
        var firstRow = split[pos++].substr(1);
        if (firstRow.charAt(0) === 'A') {
            this.subType = PacketGameDataType.TYPE_INITIAL;
            this.roomId = Number.parseInt(firstRow.substring(2, firstRow.length - 2));
            //NetLogger.writeDebug(byteArray.readASCIIString());//L,4816,100.0
            pos++;
            this.balance = Number.parseInt(split[pos++].substr(1));


            var curStr = split[pos++];//?R
            if (curStr.charAt(0) == 'C') {//C,0
                this.creditType = Number.parseInt(curStr.substr(2));
                pos += 2;
                //NetLogger.writeDebug(byteArray.readASCIIString());//T,0,0
                //NetLogger.writeDebug(byteArray.readASCIIString());//R----
            }
            curStr = split[pos++];
            var arrMbets = curStr.split(",");
            this.minBet = Number.parseInt(arrMbets[1]);
            this.maxBet = Number.parseInt(arrMbets[2]);
            //NetLogger.writeDebug(byteArray.readASCIIString());//I0
            //NetLogger.writeDebug(byteArray.readASCIIString());//H,0,0
            //NetLogger.writeDebug(byteArray.readASCIIString());//:n,Name
            this.lines = [];
            pos += 3;
            curStr = split[pos++];
            while (curStr.charAt(1) === 'l') {
                this.lines.push(curStr.substr(3));
                curStr = split[pos++];
            }
            this.reels = [];
            while (curStr.charAt(1) === 'r') {
                var arrReel = curStr.split(",");
                var category = Number.parseInt(arrReel[1]);
                if (category >= this.reels.length) {
                    this.reels.push([]);
                }
                this.reels[category].push(arrReel[2]);
                curStr = split[pos++];
            }
            //NetLogger.writeDebug(curStr);//:u,APPP
            curStr = split[pos++];
            this.wins = [];
            while (curStr.charAt(1) === 'w') {
                this.wins.push(curStr.substr(2));
                curStr = split[pos++];
            }
            //NetLogger.writeDebug(curStr);//s,0
            curStr = split[pos++];
            this.possLines = [];
            while (curStr.charAt(1) == "i") {
                this.possLines.push(Number.parseInt(curStr.substr(3)));
                curStr = split[pos++];
            }
            this.possBets = curStr.split(',').slice(2).map(v=>Number.parseInt(v));
            //NetLogger.writeDebug(byteArray.readASCIIString());//a,0,0
            //NetLogger.writeDebug(byteArray.readASCIIString());//:g,999,1000,-1
            pos += 2;
            curStr = split[pos++];//e,line,bet
            var arrEline = curStr.split(",");
            this.currLines = Number.parseInt(arrEline[1]);
            this.currBet = Number.parseInt(arrEline[2]);
            this.makeEndOfPacket(split, pos);
        } else {
            this.balance = Number.parseInt(firstRow.substr(1));
            var curStr = split[pos++];
            this.creditType = Number.parseInt(curStr.substring(2, curStr.length - 3));
            pos += 2;
            curStr = split[pos++];
            arrMbets = curStr.split(",");
            this.minBet = Number.parseInt(arrMbets[1]);
            this.maxBet = Number.parseInt(arrMbets[2]);
            var iparam = Number.parseInt(split[pos++].substr(1));//I0
            pos++;
            curStr = split[pos++];
            if (curStr.charAt(1) == "n") {
                this.subType = PacketGameDataType.TYPE_REPLAY;//REPLAY ------
            }
            else if (curStr.charAt(0) == "e") {
                this.subType = PacketGameDataType.TYPE_SPIN;
                var arrEline = curStr.split(",");
                this.currLines = Number.parseInt(arrEline[1]);
                this.currBet = Number.parseInt(arrEline[2]);
                this.makeEndOfPacket(split, pos);
                return;
            }
            this.subType = PacketGameDataType.TYPE_PAYIN;
            this.possLines = [];
            while (curStr.charAt(1) == "i") {
                this.possLines.push(Number.parseInt(curStr.substr(3)));
                curStr = split[pos++];
            }
            this.possBets = curStr.split(',').slice(2).map(v=>Number.parseInt(v));
            pos += 2;
            curStr = split[pos++];//e,line,bet
            arrEline = curStr.split(",");
            this.currLines = Number.parseInt(arrEline[1]);
            this.currBet = Number.parseInt(arrEline[2]);
            this.makeEndOfPacket(split, pos);
        }*/
    }

    makeEndOfPacket(split, pos) {

        pos++;
        //NetLogger.writeDebug(byteArray.readASCIIString());//b,1000,1000,0

        //FREESPINS -----------------CHECK //
        var curStr = split[pos++];
        if (curStr.charAt(0) == "f") {
            this.freeSpins = curStr;
            curStr = split[pos++];
        }
        this.gameMode = Number.parseInt(curStr.substr(2));
        if (this.gameMode === PacketGameDataType.GAMEMODE_GAMBLE) {
            this.subType = PacketGameDataType.TYPE_GAMBLE;
        }
        this.lastWin = Number.parseInt(split[pos++].substr(3));

        //QUESTION-----
        curStr = split[pos++];
        if (curStr == "q,1" || curStr == "q,0") {
            curStr = split[pos++];
        }
        this.gambleAmounts = [];
        while (curStr.charAt(0) === "q") {//q,
            var arrGam = curStr.split(",");
            this.gambleAmounts.push(Number.parseInt(arrGam[1]));
            curStr = split[pos++];
        }
        //GAMBLAMOUNTS

        this.lastCards = curStr;//h,CDCCCDH
        if (pos < split.length) {
            curStr = split[pos++];
            var rStopsArray = curStr.split(",");
            this.currentCat = Number.parseInt(rStopsArray[1]);
            this.numOfReels = Number.parseInt(rStopsArray[2]);
            this.reelStops = [];
            for (let i = 0; i < this.numOfReels; i++) {
                this.reelStops.push(Number.parseInt(rStopsArray[i + 3]));
            }
            if (pos < split.length) {
                //LINES
                curStr = split[pos++];
                this.linesWin = [];
                while (curStr.charAt(0) == "l" || curStr.charAt(0) == "d"
                || curStr.charAt(0) == "c") {
                    this.linesWin.push(curStr);
                    if (pos >= split.length) {
                        return;
                    }
                    curStr = split[pos++];
                }
                this.guessedAmounts = [];
                var arrGuess = curStr.split(",");
                this.guessedAmounts.push(Number.parseInt(arrGuess[1]));
                while (pos < split.length) {
                    curStr = split[pos++];
                    arrGuess = curStr.split(",");
                    this.guessedAmounts.push(Number.parseInt(arrGuess[1]));
                }
                //GUESSED AMOUNTS
            }

        }

    }
}