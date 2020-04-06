/// <reference types="./editor/monaco" />
import { Breakpoints } from "./breakpoints";
import { IDebugConnection, WebsocketConnection } from "./debugConnection";
import { Protocol } from "./protocol";
import { DebugProtocol } from "vscode-debugprotocol";
import { Renderer, IDebuggerTheme, ThemeVSLight, ThemeVSDark } from "./debugRender";
import { MessageUtil } from "./messageUtil";
import { DebugEvents } from "./events";
import { ThreadWatcher, ServerStates } from "./serverState";
import { Shortcuts, IDebugShortcuts } from "./shortcuts";

export { IDebuggerTheme, ThemeVSLight, ThemeVSDark }
export { IDebugConnection, WebsocketConnection }

export default class Debugger {
    public breakpoints: Breakpoints;
    private editor: monaco.editor.IStandaloneCodeEditor;
    private connection: IDebugConnection | null = null;
    private protocolProvider: Protocol;
    private currentFile: DebugProtocol.Source;
    private debugArguments: object;
    private renderer: Renderer;
    private messageUtil: MessageUtil;
    private events: DebugEvents;
    private threads: ThreadWatcher;
    private shortcuts: Shortcuts;
    private autostart: boolean;
    private serverStates: ServerStates;

    constructor(
        editor: monaco.editor.IStandaloneCodeEditor,
        domElement: HTMLElement,
        options: {
            currentFile: DebugProtocol.Source;
            debugArguments: object;
            language: string;
            shortcuts?: IDebugShortcuts | boolean;
            theme?: IDebuggerTheme;
            autostart?: boolean;
        }
    ) {
        // Set arguments to attributes
        this.editor = editor;
        this.debugArguments = options.debugArguments;
        this.currentFile = options.currentFile;
        this.autostart = (options.autostart !== undefined) ? options.autostart : true;

        // create all neseccary objects
        this.protocolProvider = new Protocol(options.language);
        this.events = new DebugEvents();
        this.breakpoints = new Breakpoints(this.editor, this.currentFile, this.events);
        this.shortcuts = new Shortcuts(this.events, this.editor);
        this.threads = new ThreadWatcher();
        this.serverStates = new ServerStates();
        this.renderer = new Renderer(domElement, this.editor, this.events, options.theme);
        this.messageUtil = new MessageUtil(this.events);

        // Enable Shortcuts based on options in contructor
        if (options.shortcuts !== undefined && typeof options.shortcuts !== "boolean") {
            this.shortcuts.changeShortcuts(options.shortcuts);
        }
        if (options.shortcuts !== false) {
            this.shortcuts.enable();
        }

        // Setup the breakpoint click handler
        this.breakpoints.seutpBreakpointAction();

        // Define all GUI actions (can't be done in init method, because it is used before init)
        if (options.autostart !== false) {
            this.events.on("button", "start", () => {
                this.run();
            });
        }
        this.events.on("button", "stop", () => {
            this.connection?.sendMessage(this.protocolProvider.disconnect());
            this.serverStates.disconnectRequest = true;
        });
        this.events.on("button", "stepOver", () => {
            this.connection?.sendMessage(this.protocolProvider.next(this.threads.getCurrentThreadId()));
        });
        this.events.on("button", "varOpen", (object, data) => {
            if (object !== undefined && data !== undefined && typeof data === "number") {
                this.connection?.sendMessage(
                    this.protocolProvider.variables(data),
                    (message) => {
                        this.messageUtil
                            .handleVariablesMessage(message)
                            .forEach((vars) => this.renderer.renderVariablesToElement(object, vars.body.variables));
                    },
                    false
                );
            }
        });
        this.events.on("button", "varClose", (elem) => this.renderer.removeVariablesFromElement(elem));
        this.events.on("button", "restart", () => {
            this.connection?.sendMessage(
                this.protocolProvider.disconnect(),
                () => this.connection?.sendMessage(this.protocolProvider.init()),
                false
            );
        });
        this.events.on("button", "continue", () => {
            this.connection?.sendMessage(this.protocolProvider.continue(this.threads.getCurrentThreadId()));
        });

        // Setup actions
        this.events.on("response", "initialize", () => {
            this.connection?.sendMessage(this.protocolProvider.launch(this.debugArguments));
            this.renderer.updateToolbox("start");
        });
        this.events.on("event", "initialized", () => {
            if (this.breakpoints.breakpoints.length === 0) {
                this.connection?.sendMessage(this.protocolProvider.configurationDone());
            } else {
                this.connection?.sendMessage(this.protocolProvider.setBreakpoints(this.breakpoints.breakpoints));
            }
        });
        // Need to check if breakpoints are avalible, else start program without breakpoints.
        // Resonse is launched.
        this.events.on("response", "setBreakpoints", () => {
            this.connection?.sendMessage(this.protocolProvider.configurationDone());
        });
        this.events.on("event", "stopped", () => {
            this.connection?.sendMessage(this.protocolProvider.stackTrace(this.threads.getCurrentThreadId()));
        });
        this.events.on("response", "stackTrace", (data) => {
            const stackTrace = data as DebugProtocol.StackTraceResponse;
            const stackFrame = stackTrace.body.stackFrames[0];
            this.renderer.renderStackFramesToDrawer("<b>CALL STACK</b>", stackTrace.body.stackFrames);
            this.renderer.renderStopLine(stackFrame.line);
            this.connection?.sendMessage(this.protocolProvider.scopes(stackFrame.id));
        });
        this.events.on("response", "scopes", (data) => {
            const scopes = data as DebugProtocol.ScopesResponse;
            this.connection?.sendMessage(this.protocolProvider.variables(scopes.body.scopes[0].variablesReference));
        });
        this.events.on("response", "variables", (data) => {
            const variables = data as DebugProtocol.VariablesResponse;
            this.renderer.renderVariablesToDrawer("<b>VARIABLES</b>", variables.body.variables);
        });
        this.events.on("response", "disconnect", () => {
            this.serverStates.disconnectRequest = false;
            this.serverStates.connected = false;
            this.renderer.renderStopLine(-1);
            this.renderer.updateToolbox("stop");
            this.renderer.renderVariablesToDrawer("<b>VARIABLES</b>", []);
            this.renderer.renderStackFramesToDrawer("<b>CALL STACK</b>", []);
        });
        this.events.on("event", "terminated", () => {
            if (!this.serverStates.disconnectRequest && this.serverStates.connected)
                this.connection?.sendMessage(this.protocolProvider.disconnect());
        });
        this.events.on("event", "thread", (event) => {
            const thread = event as DebugProtocol.ThreadEvent;
            this.threads.addThread(thread.body.threadId, thread.body.reason);
        });
    }

