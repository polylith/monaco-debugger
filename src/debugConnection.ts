import { MessageUtil } from "./messageUtil"
import { DebugProtocol } from "vscode-debugprotocol";

export interface IDebugConnection {
    adress: string;
    connect(): void;
    close(): void;
    on(event: "message", listener: (data: string) => void): void;
    on(event: "closed", listener: () => void): void;
    sendMessage(message: string, callback?: (data: any) => void, allowListener?: boolean, waitUntil?: string[]): boolean;
}

export class WebsocketConnection implements IDebugConnection {
    public adress: string;
    private websocket: Promise<WebSocket> | null = null;
    private messageListener: (data: string) => void;
    private exitListener: (() => void) | null = null;
    private messageCallback: { callback: (data: any) => void; allowListeners: boolean, waitUntil?: string[] } | null = null;

    constructor(adress: string) {
        this.adress = adress;
        this.messageListener = () => { };
    }

    connect(): void {
        this.websocket = new Promise((resolve, reject) => {
            const ws: WebSocket = new WebSocket(this.adress);
            ws.addEventListener("open", () => resolve(ws));
            ws.addEventListener("error", (err) => reject(err));
            ws.addEventListener("message", (event) => this.handleMessage(event));
            ws.onclose = this.exitListener;
        });
    }

    private handleMessage(ev: MessageEvent) {
        if ((this.messageCallback !== null && this.messageCallback.allowListeners) || this.messageCallback === null) {
            this.messageListener(ev.data);
        }
        if (this.messageCallback !== null) {
            let callback = true;
            if (this.messageCallback.waitUntil) {
                console.log("waitUntil", this.messageCallback.waitUntil);
                callback = false;
                let protocolMessages = MessageUtil.getProtocolMessages(ev.data);
                protocolMessages.forEach(message => {
                    console.log(message);
                    if (message.type == "response" && this.messageCallback?.waitUntil?.includes((message as DebugProtocol.Response).command)){
                        this.messageCallback.waitUntil = this.messageCallback.waitUntil.filter(command => command !== (message as DebugProtocol.Response).command)
                    }
                    if (message.type == "event" && this.messageCallback?.waitUntil?.includes((message as DebugProtocol.Event).event)){
                        console.log(this.messageCallback.waitUntil)
                        this.messageCallback.waitUntil = this.messageCallback.waitUntil.filter(event => event !== (message as DebugProtocol.Event).event)
                    }
                    if (this.messageCallback?.waitUntil?.length == 0){
                        callback = true;
                    }
                })
            }
            if (callback){
                this.messageCallback.callback(ev.data);
                this.messageCallback = null;
            }
        }
    }

    close(): void {
        this.websocket?.then((ws) => ws.close());
    }

    sendMessage(message: string, callback?: (data: any) => void, allowListeners?: boolean, waitUntil?: string[]): boolean {
        if (this.websocket !== null) {
            if (callback !== undefined) {
                if (allowListeners !== false) {
                    allowListeners = true;
                }
                this.messageCallback = { callback, allowListeners, waitUntil };
            }
            this.websocket.then((ws) => {
                ws.send(message);
                console.log("Debugger: message send", message);
            });
            return true;
        }
        return false;
    }

    on(event: "message", listener: (data: string) => void): void;
    on(event: "closed", listener: () => void): void;
    on(event: "message" | "closed", listener: any): void {
        // Typesafty through definition above
        if (event === "message") {
            this.messageListener = listener;
        }
        if (event === "closed") {
            this.exitListener = listener;
        }
    }
}
