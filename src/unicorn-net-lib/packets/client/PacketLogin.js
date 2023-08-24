/**
 * Created by boria on 06.08.16.
 */
import {PacketBase} from "./PacketBase";

export class PacketLogin extends PacketBase {
    constructor(session, password, country) {
        super();
        this.session = session;
        this.password = password;
        this.kind = "LOGIN";
        if (country)
            this.country = country;
    }
}