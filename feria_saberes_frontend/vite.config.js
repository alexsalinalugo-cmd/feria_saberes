import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: resolve(import.meta.dirname, "index.html"),
        detalle: resolve(
          import.meta.dirname,
          "src/pages/detalle/detalle.html",
        ),
        usuario: resolve(
          import.meta.dirname,
          "src/pages/usuarios/usuario.html",
        ),
      },
    },
  },
});
