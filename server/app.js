const express = require('express')
const socket = require('socket.io')
const http = require('http')

const app = express()

const server = http.createServer(app)

const io = socket(server)

user_list = []

io.sockets.on('connection', function(socket){
  console.log('유저 접속 : ',socket.id)

  socket.on('newUser', function(k_nick){
    let wel_msg = k_nick + '님이 접속 하셨습니다.'
    console.log(wel_msg)
    socket.k_nick = k_nick
    io.sockets.emit('update', {
      type : 'connect',
      k_nick : 'SERVER',
      msg : wel_msg
    })
    user_list.push(k_nick)
    console.log(user_list)
    io.sockets.emit('user_update', user_list)
  })

  socket.on('send_msg', function(data){
    data.k_nick = socket.k_nick
    console.log(data)
    io.sockets.emit('update', data)
  })

  socket.on('disconnect',function(){
    let dis_msg = socket.k_nick + "님이 나갔습니다."
    console.log(dis_msg)
    socket.broadcast.emit('update', {
      type : 'disconnect',
      k_nick : 'SERVER',
      msg : dis_msg
    })
    user_index = user_list.indexOf(socket.k_nick)
    if(user_index != -1){
      user_list.splice(user_index, 1)
    }
    console.log(user_list)
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
