const { ipcRenderer } = require("electron")

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("open-settings").addEventListener("click", function () {
        ipcRenderer.send("open-settings")
    })
    document.getElementById("start-login").addEventListener("click", function () {
        ipcRenderer.send("start-login")
    })
    document.getElementById("start-spam").addEventListener("click", function () {
        data = {
            text: document.getElementById("spam-text").value.split("\n"),
            delay: parseInt(document.getElementById("spam-delay").value),
            delay_player: parseInt(document.getElementById("spam-player-delay").value)
        }
        
        ipcRenderer.send("start-spam", data)
    })
    document.getElementById("stop-spam").addEventListener("click", function () {
        ipcRenderer.send("stop-spam")
    })
    document.getElementById("stop").addEventListener("click", function () {
        ipcRenderer.send("stop")
    })

})

ipcRenderer.on("log", function (event, text) {
    log = document.getElementById("log")
    log.value += text + "\n"
    log.scrollTop = log.scrollHeight
})

ipcRenderer.on("joined-players", function (event, number) {
    document.getElementById("joined-players").innerText = number.toString()
})