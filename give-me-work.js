var library = require("module-library")(require)

library.using(
  ["web-element", "web-site", "browser-bridge", "basic-styles", "tell-the-universe", "release-checklist", "./work-space"],
  function(element, WebSite, baseBridge, basicStyles, tellTheUniverse,releaseChecklist, workSpace) {

    var site = WebSite.provision("/give-me-work")

    baseBridge.addToHead(basicStyles)

    tellTheUniverse = tellTheUniverse
      .called("project-process")
      .withNames({
        releaseChecklist: "release-checklist",
        workSpace: "./work-space",
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

        var space = workSpace()

        var list = releaseChecklist.get("putw4e")

        var task = getTask(space, list)

        workSpace.focusOn(space, list.id, task)

        var bridge = baseBridge.forResponse(response)

        sendWorkSpace(space, bridge)
      }
    )

    site.addRoute("get",
      "/work-space/:id",
      function(request, response) {
        var space = workSpace.get(request.params.id)

        sendWorkSpace(space, baseBridge.forResponse(response))
      }
    )

    function getTask(space, list) {
      if (typeof skipTo == "undefined") {
        skipTo = 35
        console.log("Skipping to ", skipTo)
      }

      for(var i=skipTo; i<list.tasks.length; i++) {
        if (list.tasksCompleted[i]) {
          continue
        }
        return list.tasks[i]
      }
    }

    function sendWorkSpace(space, bridge) {

      var job = element("p", "Make it so «"+space.currentTask+"» is possible")
      job.appendStyles({"min-height": "2.5em"})

      var putBack = element("a.button", "Put it back", {href: "/work-space/"+space.id+"/dont-want/"+encodeURIComponent(space.currentTask)})

      var start = element("a.button", "Start working", {href: "/work-space/"+space.id+"/start-working"})

      bridge.send([job, putBack, start])
    }

    var skipTo

    site.addRoute("get",
      "/work-space/:spaceId/dont-want/:text",
      function(request, response) {

        var list = releaseChecklist.get("putw4e")
        var space = workSpace.get(request.params.spaceId)
        var task = request.params.text

        var nextIndex = list.tasks.indexOf(task) + 1
        var task = list.tasks[nextIndex]

        if (!task) {
          nextIndex = 0
          task = list.tasks[0]
        }

        workSpace.focusOn(space, list.id, task)

        var bridge = baseBridge.forResponse(response)

        if (space.isPersisted) {
          saveSkipEventually(space, list.id)
          bridge.changePath("/work-space/"+space.id)
        }

        console.log("Skipping to", nextIndex)

        sendWorkSpace(space, bridge)
      }
    )

    site.addRoute("get",
      "/work-space/:id/start-working",
      function(request, response) {
        var space = workSpace.get(request.params.id)
        var list = releaseChecklist.get("putw4e")

        saveSkipEventually(space, list.id)

        var bridge = baseBridge.forResponse(response)

        bridge.changePath("/work-space/"+space.id)

        sendWorkSpace(space, bridge)
      }
    )

    function saveSkipEventually(space, listId) {
      if (space.saving) {
        clearTimeout(space.skipSaveTimeout)
      } else {
        space.saving = true
      }
      
      space.skipSaveTimeout = setTimeout(saveSkip.bind(null, space, listId), 3000)
    }

    function saveSkip(space, listId) {
      space.saving = false

      if (!space.isPersisted) {
        tellTheUniverse("workSpace", space.id)
        space.isPersisted = true
      }

      tellTheUniverse("workSpace.focusOn", space.id, listId, space.currentTask)
    }

    WebSite.megaBoot()
  }
)