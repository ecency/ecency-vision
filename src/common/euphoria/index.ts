export function isntString(v: any): boolean {
  return typeof v !== "string";
}

export function isntNumber(v: any): boolean {
  return typeof v !== "number" && !isNaN(v);
}

export function isDefined(v: any): boolean {
  return v !== undefined;
}

export type TypeSpecification = string | number | boolean;

export function typeCheck(expr: boolean, typeSpec: string, varName: string, value: any) {
  if (expr) {
    throw Error(
      `Typecheck failure: ${varName} is not a/an ${typeSpec} it is ${JSON.stringify(value)}`
    );
  }
}
