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

let url : string;
if (process.env.DOCKER === 'production'){
  url = 'http://backend/wechat/receive_msg';
} else {
  url = 'http://127.0.0.1:8000/wechat/receive_msg';
}

//@ts-ignore
import fetch from 'node-fetch' 

async function sendPostRequest(url: string, uid: any, content: any, name:any, date:any): Promise<any> {
  const postData = {
      name: name,
      id: uid,
      content: content,
      date: date
    };
    
  // const requestOptions: RequestInit = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(postData)
  // };

  return fetch(url, {
    method: 'POST',
    headers: {  
      'Accept': 'application/json',  
      'Content-Type': 'application/json'
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

async function onMessage (msg: Message) {
  let talker: any = msg.talker();      //
  const text = msg.text();       //消息内容
  const name = talker.name();  //昵称
  const date = msg.date();         //时间
  log.info('StarterBot', msg.toString())
  await sendPostRequest(url, talker.id, text, name, date)
  .then(data => {
      if (data.type == "text"){
        msg.say(data.content)
      }
      else if(data.type == "url"){
        const fileBox = FileBox.fromUrl(data.url)
        msg.say(fileBox)
      }
      else if(data.type == "local"){
        const fileBox = FileBox.fromFile(data.routine)
        msg.say(fileBox)
      }
      else if (data.type == "image"){
        // const fileBox = FileBox.fromUrl(data.img_url)
        const fileBox = FileBox.fromFile('0.5.png')
        msg.say(fileBox)
      }
      else if (data.type == "file"){
        const fileBox = FileBox.fromFile('1.txt')
        talker.say(fileBox)
      }
      else if (data.type == "audio"){
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
        await friendship.accept()
        let friend = friendship.contact()
        const hello_word:string = "你好! 这里是TrivialTodo小助手"
        friend.say(hello_word)
    }
    catch (e) {
        console.error(e)
      }
}


const bot = WechatyBuilder.build({
  name: 'tmp/ding-dong-bot',
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

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
