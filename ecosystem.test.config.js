module.exports = {
  apps: [
    {
      name: "agent-ai-front-test",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 14002",
      env: {
        NODE_ENV: "test",
      },
      env_file: ".env.test.local"
    },
  ],
};