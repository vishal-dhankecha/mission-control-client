export class WSRequestModel
{
    rt: number;
    ry: number;
    rp: number;
    rr: number;
    r1: number;
    r2: number;
    irc: boolean;
    message: string;
    command: string;
    commandPayload: string;
    constructor() {
        this.rt = 1000;
        this.ry = 1500;
        this.rp = 1500;
        this.rr = 1500;
        this.r1 = 1000;
        this.r2 = 1000;
        this.irc = false;
        this.message = "";
    }
}