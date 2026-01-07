const evalCode = (code: string, scope: Record<string, unknown>) => {
  const scopeKeys = Object.keys(scope);
  const scopeValues = scopeKeys.map((key) => scope[key]);
  return new Function(...scopeKeys, code)(...scopeValues);
};
export const evalTheme = (config: string) => {
  const codeTrimmed = config
    .replaceAll(/export /g, "")
    .trim()
    .replace(/;$/, "");

  try {
    return evalCode(`return (() => {${codeTrimmed}; return config})()`, {});
  } catch (e) {
    console.error(e);
    return null;
  }
};
