/// <reference types="./editor/monaco" />
import { DebugProtocol } from "vscode-debugprotocol";
import { DebugEvents, IButtonEvents } from "./events";

const NAMESPACE = "monaco-debugger";

export interface IStyle {
    margin?: string;
    padding?: string;
    color?: string;
    "font-size"?: string;
    "font-family"?: string;
    border?: string;
    "border-radius"?: string;
    "text-align"?: string;
    cursor?: string;
    background?: string;
    width?: string;
    height?: string;
    "list-style-type"?: string;
    "line-height"?: string;
    overflow?: string;
    filter?: string;
    transform?: string;
    "white-space"?: string;
    "box-sizing"?: string;
    float?: string;
    display?: string;
    fill?: string;
}

export interface IDebuggerThemeRules {
    "container"?: IStyle;
    "container.resize": IStyle;
    "drawer.head": IStyle;
    "drawer.body": IStyle;
    "drawer.footer": IStyle;
    "toolbox"?: IStyle;
    "toolbox.button": IStyle;
    "drawer.callstack"?: IStyle;
    "drawer.variables": IStyle;
    "drawer.variables.name"?: IStyle;
    "drawer.variables.string"?: IStyle;
    "drawer.variables.object"?: IStyle;
    "drawer.variables.int"?: IStyle;
    "drawer.variables.boolean"?: IStyle;
    "drawer.variables.default"?: IStyle;
    "drawer.variables.arrow": IStyle;
}

export interface IDebuggerTheme {
    name: string;
    rules: IDebuggerThemeRules;
}

export class ThemeVSDark implements IDebuggerTheme {
    public name = "vs-dark";
    public rules: IDebuggerThemeRules = {
        "container": {
            background: "#1e1e1e"
        },
        "container.resize": {
            float: "left",
            width: "4px",
            height: "100%",
            cursor: "w-resize",
            background: "#3e3e3e"
        },
        "drawer.head": {
            background: "#3e3e3e",
            color: "white",
            width: "100%",
            padding: "5px 20px",
            margin: "0px",
            "font-size": "14px",
            "box-sizing": "border-box"
        },
        "drawer.body": {
            background: "#1e1e1e",
            color: "white",
            padding: "5px 0px",
            height: "300px",
            margin: "0px",
            width: "100%",
            overflow: "hidden auto",
            "white-space": "nowrap",
        },
        "drawer.footer": {
            cursor: "ns-resize", 
            height: "4px", 
            background: "#1f1f1f"
        },
        "drawer.variables": {
            "list-style-type": "none",
            color: "white",
            padding: "0 0 0 10px",
            "font-size": "14px",
            "line-height": "1.5em",
            margin: "0 0 0 0",
            "font-family": "Consolas, 'Courier New', monospace",
        },
        "toolbox": {
            background: "#1e1e1e",
            color: "white",
        },
        "toolbox.button": {
            color: "#329998",
            border: "0px solid #329998",
            width: "30px",
            height: "30px",
            margin: "5px",
        },
        "drawer.variables.name": {color: "violet"},
        "drawer.variables.string": {color: "orange"},
        "drawer.variables.object": {color: "white"},
        "drawer.variables.int": {color: "lightgreen"},
        "drawer.variables.boolean": {color: "yellow"},
        "drawer.variables.default": {color: "lightblue"},
        "drawer.variables.arrow": {fill: "white"}
    };
}

export class ThemeVSLight implements IDebuggerTheme {
    public name = "vs-light";
    public rules: IDebuggerThemeRules = {
        "container": {
            background: "#fffffe"
        },
        "container.resize": {
            float: "left",
            width: "4px",
            height: "100%",
            cursor: "w-resize",
            background: "#eeeeee"
        },
        "drawer.head": {
            background: "#eeeeee",
            color: "black",
            width: "100%",
            padding: "5px 20px",
            margin: "0px",
            "font-size": "14px",
            "box-sizing": "border-box"
        },
        "drawer.body": {
            background: "#fffffe",
            color: "black",
            padding: "5px 0px",
            height: "300px",
            margin: "0px",
            width: "100%",
            overflow: "hidden auto",
            "white-space": "nowrap",
        },
        "drawer.footer": {
            cursor: "ns-resize", 
            height: "4px", 
            background: "#fffffe"
        },
        "drawer.variables": {
            "list-style-type": "none",
            color: "black",
            padding: "0 0 0 10px",
            "font-size": "14px",
            "line-height": "1.5em",
            margin: "0 0 0 0",
            "font-family": "Consolas, 'Courier New', monospace",
        },
        "toolbox": {
            background: "#1e1e1e",
            color: "white",
        },
        "toolbox.button": {
            color: "#329998",
            border: "0px solid #329998",
            width: "30px",
            height: "30px",
            margin: "5px",
        },
        "drawer.variables.name": {color: "darkviolet"},
        "drawer.variables.string": {color: "darkorange"},
        "drawer.variables.object": {color: "black"},
        "drawer.variables.int": {color: "green"},
        "drawer.variables.boolean": {color: "yellow"},
        "drawer.variables.default": {color: "blue"},
        "drawer.variables.arrow": {fill: "grey"}
    };
}

