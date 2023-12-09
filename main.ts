#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
 *  - https://github.com/wechaty/wechaty
 */
// https://stackoverflow.com/a/42817956/1123955
// https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
import 'dotenv/config.js'

import {
  Contact,
  Friendship,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
}                  from 'wechaty'
import { FileBox }  from 'file-box'
import qrcodeTerminal from 'qrcode-terminal'
import { FriendshipType } from 'wechaty-puppet/dist/esm/src/schemas/friendship';

// to convert audio message
import FS from 'fs';
import PATH from 'path'
import { Readable } from 'stream';

// post url 
let url : string;
if (process.env.DOCKER === 'production'){
  url = 'http://backend/wechat/receive_msg';
} else {
  url = 'http://127.0.0.1:8000/wechat/receive_msg';
}
let token_url : string;
if (process.env.DOCKER === 'production'){
  token_url = 'http://backend/token';
} else {
  token_url = 'http://127.0.0.1:8000/token';
}

//@ts-ignore
import fetch from 'node-fetch' 

async function sendPostRequest(url: string, uid: any, content: any, name:any, date:any, type: any, isRoom: any, roomid: any): Promise<any> {

    
  // const requestOptions: RequestInit = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(postData)
  // };
  let token:string = "";
  let response = await fetch(token_url, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  let data = await response.json();
  token = await data.data.token;
  const postData = {
    name: name,
    id: uid,
    content: content,
    data: date,
    csrfmiddlewaretoken: token,
    type: type,
    isRoom: isRoom,
    roomid: roomid
  };
  // if (!response.ok) {
  //   throw new Error('Network response was not ok');
  // }
  // token = response.json().data.token;
  // console.log(response.json())
  
  return fetch(url, {
    method: 'POST',
    headers: {  
      'Accept': 'application/json',  
      'Content-Type': 'application/json',
      'X-CSRFToken': token,
      'Cookie': 'csrftoken='+ token
    },
    body: JSON.stringify(postData)
  })
    .then((response: any) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    });
}

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

