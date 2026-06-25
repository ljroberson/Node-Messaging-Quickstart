const path = require("path")
const { config } = require("dotenv")

config({
  path: path.resolve(__dirname, ".env"),
  override: true,
})

module.exports = {
  loadEnv: () =>
    config({
      path: path.resolve(__dirname, ".env"),
      override: true,
    }),
}
