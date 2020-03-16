# Description
This is a debugger for the debugProtocol of Microsoft, used in VSCode.

# Current Status
This is not an stable version and should not be used in production.
If you are interested in this project and wants to help please create an issue or a pull request to improve this project.

# Documentation
Actually there is no documentation, so you need to figure out the usage in the source code.
But here's an init snippet (HTML refs are from vue.js):

``` js
this.debugging = new Debugger(
    editor, 
    this.$refs.debugger,
    {
        currentFile: {path: "/data/task-data/" + settings.editableFile, file: settings.editableFile.split('/')[1]}, 
        debugArguments: conf,
        language: 'php'
    }
);
