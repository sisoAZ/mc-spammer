const { ipcRenderer } = require("electron")
window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("settings_confirm").addEventListener("click", async () => {
        const data = {
            host: null,
            port: 25565,
            type: null,
            accounts: null,
            proxy: false,
            proxies: null,
            join_delay: 5000
        }
        data.host = document.getElementById("host").value
        data.port = parseInt(document.getElementById("port").value)
        data.type = document.getElementById("account_type").value
        data.accounts = document.getElementById("read-account-textarea").value.split("\n")
        data.join_delay = parseInt(document.getElementById("join-delay").value)
        //if (document.getElementById("proxy-on").checked) {data.proxy = true}
        //data.proxies = document.getElementById("read-proxies-textarea").value.split("\n")
        console.log(data)
        ipcRenderer.send("send-settings-data", data)
    })

    const f = document.getElementById('load_accounts');
    f.addEventListener('change', event => {
        if (event.target.files.length != 0) {
            const file = event.target.files[0]
            const reader = new FileReader()
            reader.onload = function () {
                const textarea = document.getElementById("read-account-textarea")
                for (text of reader.result.split("/n")) {
                    textarea.value += text
                }
            }

            reader.readAsText(file);
        }
    })

})

ipcRenderer.on("edit-settings", function (event, data) {
    document.getElementById("host").value = data.host
    document.getElementById("port").value = data.port
    document.getElementById("account_type").value = data.type
    document.getElementById("read-account-textarea").value = data.accounts.join("\n")
    document.getElementById("join-delay").value = data.join_delay
    document.getElementById("range-input-live-join").innerText = data.join_delay.toString()
})