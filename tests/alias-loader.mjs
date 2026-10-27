export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@/router') return { url: new URL('./router-stub.mjs', import.meta.url).href, shortCircuit: true };
  if (specifier.startsWith('@/')) {
    const path = specifier.slice(2);
    return { url: new URL(`../src/${path}${/\.(js|vue)$/.test(path) ? '' : '.js'}`, import.meta.url).href, shortCircuit: true };
  }
  if (specifier.startsWith(".") && !/\.[a-z0-9]+$/i.test(specifier)) return nextResolve(`${specifier}.js`, context);
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.vue')) {
    const { readFile } = await import('node:fs/promises');
    const { parse, compileScript } = await import('@vue/compiler-sfc');
    const { descriptor } = parse(await readFile(new URL(url), 'utf8'), { filename: new URL(url).pathname });
    const compiled = compileScript(descriptor, { id: 'test-component', inlineTemplate: true });
    return { format: 'module', source: compiled.content, shortCircuit: true };
  }
  return nextLoad(url, context);
}
