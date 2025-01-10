//const config = require('./config.json');
require('dotenv').config()

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const discord = require('discord.js');

const { v4: uuidv4 } = require('uuid');


app.use(express.json());

app.get('/ping', (req,res) => {
    res.status(200).send({
        ping:'pong',
    })
})

app.get('/config/:id', (req,res) => {
    const { id } = req.params;

    let duplicateArray = [].concat(users).reverse();
    var ind = duplicateArray.indexOf(id);
    var config = "C";
    if(ind!=-1){
        var choices = ["A","B"];
        var nind = ind % 2;
        config = choices[nind];
    }
    console.log(`Sent config ${config} to ${id}`)
    res.status(200).send({
        config,
    })
})

app.get('/login', (req,res) => {
    text = undefined; textgood = false;
    while(!textgood){
        text = uuidv4();
        textgood = !(users.includes(text));
    }
    const channel = discordclient.channels.cache.get(userschannel);
    channel.send(text);
    users.push(text);
    res.status(200).send({
        loginname : text
    })
})



/*
app.post('/stats/:id', (req,res) => {

    const { id } = req.params;
    const { logo } = req.body;


    res.send({
        "stats":"gotten",
        "data":`${id} with ${logo}`
    })
})
*/

app.post('/stats', (req,res) => {

    const body = req.body;
    console.log(body);
    
    // check if loginname exists
    if(!"loginname" in body){return;}
    if(!users.includes(body["loginname"])){console.log(`[WARN] loginname ${body["loginname"]} does not exist in list.`) ;return;}
    if(!"type" in body){return;}

    var str = `${body.loginname},${body.type},${body.numb},${body.money},${body.upgradetime}`;

    const channel = discordclient.channels.cache.get(datachannel);
    channel.send(str);

    res.status(200).send({
        result:str,
    })
})


app.listen(PORT, () => console.log(`server hosting on http://localhost:${PORT}`));

discordchannel = '1316019913575628870';
userschannel = '';
datachannel = '';

const users = [];

channelobject = undefined;
const discordclient = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds,discord.GatewayIntentBits.GuildMessages,discord.GatewayIntentBits.DirectMessages] });
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
    
});
discordclient.login(process.env.DISCORDTOKEN);

discordclient.on("messageCreate", async (message) => {
    if(!message.author.bot){
        //message.author.send(`Hello ${message.author.globalName}`)
    }
})

