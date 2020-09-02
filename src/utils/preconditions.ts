export function checkArgument(expression: unknown, errorMessage: string): void {
  if (!expression) {
    throw Error(errorMessage);
  }
}
