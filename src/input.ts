export class Input {
  public static VERSION = "version";
  public static UNINSTALL = "uninstall";
  constructor(public version: string, public uninstall: boolean) {
    this.version = version.length !== 0 ? version : "dev-latest";
    this.uninstall = uninstall;
  }
}
