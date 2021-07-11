const socket = io()

//elements
 const $messageForm = document.querySelector('#message-form')
 const $messageFormInput = $messageForm.querySelector('input')
 const $messageFormButton = $messageForm.querySelector('button')
 const $sendLocationButton = document.querySelector('#send-location')
 const $messages = document.querySelector('#messages')

//Templates
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageLocationTemplate = document.querySelector('#message-location-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoScroll = ()=>{
    //get chat templat height
    const newMessage = $messages.lastElementChild
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessgeMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessgeMargin

    const visibleHeight = messages.offsetHeight

    //get chatbox height
    const containerHeight = messages.scrollHeight

    //how far i scroll
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight- newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('roomData',({success: success,data:{room, users}})=>{

    const html = Mustache.render(sidebarTemplate,{
        room: room,
        users:users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('replied',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationReplied', (locationDetail) =>{
    const locationhtml = Mustache.render(messageLocationTemplate,{
        username: locationDetail.username,
        url: locationDetail.url,
        createdAt: moment(locationDetail.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',locationhtml)
    autoScroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

   // $messageFormButton.setAttribute('disabled','disabled')

    
    const value = e.target.elements.message.value;


    socket.emit('sendMessage',value, (error)=>{
        //$messageFormButton.removeAttribute('disabled','disabled')
        console.log("error")
        $messageFormInput.value = ""
        $messageFormInput.focus()
    

        if(error){
            return console.log(error)
        }

        console.log('message delivered!')
    })

})

$sendLocationButton.addEventListener('click',()=>{
   
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by browser')
    }

    //$sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
           // $sendLocationButton.removeAttribute('disabled', 'disabled')
            console.log('Location send')
        })
    })
})

socket.emit('join',{username, room }, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})