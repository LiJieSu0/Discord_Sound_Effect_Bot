const { Client,GatewayIntentBits,EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv').config();
const path = require('path');
var fs = require('fs');
var files = fs.readdirSync('./sound_effect');

const { joinVoiceChannel,createAudioPlayer,createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});
client.login(process.env.TOKEN);

const PREFIX="!";

client.on("ready",()=>{
    console.log(`Logged in as ${client.user.tag}`);
})

const AudioList=files.map(f=>{return path.parse(f).name}); //conver all files in sound_effect to a file name only list.

let timer;
const player = createAudioPlayer();

client.on("messageCreate", async(msg)=>{
    if(msg.content.startsWith(`${PREFIX}help`)){    
        const commandList=()=>{
            return AudioList.join(", ").toString();
        }

        const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('SE_Bot Command List')
        .setURL('https://discord.js.org/')
        .setAuthor({ name: 'LiJie Su', url: 'https://i.imgur.com/gSgE3xx.png' })
        .setThumbnail('https://i.imgur.com/gSgE3xx.png')
        .addFields(
            { name: 'Add ! before every command', value: 'EX: !help, !call, !like'},
            { name: 'Available Options',value: commandList() },
        )
        .setTimestamp();

        msg.channel.send({ embeds: [exampleEmbed] });
        return;
    }
    if(msg.content.startsWith(`${PREFIX}`)){
        const command=msg.content.replace("!","");
        
        if(AudioList.includes(command)){
            const audioPath=path.join(__dirname,'sound_effect',command+'.ogg');
            const resource = createAudioResource(audioPath);
            player.play(resource);
            setTimeout(()=>{
                msg.delete(); 
            },2000);
            try{
                if (msg.member.voice.channel) {
                    const connection = createAudioConnection(msg.member.voice.channel);                 
                    const subscription=connection.subscribe(player);
                    
                const destroyConnect=()=>{
                timer=setTimeout(() =>{ 
                    try{connection.destroy();}catch(e){console.log("Already destroyed");}
                }, 5_000);}

                player.on(AudioPlayerStatus.Playing, (oldState, newState) => {//Reset the timer once audio is playing.
                    clearTimeout(timer);
                    destroyConnect();
                });
                }
            }catch(e){
                    console.log(e);
            }
        }
        else{
            msg.reply("Command not found");
            return;
        }
        if(!msg.member.voice.channel){
            msg.reply("You must stay in at least one voice channel!");
        }
    } 
});


function createAudioConnection(channel){
    let connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    return connection;
}
