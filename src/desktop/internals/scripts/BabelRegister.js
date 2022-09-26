const path = require("path");

require("@babel/register")({
  extensions: [".jsx", ".js", ".ts", ".tsx"],
  cwd: path.join(__dirname, "..", "..")
});
