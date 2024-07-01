const moment = require('moment');
const menuItems = require('../model/menu');
function formatMessage(user, msg) {
  return {
    user,
    msg,
    time: moment().format('h:mm a'),
  };
}

function welcomeCustomer() {
  return {
    user: 'Chatbot',
    msg: 'Hi! </br > welcome to my Chatbot!</br > </br >Select 1 to place an order</br > Select 99 to checkout order</br > Select 98 to see order history</br >Select 97 to see current order</br > Select 0 to cancel order</br >',
    time: moment().format('h:mm a'),
  };
}

function mainMenu() {
  return {
    user: 'Chatbot',
    msg: '<p>Main menu</p > Select 1 to place an order</br > Select 99 to checkout order</br > Select 98 to see order history</br >Select 97 to see current order</br > Select 0 to cancel order</br >',
    time: moment().format('h:mm a'),
  };
}

function getMenu() {
  let menuText = 'Please select an item by entering its number:<br>';
  menuItems.forEach((item) => {
    menuText += `${item.id}: ${item.name} - $${item.price.toFixed(2)}<br>`;
  });

  return {
    user: 'Chatbot',
    msg: menuText,
    time: moment().format('h:mm a'),
  };
}

function promptAnotherOrderOrCheckout(item, total) {
  return {
    user: 'Chatbot',
    msg: `Added <b>${item.name}</b> to your order. Total: <b>$${total.toFixed(
      2
    )}.</b><br>Enter <b>'1'</b> to add another item. </br> Enter <b>'99'</b> to checkout. </br> Enter <b>'10'</b> to access main menu </br> Enter <b>'97'</b> to see current order`,
    time: moment().format('h:mm a'),
  };
}

module.exports = {
  formatMessage,
  welcomeCustomer,
  mainMenu,
  getMenu,
  promptAnotherOrderOrCheckout,
};
