#! /usr/bin/env node

import { CliOptionsInterface } from "./core/interfaces/cli-options.interface";
import { Command } from 'commander';
import { Observable } from 'rxjs';
import { ExecException } from 'child_process';

const { exec } = require('child_process');

const figlet = require("figlet");
const packagejson = require('../package.json');

const TITLE = 'ATESO MWK'
const OPTIONS: CliOptionsInterface[] = [
  {
    optionName: "new",
    commandsCommaSeperated: "-n, --new",
    description: `Creates a new full featured ${TITLE} app with frontend and backend`,
    function: initializeNewProject
  }
]

class Main {
  commandApi: any;
  commandOptions: any;

  constructor() {
    this.init();
  }

  init() {
    // Create title
    console.log(this.figletTitle);

    // Initializes command api
    this.setupCommand();
    this.setupOptions();
  }

  private setupCommand() {
    this.commandApi = new Command();
    this.commandApi.version(packagejson.version);
    this.commandApi.description("ATESO CLI provides the following commands");

    // Populate commands
    OPTIONS.forEach(option => this.commandApi.option(option.commandsCommaSeperated, option.description));
    this.commandApi.showHelpAfterError();

    // Connect to args
    this.commandApi.parse(process.argv);

  }

  private setupOptions() {
    this.commandOptions = this.commandApi.opts();
    OPTIONS.forEach(option => {
      if (this.commandOptions[option.optionName]) {
        // Execute assigned function
        const actionObj = {
          commandOptions: this.commandOptions[option.optionName],
          commandApi: this.commandApi
        }
        option.function(actionObj);
      }
    });
  }

  private get figletTitle() {
    return figlet.textSync?.(TITLE);
  }
}

new Main();

function initializeNewProject(actionObj: any) {
  executeCommand('npm i -g @nestjs/cli').subscribe((next => console.log(next)))
}

function executeCommand(command: string): Observable<any> {
  console.log('Execute command: ', command);
  return (new Observable(subscriber => {
    exec(command, (error: ExecException | null, stdout: string, stderr: string) => {
      console.log('>> [comamand execution]', error, stdout, stderr);
      subscriber.complete();
    });
  }));
}
