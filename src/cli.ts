export function getHelloWorld(): string {
  return "Hello World";
}

export function main(
  output: Pick<NodeJS.WriteStream, "write"> = process.stdout
): void {
  output.write(`${getHelloWorld()}\n`);
}
