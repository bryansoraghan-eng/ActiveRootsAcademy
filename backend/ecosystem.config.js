module.exports = {
  apps: [
    {
      name: 'active-roots-backend',
      script: 'node_modules/ts-node-dev/lib/bin.js',
      args: 'src/index.ts',
      interpreter: 'node',
      cwd: __dirname,
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
