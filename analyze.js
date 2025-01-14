const discord = require('discord.js');

const config = require('./config.json');

const fs = require('fs');
const path = require('path');

const { convertArrayToCSV } = require('convert-array-to-csv');


const discordclient = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds,discord.GatewayIntentBits.GuildMessages,discord.GatewayIntentBits.DirectMessages] });

discordclient.login(config.discord.token);

discordchannel = '1316019913575628870';
userschannel = '';
datachannel = '';
const users = [];
const messages = [];

discordclient.once(discord.Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    console.log(readyClient.guilds);
    console.log(readyClient.channels)
    channelobject = readyClient.channels.cache.get(discordchannel);

    discordclient.channels.cache.forEach(channel => {
        if(channel.name == "users"){userschannel = channel.id}
        if(channel.name == "data"){datachannel = channel.id}
    })
    // read users
    
    const channel = discordclient.channels.cache.get(userschannel);
    channel.messages.fetch({ limit: 100 }).then(messages => {
        console.log(`Received ${messages.size} messages`);
        //Iterate through the messages here with the variable "messages".
        messages.forEach(message => {console.log(message.content); users.push(message.content);})
        console.log(users)
      })
    
    fetchAllMessages();
});

async function fetchAllMessages() {
    const channel = discordclient.channels.cache.get(datachannel);
  
    // Create message pointer
    let message = await channel.messages
      .fetch({ limit: 1 })
      .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
  
    while (message) {
      await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then(messagePage => {
          messagePage.forEach(msg => messages.push(msg.content));
  
          // Update our message pointer to be the last message on the page of messages
          message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }
  
    //console.log(messages);  // Print all messages
    //console.log(messages)
    console.log(messages.length)

    useMessages();
}

const results = {};
function useMessages(){
    // use messages
    messages.forEach(element => {
        var array = element.split(",");
        var user = array[0];
        var type = array[1];
        var variable = array[2];
        var money = array[3];
        var timesinceupgrade = array[4];
        var gamesession = array[5];

        var t; var d;
        switch(type){
            case "upgrade":
                t = Number(variable)-1;
                d = [variable,money,timesinceupgrade,gamesession];
            break;
            case "endgame":
                t = Number(gamesession)-1;
                d = [gamesession,variable,money,timesinceupgrade];
            break;
        }
        
        if(results[user] == undefined){results[user] = {}}
        if(results[user][type] == undefined){results[user][type] = [];}
        results[user][type][t] = d;
    });

    // cleanup
    for (user in results) {
        for (type in results[user]) {
            results[user][type].forEach(arr => {
                var len = arr.length, i;
                for(i = 0; i < len; i++ ){
                    arr[i] && arr.push(arr[i]);
                }
            });
        }       
    }
    
    // save
    for (const [key, value] of Object.entries(results)) {
        console.log(`${key}`)
        console.log(value)
        var folder = "./results/"
        var separator = ",";

        if("upgrade" in value){
            var header = ["upgrade","money","last_upgrade","session"];

            var csv = convertArrayToCSV(value["upgrade"],{header,separator});
            console.log("hi")
            console.log(csv)
            
            var f = path.join(folder,"upgrade/");
            if (!fs.existsSync(f)) {
                fs.mkdirSync(f);
              }           
            fs.writeFileSync(path.join(f,`${key}.csv`),csv, err =>{
                if(err){console.log(18,err)}
                console.log(`upgrade/${key}.csv`)
            })
        

            if("endgame" in value){
                var header = ["session","session_time","money","last_upgrade"];
                //var csv = convertArrayToCSV(value["endgame"],{header,separator});

                /*fs.writeFile(folder+"endgame/"+`${key}.csv`,csv, err =>{
                    if(err){console.log(18,err)}
                    console.log(`endgame/${key}.csv`)
                })*/
            }
        }
    }
    console.log(Object.entries(results).length)
}

function getAverage(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  }

function getMedian(arr) {
    const middle = (arr.length + 1) / 2;

    // Avoid mutating when sorting
    const sorted = [...arr].sort((a, b) => a - b);
    const isEven = sorted.length % 2 === 0;

    return isEven ? (sorted[middle - 1.5]
        + sorted[middle - 0.5]) / 2 :
        sorted[middle - 1];
}