$(document).ready(function () {
  // window.onbeforeunload = function() {
  //   localStorage.removeItem('name');
  //   localStorage.removeItem('room');
  //   localStorage.removeItem('profile');
  //   window.location.href = "http://localhost:3000";
  // };
  function checkEvt(){
    var evTypep=window.performance.getEntriesByType("navigation")[0].type;
       if (evTypep=='reload'){
         leave=confirm('Refreshing the page means leaving the room.\nAre you sure to leave the room')
        if(leave){
        localStorage.removeItem('name');
        localStorage.removeItem('room');
        localStorage.removeItem('profile');
        window.location.replace("http://localhost:3000");
        }
       }
      
}
checkEvt();
  // window.addEventListener('beforeunload', function (e) {
  //   // Cancel the event
  //   e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
  //   // Chrome requires returnValue to be set
  //   e.returnValue = confirm("Refreshing the page means leaving the room..\nAre you sure to leave the room?")
  //   alert("a")
  // });
  // sessionStorage.setItem("is_reloaded", true);
  // if (sessionStorage.getItem("is_reloaded")) alert('Reloaded!');
  $("#userDetails").modal("hide");
  $("body").toggleClass("dark-mode");
  let userName = localStorage.getItem("name");
  let room = localStorage.getItem("room");
  let profile=localStorage.getItem("profile");
  let ID = "";
  let private = false;
  let privateName = "";
  let privateID = "";
  var socket = io();
  // console.log(localStorage.getItem("name"))
  // console.log(localStorage.getItem("room"))

  window.EmojiPicker.init()
  socket.emit("new joined", userName);
  socket.emit("join room", {
    username: userName,
    roomName: room,
    profile:profile
  });
  $(".room-user").html("#" + room + " - Room");
  $(".room-name").html(room);

  // $(`.profile-img`).attr('src', profile);

  // $("#userDetails").modal({
  //   backdrop: "static",
  //   keyboard: false
  // });
  // $("button.save").click(function () {
  //   userName = $(".uname").val();
  //   room = $(".uroom").val();
  //   if(userName!="" || room!=""){
  //   $("#userDetails").modal("hide");
  //   socket.emit("new joined", userName);
  //   socket.emit("join room", {
  //     username: userName,
  //     roomName: room,
  //   });
  //   $(".room-user").html("#" + room + " - Room");
  //   $(".room-name").html(room);
  //   return false;
  // }
  // });

  console.log("ready");
  $(".message").focus();

  // new join user
  socket.on("new joined", (data) => {
    if (data == userName) {
      $(".messages").append(
        '<li><div class="chat__time">You have joined the room</div></li>'
      );
    } else {
      $(".messages").append(
        '<li><div class="chat__time">' + data + " Joined the room</div></li>"
      );
    }
  });

  socket.on("disconnect user", (data) => {
    $(".messages").append(
      `<li id="user_${data}"><div class="chat__time">${data} left the room</div></li>`
    );

    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);
    // $(`#user_${data}`).remove();
  });
  //receive data from server.
  socket.on("send data", (data) => {
    ID = data.id; //ID will be used later
    console.log(" my ID:" + ID);
    //   console.log(" new user:" + data.username);
  });

  $(".send").click(function () {
    send();
  });


  // getting all users and display 
  socket.on("allUsers all", (data) => {
    $(
      ".online-users"
    ).empty();
    allUsers(data);
 
  });

  function allUsers(data){
    $.map(data.reverse(), function (user) {
      if (userName == user.username) {
        console.log(user.profile)
        $(
          ".online-users"
        ).prepend(`<li id="" user-name="${user.username}" user-id="${user.socketID}" class="messaging-member  messaging-member--new messaging-member--online private-user">
          <div class="messaging-member__wrapper">
            <div class="messaging-member__avatar">
              <img onerror="this.onerror=null;this.src='${user.profile}';" class="profile-img ${user.username}-img" src="${user.profile}" alt="Bessie Cooper" loading="lazy">
              <div class="user-status"></div>
            </div>
          
            <span class="messaging-member__name  user-name">${user.username}</span>
            <span class="messaging-member__message small">You</span>
          </div>
          </li>`);
      } else {
        console.log(user.profile)
        $(
          ".online-users"
        ).prepend(`<li id="" user-name="${user.username}" user-id="${user.socketID}" class="messaging-member messaging-member--new messaging-member--online private-user">
          <div class="messaging-member__wrapper">
            <div class="messaging-member__avatar">
              <img onerror="this.onerror=null;this.src='${user.profile}';"  class="profile-img ${user.username}-img" src="${user.profile}" alt="Bessie Cooper" loading="lazy">
              <div class="user-status"></div>
            </div>
          
            <span class="messaging-member__name mt-3 user-name">${user.username}</span>
          
          </div>
          </li>`);
      }

    });
  }

  $(".rooms").click(function () {
    private = false;
    // privateID = "";
    $(".private-messages").addClass("d-none").removeClass("d-block");
    $(".messages").addClass("d-block").removeClass("d-none");
    $(".user-icon").addClass("d-none").removeClass("d-block");
    $(".room-user").html("#" + $(".room-name").text() + " - Room");
  });

  $(".online-users").on("click", ".private-user", function () {
    privateName = $(this).attr("user-name");
    privateID = ($(this).attr("user-id"));
    if (privateName != userName) {

      // $('.message-container').append(` <ul id="${privateID}" class="chat__list-messages "></ul>`)
      private = true;
      $(".messages").addClass("d-none").removeClass("d-block");
      // $(`#${privateID}`).addClass("d-block").removeClass("d-none");

      $(`.private-messages`).addClass("d-block").removeClass("d-none");
      $(".user-icon").addClass("d-block").removeClass("d-none");
      $(".room-user").html($(this).attr("user-name"));

    }

  });

  $('.leave').click(function () {
    leave = confirm("Are you sure to leave the room?")
    if (leave) {
      localStorage.removeItem('name');
      localStorage.removeItem('room');
      window.location.href = "http://localhost:3000";
    }

  })

  function send() {
    if (private) {
      socket.emit("private", {
        value: $(".message").val(),
        to: privateID,
        user: userName
      });
    } else {
      socket.emit("chat message", {
        value: $(".message").val(),
        user: userName,
      });
    }
    $(".message").val("");
    $(".message").focus();
  }

  $(".message").keyup(function () {
    socket.emit("typing", {
      isTyping: $(".message").val().length > 0,
      user: userName,
    });
  });

  socket.on("typing", function (data) {
    const {
      isTyping,
      user
    } = data;

    if (!isTyping) {
      $(".user-typing").html("");
      $(".c-form").removeClass("mt-3").addClass("mt-2");
    } else {
      $(".user-typing").html(`${user} is typing...`);
      $(".c-form").removeClass("mt-2").addClass("mt-3");
    }
  });


  socket.on("chat message", (data) => {
    displayMessage(data);
  });

  socket.on("private", function (data) {
    displayMessage(data);
    // displayPrivateMessage(data) ;
    // $('.private-messages').append('<li class="private"><em><strong>'+ data.from +' -> '+ data.to +'</strong>: '+ data.msg +'</em></li>');
  });

  function displayPrivateMessage(data) {
    if (data.id === ID) {
      console.log("you sent a message");
      divs =
        '<li><div class="chat__time">' +
        moment().format("hh:mm") +
        '</div><div class="chat__bubble chat__bubble--me"> ' +
        data.data.value +
        "</div></li>";
    } else {
      divs =
        ' <li><div class="chat__time">' +
        moment().format("hh:mm") +
        ' </div><p class="small m-0 p-0 ml-2">' +
        data.data.user +
        '</p><div class="chat__bubble chat__bubble--you">' +
        data.data.value +
        "</div></li>";
    }
    $(`#${data.to}`).append(divs)
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);
  }


  //  messsaging global and private
  function displayMessage(data) {
    // if(pri){
    if (data.id === ID) {
      console.log("This person has sent a message");
      divs =
        '<li><div class="chat__time">' +
        moment().format("hh:mm") +
        '</div><div class="chat__bubble chat__bubble--me"> ' +
        data.data.value +
        "</div></li>";
    } else {
      divs =
        ' <li><div class="chat__time">' +
        moment().format("hh:mm") +
        ' </div><p class="small m-0 p-0 ml-2">' +
        data.data.user +
        '</p><div class="chat__bubble chat__bubble--you">' +
        data.data.value +
        "</div></li>";
    }


    if (private) {
      $('.private-messages').append(divs)
    } else {
      $(".messages").append(divs);
    }
    // $(".messages").append(divs);
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);
    // $(".message-container").scrollTop($(".mess-con").height() * 2);
  }



  // emoji text hover
  const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "😘", "😗", "😙", "😚", "😋", "😜", "😝", "😛", "🤑", "🤗", "🤓", "😎", "🤡", "🤠", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "😤", "😠", "😡", "😶", "😐", "😑", "😯", "😦", "😧", "😮", "😲", "😵", "😳", "😱", "😨", "😰", "😢", "😥", "🤤", "😭", "😓", "😪", "😴", "🙄", "🤔", "🤥", "😬", "🤐", "🤢", "🤧", "😷", "🤒", "🤕"]
  var random;
  var randomTemp;
  $('.rotate-emoji').mouseover(function () {
    random = Math.floor(Math.random() * emojis.length) + 1
    if (random == randomTemp) {
      random = Math.floor(Math.random() * emojis.length) + 1
    }
    randomTemp = random;
    setTimeout(function () {
      $('.rotate-emoji').html(emojis[random]);
    }, 100);

  })

  socket.on('profile', (data) => {

    $(`.${data.username}-img`).attr('src', data.profile);
   
    // alert(data.username+" change his profile picture")
  })


  $('.ch-profile').click(function () {
    socket.emit('profile', {
      username: userName,
      profile: $('.image-url').val()
    })

    createToast({
      style: 'success',
      content: 'Successfully change profile'
  });
  
    //  $('${user.username}-img').attr('src',$('.image-url').val());
    $("#changeProfle").modal("hide");
  })





// toast Notification
function createToast(options) {
  var settings = $.extend({
      style: null,
      content: '',
      delay: 3000
  }, options);

  if ($('.toast-wrap').length < 1) {
      $('body').append('<div class="toast-wrap"></div>');
  }

  var $wrapper = $('.toast-wrap');

  var $newToast = $('<div class="toast ' + settings.style + '"><span class="toast-close">Close</span><p>' + settings.content + '</p></div>').appendTo($wrapper);

  setTimeout(function() {
      $newToast.addClass('active');
  }, 100);

  $newToast.children('.toast-close').click(function() {
      var _this = $(this).parent();
      _this.removeClass('active');
      setTimeout(function() {
        _this.remove();
      }, 500);
  });

  $newToast.delay(settings.delay).queue(function() {
    var _this = $(this);
    _this.removeClass('active');
    setTimeout(function() {
      _this.remove();
    }, 500);
  });
}







});