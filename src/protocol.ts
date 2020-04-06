import { DebugProtocol } from "vscode-debugprotocol";
import { IBreakpoint } from "./breakpoints";
const DOUBLE_CLRF = "\r\n\r\n";
export class Protocol {
    private seqence = 1;
    private language: string;

    constructor(language: string) {
        this.language = language;
    }

    private toProtocolMessage(message: object): string {
        const messageString = JSON.stringify(message);
        const header = "Content-Length: " + messageString.length.toString();
        return header + DOUBLE_CLRF + messageString + DOUBLE_CLRF;
    }

    private requestMessage(command: string, argument?: object): string {
        const request: DebugProtocol.Request = {
            command,
            seq: this.seqence,
            type: "request",
            arguments: argument,
        };
        this.seqence++;
        return this.toProtocolMessage(request);
    }

    // TODO: set the right attributes
    public init(): string {
        const argument = {
            clientID: "ehdebug",
            clientName: "EntwicklerHeld Debugger",
            adapterID: this.language,
            pathFormat: "path",
            linesStartAt1: true,
            columnsStartAt1: true,
            supportsVariableType: true,
            supportsVariablePaging: true,
            supportsRunInTerminalRequest: false,
            locale: "de",
        };
        return this.requestMessage("initialize", argument);
    }

    public launch(argument: object): string {
        return this.requestMessage("launch", argument);
    }

    public disconnect(): string {
        return this.requestMessage("disconnect");
    }

    public setBreakpoint(line: number, source: DebugProtocol.Source): string {
        const argument = {
            source,
            lines: [line],
            breakpoints: [{ line }],
            sourceModified: false,
        };
        return this.requestMessage("setBreakpoints", argument);
    }

    public setBreakpoints(breakpoints: IBreakpoint[]): string {
        const sources = new Set<DebugProtocol.Source>(breakpoints.map((item) => item.file));
        let message = "";
        sources.forEach((source) => {
            const fileBreakpoints = breakpoints.filter((breakpoint) => breakpoint.file === source);
            const argument = {
                source,
                lines: fileBreakpoints.map((bps) => bps.line),
                breakpoints: fileBreakpoints.map((breakpoint) => {
                    return { line: breakpoint.line };
                }),
                sourceModified: false,
            };
            message += this.requestMessage("setBreakpoints", argument);
        });
        return message;
    }

    public configurationDone(): string {
        return this.requestMessage("configurationDone");
    }

    public stackTrace(threadId: number) {
        return this.requestMessage("stackTrace", { threadId, startFrame: 0 });
    }

    public scopes(stackFrame: number): string {
        return this.requestMessage("scopes", { frameId: stackFrame });
    }

    public variables(scopeId: number): string {
        return this.requestMessage("variables", { variablesReference: scopeId });
    }

    public next(threadId: number): string {
        return this.requestMessage("next", { threadId });
    }

    public restart(): string {
        return this.requestMessage("restart");
    }

    public continue(threadId: number): string {
        return this.requestMessage("continue", { threadId });
    }

    public terminate(restart = false){
        return this.requestMessage("terminate", {restart: restart})
    }
}
