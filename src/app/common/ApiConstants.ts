// const BASE_URL = "http://jaldi-dekh.com/drone/"; 
const BASE_URL = "http://ec2-3-15-43-64.us-east-2.compute.amazonaws.com/"; 

export const API_CONSTANTS = {
    GET_SERVER_STATUS: BASE_URL +  "server-status",
    WEB_SOCKET_URL: "ws://ec2-3-15-43-64.us-east-2.compute.amazonaws.com/webrtc",
    ICE_SERVER_URL: "stun:stun.l.google.com:19302?transport=udp",
    STATUS_SERVER_END_POINT: BASE_URL + "api",
    GOOGLE_MAP_API: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDRmqZ-1VD-DbsccElMGtMtlRz9FndbPB4&amp;callback=initMap"
}