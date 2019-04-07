const express = require('express')
const socket = require('socket.io')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socket(server)

const db = require("./db.js")

user_list = []

io.sockets.on('connection', function(socket){
  socket.on('newUser',async (data) => {
    ip_re = /(\d+).(\d+).(\d+).(\d+)/g
    address = socket.handshake.address
    ip = ip_re.exec(address)[0]
    user = await db.check_user(data)
    if (!user) {
      db.set_user(data.k_id, data.k_nick, data.k_img, 0)
    }

    db.chang_stat(data.k_id, "on")

    let wel_msg = data.k_nick + '님이 접속 하셨습니다.'
    io.sockets.emit('update', {
      type : 'connect',
      k_id : 'SERVER',
      msg : wel_msg
    })

    db.set_log(ip, data.k_id, "login")
    socket.ip = ip
    socket.k_nick = data.k_nick
    socket.k_id = data.k_id
    user_list = await db.get_user_list()
    //모두에게 메세지를 날리는 방법
    io.sockets.emit('user_update', user_list)
  })

  socket.on('send_msg', function(data){
    data.k_id = socket.k_id
    console.log(data)
    io.sockets.emit('update', data)
  })

  socket.on('disconnect',function(){
    if (!socket.k_nick) {
      return
    }
    let dis_msg = socket.k_nick + "님이 나갔습니다."
    socket.broadcast.emit('update', {
      type : 'disconnect',
      k_id : 'SERVER',
      msg : dis_msg
    })

    //user 상태를 off로
    db.chang_stat(data.k_id, "off")

    //logout log 남기기
    db.set_log(ip, data.k_id, "logout")

    user_list = await db.get_user_list()
    //본인을 제외한 모두에게 메세지를 날리는 방법
    socket.broadcast.emit('user_update', user_list)
  })
})

app.get('/', function(request, response){
  //console.log('유저가 /로 접속했습니다.')
  //response.send('Hello Express Server')
})

server.listen(8080, function() {
  console.log('서버 실행중..')
})
