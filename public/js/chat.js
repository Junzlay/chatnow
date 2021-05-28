$(document).ready(function () {

  function checkEvt() {
    var evTypep = window.performance.getEntriesByType("navigation")[0].type;
    if (evTypep == 'reload') {
      leave = confirm('Refreshing the page means leaving the room.\nAre you sure to leave the room')
      if (leave) {
        localStorage.removeItem('name');
        localStorage.removeItem('room');
        localStorage.removeItem('profile');
        window.location.replace("https://chats-sa.herokuapp.com/");
      }
    }

  }
  checkEvt();

  $("#userDetails").modal("hide");
  $("body").toggleClass("dark-mode");
  let userName = localStorage.getItem("name");
  let room = localStorage.getItem("room") || "global";
  let profile = localStorage.getItem("profile");
  let ID = "";
  let private = false;
  let privateName = "";
  let privateID = "";
  var socket = io();
  let profileicon = "";

  window.EmojiPicker.init()

  if (userName != null) {
    socket.emit("new joined", {
      user: userName,
      room: room
    });
    socket.emit("join room", {
      username: userName,
      roomName: room,
      profile: profile
    });
  }

  $(".room-user").html("#" + room + " - Room");
  $(".room-name").html(room);



  console.log("ready");
  $(".message").focus();

  // new join user
  socket.on("new joined", (data) => {
    if (data.user == userName) {
      $(".messages").append(
        '<li><div class="chat__time">You have joined the room</div></li>'
      );
    } else {
      $(".messages").append(
        '<li><div class="chat__time">' + data.user + " Joined the room</div></li>"
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
    if ($(".message").val() != "") {
      send();
    }

  });


  // getting all users and display 
  socket.on("allUsers all", (data) => {
    $(
      ".online-users"
    ).empty();
    allUsers(data);

  });

  function allUsers(data) {
    $.map(data.reverse(), function (user) {
      if (userName == user.username) {
        console.log(user.profile)
        $(
          ".online-users"
        ).prepend(`<li id="" user-profile="${user.profile}" user-name="${user.username}" user-id="${user.socketID}" class="messaging-member  messaging-member--new messaging-member--online private-user">
          <div class="messaging-member__wrapper">
            <div class="messaging-member__avatar">
              <img onerror="this.onerror=null;this.src='${user.profile}';" class="profile-img ${user.username}-img" src="${user.profile}" alt="profile" loading="lazy">
              <div class="user-status"></div>
            </div>
          
            <span class="messaging-member__name  user-name">${user.username}</span>
            <span class="messaging-member__message small">You</span>
          </div>
          </li>`);
      } else {
        if (!$(".message-container ul").is(`#${user.socketID}`)) {
          $('.message-container').append(`<ul id="${user.socketID}" class="chat__list-messages private d-none"> <p class="text-center">Private Message</p></ul>`)
        }

        console.log(user.profile)
        $(
          ".online-users"
        ).append(`<li id="" user-profile="${user.profile}" user-name="${user.username}" user-id="${user.socketID}" class="messaging-member messaging-member--new messaging-member--online private-user ${user.socketID}-parent">
          <div class="messaging-member__wrapper">
            <div class="messaging-member__avatar">
              <img onerror="this.onerror=null;this.src='${user.profile}';"  class="profile-img ${user.username}-img" src="${user.profile}" alt="profile" loading="lazy">
              <div class="user-status"></div>
            </div>
          
            <span class="messaging-member__name mt-3 user-name">${user.username}</span>
            <span class="messaging-member__message mt-2 small ${user.socketID}"></span>
          </div>
          </li>`);
      }

    });
  }

  $('.search').keyup(() => {
    filter($('.search'))
  })


  function filter(element) {
    var value = $(element).val();
    $(".online-users > li").each(function () {
      if ($(this).attr("user-name").search(value) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }


  function showTypeMessage(userID, type) {
    $('.private').each(function () {
      $(this).addClass("d-none").removeClass("d-block");
    })
    if (type == "room") {
      $(".messages").addClass("d-block").removeClass("d-none");
    } else {
      $(".messages").addClass("d-none").removeClass("d-block");
      $(`#${userID}`).addClass("d-block").removeClass("d-none");
    }
  }

  $(".rooms").click(function () {
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);
    private = false;
    showTypeMessage(null, "room")

    $(".user-icon").addClass("d-none").removeClass("d-block");
    $(".room-user").html("#" + $(".room-name").text() + " - Room");
  });

  $(".online-users").on("click", ".private-user", function () {
    privateName = $(this).attr("user-name");
    privateID = ($(this).attr("user-id"));
    profileicon = $(`.${privateName}-img`).prop("src");
    if (privateName != userName) {

      showTypeMessage(privateID, "private");
      $(`.${privateID}-parent`).removeClass('messaging-member--active')
      private = true;

      $(".user-icon").addClass("d-block").removeClass("d-none");
      $(".room-user").html($(this).attr("user-name"));
      $('.profile-icon').attr('src', profileicon)

    }
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);
  });

  $('.leave').click(function () {
    leave = confirm("Are you sure to leave the room?")
    if (leave) {
      localStorage.removeItem('name');
      localStorage.removeItem('room');
      window.location.href = "https://chats-sa.herokuapp.com/";
    }

  })

  $('#txtURL').change(function () {
    $('#imgPreview').attr('src', $('#txtURL').val())
  })

  $('.send-image').click(function () {
    if (private) {
      socket.emit("private image", {
        image: $('#txtURL').val(),
        to: privateID,
        user: userName
      })
      $(`.${privateID}`).html("You send an image");
    } else {
      socket.emit("image", {
        image: $('#txtURL').val(),
        sender: userName
      })
    }

    $('#txtURL').val("")
    $('#imgPreview').attr('src', "")
    $("#send-image").modal("hide");
  })

  socket.on("image", (data) => {
    if (data.sender == userName) {
      divs = `
        <li>
        <div class="chat__time">${ moment().format("hh:mm")}
        </div>
        
        <div class="chat__bubble chat__bubble--me bg-transparent">
          <img class="img-fluid rounded" src="${data.image}" alt="">
         </div>
      </li>
        `;
    } else {
      divs = `
        <li>
        <div class="chat__time">${ moment().format("hh:mm")}
        </div>
        <p class="small m-0 p-0 ml-2">${data.sender}
        </p>
        <div class="chat__bubble chat__bubble--you bg-transparent">
          <img class="img-fluid rounded" src="${data.image}" alt="">
         </div>
      </li>
        `;
    }

    $(".messages").append(divs);
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);

  });

  function send() {
    if (private) {
      socket.emit("private", {
        value: $(".message").val(),
        to: privateID,
        user: userName
      });
      $(`.${privateID}-parent`).removeClass('messaging-member--active')
      $(`.${privateID}`).html($(".message").val());
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

    if (user != userName) {
      if (!isTyping) {
        $(".user-typing").html("");
        $(".c-form").removeClass("mt-3").addClass("mt-2");
      } else {
        $(".user-typing").html(`${user} is typing...`);
        $(".c-form").removeClass("mt-2").addClass("mt-3");
      }
    }

  });



  socket.on("chat message", (data) => {
    displayMessage(data);
  });

  socket.on("private", function (data) {
    $(`.${data.id}-parent`).addClass('messaging-member--active')
    displayPrivateMessage(data);
    $(`.${data.id}`).html(`${data.data.value}`);
  });

  socket.on("private image", function (data) {
    if (data.data.user == userName) {
      divs = `
        <li>
        <div class="chat__time">${ moment().format("hh:mm")}
        </div>
        
        <div class="chat__bubble chat__bubble--me bg-transparent">
          <img class="img-fluid rounded" src="${data.data.image}" alt="">
         </div>
      </li>
        `;
    } else {
      divs = `
        <li>
        <div class="chat__time">${ moment().format("hh:mm")}
        </div>
        <p class="small m-0 p-0 ml-2">${data.data.user}
        </p>
        <div class="chat__bubble chat__bubble--you bg-transparent">
          <img class="img-fluid rounded" src="${data.data.image}" alt="">
         </div>
      </li>
        `;
    }
    $(`.${data.id}-parent`).addClass('messaging-member--active')

    $(`.${data.id}`).html('Sends an image');

    $(`#${data.to}`).append(divs);
    $(`#${data.id}`).append(divs);
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);
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

    $(`#${data.to}`).append(divs);
    $(`#${data.id}`).append(divs);
    $(".message-container").animate({
      scrollTop: $(".message-container")[0].scrollHeight
    }, 1000);

  }


  //  messsaging global
  function displayMessage(data) {
    // if(pri){
    if (data.id === ID) {
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



    $(".messages").append(divs);
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

  })


  $('.ch-profile').click(function () {
    socket.emit('profile', {
      username: userName,
      profile: $('.image-url').val()
    })

    $('.image-url').keyup(function () {
      $('#profile-preview').attr('src', $('.image-url').val())
    })

    createToast({
      style: 'success',
      content: 'Successfully change profile'
    });
    $('.image-url').val("")
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

    setTimeout(function () {
      $newToast.addClass('active');
    }, 100);

    $newToast.children('.toast-close').click(function () {
      var _this = $(this).parent();
      _this.removeClass('active');
      setTimeout(function () {
        _this.remove();
      }, 500);
    });

    $newToast.delay(settings.delay).queue(function () {
      var _this = $(this);
      _this.removeClass('active');
      setTimeout(function () {
        _this.remove();
      }, 500);
    });
  }







});
