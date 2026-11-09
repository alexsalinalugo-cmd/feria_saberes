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
        checkin: resolve(
          import.meta.dirname,
          "src/pages/checkIn/checkIn.html",
        ),
        auth: resolve(
          import.meta.dirname,
          "src/pages/auth/auth.html",
        ),
        admin: resolve(
          import.meta.dirname,
          "src/pages/admin/admin.html",
        ),
        reportes: resolve(
          import.meta.dirname,
          "src/pages/reportes/reportes.html",
        ),
      },
    },
  },
});
