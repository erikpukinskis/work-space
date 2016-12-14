var library = require("module-library")(require)

library.using(
  ["./", "web-site"],
  function(workSpace, WebSite) {
    WebSite.provision(workSpace.bootServer)
    WebSite.megaBoot()
  }
)
