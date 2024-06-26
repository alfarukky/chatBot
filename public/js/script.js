const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
let userInput = document.getElementById('user-input');
userInput.inputMode = 'numeric';

const socket = io();

socket.on('welcome', (servermessage) => {
  welcomeMessage(servermessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('mainMenu', (serverMessage) => {
  mainMenu(serverMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('customerMessage', (serverMessage) => {
  customerMessage(serverMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('menuItems', (serverMessage) => {
  displayMenu(serverMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('orderConfirmation', (orderDetails) => {
  displayConfirmOrder(orderDetails);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

let menuDisplayed = false;

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = e.target.elements.message.value;
  socket.emit('customerMessage', message);
  switch (message) {
    case '1':
      socket.emit('getMenu', '1');
      menuDisplayed = true;
      break;
    case '99':
      socket.emit('checkoutOrder', message);
      break;
    case '98':
      socket.emit('orderHistory', message);
      break;
    case '97':
      socket.emit('currentOrder');
      break;
    case '0':
      socket.emit('cancelOrder');
      break;
    case '10':
      socket.emit('mainMenu');
      break;
    default:
      if (menuDisplayed && message >= '100' && message <= '108') {
        socket.emit('placeOrder', message);
        menuDisplayed = false;
      } else {
        socket.emit('chatMessage', message);
      }
  }

  e.target.elements.message.value = '';
  e.target.elements.message.focus();
});

function welcomeMessage(serverMessage) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${serverMessage.user} <span>${serverMessage.time}</span></p>
            <p class="text">
              ${serverMessage.msg}
            </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

function mainMenu(serverMessage) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${serverMessage.user} <span>${serverMessage.time}</span></p>
            <p class="text">
              ${serverMessage.msg}
            </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

function customerMessage(serverMessage) {
  const div = document.createElement('div');
  div.classList.add('message');

  div.innerHTML = `<p class="custom">${serverMessage.user} <span>${serverMessage.time}</span></p>
  <p class="text">
    ${serverMessage.msg}
  </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

function displayMenu(serverMessage) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${serverMessage.user} <span>${serverMessage.time}</span></p>
  <p class="text">
    ${serverMessage.msg}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function displayConfirmOrder(orderDetails) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${
      orderDetails.item.name
    } - $${orderDetails.item.price.toFixed(2)}</p>
    <p class="text"><b>Total: $${orderDetails.total.toFixed(2)}</b></p>
  `;
  document.querySelector('.chat-messages').appendChild(div);
}
