const Discord = require('discord.js')
const ms = require('ms')
const client = new Discord.Client()
client.ongoingMails = new Discord.Collection()
client.cooldowns = new Discord.Collection()
client.userReports = new Discord.Collection()

client.on('ready', () => {
    client.user.setActivity('DM me for assistance')
    console.log('ready')
})

client.on('message', async message => {
    if (client.ongoingMails.has(message.author.id)) return;
    if (message.author.bot) return;
    if (message.channel.type == 'dm') {
        if (client.cooldowns.has(message.author.id)) {
        let now = Date.now()
        let expiration = now+ms('5m')
            if (now < expiration) {
                let timeleft = expiration - now
                return message.channel.send(`You need to wait ${ms(timeleft)} before suggestion/report`)
            }
        }
        setTimeout(async () => {
            client.cooldowns.delete(message.author.id)
        }, expiration)
        client.cooldowns.set(message.author.id)
        client.ongoingMails.set(message.author.id, message.author)
        let selectedOption = null
        let selected = false
        let msg = await message.channel.send(
            {
                embed: {
                    title: 'Ascend Modmail Bot',
                    description: `What would you like to do?\n📑: For suggestions\n⚒: For reports`
                }
            }
        )
        await msg.react('📑')
        await msg.react('⚒')
        let filter = (reaction, user) => {
            return ['📑', '⚒'].includes(reaction.emoji.name) && message.author.id === user.id
        }
        let filtermsg = m => m.author.id === message.author.id && !m.author.bot
        let collector = msg.createReactionCollector(filter)
        let collectormsg = msg.channel.createMessageCollector(filtermsg)
        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name == '📑') {
                selected = true
                selectedOption = "Suggestion"
                message.channel.send('What would you like to suggest?')
                collector.stop()
            } else if (reaction.emoji.name == '⚒') {
                selected = true
                selectedOption = "Report"
                message.channel.send('What would you like to report?')
                collector.stop()
            }
        })
        collectormsg.on('collect', async m => {
            if (selected == false) return;
            let guild = client.guilds.cache.get('708194204274131005')
            let suggestchannel = guild.channels.cache.find(f => {return f.name.includes('modmail-logs')})
            if (!suggestchannel) return;
            if (selectedOption == "Suggestion") {
                suggestchannel.send(
                    {
                        embed: {
                            title: 'Suggestion',
                            description: `${message.author.tag}: ${m.content}`
                        }
                    }
                ).then(mm => {
                    message.channel.send(`Successfully sent the suggestion`)
                })
                .catch(err => {
                    console.error(err)
                })
            } else if (selectedOption == "Report") {
                client.userReports.set(message.author.id, message.author.id)
                let channel = await guild.channels.create(`${message.author.id}`, {
                    type: 'text',
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: ["VIEW_CHANNEL"]
                        },
                        {
                            id: message.author.id,
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: `689445730636660825`, //remo
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: `684095690812555305`, //atta
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: `445643175369900032`, //rarted
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: `741309836259491851`, //jupiter
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: `623589834866556951`, //abeer
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: `434409763233857536`, //crawler
                            allow: ["VIEW_CHANNEL"]
                        }
                    ]
                })
                await channel.send(
                    {
                        embed: {
                            title: 'Report',
                            description: `${message.author.tag}: ${m.content}`
                        }
                    }
                ).then(mm => {
                    message.channel.send(`Successfully sent the report`)
                })
                .catch(err => {
                    console.error(err)
                });
                await channel.send(
                    {
                        embed: {
                            description: `Please react below to delete the channel`
                        }
                    }
                ).then(mm => {
                    mm.react('👍')
                })
                .catch(err => {
                    console.err(err)
                })
            }
            selected = false
            selectedOption = null
            setTimeout(() => {
                client.ongoingMails.delete(message.author.id)
            }, 500)
            collectormsg.stop()
        })
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.channel.type == 'dm') return;
    if (reaction.emoji.name == `👍` && client.userReports.array().includes(reaction.message.channel.name) && ['689445730636660825','684095690812555305','445643175369900032','741309836259491851','623589834866556951','434409763233857536'].includes(user.id)) {
        client.userReports.delete(reaction.message.channel.name)
        reaction.message.channel.delete()
    }
})

client.login('ODEwMzc4NTE1MDM4OTk0NDUz.YCixzg.NQaqQiXV_64vxA6HfXANPLldDvg')