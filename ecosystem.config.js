module.exports = {
  apps: [{
    name: "autoreview",
    cwd: "/var/www/autoreview",
    script: "npm",
    args: "start",
    env_file: ".env",
    env: { NODE_ENV: "production", PORT: "3001" }
  }]
}
