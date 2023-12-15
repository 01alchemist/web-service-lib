import { fileURLToPath, URL } from "url";
import { defineConfig, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export const ViteBaseConfig = ({
  plugins = [],
  resolve = {},
  ...rest
}: UserConfig) =>
  defineConfig({
    plugins: [vue(), vueJsx(), envPlugin(), ...plugins],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      ...resolve,
    },
    ...rest,
  });

export function envPlugin() {
  const virtualModuleId = "process.env";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name: "env-plugin",
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const variables = Object.keys(process.env)
          .filter((el) => el.startsWith("VITE_"))
          .reduce((acc: Record<string, string | undefined>, el: string) => {
            acc[el] = process.env[el];
            return acc;
          }, {});
        return `export default ${JSON.stringify(variables)}`;
      }
    },
  };
}
