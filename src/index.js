const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { Socket } = require('dgram')
const { generateMessage,generateUrlMessage } = require('./utils/messagers')
const { addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')
const { isObject } = require('util')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.port || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: ' + add);
  })

io.on('connection', (socket)=>{
    console.log('message soket connection')
    socket.on('join', ({username, room},calllback)=>{

        const {error, user} = addUser({id: socket.id, username: username,room: room})

        if(error){
          // return calllback(error) 
           io.emit('roomData',{success: false, message: error, data:{}})
           return 
           //calllback(error) 
        }
        
        socket.join(user.room) 
    
        //welcome message
        io.to(user.room).emit('roomData',{success: true, data:{

            room: user.room,
            users: getUserInRoom(user.room)
        }})

        
        socket.emit('replied', generateMessage('Admin','Welcome!'))
        //send message to infrom others new uer join
        socket.broadcast.to(user.room).emit('replied',generateMessage("Admin",user.username + " has joined!"))

        //socket.emit('callbackSuccessMessage',{success: true, message: "delivered"} )
        
    })

    //send user message
    socket.on('sendMessage', (value)=>{

        const user = getUser(socket.id) 
        const person = user.username

        // if(username === user.username){
        //     person = "You"
        // }

        io.to(user.room).emit('replied',generateMessage(person, value))
        //socket.emit('callbackSuccessMessage',{success: true, message: "delivered"} )
      
    })

    //send location link 
    socket.on('sendLocation', (coords) =>{
        const user = getUser(socket.id)
        
        const mapLink = 'https://www.google.com.my/maps/@'+coords.latitude+'.'+coords.longitude
        io.to(user.room).emit('locationReplied', generateUrlMessage(user.username, mapLink))

        //socket.emit('callbackSuccessMessage',{success: true, message: "delivered"} )
      
    })

    //send user left message
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('replied', generateMessage("Admin", user.username+' has left!'))

            io.to(user.room).emit('roomData',{success: true, data:{

                room: user.room,
                users: getUserInRoom(user.room)
            }})
    

            // io.to(user.room).emit('roomData',{room: user.room, users: getUserInRoom(user.room)})
        }
    })
})

server.listen(port, () =>{
    console.log('Server is up on port '+port)
})

