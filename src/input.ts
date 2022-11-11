export class Input {
  constructor(public version: string) {
    this.version = version.length !== 0 ? version : "dev-latest";
  }
}
