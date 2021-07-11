const users = []

//addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room}) =>{
    // Clean data
    username = username.trim().toUpperCase()
    room = room.trim().toUpperCase()

    //validate data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    //check for exiting user
    const existingUser = users.find((user) =>{
        return user.room == room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = {id, username, room}

    users.push(user)

    return {user}
}


const removeUser = (id) => {
    const index = users.findIndex((user) =>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const getUserInfo = users.find((user)=>{return user.id === id})
    return getUserInfo
}

const getUserInRoom = (room) => {
    const usersInRoom = users.filter((user)=> {return room === user.room})

    return usersInRoom
}
module.exports={
    addUser,
    removeUser,
    getUser, 
    getUserInRoom
}

