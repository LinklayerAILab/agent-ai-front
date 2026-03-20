module.exports = {
  apps: [
    {
      name: process.env.NEXT_PUBLIC_FONT_NAME || "agent-ai-front",
      script: "node_modules/.bin/next",
      args: `start -p ${process.env.NEXT_PUBLIC_APP_PORT || 4002}`,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
