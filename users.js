let users = [];
function joinUser(socketId , userName, roomName,profile) {
const user = {
  socketID :  socketId,
  username : userName,
  roomname : roomName,
  profile: profile
}
  users.push(user)
return user;
}
function findUser(id) {
  return users.find((user)=>{
    user.id === id;
  })
}
function getAllUsers(){
  return users;
}
function removeUser(id) {
  const getID = users => users.socketID === id;
 const index =  users.findIndex(getID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}
module.exports ={ joinUser, removeUser,findUser,getAllUsers}