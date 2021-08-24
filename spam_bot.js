// main.js
let settings
let spam_settings
let bots = []
let spam = false
// アプリケーションの寿命の制御と、ネイティブなブラウザウインドウを作成するモジュール
const { app, BrowserWindow, BrowserView, ipcMain } = require('electron')
const path = require('path')
const { mc_auth } = require("./login_server")

function createWindow() {
    // ブラウザウインドウを作成します。
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload_2.js')
        },
        autoHideMenuBar: true,
        icon: "./favicon.ico"
    })

    // そしてアプリの index.html を読み込みます。
    mainWindow.loadFile('main_window.html')

    // デベロッパー ツールを開きます。
    //mainWindow.webContents.openDevTools()

    return mainWindow
}

function createSubWindow() {
    // ブラウザウインドウを作成します。
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 550,
        webPreferences: {
            preload: path.join(__dirname, 'subWindow.js')
        },
        autoHideMenuBar: true,
        icon: "./favicon.ico"
    })

    // そしてアプリの index.html を読み込みます。
    mainWindow.loadFile('settings_window.html')

    // デベロッパー ツールを開きます。
    //mainWindow.webContents.openDevTools()

    return mainWindow
}
// このメソッドは、Electron の初期化が完了し、
// ブラウザウインドウの作成準備ができたときに呼ばれます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.whenReady().then(() => {
    mainWindow = createWindow()
    subWindow = createSubWindow()

    app.on('activate', function () {
        // macOS では、Dock アイコンのクリック時に他に開いているウインドウがない
        // 場合、アプリ内にウインドウを再作成するのが一般的です。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    mainWindow.on("close", function () {
        for (window of BrowserWindow.getAllWindows()) {
            if (window != mainWindow) {
                window.close()
            }
        }
        app.quit()
        setTimeout(() => {
            process.exit(1)
        }, 1000);
    })

    ipcMain.on("send-settings-data", function (event, data) {
        settings = data
        mainWindow.webContents.send("log", `Loaded settings`)
        mainWindow.webContents.send("log", `---------------------------------------------------`)
        mainWindow.webContents.send("log", `Target host -> ${data.host}:${data.port}`)
        mainWindow.webContents.send("log", `Auth type -> ${data.type}`)
        mainWindow.webContents.send("log", `Accounts length -> ${data.accounts.length}`)
        mainWindow.webContents.send("log", `Player join delay -> ${data.join_delay}ms`)
        mainWindow.webContents.send("log", `---------------------------------------------------`)
        console.log(data)
        subWindow.close()
    })

    ipcMain.on("open-settings", function (event) {
        subWindow = createSubWindow()
        subWindow.webContents.on('did-finish-load', () => {
            subWindow.webContents.send("edit-settings", settings)
        });
    })

    ipcMain.on("start-login", async function (event) {
        mainWindow.webContents.send("log", "Logged in...")
        for (account of settings.accounts)
            try {
                await sleep(settings.join_delay)
                bot_login(account)
            }
            catch {
                console.log("YEP")
            }
    })
})

// macOS を除き、全ウインドウが閉じられたときに終了します。 ユーザーが
// Cmd + Q で明示的に終了するまで、アプリケーションとそのメニューバーを
// アクティブにするのが一般的です。
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
        setTimeout(() => {
            process.exit(1)
        }, 1000);
    }
})

async function bot_login(account) {
    let bot
    switch (settings.type) {
        case "mojang":
            console.log("Mojang")
            console.log("LENGT" + settings.accounts.length)
            if (settings.proxy == false) {
                bot = new mc_auth(settings.host, settings.port).mojang(account.split(":")[0], account.split(":")[1])
                //bot = new mc_auth(settings.host, settings.port).debug(account)
            }
            else {
                random_array_num = Math.floor(Math.random() * settings.proxies.length)
                proxy = settings.proxies[random_array_num]
                settings.proxies.slice(random_array_num, 1)
                console.log(proxy)
                bot = new mc_auth(settings.host, settings.port).debug(account, null, proxy)
            }
            bot.account = account
            control_bot(bot)
            break
        case "altening":
            console.log("Altening")
            console.log("LENGT" + settings.accounts.length)
            if (settings.proxy == false) {
                bot = new mc_auth(settings.host, settings.port).altening(account)
            }
            else {
                random_array_num = Math.floor(Math.random() * settings.proxies.length)
                proxy = settings.proxies[random_array_num]
                settings.proxies.slice(random_array_num, 1)
                console.log(proxy)
                bot = new mc_auth(settings.host, settings.port).debug(account, null, proxy)
            }
            bot.account = account
            control_bot(bot)
            break
    }
}

async function control_bot(bot) {
    bots.push(bot)

    bot.alive = false

    bot.on("message", async function (message) {
        msg = message.toString()
        BrowserWindow.getAllWindows()[0].webContents.send("log", `${msg}`)
    })

    bot.on("spawn", function () {
        console.log("SPAWN " + bot.username)
        bot.alive = true
        BrowserWindow.getAllWindows()[0].webContents.send("log", `${bot.username} Connected`)
        BrowserWindow.getAllWindows()[0].webContents.send("joined-players", bots.length)
        if (spam == true) {
            bot.spam_text = spam_settings.text[Math.floor(Math.random()) * spam_settings.text.length]
            spammer(bot, spam_settings)
        }
    })
    bot.on("kicked", async function (err) {
        console.log(err)
        BrowserWindow.getAllWindows()[0].webContents.send("log", `${bot.username} kicked -> ${err}`)
        if (err.toString().includes("You are banned from this server")) {
            return
        }
        await sleep(settings.join_delay)
        bot_login(bot.account)
    })
    bot.on("error", async function (err) {
        console.log(err)
        BrowserWindow.getAllWindows()[0].webContents.send("log", `${bot.username} Error -> ${err}`)
        await sleep(settings.join_delay)
        bot_login(bot.account)
    })
    bot.on("end", function () {
        console.log(`${bot.username} is END`)
        bot.end()
        bot.alive = false
        bots_index = bots.indexOf(bot)
        bots.splice(bots_index, 1)
        console.log(bots_index)
        console.log(bots.length)
        BrowserWindow.getAllWindows()[0].webContents.send("joined-players", bots.length)
    })

}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function spammer(bot, settings) {
    while (spam == true) {
        await sleep(settings.delay)
        bot.chat(bot.spam_text)
    }
}

ipcMain.on("stop-spam", function () {
    spam = false
})

ipcMain.on("start-spam", async function (event, settings) {
    spam = true
    spam_settings = settings
    console.log(typeof (settings.delay))
    console.log(settings.delay)
    index_number = 0
    for (bot of bots) {
        bot.spam_text = settings.text[index_number]
        if (index_number >= settings.text.length - 1) {
            index_number = 0
        }
        else {
            index_number += 1
        }
        await sleep(settings.delay_player)
        spammer(bot, settings)
    }
})

ipcMain.on("stop", function () {
    BrowserWindow.getAllWindows()[0].webContents.send("log", "Stopping...")
    for (bot of bots) {
        bot.end()
    }
})

// このファイルでは、アプリ内のとある他のメインプロセスコードを
// インクルードできます。 
// 別々のファイルに分割してここで require することもできます。