    // Set/change shortcuts with the shortcut interface
    public setShortcuts(shortcuts: IDebugShortcuts) {
        this.shortcuts.changeShortcuts(shortcuts);
    }

    // Attaches a debug connection to the current object
    public attachDebugAdapterConnetion(connection: IDebugConnection) {
        this.connection = connection;
        this.connection?.on("message", this.messageUtil.handleMessageFromString.bind(this.messageUtil));
    }

    // Starts the debugging
    public run(): boolean {
        if (this.connection != null) {
            this.connection.connect();
            // Send initialize message.
            this.connection.sendMessage(this.protocolProvider.init());
            this.serverStates.connected = true;
            return true;
        }
        return false;
    }

    public on(type: "button", listener: (element?: HTMLElement, data?: any) => {}): void;
    public on(type: "resize", listener: (element?: HTMLElement, data?: any) => {}): void;
    public on(type: "start", listener: (element?: HTMLElement, data?: any) => {}): void;
    public on(type: "resize" | "button" | "start", listener: (element?: HTMLElement, data?: any) => {}): void {
        switch (type) {
            case "resize":
                this.events.on("button", "resize", listener);
                break;
            case "button":
                this.events.on("button", "all", listener);
                break;
            case "start":
                this.events.on("button", "start", listener);
                break;
            default:
                break;
        }
    }


}
