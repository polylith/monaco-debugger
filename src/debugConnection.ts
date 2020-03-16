export interface IDebugConnection {
    adress: string;
    connect(): void;
    close(): void;
    on(event: "message", listener: (data: string) => void): void;
    on(event: "closed", listener: () => void): void;
    sendMessage(message: string, callback?: (data: any) => void, allowListener?: boolean): boolean;
}

export class WebsocketConnection implements IDebugConnection {
    public adress: string;
    private websocket: Promise<WebSocket> | null = null;
    private messageListener: (data: string) => void;
    private exitListener: (() => void) | null = null;
    private messageCallback: { callback: (data: any) => void; allowListeners: boolean } | null = null;

    constructor(adress: string) {
        this.adress = adress;
        this.messageListener = () => {};
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
            this.messageCallback.callback(ev.data);
            this.messageCallback = null;
        }
    }

    close(): void {
        this.websocket?.then((ws) => ws.close());
    }

    sendMessage(message: string, callback?: (data: any) => void, allowListeners?: boolean): boolean {
        if (this.websocket !== null) {
            if (callback !== undefined) {
                if (allowListeners !== false) {
                    allowListeners = true;
                }
                this.messageCallback = { callback, allowListeners };
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
