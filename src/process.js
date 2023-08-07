import { Command } from "commander";

const program = new Command();

program
  .option("-d", "Variable para debug", false)
  .option("-p <port>", "Puerto del server", 3033)
  .option("--mode <mode>", "Modo de trabajo", "develop")
  .requiredOption("-u <user>", "El user que va usar la aplicación", "User");

program.parse(); //Parsea los comandos y valida si son correctos.
//console.log("Mode Option: ", program.opts().mode);
(req) => {
  let messageinfo = `[${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}] - Logger Info : Mode Option:  ${program.opts().mode} `;
  req.logger.warning(`${messageinfo}`);
};

export default program;
