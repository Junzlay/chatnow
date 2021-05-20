

"use strict"

const generateElements = (emojiInput) => {
  const clickLink = (event) => {
    document.getElementById("chat-input").focus();
    emojiInput.value = emojiInput.value + event.target.innerHTML
    emojiPicker.style.display = 'none'

    //trigger ng-change for angular
    if (typeof angular !== "undefined") {
      angular.element(emojiInput).triggerHandler('change')
    }
  }

  emojiInput.style = `width: 100%`

  const emojiContainer = document.createElement('div')
  emojiContainer.style = `position: relative;margin:0; border-top-left-radius: ;:10px solid #5A5EB9;`

  const parent = emojiInput.parentNode
  parent.replaceChild(emojiContainer, emojiInput)
  emojiContainer.appendChild(emojiInput)


  const header = document.createElement('div')
header.style=`
height:40px;
// width: 400px;
color: black;
margin: 0;
// background: #5A5EB9;
`

// close emojis
const close = document.createElement('a')
close.style = `position: absolute;
    top: -5px;
    right: 0px;
    color:black;
    padding:5px;
    height:30px;
    text-decoration: none;`
    close.setAttribute('href', "javascript:void(0)")
    close.setAttribute("class", "close-emoji");
    close.innerHTML = "✕"
    close.onclick = () => {
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
  }

// header keep typing
  const title = document.createElement('p')
  title.style = `position: absolute;
    float:left;
    top: 10px;
    right: 170px;
    color: black;`

    title.innerHTML = "Keep typing to find an emoji"


// emoji emojiPicker
  const emojiPicker = document.createElement('div')
  emojiPicker.style = `position: absolute;
    right: 5px;
    bottom: 48px;
    z-index: 999;
    display: none;
    width: 400px;
    // height:300px;
    padding: 5px 5px 5px 5px;
    margin-top: 5px;
    overflow-y: auto;
    background: #fff;
    border: 1px #dfdfdf solid;
    border-radius: 3px;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.4);`
    emojiPicker.setAttribute("class", "scroll-over");
    emojiPicker.setAttribute("id", "emo");

    // emoji icon to be clicked
  const emojiTrigger = document.createElement('a')
  emojiTrigger.setAttribute("class", "rotate-emoji");
  emojiTrigger.style = `position: absolute;
  cursor:pointer;
    top: 5px;
    right: 50px;
    text-decoration: none;`
//   emojiTrigger.setAttribute('href', "javascript:void(0)")
  emojiTrigger.innerHTML = "😀"
  emojiTrigger.onclick = () => {
    // emojiPicker.fadeIn();
    var el = document.getElementById("emo");
    fadeIn(el, 500)
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
  }
  header.prepend(close)
  header.prepend(title)
  emojiContainer.appendChild(emojiTrigger)

  // emojiList
  const emojiList = document.createElement('ul')
  emojiList.style = `padding: 0;
    margin: 0;
    list-style: none;`
  const emojis = [0x1F642, 0x1F641, 0x1f600, 0x1f601, 0x1f602, 0x1f603, 0x1f604, 0x1f605, 0x1f606, 0x1f607, 0x1f608, 0x1f609, 0x1f60a, 0x1f60b, 0x1f60c, 0x1f60d, 0x1f60e, 0x1f60f, 0x1f610, 0x1f611, 0x1f612, 0x1f613, 0x1f614, 0x1f615, 0x1f616, 0x1f617, 0x1f618, 0x1f619, 0x1f61a, 0x1f61b, 0x1f61c, 0x1f61d, 0x1f61e, 0x1f61f, 0x1f620, 0x1f621, 0x1f622, 0x1f623, 0x1f624, 0x1f625, 0x1f626, 0x1f627, 0x1f628, 0x1f629, 0x1f62a, 0x1f62b, 0x1f62c, 0x1f62d, 0x1f62e, 0x1f62f, 0x1f630, 0x1f631, 0x1f632, 0x1f633, 0x1f634, 0x1f635, 0x1f636, 0x1f637, 0x1f638, 0x1f639, 0x1f63a, 0x1f63b, 0x1f63c, 0x1f63d, 0x1f63e, 0x1f63f, 0x1f640, 0x1f643, 0x1f4a9, 0x1f644, 0x2620, 0x1F44C, 0x1F44D, 0x1F44E, 0x1F648, 0x1F649, 0x1F64A]
 
  
  
  // display emojiList
  emojis.map((item) => {
      const emojiLi = document.createElement('li')
      emojiLi.style = `display: inline-block;
        margin: 5px;`

      const emojiLink = document.createElement('a')
      emojiLink.style = `text-decoration: none;
        margin: 10px;
       
        position: initial;
        font-size: 24px;`
      emojiLink.setAttribute('href', "javascript:void(0)")
      emojiLink.innerHTML = String.fromCodePoint(item)
      emojiLink.onclick = clickLink

      emojiList.appendChild(emojiLink)
  })
  emojiPicker.prepend(header)
  emojiPicker.appendChild(emojiList)
  emojiContainer.appendChild(emojiPicker)
}

window.EmojiPicker = {
  init: () => {
    const emojiInputs = document.querySelectorAll('[data-emoji="true"]');

    emojiInputs.forEach((element) => {
      generateElements(element)
    })
  }
}

function fadeIn(el, time) {
    el.style.opacity = 0;
  
    var last = +new Date();
    var tick = function() {
      el.style.opacity = +el.style.opacity + (new Date() - last) / time;
      last = +new Date();
  
      if (+el.style.opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      }
    };
  
    tick();
  }



