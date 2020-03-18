import { DebugProtocol } from "vscode-debugprotocol";

type ProtocolFunctionArray = ((data?: DebugProtocol.ProtocolMessage) => void)[];

type ButtonFunctionArray = ((object?: HTMLElement, data?: any) => void)[];

export interface IButtonEvents {
    start?: ButtonFunctionArray;
    stop?: ButtonFunctionArray;
    continue?: ButtonFunctionArray;
    stepOver?: ButtonFunctionArray;
    drawer?: ButtonFunctionArray;
    scopeClick?: ButtonFunctionArray;
    varOpen?: ButtonFunctionArray;
    varClose?: ButtonFunctionArray;
    restart?: ButtonFunctionArray;
    resize?: ButtonFunctionArray;
}

export interface IEventEvents {
    initialized?: ProtocolFunctionArray;
    stopped?: ProtocolFunctionArray;
    continued?: ProtocolFunctionArray;
    exited?: ProtocolFunctionArray;
    terminated?: ProtocolFunctionArray;
    thread?: ProtocolFunctionArray;
    output?: ProtocolFunctionArray;
    breakpoint?: ProtocolFunctionArray;
    module?: ProtocolFunctionArray;
    loadedSource?: ProtocolFunctionArray;
    process?: ProtocolFunctionArray;
    capabilities?: ProtocolFunctionArray;
}

export interface IResponseEvents {
    initialize?: ProtocolFunctionArray;
    launch?: ProtocolFunctionArray;
    attach?: ProtocolFunctionArray;
    restart?: ProtocolFunctionArray;
    terminate?: ProtocolFunctionArray;
    breakpointLocations?: ProtocolFunctionArray;
    setBreakpoints?: ProtocolFunctionArray;
    setFunctionBreakpoints?: ProtocolFunctionArray;
    setExecptionBreakpoints?: ProtocolFunctionArray;
    dataBreakpointInfo?: ProtocolFunctionArray;
    setDataBreakpoints?: ProtocolFunctionArray;
    continue?: ProtocolFunctionArray;
    next?: ProtocolFunctionArray;
    stepIn?: ProtocolFunctionArray;
    stepOut?: ProtocolFunctionArray;
    stepBack?: ProtocolFunctionArray;
    reverseContinue?: ProtocolFunctionArray;
    restartFrame?: ProtocolFunctionArray;
    goto?: ProtocolFunctionArray;
    configurationDone?: ProtocolFunctionArray;
    disconnect?: ProtocolFunctionArray;
    pause?: ProtocolFunctionArray;
    stackTrace?: ProtocolFunctionArray;
    scopes?: ProtocolFunctionArray;
    variables?: ProtocolFunctionArray;
    setVariable?: ProtocolFunctionArray;
    source?: ProtocolFunctionArray;
    treads?: ProtocolFunctionArray;
    terminateThreads?: ProtocolFunctionArray;
    modules?: ProtocolFunctionArray;
    loadedSources?: ProtocolFunctionArray;
    evaluate?: ProtocolFunctionArray;
    setExpression?: ProtocolFunctionArray;
    stepInTargets?: ProtocolFunctionArray;
    gotoTargets?: ProtocolFunctionArray;
    completions?: ProtocolFunctionArray;
    exceptionInfo?: ProtocolFunctionArray;
    readMemory?: ProtocolFunctionArray;
    disassemble?: ProtocolFunctionArray;
}

export interface IEvent {
    on(type: "event", event: keyof IEventEvents, listener: (data?: DebugProtocol.Event) => void): void;
    on(type: "response", event: keyof IResponseEvents, listener: (data?: DebugProtocol.Response) => void): void;
    on(type: "button", events: keyof IButtonEvents, listener: (object?: HTMLElement, data?: any) => void): void;
    process(type: "event", event: DebugProtocol.Event): void;
    process(type: "response", response: DebugProtocol.Response): void;
    process(type: "button", action: keyof IButtonEvents, object?: HTMLElement, data?: any): void;
    resetListeners(): void;
}

export class DebugEvents implements IEvent {
    eventEventListeners: IEventEvents = {};
    responseEventListeners: IResponseEvents = {};
    buttonEventListeners: IButtonEvents = {};

    on(type: "event", event: keyof IEventEvents, listener: (data?: DebugProtocol.Event) => void): void;
    on(type: "response", event: keyof IResponseEvents, listener: (data?: DebugProtocol.Response) => void): void;
    on(type: "button", events: keyof IButtonEvents, listener: (object?: HTMLElement, data?: any) => void): void;

    on(type: any, event: any, listener: any) {
        if (type === "event") {
            const ev = event as keyof IEventEvents;
            if (this.eventEventListeners[ev] === undefined) {
                this.eventEventListeners[ev] = [];
            }
            this.eventEventListeners[ev]?.push(listener);
        }
        if (type === "response") {
            const ev = event as keyof IResponseEvents;
            if (this.responseEventListeners[ev] === undefined) {
                this.responseEventListeners[ev] = [];
            }
            this.responseEventListeners[ev]?.push(listener);
        }
        if (type === "button") {
            const ev = event as keyof IButtonEvents;
            if (this.buttonEventListeners[ev] === undefined) {
                this.buttonEventListeners[ev] = [];
            }
            this.buttonEventListeners[ev]?.push(listener);
        }
    }

    process(type: "event", event: DebugProtocol.Event): void;
    process(type: "response", response: DebugProtocol.Response): void;
    process(type: "button", action: keyof IButtonEvents, object?: HTMLElement | undefined, data?: any): void;

    process(type: any, action: any, object?: any, data?: any) {
        if (type === "event") {
            const ev = action as DebugProtocol.Event;
            const eventState = ev.event as keyof IEventEvents;
            this.eventEventListeners[eventState]?.forEach((listener) => listener(ev));
        }
        if (type === "response") {
            const resp = action as DebugProtocol.Response;
            const responseState = resp.command as keyof IResponseEvents;
            this.responseEventListeners[responseState]?.forEach((listener) => listener(resp));
        }
        if (type === "button") {
            this.buttonEventListeners[action as keyof IButtonEvents]?.forEach((listener) => listener(object, data));
        }
    }

    resetAllListeners(): void {
        this.buttonEventListeners = {};
        this.eventEventListeners = {};
        this.responseEventListeners = {};
    }

    resetListeners(): void {
        this.eventEventListeners = {};
        this.responseEventListeners = {};
    }
}
