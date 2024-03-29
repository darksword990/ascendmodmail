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

let userperms = ['689445730636660825','684095690812555305','445643175369900032','741309836259491851','623589834866556951','434409763233857536','722319956171030569','421708434165989378']
client.on('message', async message => {
    if (client.ongoingMails.has(message.author.id)) return;
    if (message.author.bot) return;
    //message.guild.members.cache.get('434409763233857536').roles.add('833057848661508097')
    if (message.guild && message.content.toLowerCase() == `<@${client.user.id}>` || message.content.toLowerCase() == `<@!${client.user.id}>`) {
        message.channel.send(`Any queries? DM me for further details!`)
    }
    if (message.channel.type == 'dm') {
        let now = Date.now()
        let cooldownamount = ms('5m')
        if (client.cooldowns.has(message.author.id)) {
            let expiration = client.cooldowns.get(message.author.id)+cooldownamount
            if (now < expiration) {
                let timeleft = expiration - now
                return message.channel.send(`You need to wait ${ms(timeleft, {long: true})} before suggestion/report`)
            }
        }
        client.cooldowns.set(message.author.id, now)
        setTimeout(async () => {
            client.cooldowns.delete(message.author.id)
        }, cooldownamount)
        client.ongoingMails.set(message.author.id, message.author)
        let selectedOption = null
        let selected = false
        let msg = await message.channel.send(
            {
                embed: {
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.displayAvatarURL({format: 'png', dynamic: true})
                    },
                    title: 'Ascend Modmail Bot',
                    description: `
                    Hewwos :slight_smile:\nWelcome to our awesome server Ascend!\nYour everyday chill and hangout server with many gamers, artists and causal peeps to have a chat with!\nWe have really active Voice and Chat channels so ya wont get bored!\nKewl emojis, activities, active and fun staff, everything is here, YA NAME IT!\nSo join now and be a part of this awesome family :heart:\n\nWhat would you like to do?\n📑: For suggestions\n⚒: For reports`,
                    color: 0x00DEFF,
                    thumbnail: {
                        url: client.user.displayAvatarURL({format: 'png'})
                    },
                    timestamp: new Date()
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
            if (selectedOption == "Suggestion") {
                if (!suggestchannel) return;
                suggestchannel.send(
                    {
                        embed: {
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL({format: 'png', dynamic: true})
                            },
                            title: 'Suggestion',
                            description: `${message.author.tag}: ${m.content}`,
                            color: 0x00FF33,
                            timestamp: new Date(),
                            footer: {
                                text: `ID: ${message.author.id}`
                            }
                        }
                    }
                ).then(mm => {
                    message.channel.send(`Successfully sent the suggestion`)
                })
                .catch(err => {
                    console.error(err)
                })
            } else if (selectedOption == "Report") {
                let name = `${message.author.id}-${(Math.random() * 10 + 1).toString().replace('.', '')}`
                if (suggestchannel) {
                    suggestchannel.send(
                        {
                            embed: {
                                author: {
                                    name: message.author.tag,
                                    icon_url: message.author.displayAvatarURL({format: 'png', dynamic: true})
                                },
                                title: `Report Log`,
                                description: `Report was submitted by ${message.author}`,
                                fields: [
                                    {
                                        name: `Report Reason`,
                                        value: m.content
                                    }
                                ],
                                color: 0x00FF33,
                                timestamp: new Date(),
                                footer: {
                                    text: `Report ID: ${name}`
                                }
                            }
                        }
                    )
                }
                client.userReports.set(name, name)
                let perms = [
                    {
                        id: guild.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: message.author.id,
                        allow: ["VIEW_CHANNEL"]
                    }
                ]
                for (const id of userperms) {
                    if (guild.members.cache.has(id)) {
                        perms.push(
                            {
                                id: id,
                                allow: ["VIEW_CHANNEL"]
                            }
                        )
                    }
                }
                let channel = await guild.channels.create(`${name}`, {
                    type: 'text',
                    permissionOverwrites: perms
                })
                await channel.send(
                    {
                        embed: {
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL({format: 'png', dynamic: true})
                            },
                            title: 'Report',
                            description: `${message.author.tag}: ${m.content}`,
                            color: 0x00DEFF,
                            timestamp: new Date(),
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
    if (reaction.emoji.name == `👍` && client.userReports.array().includes(reaction.message.channel.name) && userperms.includes(user.id)) {
        client.userReports.delete(reaction.message.channel.name)
        reaction.message.channel.delete()
    }
})

client.login('ODEwMzc4NTE1MDM4OTk0NDUz.YCixzg.JkNin2lJCkSquw39r9GcTQFvwE4')