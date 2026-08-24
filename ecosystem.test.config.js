module.exports = {
  apps: [
    {
      name: "agent-ai-front-test",
      script: "./node_modules/next/dist/bin/next",
      args: "dev --turbopack -H 0.0.0.0 -p 14002",
      env: {
        NODE_ENV: "development",
      },
      env_file: ".env.test.local"
    },
  ],
};