// https://github.com/fuergaosi233/wechat-chatgpt/issues/375
async function saveFile(filebox: any, path:string = 'resource') {
  const audioReadStream = Readable.from(filebox.stream);
  console.log(filebox.name)
  const filePath = PATH.join(path, filebox.name);
  const writeStream = FS.createWriteStream(filePath);

  audioReadStream.pipe(writeStream);

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
function convertSlkToMp3(slkFilePath: string, mp3FilePath: string): void {

    ffmpeg()
        .input(slkFilePath)
        .audioCodec('libmp3lame')  // Use the MP3 codec
        .audioBitrate(192)        // Set the audio bitrate (adjust as needed)
        .save(mp3FilePath)
  }


async function onMessage (msg: Message) {
  if (msg.self()){
    return
  }
  if(msg.talker().id == "weixin"){
    return
  }
  let talker: any = msg.talker();      //
  let text = msg.text();       //消息内容
  const name = talker.name();  //昵称
  const date = msg.date();         //时间
  let room = msg.room();
  let isRoom = false;
  let roomid = "nogroup";
  if (room){
    isRoom = true;
    roomid = msg.room().id;
  } else{

  }
  log.info('StarterBot', msg.toString())
  // console.log(bot.Message.Type)
  let type: string = "undefined"
  if (msg.type() === bot.Message.Type.Audio) {
    type = "audio"
    const voiceFile = await msg.toFileBox();
    //console.log(`Received a voice msg: ${voiceFile.name}`);
    // voiceFile.toFile('tmp/123.amr');
    saveFile(voiceFile, 'tmp')
    let silFilePath: string = 'tmp/' + voiceFile.name;
    let mp3FilePath = silFilePath + '.mp3'
    FS.writeFileSync(mp3FilePath, "");
    convertSlkToMp3(silFilePath, mp3FilePath)
    let mp3Content: Buffer = FS.readFileSync(mp3FilePath);
    let base64Encoded: string = mp3Content.toString('base64');
    FS.unlinkSync(silFilePath);
    // FS.unlinkSync(mp3FilePath);
    text = base64Encoded;
  }
  else if(msg.type() == bot.Message.Type.Image)
  {
    type = "image"
    const imageFile = await msg.toFileBox();
    let imagePath = 'tmp/' + imageFile.name
    await imageFile.toFile(imagePath)
    let imgContent: Buffer = FS.readFileSync(imagePath);
    let base64Encoded: string = imgContent.toString('base64');
    // FS.unlinkSync(mp3FilePath);
    text = base64Encoded;
  }
  else {
    type = "text"
  }
  console.log(text)
  await sendPostRequest(url, talker.id, text, name, date, type, isRoom, roomid)
  .then(data => {
      if (data.data.type == "text"){
        msg.say(data.data.content)
      }
      else if(data.data.type == "url"){
        const fileBox = FileBox.fromUrl(data.data.url)
        msg.say(fileBox)
      }
      else if(data.data.type == "local"){
        const fileBox = FileBox.fromFile(data.data.routine)
        msg.say(fileBox)
      }
      else if (data.data.type == "image"){
        // const fileBox = FileBox.fromUrl(data.img_url)
        const fileBox = FileBox.fromFile('0.5.png')
        msg.say(fileBox)
      }
      else if (data.data.type == "file"){
        const fileBox = FileBox.fromFile('1.txt')
        talker.say(fileBox)
      }
      else if (data.data.type == "audio"){
        msg.say("this is a audio")
      }
      else{
        msg.say("Error!")
      }
  })
  .catch(error => {
      console.error('Fetch error: ', error);
  });
  // if (msg.text() === 'ding') {
  //   await msg.say('dong')
  // }
  // else{
  //   await msg.say(return_content)
  // }
}

async function onFriendship (friendship: Friendship) {
    try{
        const hello_word:string = "你好! 这里是TrivialTodo小助手"
        console.log("abc")
        await friendship.accept()
        let friend = await friendship.contact()
        let label = await friend.alias()
        console.log('###', typeof label)
        if (label == "" || typeof label === undefined || typeof label == null)
        {
          let friends = await bot.Contact.findAll()
          let friend_num = friends.length
          let currentTimestamp: number = Date.now();
          friend.alias('#user_' + (String)(friend_num) + '_accepted_on_' + (String)(currentTimestamp))
          friend.say(hello_word)
        }
        else{
          friend.say(hello_word)
        }
    }
    catch (e) {
        console.error(e)
      }
}


const bot = WechatyBuilder.build({
  name: 'config/ding-dong-bot',
  /**
   * You can specific `puppet` and `puppetOptions` here with hard coding:
   *
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true,
  },
   */
  /**
   * How to set Wechaty Puppet Provider:
   *
   *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-whatsapp' }`, see below)
   *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-whatsapp`)
   *
   * You can use the following providers locally:
   *  - wechaty-puppet-wechat (web protocol, no token required)
   *  - wechaty-puppet-whatsapp (web protocol, no token required)
   *  - wechaty-puppet-padlocal (pad protocol, token required)
   *  - etc. see: <https://wechaty.js.org/docs/puppet-providers/>
   */
  // puppet: 'wechaty-puppet-whatsapp'

  /**
   * You can use wechaty puppet provider 'wechaty-puppet-service'
   *   which can connect to remote Wechaty Puppet Services
   *   for using more powerful protocol.
   * Learn more about services (and TOKEN) from https://wechaty.js.org/docs/puppet-services/
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)
bot.on('friendship', onFriendship)

// receive request from backend
// https://github.com/fuergaosi233/wechat-chatgpt/issues/375
import express, { Request, Response } from 'express';
import { request } from 'http';
// import { Contact } from 'wechaty-puppet/types';


// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });



bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
  .then(() =>{
  const app = express();
  const port = 3000;
  app.use(express.json());

  app.get('/all_contact', async (req: Request, res: Response) => {
    let friends = await bot.Contact.findAll()
    for (const contact of friends) {
      let label = await contact.alias()
      if (typeof label === undefined)
        console.log(contact.name(), '#', 'label is not defined')
      else
        console.log(contact.name(), '#', label);
    }
    res.json({ code: 200, data: {msg : "Succeed"} });
  });

  app.get('/all_room', async (req: Request, res: Response) => {
    let rooms = await bot.Room.findAll()

    let contactIds: string[] = rooms.map(room => room.id);
    res.json({ code: 200, data: {contacts : contactIds} });
  }); 

  app.get('/all_contact_in_room', async (req: Request, res: Response) => {
    let roomid : string = req.query.roomid as string;
    let room = await bot.Room.find({id: roomid})
    let contacts = await room.memberAll();
    let contactIds: string[] = contacts.map(contact => contact.id);
    if (contactIds.length == 0){
      res.json({ code: 404, data: {} });
    }
    else{
      res.json({ code: 200, data: {contacts : contactIds} });
    }
  });

  app.post('/send_msg_by_name', async(req: Request, res: Response) => {
    const requestBody = req.body;

    let id = requestBody.id 
    let content = requestBody.content
    let talker = await bot.Contact.find({name : id})
    if (talker instanceof bot.Contact){
      await talker?.say(content)
      res.json({ code: 200, data: {msg : "Succeed"} });
    } else{
      console.log('Error')
      res.json({ code: 404, data: {msg : "User not found"} });
    }
  });

  app.post('/change_alias', async(req: Request, res: Response) => {
    const requestBody = req.body;

    let fname : string = requestBody.id
    let nalias : string = requestBody.content
    let talker = await bot.Contact.find({name : fname})
    if(talker)
    {
      talker.alias("新备注")
      res.json({ code: 200, data: {msg : "Succeed"} });
    }
    else{
      console.log('Error')
      res.json({ code: 404, data: {msg : "User not found"} });
    }
    // if (talker instanceof bot.Contact){
    //   (talker as Contact).alias("新备注")
    //   res.json({ code: 200, data: {msg : "Succeed"} });
    // } else{
    //   console.log('Error')
    //   res.json({ code: 404, data: {msg : "User not found"} });
    // }
  });

  app.post('/send_msg', async(req: Request, res: Response) => {
    const requestBody = req.body;

    let id = requestBody.id
    let content = requestBody.content
    let talker = await bot.Contact.find({id : id})
    if (talker instanceof bot.Contact){
      await talker?.say(content)
      res.json({ code: 200, data: {msg : "Succeed"} });
    } else{
      console.log('Error')
      res.json({ code: 404, data: {msg : "User not found"} });
    }
  });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });}
  )
