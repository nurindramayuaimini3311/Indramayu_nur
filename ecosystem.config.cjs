module.exports = {
  apps: [
    {
      name: "alwi-memory",
      script: "./memory-server.mjs",
      cwd: "/home/imahazzah51/NURgenerator",
      env: { PORT: 4000 }
    },
    {
      name: "bot-alwi",
      script: "./bot-alwi.cjs",
      cwd: "/home/imahazzah51/NURgenerator",
      env: { NODE_PATH: "/home/imahazzah51/bot-alwi-project/node_modules" }
    },
    {
      name: "nur-static",
      script: "./server3000.cjs",
      cwd: "/home/imahazzah51/NURgenerator"
    },
    {
      name: "alwi-modular",
      script: "./alwi-modular/server/server.js",
      cwd: "/home/imahazzah51/NURgenerator",
      env: { PORT: 8080 }
    }
  ]
};