interface IDrawer {
    name: string;
    content: HTMLElement;
    fold: boolean;
}

class Styles {
    static disabled: IStyle = { filter: "grayscale(100%) brightness(80%); cursor: inherit" };
    static button: IStyle = {
        color: "black",
        margin: "0px 30px",
        "font-size": "14px",
        border: "1px solid black",
        padding: "3px 4px",
        cursor: "pointer",
        "border-radius": "5px",
        "text-align": "center",
        background: "none",
    };
    static wrapper: IStyle = { margin: "8px auto", width: "fit-content" };
    static contentWrapper: IStyle = {float: "left", width: "calc( 100% - 4px)" };
    static stackFramesHeader: IStyle = {padding: "0px 20px"};
    static drawerWrapper: IStyle = {width: "100%", margin: "0px"};
    static wrapperText: IStyle = { margin: "0px" };
    static drawerFold: IStyle = {display: "none"};
    static emptyVar: IStyle = { margin: "0 0 0 20px" };
}

class Media {
    static continueSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><style>.start-1{fill:#399d0b;}.start-2{fill:#93ca7a;}</style></defs><g id="Ebene_2" data-name="Ebene 2"><g id="Ebene_1-2" data-name="Ebene 1"><rect class="start-1" width="30" height="200" rx="15"/><path class="start-2" d="M62.13,137.59h105a0,0,0,0,1,0,0v30a0,0,0,0,1,0,0h-105a15,15,0,0,1-15-15v0A15,15,0,0,1,62.13,137.59Z" transform="translate(-76.52 120.44) rotate(-45)"/><path class="start-1" d="M57.43,42.43h120a15,15,0,0,1,15,15v15a0,0,0,0,1,0,0h-135a15,15,0,0,1-15-15v0A15,15,0,0,1,57.43,42.43Z" transform="translate(75 -66.21) rotate(45)"/></g></g></svg>`;
    static startSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><style>.start-1{fill:#399d0b;}.start-2{fill:#93ca7a;}</style></defs><g id="Ebene_2" data-name="Ebene 2"><g id="Ebene_1-2" data-name="Ebene 1"><path class="start-2" d="M62.13,137.59h105a0,0,0,0,1,0,0v30a0,0,0,0,1,0,0h-105a15,15,0,0,1-15-15v0A15,15,0,0,1,62.13,137.59Z" transform="translate(-76.52 120.44) rotate(-45)"/><path class="start-1" d="M57.43,42.43h120a15,15,0,0,1,15,15v15a0,0,0,0,1,0,0h-135a15,15,0,0,1-15-15v0A15,15,0,0,1,57.43,42.43Z" transform="translate(75 -66.21) rotate(45)"/></g></g></svg>`;
    static stepOverSvg = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 -75 215 215"><defs><style>.step-1{fill:#9cb5de;}.step-2{fill:#0071bc;}</style></defs><g id="Ebene_2" data-name="Ebene 2"><g id="Ebene_1-2" data-name="Ebene 1"><path class="step-1" d="M4.39,55.13a15,15,0,0,0,20,1.07,120,120,0,0,1,159.71,9l21.21-21.22A150,150,0,0,0,5.69,32.75,15,15,0,0,0,4.38,55.13Z"/><path class="step-2" d="M214,52.47,188,7.52a10,10,0,0,0-17.32,0L144.75,52.44a10,10,0,0,0,8.66,15l51.91,0A10,10,0,0,0,214,52.47Z"/><circle class="step-2" cx="99.25" cy="83" r="25"/></g></g></svg>`;
    static restartSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><style>.restart-1{fill:#93ca7a;}.restart-2{fill:#399d0b;}</style></defs><g id="Ebene_2" data-name="Ebene 2"><g id="Ebene_1-2" data-name="Ebene 1"><path class="restart-1" d="M89.22,20.27v27c35.61,0,64.38,29,63.53,64.43-.8,33.36-28.28,60.57-62,61.36A63.41,63.41,0,0,1,27,122.84a13.58,13.58,0,0,0-13.36-10.76h0A13.52,13.52,0,0,0,.28,128.23C8.74,169.19,45.34,200,89.22,200c50.19,0,91.09-40.75,90.78-90.44C179.69,60.19,139.16,20.27,89.22,20.27Z"/><path class="restart-2" d="M89.22,20.27v27c35.09,0,63.55,28.16,63.55,62.91a62.41,62.41,0,0,1-18.62,44.48l19.26,19.06A89.12,89.12,0,0,0,180,110.14C180,60.5,139.36,20.27,89.22,20.27Z"/><path class="restart-2" d="M37,44.61,82,70.54a10,10,0,0,0,15-8.67V10A10,10,0,0,0,82,1.35L37,27.28A10,10,0,0,0,37,44.61Z"/></g></g></svg>`;
    static stopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><style>.cls-1{fill:#ca0707;}.cls-2{fill:#c38383;}</style></defs><g id="Ebene_2" data-name="Ebene 2"><g id="Ebene_1-2" data-name="Ebene 1"><path class="cls-1" d="M15,0H185a15,15,0,0,1,15,15V30a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V15A15,15,0,0,1,15,0Z"/><path class="cls-1" d="M100,85H270a15,15,0,0,1,15,15v15a0,0,0,0,1,0,0H85a0,0,0,0,1,0,0V100A15,15,0,0,1,100,85Z" transform="translate(285 -85) rotate(90)"/><path class="cls-2" d="M0,15V185a15,15,0,0,0,15,15H30V30L4.39,4.39A15,15,0,0,0,0,15Z"/><path class="cls-2" d="M170,170H0v15a15,15,0,0,0,15,15H185a15,15,0,0,0,10.61-4.39Z"/></g></g></svg>`;
    static rightArrow = `<svg id="Ebene_1" data-name="Ebene 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.15 16" width="7" style="padding-right: 12px; padding-top: 2px;"><defs><style>.c-1{fill:grey;}</style></defs><path class="drawer variables arrow" d="M8.82,8.76,2,15.67a1.12,1.12,0,0,1-1.59,0,1.11,1.11,0,0,1,0-1.58L6.44,8,.33,1.92A1.12,1.12,0,0,1,.33.33a1.11,1.11,0,0,1,1.58,0l6.9,6.85A1.16,1.16,0,0,1,9.15,8a1.11,1.11,0,0,1-.33.79" transform="translate(0 0)"/></svg>`;
    static downArrow = `<svg id="Ebene_1" data-name="Ebene 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9.15" width="12.24" style="padding-right: 7px;"><defs><style>.c-2{fill:grey;}</style></defs><path class="drawer variables arrow" d="M7.24,8.82.33,2A1.12,1.12,0,0,1,.33.38a1.11,1.11,0,0,1,1.58,0L8,6.44,14.08.33a1.12,1.12,0,0,1,1.59,0,1.11,1.11,0,0,1,0,1.58L8.82,8.81A1.16,1.16,0,0,1,8,9.15a1.11,1.11,0,0,1-.79-.33"/></svg>`;
}

const globalstyle = `
/* width */
.drawer-content::-webkit-scrollbar {
  width: 5px;
}

/* Track */
.drawer-content::-webkit-scrollbar-track {
  background: #1e1e1e; 
  border-radius: 10px;
}
 
/* Handle */
.drawer-content::-webkit-scrollbar-thumb {
  background: #3e3e3e; 
}

/* Handle on hover */
.drawer-content::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e; 
}

.drawer-content::-webkit-scrollbar-corner {
    background: #1e1e1e;
}
.noselect {
    -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
       -khtml-user-select: none; /* Konqueror HTML */
         -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
              user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome and Opera */
}
.breakpoints {
	background: red;
    width: 8px !important;
    height: 8px !important;
    left: 5px !important;
    top: 5px;
    border-radius: 4px;
}
.myContentClass {
    border:1px solid rgba(240,230,140, 0.7);
    background: rgba(240,230,140, 0.1);
}
`;

export class Renderer {
    buttonEventListener: IButtonEvents = {};
    domElement: HTMLElement;
    drawers: IDrawer[] = [];
    editor: monaco.editor.IStandaloneCodeEditor;
    toolbox: HTMLElement;
    events: DebugEvents;
    theme: IDebuggerTheme = new ThemeVSLight();
    stylesheet = "";

    constructor(domElement: HTMLElement, editor: monaco.editor.IStandaloneCodeEditor, events: DebugEvents, theme?: IDebuggerTheme) {
        this.domElement = domElement;
        this.editor = editor;
        this.events = events;
        if (theme)
            this.theme = theme;
        if (this.theme.rules.container)
            this.domElement.classList.add("container");
            this.domElement.classList.add(NAMESPACE);
        const wrapper = this.renderElement("div", "contentWrapper container");
        const border = this.renderElement("div", "container resize");
        this.toolbox = this.renderToolbox();
        wrapper.appendChild(this.toolbox);
        wrapper.appendChild(this.renderDrawer("<b>VARIABLES</b>"));
        wrapper.appendChild(this.renderDrawer("<b>CALL STACK</b>"));
        this.domElement.appendChild(wrapper);
        this.domElement.appendChild(border);
        this.addResizeToElement(border, this.domElement, "h");
        console.log(this.theme);
        this.setTheme(this.theme);
    }

    updateToolbox(action: keyof IButtonEvents, object?: HTMLElement) {
        switch (action) {
            case "start":
                const continu = this.renderButton(Media.continueSvg, "continue", "toolbox button");
                if (this.toolbox.firstChild) this.toolbox.replaceChild(continu, this.toolbox.firstChild);
                else if (object) this.toolbox.replaceChild(continu, object);
                this.toolbox.childNodes.forEach((child) => {
                    (child as HTMLElement).setAttribute("class", "toolbox button");
                    (child as HTMLElement).removeAttribute("disabled");
                });
                break;
            case "stop":
                const start = this.renderButton(Media.startSvg, "start", "toolbox button");
                if (this.toolbox.firstChild) {
                    this.toolbox.replaceChild(start, this.toolbox.firstChild);
                    this.toolbox.childNodes.forEach((child) => {
                        if (child !== this.toolbox.firstChild) {
                            (child as HTMLElement).setAttribute(
                                "class",
                                "toolbox button disabled"
                            );
                            (child as HTMLElement).setAttribute("disabled", "true");
                        }
                    });
                }
                break;
            default:
                break;
        }
    }

    renderStopLine(line: number) {
        for (let i = 1; i <= (this.editor.getModel()?.getLineCount() || 1); i++) {
            const currentDecorations = this.editor.getLineDecorations(i);
            this.editor.deltaDecorations(
                currentDecorations?.filter((value) => value.options.className === "myContentClass").map((value) => value.id) || [],
                []
            );
        }
        if (line !== -1) {
            const currentDecorations: monaco.editor.IModelDecoration[] | null = this.editor.getLineDecorations(line);
            const decoration: monaco.editor.IModelDeltaDecoration = {
                range: new monaco.Range(line, 1, line, 1),
                options: { isWholeLine: true, className: "myContentClass" },
            };
            if (currentDecorations?.filter((value) => value.options.className === "myContentClass").length === 0) {
                this.editor.deltaDecorations([], [decoration]);
            }
        }
    }

    setTheme(theme: IDebuggerTheme){
        this.theme = theme;
        this.stylesheet = globalstyle;
        this.buildStyleSheet();
        document.querySelector('style.'+NAMESPACE)?.remove();
        const styles = this.renderElement("style", undefined, this.stylesheet);
        styles.classList.add(NAMESPACE);
        document.head.appendChild(styles);
    }

    private buildStyleSheet(){
        for (const key in this.theme.rules){
            const querySelector = "." + NAMESPACE + " ." + key
            this.stylesheet += querySelector + " {\n" + this.buildStyle(this.theme.rules[key as (keyof IDebuggerThemeRules)]) + "}\n"
        }   
        for (const key in Styles){
            const querySelector = "." + NAMESPACE + " ." + key
            this.stylesheet += querySelector + " {\n" + this.buildStyle(Styles[key as (keyof Styles)]) + "}\n"
        }     
    }

    private buildStyle(template: IStyle | undefined, override = false, ...style: IStyle[]): string {
        if (template == undefined){
            return "";
        }
        let styles = {};
        if (!override) {
            styles = template;
        }
        style.forEach((s) => {
            styles = { ...styles, ...s };
        });
        let styleStr = "";
        Object.entries(styles).forEach((value) => {
            styleStr += value[0] + ": " + value[1] + ";\n";
        });
        return styleStr;
    }

    renderVariablesToDrawer(drawerName: string, varObject: DebugProtocol.Variable[]): void {
        this.setDrawerContent(drawerName, this.renderVariables(varObject));
    }

    renderVariablesToElement(element: HTMLElement, varObject: DebugProtocol.Variable[]): void {
        const elem = this.removeEventListeners(element);
        elem.appendChild(this.renderVariables(varObject));
        if (elem.firstChild) {
            const arrow = this.renderElement("span", "", Media.downArrow.replace("c-2", "drawer variables arrow"));
            elem.replaceChild(arrow, elem.firstChild);
            arrow.addEventListener("click", () => this.events.process("button", "varClose", elem));
        }
    }

    removeVariablesFromElement(element?: HTMLElement): void {
        if (element) {
            element.getElementsByTagName("ul")[0].remove();
            const elem = this.removeEventListeners(element);
            if (elem.firstChild) {
                const arrow = this.renderElement("span", "", Media.rightArrow.replace("c-1", "drawer variables arrow"));
                elem.replaceChild(arrow, elem.firstChild);
                arrow.addEventListener("click", () => this.events.process("button", "varOpen", elem, Number(elem.getAttribute("varRef"))));
            }
        }
    }

    renderVariables(varObject: DebugProtocol.Variable[]): HTMLElement {
        const list = this.renderElement("ul", "drawer variables");
        varObject.forEach((variable) => {
            const listentry = this.renderElement("li");
            if (variable.variablesReference !== 0) {
                const arrow = this.renderElement("span", "", Media.rightArrow.replace("c-1", "drawer variables arrow"));
                listentry.appendChild(arrow);
                arrow.addEventListener("click", () => this.events.process("button", "varOpen", listentry, variable.variablesReference));
                listentry.setAttribute("varRef", variable.variablesReference.toString());
            } else {
                listentry.append(this.renderElement("span", "emptyVar"));
            }
            listentry.appendChild(this.renderElement("span", "drawer variables name", variable.name + ": "));
            switch (variable.type) {
                case "string":
                    listentry.appendChild(this.renderElement("span", "drawer variables string", variable.value));
                    break;
                case "object":
                    listentry.appendChild(this.renderElement("span", "drawer variables object", variable.value));
                    break;
                case "int":
                    listentry.appendChild(this.renderElement("span", "drawer variables int", variable.value));
                    break;
                default:
                    listentry.appendChild(this.renderElement("span", "drawer variables default", variable.value));
                    break;
            }
            list.appendChild(listentry);
        });
        return list;
    }

    renderStackFramesToDrawer(drawerName: string, varObject: DebugProtocol.StackFrame[]): void {
        this.setDrawerContent(drawerName, this.renderStackFrames(varObject));
    }

    renderStackFrames(stackObject: DebugProtocol.StackFrame[]): HTMLElement {
        const list = this.renderElement("ul", "drawer variables");
        stackObject.forEach((stackFrame) => {
            const listentry = this.renderElement("li");
            listentry.innerHTML = stackFrame.name + " at line " + stackFrame.line;
            list.appendChild(listentry);
        });
        return list;
    }

    renderToolbox() {
        const wrapper = this.renderWrapper("");
        const start = this.renderButton(Media.startSvg, "start", "toolbox button");
        wrapper.appendChild(start);
        this.on("start", () => this.updateToolbox.call(this, "start", start));
        wrapper.appendChild(this.renderButton(Media.stepOverSvg, "stepOver", "toolbox button", true));
        wrapper.appendChild(this.renderButton(Media.restartSvg, "restart", "toolbox button", true));
        wrapper.appendChild(this.renderButton(Media.stopSvg, "stop", "toolbox button", true));
        return wrapper;
    }

    renderDrawer(name: string, content?: HTMLElement) {
        const wrapper = this.renderWrapper("drawerWrapper");
        const header = this.renderWrapper("drawer head");
        const footer = this.renderElement("div", "drawer footer");
        const nameTag = this.renderElement("p", "wrapperText", name);
        nameTag.classList.add("noselect");
        header.appendChild(nameTag);
        const contentWrapper = this.renderWrapper("drawer body drawer-content noselect");
        if (content) {
            contentWrapper.appendChild(content);
        }
        const drawer: IDrawer = { name, content: contentWrapper, fold: false };
        this.drawers.push(drawer);
        wrapper.appendChild(header);
        wrapper.appendChild(contentWrapper);
        wrapper.appendChild(footer);
        header.addEventListener("click", () => this.foldDrawer(drawer));
        this.addResizeToElement(footer, contentWrapper, "v");
        return wrapper;
    }

    foldDrawer(drawer: IDrawer) {
        if (drawer.fold) {
            drawer.content.classList.remove("drawerFold");
            drawer.fold = false;
        } else {
            drawer.content.classList.add("drawerFold");
            drawer.fold = true;
        }
    }

    setDrawerContentFromString(name: string, HTMLcontent: string) {
        const drawers = this.drawers.filter((d) => d.name === name);
        if (drawers.length !== 0) {
            drawers[0].content.innerHTML = HTMLcontent;
        }
    }

    setDrawerContent(name: string, content: HTMLElement) {
        const drawers = this.drawers.filter((d) => d.name === name);
        if (drawers.length !== 0) {
            const drawer = drawers[0];
            drawer.content.innerHTML = "";
            drawer.content.appendChild(content);
        }
    }

    renderWrapper(cssClass: string) {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "wrapper " + cssClass);
        return wrapper;
    }

    renderButton(content: string, action: keyof IButtonEvents, cssClass: string, disabled = false) {
        const button = this.renderElement("button", cssClass, content);
        if (disabled) {
            button.setAttribute("disabled", disabled.toString());
            button.classList.add("disabled");
        }
        button.addEventListener("click", () => this.events.process("button", action, button));
        return button;
    }

    renderElement(tagName: string, cssClass?: string, HTMLcontent?: string): HTMLElement {
        const element = document.createElement(tagName);
        if (HTMLcontent !== undefined) {
            element.innerHTML = HTMLcontent;
        }
        if (cssClass !== undefined) {
            element.setAttribute("class", cssClass);
        }
        return element;
    }

    removeEventListeners(element: HTMLElement): HTMLElement {
        const newElement = element.cloneNode(true);
        element.parentNode?.replaceChild(newElement, element);
        return newElement as HTMLElement;
    }

    processClick(action: keyof IButtonEvents, object?: HTMLElement, data?: any): void {
        console.log("Button action called:" + action);
        this.buttonEventListener[action]?.forEach((listener) => listener(object, data));
    }

    on(event: keyof IButtonEvents, listener: (object?: HTMLElement, data?: any) => void) {
        if (this.buttonEventListener[event] === undefined) {
            this.buttonEventListener[event] = [];
        }
        this.buttonEventListener[event]?.push(listener);
    }

    resizeVertical(event: MouseEvent, element: HTMLElement) {
        const box: DOMRect = element.getBoundingClientRect();
        const dx = event.y - box.top;
        element.style.height = dx - 10 + "px";
    }

    resizeHorizontal(event: MouseEvent, element: HTMLElement) {
        const box: DOMRect = element.getBoundingClientRect();
        const dx = event.x - box.left;
        element.style.width = dx - 10 + "px";
        this.events.process("button", "resize", this.domElement, { width: box.width, height: box.height });
    }

    addResizeToElement(listen: HTMLElement, resize: HTMLElement, direction: "h" | "v") {
        listen.addEventListener("mousedown", () => {
            if (direction === "h") {
                document.onmousemove = (event) => this.resizeHorizontal.call(this, event, resize);
            }
            if (direction === "v") {
                document.onmousemove = (event) => this.resizeVertical.call(this, event, resize);
            }
            document.onmouseup = () => {
                document.onmousemove = () => { };
            };
        });
    }
}
