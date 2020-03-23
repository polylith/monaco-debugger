/// <reference types="./editor/monaco" />
import { DebugEvents, IButtonEvents } from "./events";

export interface IDebugShortcuts {
    start: string;
    stop: string;
    stepOver: string;
    continue: string;
    breakpoint: string;
}

export class Shortcuts {
    shortcuts: IDebugShortcuts = {
        start: "117",
        stop: "120",
        stepOver: "118",
        continue: "119",
        breakpoint: "ctrl + shift + 66",
    };
    events: DebugEvents;
    private editor: monaco.editor.IStandaloneCodeEditor;
    eventFunction: (event: KeyboardEvent) => void = this.keyEvent.bind(this); // Needed to disable the listener

    constructor(events: DebugEvents, editor: monaco.editor.IStandaloneCodeEditor, shortcuts?: IDebugShortcuts) {
        this.events = events;
        if (shortcuts) {
            this.shortcuts = shortcuts;
        }
        this.editor = editor;
    }

    changeShortcuts(shortcuts: IDebugShortcuts) {
        this.disable();
        this.shortcuts = shortcuts;
        this.enable();
    }

    private keyEvent(event: KeyboardEvent) {
        Object.keys(this.shortcuts).forEach((key) => {
            const action = key as keyof IDebugShortcuts;
            const keycodes = this.shortcuts[action].split(" + ");
            let condition = true;
            keycodes.forEach((keycode) => {
                if (keycode === "ctrl") {
                    condition = event.ctrlKey && condition;
                }
                if (keycode === "alt") {
                    condition = event.altKey && condition;
                }
                if (keycode === "shift") {
                    condition = event.shiftKey && condition;
                }
                const code = Number(keycode);
                if (!isNaN(code)) {
                    condition = event.keyCode === code && condition;
                }
            });
            if (condition) {
                if (!event.metaKey) {
                    event.preventDefault();
                }
                if (action === "breakpoint"){
                    this.events.process("button", action as keyof IButtonEvents, undefined, this.editor.getPosition()?.lineNumber);
                }
                else
                    this.events.process("button", action as keyof IButtonEvents);
            }
        });
    }

    enable() {
        document.addEventListener("keydown", this.eventFunction);
    }

    disable() {
        document.removeEventListener("keydown", this.eventFunction);
    }
}
