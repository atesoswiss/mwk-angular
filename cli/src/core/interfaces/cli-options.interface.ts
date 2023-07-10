/**
 *
 */
export interface CliOptionsInterface{
    optionName: string;
    commandsCommaSeperated: string;
    description: string;
    function: (commandOptions:any)=>void;
}