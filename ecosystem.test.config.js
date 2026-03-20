module.exports = {
  apps: [
    {
      name: "ll-agenttest",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 14002",
      env: {
        NODE_ENV: "test",
      },
      env_file: ".env.test.local"
    },
  ],
};