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
    eventFunction: (event: KeyboardEvent) => void = this.keyEvent.bind(this); // Needed to disable the listener

    constructor(events: DebugEvents, shortcuts?: IDebugShortcuts) {
        this.events = events;
        if (shortcuts) {
            this.shortcuts = shortcuts;
        }
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
            let condition: boolean = true;
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
