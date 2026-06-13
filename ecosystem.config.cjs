// Configuración PM2 del holding para yavideo.
// Dos procesos: la web (Next.js) y el worker de render (BullMQ + Remotion).
// Regla fija: `pnpm start` sirve producción leyendo process.env.PORT.
module.exports = {
  apps: [
    {
      name: "yavideo",
      cwd: "/var/www/yavideo",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "4001",
      },
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: "600M",
    },
    {
      // Worker de render: consume la cola y renderiza con Remotion (Chromium headless + ffmpeg).
      // Más memoria que la web; concurrencia 1 (se controla en el código del worker).
      name: "yavideo-worker",
      cwd: "/var/www/yavideo",
      script: "pnpm",
      args: "worker",
      env: {
        NODE_ENV: "production",
      },
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: "2G",
    },
  ],
};
