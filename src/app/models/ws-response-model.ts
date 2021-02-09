export class WSResponseModel {
    public bluetoothConnectionStatus: string;
    public telemetryData: string;
    public controlsData: string;
    public arduinoResponseModel: ArduinoResponseModel;
    public timeStamp: string;
    public base64Image: string;
    
    constructor(){
        this.arduinoResponseModel = new ArduinoResponseModel();
    }
}
export class ArduinoResponseModel {
    voltage: number;
    al :number;
    te :number;
    te2 :number;
    ax :number;
    ay :number;
    az :number;
    spe :number;
    lat: string;
    lon: string;
}
