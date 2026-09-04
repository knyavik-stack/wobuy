import { defineConfig, globalIgnores } from "eslint/config";
import nextVitalsModule from "eslint-config-next/core-web-vitals.js";
import nextTsModule from "eslint-config-next/typescript.js";

const toConfigArray = (module) => {
  if (Array.isArray(module)) return module;
  if (Array.isArray(module?.default)) return module.default;
  return [module?.default ?? module];
};

const eslintConfig = defineConfig([
  ...toConfigArray(nextVitalsModule),
  ...toConfigArray(nextTsModule),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
