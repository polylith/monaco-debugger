/// <reference types="./editor/monaco" />
import { DebugProtocol } from "vscode-debugprotocol";
import { DebugEvents } from "./events";

export interface IBreakpoint {
    line: number;
    file: DebugProtocol.Source;
}

export class Breakpoints {
    private editor: monaco.editor.IStandaloneCodeEditor;
    public breakpoints: IBreakpoint[] = [];
    private currentFile: DebugProtocol.Source;
    private events: DebugEvents;

    constructor(editor: monaco.editor.IStandaloneCodeEditor, currentFile: DebugProtocol.Source, events: DebugEvents) {
        this.editor = editor;
        this.currentFile = currentFile;
        this.events = events;
        this.events.on("button", "breakpoint", (object, lineNumber) => this.toggleBreakpoint(lineNumber));
    }

    public changeCurrentFile(currentFile: DebugProtocol.Source) {
        this.currentFile = currentFile;
    }

    public add(line: number) {
        const breakpoint = { line, file: this.currentFile };
        if (this.breakpoints.indexOf(breakpoint) === -1) {
            this.breakpoints.push(breakpoint);
            this.drawBreakpoint(breakpoint.line);
        }
    }

    public toggleBreakpoint(line: number) {
        const breakpoint = { line, file: this.currentFile };
        if (this.breakpoints.filter((value) => value.line === breakpoint.line && value.file === breakpoint.file).length === 0) {
            this.breakpoints.push(breakpoint);
            this.drawBreakpoint(breakpoint.line);
        } else {
            this.breakpoints = this.breakpoints.filter((value) => value.line !== breakpoint.line && value.file !== breakpoint.file);
            this.undrawBreakpoint(line);
        }
    }

    // Editor actions
    public seutpBreakpointAction() {
        this.editor.onMouseDown((mouseEvent) => {
            if (mouseEvent.target.type === 2) {
                this.events.process("button", "breakpoint", undefined, mouseEvent.target.position?.lineNumber || -1);
            }
        });
        this.editor.getModel()?.onDidChangeContent(this.moveBreakpoint.bind(this));
    }

    private drawBreakpoint(line: number) {
        const currentDecorations: monaco.editor.IModelDecoration[] | null = this.editor.getLineDecorations(line);
        const decoration: monaco.editor.IModelDeltaDecoration = {
            range: new monaco.Range(line, 1, line, 1),
            options: { isWholeLine: false, linesDecorationsClassName: "breakpoints" },
        };
        if (currentDecorations?.filter((value) => value.options.linesDecorationsClassName === "breakpoints").length === 0) {
            this.editor.deltaDecorations([], [decoration]);
        }
    }

    private undrawBreakpoint(line: number) {
        const currentDecorations: monaco.editor.IModelDecoration[] | null = this.editor.getLineDecorations(line);
        this.editor.deltaDecorations(
            currentDecorations?.filter((value) => value.options.linesDecorationsClassName === "breakpoints").map((value) => value.id) || [],
            []
        );
    }

    public undrawAll() {
        this.breakpoints.forEach((breakpoint) => {
            const currentDecorations = this.editor.getLineDecorations(breakpoint.line);
            this.editor.deltaDecorations(
                currentDecorations?.filter((value) => value.options.linesDecorationsClassName === "breakpoints").map((value) => value.id) ||
                    [],
                []
            );
        });
    }

    private moveBreakpoint(event: monaco.editor.IModelContentChangedEvent) {
        event.changes.forEach((change) => {
            // move down on line break
            if (change.text === "\r\n") {
                this.breakpoints.forEach((bp) => {
                    if (bp.line >= change.range.startLineNumber) {
                        this.undrawBreakpoint(bp.line);
                        this.drawBreakpoint(++bp.line);
                    }
                });
            }
            // move up on line remove
            if (change.text === "" && change.range.endLineNumber - change.range.startLineNumber === 1) {
                this.breakpoints.forEach((bp) => {
                    if (bp.line >= change.range.startLineNumber) {
                        this.undrawBreakpoint(bp.line);
                        this.drawBreakpoint(--bp.line);
                    }
                });
            }
        });
    }
}
