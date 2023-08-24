import {EcoleNetworkManager} from './EcoleNetworkManager'
import {EcolePackets} from './packets/EcolePackets'

export class EcoleController {
    constructor(session, host) {
        /*this.gameName = "bookoftattoo";
         var session = {
         "userName": "toker",
         "sessionId": "1750",
         "operatorId": "1700",
         "mode": "static",
         "gameName": this.gameName
         };*/

        this.netManager = new EcoleNetworkManager(host,
            JSON.stringify(session),
            '000000', '50');
        $('#input-game').val(session.gameName);

        this.netManager.addListener(EcolePackets.LOGIN, e => {
            console.log('LOGIN RESPONSE: ', e.data);
        });

        this.netManager.addListener(EcolePackets.CURRENCY, e => {
            console.log('CURRENCY: ', e.data);
        });
        this.netManager.addListener(EcolePackets.JOIN, e => {
            console.log('JOIN RESPONSE ', e.data);
            var packet = e.data;
            this.tickets = packet.tickets;
        });
        this.netManager.addListener(EcolePackets.JOIN_DATA, e => {
            console.log('JOIN DATA: ', e.data);
        });
        this.netManager.addListener(EcolePackets.HISTORY, e => {
            console.log('HISTORY: ', e.data);
            $('#but-history').attr('disabled', false);
        });
        this.netManager.addListener(EcolePackets.JACKPOTS, e => {
            console.log('JACKPOTS: ', e.data);
            $('#but-jackpots').attr('disabled', false);
            var jackpots = e.data.jackpots;
            $('#div-jackpots').find('input[type=text]').remove();
            $('#div-jackpots').find('p').remove();
            for (var key in jackpots) {
                $('#div-jackpots').append(`<p>${key}:</p><input type="text" value="${jackpots[key]}" readonly class="form-control">`);
            }

        });
        this.netManager.addListener(EcolePackets.JACKPOTS_WIN, e => {
            console.log('JACKPOTS WIN: ', e.data);
            $('#but-jackpots-check').attr('disabled', false);
        });
        this.netManager.addListener(EcolePackets.BALANCE, e => {
            console.log('BALANCE: ', e.data);
            $('#input-bal').val(e.data.equity);
        });

        this.netManager.addListener(EcolePackets.CONDITION, e => {
            console.log('CONDITION: ', e.data);
            $('#but-bet-line-reels').attr('disabled', false);
        });
        this.netManager.addListener(EcolePackets.ERROR, e => {
            console.log('ERROR: ', e.data);
        });

        this.netManager.addListener(EcolePackets.GAME_DATA, e => {
            console.log('GAME DATA: ', e.data);
            var packet = e.data;
            this.equity = packet.equity;
            this.bet = packet.nowBet;
            this.line = packet.nowFigures;
            this.denom = packet.nowDenom;
            this.currReels = packet.nowReels;
            $('#spin-bet').val(this.bet);
            $('#spin-line').val(this.line);
            $('#spin-denom').val(this.denom);
            $('#spin-reels').val(this.currReels);
            if (packet.freeSpins) {
                var arrFree = packet.freeSpins.split(",");
                this.freeSpins = Number.parseInt(arrFree[1]);
                this.freeDone = Number.parseInt(arrFree[2]);
            }
            $('#input-bal').val(this.equity);
            if (packet.breed === 'INITIAL') {
                //this.netManager.ping();
                //this.netManager.payIn(this.tickets);
                this.reels = packet.wheels;
                $('#but-freespin').attr('disabled', packet.afterReact !== 'FREE_SPIN');
                $('#but-feature').attr('disabled', packet.afterReact !== 'FEATURE');
                $('#but-bonus').attr('disabled', packet.afterReact !== 'BONUS');
                $('#but-grate-play').attr('disabled', packet.afterReact !== 'GAMBLE_RATE_PLAY');
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
                $('#but-gamble-ladder').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.gambleLadder();
                });
                $('#but-ladder-play').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.ladderPlay();
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
                    this.netManager.betSpin(this.bet, this.line, this.denom);
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
                $('#but-grate').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.gambleRate();
                });
                $('#but-grate-play').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.gambleRatePlay(2);
                });
                $('#but-feature').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    let position = Number.parseInt($('#spin-feature').val());
                    this.netManager.feature(position);
                });
                $('#but-bonus').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.bonus();
                });
                this.printPacket(packet);
            } else if (packet.breed === 'SPIN' || packet.breed === 'COLLECT' || packet.breed === 'GAMBLE_PLAY' ||
                packet.breed === 'LADDER_PLAY' ||
                packet.breed === 'FREE_SPIN' || packet.breed === 'FREE_COLLECT' || packet.breed === 'RESPIN' || packet.breed === 'DROP') {
                this.printPacket(packet);
                $('#but-spin').attr('disabled', false);
                $('#but-bet-spin').attr('disabled', false);
                $('#but-drop').attr('disabled', true);

                if (packet.afterReact === 'RESPIN') {
                    $('#but-respin').attr('disabled', false);
                    $('#but-spin').attr('disabled', true);
                }
                if (packet.afterReact === 'COLLECT') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-bet-spin').attr('disabled', true);
                    $('#but-spin').attr('disabled', true);
                }
                if (packet.afterReact === 'COLLECT_GAMBLE_LADDER') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-bet-spin').attr('disabled', true);
                    $('#but-spin').attr('disabled', true);
                    $('#but-gamble-ladder').attr('disabled', false);
                    $('#but-grate').attr('disabled', false);
                }
                if (packet.afterReact === 'FREE_COLLECT') {
                    $('#but-freecollect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-freespin').attr('disabled', true);
                }
                if (packet.afterReact === 'FREE_COLLECT_GAMBLE_LADDER') {
                    $('#but-freecollect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-freespin').attr('disabled', true);
                    $('#but-gamble-ladder').attr('disabled', false);
                }
                if (packet.afterReact === 'FREE_SPIN') {
                    $('#but-freespin').attr('disabled', false);
                    $('#but-freecollect').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                }
                if (packet.afterReact === 'BET') {
                    $('#but-bet-spin').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                    $('#but-bet-line-reels').attr('disabled', false);
                }
                if (packet.afterReact === 'DROP') {
                    $('#but-drop').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                }
                if (packet.afterReact === 'GAMBLE_LADDER_PLAY' || packet.nextAct === 'GAMBLE_LADDER_PLAY_OFF'
                    || packet.nextAct === 'GAMBLE_LADDER_PLAY_OFF_FREE' || packet.nextAct === 'GAMBLE_LADDER_PLAY_FREE') {
                    $('#but-ladder-play').attr('disabled', false);
                }
                if (packet.afterReact === 'FEATURE') {
                    $('#but-feature').attr('disabled', false);
                }
                if (packet.afterReact === 'BONUS') {
                    $('#but-bonus').attr('disabled', false);
                }
            } else if (packet.breed === 'GAMBLE_PLAY') {
                $('#but-gplay').attr('disabled', false);
                var text = `REEL-STOPS: ${packet.product.stops} \r\nLAST-WIN: ${packet.product.total}\r\nLINES-WIN: ${packet.product.wins}\r\n` +
                    `CARDS: ${packet.product.cards}\r\nFREE-GAMES: ${packet.unpaid}`;
                $('#text-res').val(text);
            } else if (packet.breed === 'GAMBLE_LADDER') {
                if (packet.afterReact === 'GAMBLE_LADDER_PLAY' || packet.afterReact === 'GAMBLE_LADDER_PLAY_FREE') {
                    $('#but-ladder-play').attr('disabled', false);
                }
                this.printPacket(packet);
            } else if (packet.breed === 'GAMBLE_RATE' || packet.breed === 'GAMBLE_RATE_PLAY') {
                if (packet.afterReact === 'GAMBLE_RATE') {
                    $('#but-grate').attr('disabled', false);
                } else if (packet.afterReact === 'GAMBLE_RATE_PLAY') {
                    $('#but-grate-play').attr('disabled', false);
                    $('#but-collect').attr('disabled', false);
                } else {
                    $('#but-spin').attr('disabled', false);
                    $('#but-bet-spin').attr('disabled', false);
                }
                this.printPacket(packet);
            } else if (packet.breed === 'FEATURE') {
                if (packet.afterReact === 'COLLECT_GAMBLE_LADDER') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-grate').attr('disabled', false);
                } else if (packet.afterReact === 'FREE_COLLECT_GAMBLE_LADDER') {
                    $('#but-freecollect').attr('disabled', false);
                    $('#but-grate').attr('disabled', false);
                } else if (packet.afterReact === 'FEATURE') {
                    $('#but-feature').attr('disabled', false);
                }
                this.printPacket(packet);
            } else if (packet.breed === 'BONUS') {
                if (packet.afterReact === 'BONUS') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-grate').attr('disabled', false);
                    $('#but-bonus').attr('disabled', false);
                } else if (packet.afterReact === 'COLLECT_GAMBLE_LADDER') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-grate').attr('disabled', false);
                } else if (packet.afterReact === 'FREE_COLLECT_GAMBLE_LADDER') {
                    $('#but-freecollect').attr('disabled', false);
                    $('#but-grate').attr('disabled', false);
                } else if (packet.afterReact === 'FEATURE') {
                    $('#but-feature').attr('disabled', false);
                }
                this.printPacket(packet);
            }
        });

        this.netManager.connect(e => {
            this.netManager.login();
        }, this.onclose, this.onerror);
    }

    printPacket(packet) {
        let reels = this.reels[packet.grade];
        let stops = packet.product.stops;
        let screen = new Array();
        if (reels.length < 30) {
            for (let i = 0; i < 5; i++) {
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
        var special = JSON.stringify(packet.product.special);
        if (packet.product.special) {
            if (packet.product.special.matrix) {
                var matrix = packet.product.special.matrix;
                if (matrix.length) {
                    var mats = new Array();
                    for (let i = 0; i < 5; i++) {
                        let col = "";
                        for (let j = 0; j < 6; j++) {
                            let pos = i * 6 + j;
                            let reel = matrix[pos];
                            col += reel + '\t';
                        }
                        mats.push(col);
                    }
                    special = mats.join('\n');
                }
            }
        }
        var text = `REEL-STOPS: ${packet.product.stops} \r\nLAST-WIN: ${packet.product.total}\r\nLINES-WIN: ${packet.product.wins}\r\n` +
            `CARDS: ${packet.product.cards.map(c => c.suit)}\r\nFREE-GAMES: ${JSON.stringify(packet.unpaid)}` +
            `\r\nNEXT-ACT: ${packet.afterReact}\r\nSPECIAL:\n${special}` +
            `\r\nPROMO: ${packet.rich}` +
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

    onerror() {
        console.log('ON ERROR');
    }
}
