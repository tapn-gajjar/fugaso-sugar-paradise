import {SimplexNetworkManager} from "./SimplexNetworkManager";
import {Packets} from "./packets/Packets";
import {PacketGameDataType} from "./packets/server/PacketGameDataRs";

export class SimplexController {
    constructor(session, host) {

        this.netManager = new SimplexNetworkManager(host,
            JSON.stringify(session),
            '000000', '50');
        $('#input-game').val(session.gameName);

        this.netManager.addListener(Packets.PKT_LOGIN_RS.name, e => {
            console.log('LOGIN RESPONSE: ', e.data);
        });

        this.netManager.addListener(Packets.PKT_CURRENCY_RS.name, e => {
            console.log('CURRENCY: ', e.data);
        });
        this.netManager.addListener(Packets.PKT_JOIN_RS.name, e => {
            console.log('JOIN RESPONSE ', e.data);
            var packet = e.data;
            this.tickets = packet.tickets;
        });
        this.netManager.addListener(Packets.PKT_JOIN_DATA_RS.name, e => {
            console.log('JOIN DATA: ', e.data);
        });
        this.netManager.addListener(Packets.PKT_HISTORY_RS.name, e => {
            console.log('HISTORY: ', e.data);
            $('#but-history').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_JACKPOTS_HISTORY_RS.name, e => {
            console.log('JACKPOTS HISTORY: ', e.data);
            $('#but-jackpots-history').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_JACKPOTS_RS.name, e => {
            console.log('JACKPOTS: ', e.data);
            $('#but-jackpots').attr('disabled', false);
            var jackpots = e.data.jackpots;
            $('#div-jackpots').find('input[type=text]').remove();
            $('#div-jackpots').find('p').remove();
            for (var key in jackpots) {
                $('#div-jackpots').append(`<p>${key}:</p><input type="text" value="${jackpots[key]}" readonly class="form-control">`);
            }

        });
        this.netManager.addListener(Packets.PKT_JACKPOTS_WIN_RS.name, e => {
            console.log('JACKPOTS WIN: ', e.data);
            $('#but-jackpots-check').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_BALANCE_RS.name, e => {
            console.log('BALANCE: ', e.data);
            $('#input-bal').val(e.data.balance);
        });

        this.netManager.addListener(Packets.PKT_CONDITION_RS.name, e => {
            console.log('CONDITION: ', e.data);
            $('#but-bet-line-reels').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_ERROR_RS.name, e => {
            console.log('ERROR: ', e.data);
            $('#but-connect').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_TOURNAMENT_INFO.name, e => {
            console.log('TOURNAMENT_INFO: ', e.data);
            $('#but-tournament-info').attr('disabled', false);
        });

        this.netManager.addListener(Packets.PKT_GAME_DATA_RS.name, e => {
            console.log('GAME DATA: ', e.data);
            var packet = e.data;
            this.balance = packet.balance;
            this.bet = packet.currBet;
            this.line = packet.currLines;
            this.denom = packet.currDenom;
            this.currReels = packet.currReels;
            $('#spin-bet').val(this.bet);
            $('#spin-line').val(this.line);
            $('#spin-denom').val(this.denom);
            $('#spin-reels').val(this.currReels);
            if (packet.freeSpins) {
                var arrFree = packet.freeSpins.split(",");
                this.freeSpins = Number.parseInt(arrFree[1]);
                this.freeDone = Number.parseInt(arrFree[2]);
            }
            $('#input-bal').val(this.balance);
            if (packet.subType === 'INITIAL') {
                console.log('Ping...')
                this.netManager.ping(1000 * 60 * 60);
                //this.netManager.payIn(this.tickets);
                this.reels = packet.reels;
                if (packet.nextAct === 'FREE_SPIN') {
                    $('#but-freespin').attr('disabled', false);
                } else if (packet.nextAct === 'RESPIN') {
                    $('#but-respin').attr('disabled', false);
                } else if (packet.nextAct === 'DROP') {
                    $('#but-drop').attr('disabled', false);
                }
                $('#but-freecollect').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.freeCollect();
                });
                $('#but-respin').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.respin();
                });

                $('#but-tournament-info').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.tournamentInfo();
                });

                $('#but-spin').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    $('#but-collect').attr('disabled', true);
                    $('#but-gamble').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                    if (this.freeSpins - this.freeDone > 0) {
                        this.netManager.freeSpin();
                    } else {
                        this.netManager.spin();
                    }
                });
                $('#but-collect').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.collect();
                });
                $('#but-gamble').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.gamble();
                });
                $('#but-freespin').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.freeSpin();
                });
                $('#but-gplay').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    if ($('#radio-black').is(':checked')) {
                        this.netManager.gambleBlack();
                    } else {
                        this.netManager.gambleRed();
                    }
                });
                $('#but-bet-line').click(e => {
                    this.bet = $('#spin-bet').val();
                    this.line = $('#spin-line').val();
                    this.netManager.betLine(this.bet, this.line);
                });
                $('#but-bet-spin').click(e => {
                    this.bet = $('#spin-bet').val();
                    this.line = $('#spin-line').val();
                    this.denom = $('#spin-denom').val();
                    this.betCounter = $('#spin-bet-counter').val();
                    this.netManager.betSpin(this.bet, this.line, this.denom, this.betCounter);
                });
                $('#but-drop').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.drop();
                });
                $('#but-history').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.getHistory(10);
                });
                $('#but-jackpots').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.getJackpots();
                });
                $('#but-bet-line-reels').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.bet = $('#spin-bet').val();
                    this.line = $('#spin-line').val();
                    this.currReels = $('#spin-reels').val();
                    this.netManager.betLineReels(this.bet, this.line, this.currReels);
                });
                $('#but-jackpots-check').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.checkJackpots();
                });
                $('#but-jackpots-history').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.jackpotHistory();
                });
                $('#but-bonus').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    let position = $('#spin-position').val();
                    this.netManager.bonus(position);
                });
                $('#but-bonus').attr('disabled', packet.nextAct !== 'BONUS');
                this.rows = $('#input-rows').val() ? Number.parseInt($('#input-rows').val()) : 3;
                this.printPacket(packet);
            } else if (packet.subType === PacketGameDataType.TYPE_PAYIN) {

            } else if (packet.subType === 'SPIN' || packet.subType === 'COLLECT' || packet.subType === 'GAMBLE_PLAY' ||
                packet.subType === 'FREE_SPIN' || packet.subType === 'FREE_COLLECT' || packet.subType === 'RESPIN' || packet.subType === 'DROP' ||
                packet.subType === 'BONUS') {
                let matrix = packet.result.special.matrix;
                this.printPacket(packet);
                $('#but-spin').attr('disabled', false);
                $('#but-bet-spin').attr('disabled', false);
                $('#but-drop').attr('disabled', true);

                if (packet.nextAct === 'RESPIN') {
                    $('#but-respin').attr('disabled', false);
                    $('#but-spin').attr('disabled', true);
                }
                if (packet.nextAct === 'COLLECT') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-bet-spin').attr('disabled', true);
                    $('#but-spin').attr('disabled', true);
                }
                if (packet.nextAct === 'FREE_COLLECT') {
                    $('#but-freecollect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-freespin').attr('disabled', true);
                }
                if (packet.nextAct === 'FREE_SPIN') {
                    $('#but-freespin').attr('disabled', false);
                    $('#but-freecollect').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                }
                if (packet.nextAct === 'BET') {
                    $('#but-bet-spin').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                    $('#but-bet-line-reels').attr('disabled', false);
                }
                if (packet.nextAct === 'DROP') {
                    $('#but-drop').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                }
                if (packet.nextAct === 'BONUS') {
                    $('#but-bonus').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                }
            } else if (packet.subType === 'GAMBLE_PLAY') {
                $('#but-gplay').attr('disabled', false);
                var text = `REEL-STOPS: ${packet.result.stops} \r\nLAST-WIN: ${packet.result.total}\r\nLINES-WIN: ${packet.result.wins}\r\n` +
                    `CARDS: ${packet.result.cards}\r\nFREE-GAMES: ${packet.free}`;
                $('#text-res').val(text);
            }
        });

        this.netManager.connect(this.onerror);
    }

    printPacket(packet) {
        let reels = this.reels[packet.category];
        let stops = packet.result.stops;
        let screen = new Array();
        if (packet.result.special && packet.result.special.categories) {
            let categories = packet.result.special.categories;
            for (let i = 0; i < this.rows; i++) {
                let col = "";
                for (let j = 0; j < stops.length; j++) {
                    let reels = this.reels[categories[i]];
                    let reel = reels[0];
                    col += this.getCharAt(stops[j] + i, reel) + '\t';
                }
                screen.push(col);
            }
        } else if (reels.length < 30) {
            for (let i = 0; i < this.rows; i++) {
                let col = "";
                for (let j = 0; j < stops.length; j++) {
                    let reel = reels[j];
                    col += this.getCharAt(stops[j] + i, reel) + '\t';
                }
                screen.push(col);
            }
        } else {
            for (let i = 0; i < 5; i++) {
                let col = "";
                for (let j = 0; j < 6; j++) {
                    let pos = i * 6 + j;
                    let reel = reels[pos];
                    col += this.getCharAt(stops[pos], reel) + '\t';
                }
                screen.push(col);
            }
        }
        var special = JSON.stringify(packet.result.special);
        if (packet.result.special) {
            if (packet.result.special.matrix) {
                var matrix = packet.result.special.matrix;
                if (matrix.length) {
                    var mats = new Array();
                    for (let i = 0; i < this.rows; i++) {
                        let col = "";
                        for (let j = 0; j < stops.length; j++) {
                            let pos = i * stops.length + j;
                            let reel = matrix[pos];
                            col += reel + '\t';
                        }
                        mats.push(col);
                    }
                    special = mats.join('\n');
                }
            }
        }
        var text = `REEL-STOPS: ${packet.result.stops} \r\nLAST-WIN: ${packet.result.total}\r\nLINES-WIN: ${packet.result.wins}\r\n` +
            `CARDS: ${packet.result.cards.map(c => c.suit)}\r\nFREE-GAMES: ${JSON.stringify(packet.free)}` +
            `\r\nNEXT-ACT: ${packet.nextAct}\r\nSPECIAL:\n${special}` +
            `\r\nPROMO: ${JSON.stringify(packet.promo)}` +
            `\r\nHOLDS: ${packet.result.holds}`+
            `\r\nREELS: \r\n${screen.join('\r\n')}\r\n<--------------------->`;
        $('#text-res').val(text);
    }

    getCharAt(pos, str) {
        //console.log('BEFORE: ',Math.floor(pos / str.length));
        pos -= str.length * Math.floor((pos / str.length));
        //console.log('POSITION: ',pos);
        return str.charAt(pos);
    }

    onclose() {
        console.log('CLOSED');
    }

    onerror(request, textStatus, errorThrown) {
        console.log('Error ', request.status, textStatus, errorThrown);
        $('#but-connect').attr('disabled', false);
    }
}
