import { spawn } from "child_process";

export const exec = async (command: string, options = []) => {
    const child = spawn(command, options);
    var allData = "";

    console.log(command, options);

    // read from child
    for await (const d of child.stdout) {
        console.log(`stdout from the child: \n${d}`);
        allData = d.toString();
    };

    return allData;
}