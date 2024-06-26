const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const utils = require('./utils/utils.messages');
const connectDB = require('./model/connection');
const Session = require('./model/schema/session.schema');
const menuItems = require('./model/menu');
const PORT = process.env.PORT || 9000;

const app = express();
dotenv.config();
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketio(server);

connectDB().then(() => {
  io.on('connection', async (socket) => {
    const userAgent = socket.handshake.headers['user-agent'];
    const sessionId = uuidv4();

    // Store session in MongoDB using Mongoose
    const session = await Session.create({ sessionId, userAgent });

    socket.emit('welcome', utils.welcomeCustomer());

    socket.on('mainMenu', () => {
      setTimeout(() => {
        socket.emit('mainMenu', utils.mainMenu());
      }, 500);
    });
    socket.on('customerMessage', (message) => {
      socket.emit('customerMessage', utils.formatMessage('customer', message));
    });

    socket.on('getMenu', () => {
      setTimeout(() => {
        socket.emit('menuItems', utils.getMenu());
      }, 500);
    });

    // Array to store orders for the current session
    let orders = [];

    socket.on('placeOrder', async (message) => {
      const itemId = parseInt(message.trim()); // Assuming message is the item ID
      const item = menuItems.find((item) => item.id === itemId);

      if (item) {
        // Add order item to orders array
        orders.push({
          id: item.id,
          name: item.name,
          price: item.price,
        });

        // Emit confirmation message
        setTimeout(() => {
          socket.emit('orderConfirmation', {
            item,
            total: calculateOrderTotal(orders),
          });
        }, 500);

        setTimeout(() => {
          socket.emit(
            'customerMessage',
            utils.promptAnotherOrderOrCheckout(
              item,
              calculateOrderTotal(orders)
            )
          );
        }, 1000);
      } else {
        socket.emit(
          'customerMessage',
          utils.formatMessage(
            'chatbot',
            `Invalid item selection. Enter '1' to try again.`
          )
        );
      }
    });

    socket.on('checkoutOrder', async () => {
      if (orders.length > 0) {
        const total = calculateOrderTotal(orders);
        const orderSummary = generateOrderSummary(orders, total);
        setTimeout(() => {
          socket.emit(
            'customerMessage',
            utils.formatMessage('chatbot', `Orders:<br>${orderSummary}`)
          );
        }, 500);

        // Save order summary to the session in the database
        session.orderSummaries.push(orderSummary);
        await session.save();

        // Optionally, you can clear the current orders after checkout
        orders = [];
      } else {
        socket.emit(
          'customerMessage',
          utils.formatMessage('chatbot', 'No orders to checkout.')
        );
      }
    });

    socket.on('orderHistory', async () => {
      try {
        const session = await Session.findOne({ sessionId });

        if (session) {
          if (session.orderSummaries.length > 0) {
            const orderHistories = session.orderSummaries.join('<br><br>');
            socket.emit(
              'customerMessage',
              utils.formatMessage(
                'chatbot',
                `Order History:<br>${orderHistories}`
              )
            );
          } else {
            socket.emit(
              'customerMessage',
              utils.formatMessage('chatbot', 'No orders placed yet.')
            );
          }
        } else {
          console.error(`Session with ID ${sessionId} not found.`);
        }
      } catch (err) {
        console.error('Error fetching order history:', err.message);
      }
    });

    socket.on('currentOrder', async () => {
      try {
        if (orders.length > 0) {
          const total = calculateOrderTotal(orders);
          const currentOrderSummary = generateOrderSummary(orders, total);
          socket.emit(
            'customerMessage',
            utils.formatMessage(
              'chatbot',
              `Current Order:<br>${currentOrderSummary}`
            )
          );
        } else {
          socket.emit(
            'customerMessage',
            utils.formatMessage('chatbot', 'No items in the current order.')
          );
        }
      } catch (err) {
        console.error('Error fetching current order:', err.message);
      }
    });

    socket.on('cancelOrder', async () => {
      try {
        if (orders.length > 0) {
          orders = [];
          socket.emit(
            'customerMessage',
            utils.formatMessage(
              'chatbot',
              `Order canceled.</br> Enter <b>'10' </b>to access to main menu`
            )
          );
        } else {
          socket.emit(
            'customerMessage',
            utils.formatMessage(
              'chatbot',
              `There is no order to cancel.</br> Enter <b>'1'</b> to place an order </br>  Enter <b>'10'</b> to acess main menu`
            )
          );
        }
      } catch (err) {
        console.error('Error canceling order:', err.message);
      }
    });

    // Remove the session deletion on disconnect
    socket.on('disconnect', async () => {
      try {
        await Session.deleteOne({ sessionId });
        console.log(`Session with ID ${sessionId} deleted upon disconnect.`);
      } catch (err) {
        console.error(
          'Error during session cleanup on disconnect:',
          err.message
        );
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});

function calculateOrderTotal(orderItems) {
  return orderItems.reduce((total, item) => total + item.price, 0);
}

function generateOrderSummary(orderItems, total) {
  const orderSummary = orderItems
    .map((item) => `${item.name} - $${item.price.toFixed(2)}`)
    .join('<br>');
  return `${orderSummary}<br>Total: <b>$${total.toFixed(2)}</b>`;
}
