const Discord = require('discord.js')
const client = new Discord.Client()
client.ongoingMails = new Discord.Collection()
client.cooldowns = new Discord.Collection()

client.on('ready', () => {
    client.user.setActivity('DM me for assistance')
    console.log('ready')
})

client.on('message', async message => {
    if (client.ongoingMails.has(message.author.id)) return;
    if (message.author.bot) return;
    if (message.channel.type == 'dm') {
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
            let channel = guild.channels.cache.find(f => {return f.name.includes('modmail-logs')})
            if (!channel) return;
            if (selectedOption == "Suggestion") {
                channel.send(
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
                channel.send(
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

client.login('ODEwMzc4NTE1MDM4OTk0NDUz.YCixzg.NQaqQiXV_64vxA6HfXANPLldDvg')