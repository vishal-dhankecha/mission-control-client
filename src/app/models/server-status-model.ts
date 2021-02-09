export class ServerStatusModel
{
    public id: number;
    public status: ServerStatusEnum = ServerStatusEnum.ONLINE;
    public ip: string;
    public port: string;
    public lastUpdated: string;
}

export enum ServerStatusEnum
{
    OFFLINE = "0",
    ONLINE = "1",
    RESTARTING = "2"
}