const mineflayer = require("mineflayer")
const ProxyAgent = require('proxy-agent')
const Http = require('http')

class mc_auth {

    constructor(host, port = 25565) {
        this.host = host
        this.port = port
    }

    mojang(mail, pass, proxy = null) {
        if (proxy == null) {
            const bot = mineflayer.createBot({
                host: this.host,
                port: this.port,
                username: mail,
                password: pass
            })
            return bot
        }
        else {

        }
    }

    altening(key, proxy = null) {
        if (proxy == null) {
            const bot = mineflayer.createBot({
                host: this.host,
                port: this.port,
                username: key,
                password: "a",
                version: "1.12.2",
                authServer: "http://authserver.thealtening.com",
                sessionServer: "http://sessionserver.thealtening.com"
            })
            return bot
        }
        else {
            const bot = mineflayer.createBot({
                connect: (bot) => {
                    const req = Http.request({
                        host: proxyHost,
                        port: proxyPort,
                        method: 'CONNECT',
                        path: this.host + ':' + this.port
                    })
                    req.end()

                    req.on('connect', (res, stream) => {
                        bot.setSocket(stream)
                        bot.emit('connect')
                    })
                },
                agent: new ProxyAgent({ protocol: 'http', host: proxyHost, port: proxyPort }),
                username: key,
                password: "a",
            })
            return bot
        }
    }
    debug(mail, pass = null, proxy = null) {
        if (proxy == null) {
            const bot = mineflayer.createBot({
                host: this.host,
                port: this.port,
                username: mail
            })
            return bot
        }
        else {
            console.log("RECEIVE PROXY " + proxy)
            const proxyHost = proxy.split(":")[0]
            const proxyPort = proxy.split(":")[1]
            console.log(proxyHost + " ::: " + proxyPort)
            console.log(`this ${this.host} ${this.port}`)
            const bot = mineflayer.createBot({
                connect: (bot) => {
                    const req = Http.request({
                        host: proxyHost,
                        port: proxyPort,
                        method: 'CONNECT',
                        path: this.host + ':' + parseInt(this.port)
                    })
                    req.end()

                    req.on('connect', (res, stream) => {
                        bot.setSocket(stream)
                        bot.emit('connect')
                    })
                },
                agent: new ProxyAgent({ protocol: 'http', host: proxyHost, port: proxyPort }),
                username: mail
            })
            return bot
        }
    }
}

exports.mc_auth = mc_auth