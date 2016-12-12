var library = require("module-library")(require)

library.using(
  ["web-element", "web-site", "browser-bridge", "basic-styles", "tell-the-universe", "release-checklist"],
  function(element, WebSite, baseBridge, basicStyles, tellTheUniverse,releaseChecklist) {

    var site = WebSite.provision("/give-me-work")

    baseBridge.addToHead(basicStyles)

    tellTheUniverse = tellTheUniverse
      .called("project-process")
      .withNames({
        releaseChecklist: "release-checklist"
      })

    tellTheUniverse.load()

    site.addRoute("get",
      "/give-me-work",
      function(request, response) {
        var button = element("a.button", "Give me programming work", {href: "/give-me-work/programming"})

        baseBridge.requestHandler([button])(request, response)
      }
    )


    site.addRoute("get",
      "/give-me-work/programming",
      function(request, response) {

        var list = releaseChecklist.get("putw4e")

        var bridge = baseBridge.forResponse(response)

        sendNextTask(list, bridge)
      }
    )

    function sendNextTask(list, bridge, response) {
      if (typeof skipTo == "undefined") {
        skipTo = list.tasks.length - 1
      }

      for(var i=skipTo; i<list.tasks.length; i++) {
        if (list.tasksCompleted[i]) {
          continue
        }
        var task = list.tasks[i]
        break
      }

      var job = element("p", "Make it so «"+task+"» is possible")
      job.appendStyles({"min-height": "2.5em"})

      var button = element("a.button", "Put it back", {href: "/give-me-work/dont-want/"+encodeURIComponent(task)})

      bridge.send([job, button])
    }

    var skipTo

    site.addRoute("get",
      "/give-me-work/dont-want/:text",
      function(request, response) {
        var list = releaseChecklist.get("putw4e")

        var task = request.params.text

        var i = list.tasks.indexOf(task)

        skipTo = i+1
        if (!list.tasks[skipTo]) {
          skipTo = 0
        }

        var bridge = baseBridge.forResponse(response)
        bridge.changePath("/give-me-work/programming")

        sendNextTask(list, bridge)
      }
    )

    WebSite.megaBoot()
  }
)