module.exports = {
  apps : [{
    name: "sistema-chamados",
    script: "./server.js",
    watch: false,
    env: {
      NODE_ENV: "development",
    },
    dot_env: ".env" 
  }]
}