import { DebugProtocol } from "vscode-debugprotocol";
import { DebugEvents } from "./events";

const DOUBLE_CLRF = "\r\n\r\n";
const HEADER_STRING = "Content-Length: ";

export class MessageUtil {
    private events: DebugEvents;

    constructor(events: DebugEvents) {
        this.events = events;
    }

    public handleVariablesMessage(data: string): DebugProtocol.VariablesResponse[] {
        const result: DebugProtocol.VariablesResponse[] = [];
        this.getProtocolMessages(data).forEach((message) => {
            if ((message as DebugProtocol.Response).command === "variables") {
                result.push(message as DebugProtocol.VariablesResponse);
            } else {
                this.handleMessage([message]);
            }
        });
        return result;
    }

    // handles encoded messages and triggers the right events beased on the message content
    handleMessage(data: DebugProtocol.ProtocolMessage[]): void {
        data.forEach((protocolMessage) => {
            console.log(protocolMessage);
            switch (protocolMessage.type) {
                case "response":
                    const response = protocolMessage as DebugProtocol.Response;
                    if (response.success === false) {
                        console.error("Debugger has rejected the request, beacuse " + response.message, response);
                    } else {
                        // TODO: Implement a checker, if response really comes from a request
                        this.events.process("response", response);
                    }
                    break;

                case "event":
                    this.events.process("event", protocolMessage as DebugProtocol.Event);
                    break;

                default:
                    console.log("Unsupported Messagetype: " + protocolMessage.type, protocolMessage);
                    break;
            }
        });
    }

    // decode a raw message and trigger all events
    handleMessageFromString(data: string): void {
        this.handleMessage(this.getProtocolMessages(data));
    }

    // Returns the encoded (objectified) ProtocolMessages from a raw message
    getProtocolMessages(data: string): DebugProtocol.ProtocolMessage[] {
        const result: DebugProtocol.ProtocolMessage[] = [];
        this.getMessagesFromData(data).forEach((message) => {
            result.push(JSON.parse(message) as DebugProtocol.ProtocolMessage);
        });
        return result;
    }

    // Extract the messagedata from the raw message (removes head and grab the specified numbers of char)
    // Message format:
    // Content-Length: xx \r\n\r\n
    // {'json-message': 42}
    private getMessagesFromData(data: string): string[] {
        const messages: string[] = [];
        while (data.length > 20) {
            const header: string = data.split(DOUBLE_CLRF)[0];
            const messageSize = Number(header.split(HEADER_STRING)[1]);
            data = data.replace(header + DOUBLE_CLRF, "");
            messages.push(data.substr(0, messageSize));
            data = data.substr(messageSize, data.length - messageSize);
        }
        return messages;
    }
}
