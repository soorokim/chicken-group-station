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
    ip = ip_re.exec(address)
    if (ip) {
      ip = ip[0]
    } else {
      ip = 'unknown'
    }
    let user = await db.check_user(data.k_id)
    if(!user){ //db에 user data가 없을때
      db.set_user(data.k_id, data.k_nick, data.k_img, 0)
      user = data
    }else{ //db에 user data가 있을때
      if(user.status === "out"){
          //연결 끊기 !
          socket.disconnect
          console.log("강퇴된 유저 입니다.")
          db.set_log(ip, data.k_id, 'out', '강제퇴장당한 유저입니다.')
          io.to(socket.id).emit('user_data')
          return
      }
      if (data.k_nick != user.k_nick || ){
        db.change_user_data(data)
        user.k_nick = data.k_nick
        db.set_stat(data.k_id, 'chg_nick', user.k_nick+"->"+data.k_nick)
      }
      if (data.k_img != user.k_img){
        db.change_user_data(data)
        user.k_img = data.k_img
        db.set_stat(data.k_id, 'chg_img', user.k_nick+"->"+data.k_nick)
      }
    }

    db.set_stat(data.k_id, 'on')
    console.log(user)

    let wel_msg = data.k_nick + '님이 접속 하셨습니다.'
    io.sockets.emit('update', {
      type : 'connect',
      k_id : 'SERVER',
      msg : wel_msg
    })

    io.to(socket.id).emit('user_data', user)

    db.set_log(ip, data.k_id, 'login')
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

  socket.on('kick', async (data) => {
    await io.of('/').clients((err,clients) => {
      clients.forEach( async (socket_id) => {
        let cl_socket = io.sockets.connected[socket_id]
        if (cl_socket.k_id == data.k_id){
          await db.set_stat(data.k_id, 'out')
          db.set_log(ip, data.k_id, 'forced_out', data.reason)
          io.to(socket_id).emit('forced_out',data.reason)

          let fout_msg = cl_socket.k_nick + "님이 추방당했습니다.\n 사유:" + data.reason
          cl_socket.broadcast.emit('update', {
            type : 'forced_out',
            k_id : 'SERVER',
            msg : fout_msg
          })
          cl_socket.disconnect(data.reason);
        }
      })
    })
    console.log(4)
    user_list = await db.get_user_list()
    console.log(user_list)
    io.sockets.emit('user_update', user_list)
  })

  socket.on('disconnect',async (reason) => {
    if (!socket.k_nick || reason == "server namespace disconnect") {
      return
    }

    let dis_msg = socket.k_nick + "님이 나갔습니다."
    socket.broadcast.emit('update', {
      type : 'disconnect',
      k_id : 'SERVER',
      msg : dis_msg
    })

    //user 상태를 off로
    db.set_stat(socket.k_id, 'off')
    //logout log 남기기
    db.set_log(ip, socket.k_id, 'logout')

    user_list = await db.get_user_list()
    //본인을 제외한 모두에게 메세지를 날리는 방법
    socket.broadcast.emit('user_update', user_list)
  })
})

app.get('/', function(request, response){
})

server.listen(8080, function() {
    console.log('서버 실행중..')
})
