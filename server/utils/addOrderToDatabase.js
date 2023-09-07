// Export the addOrderToDatabase function
const Order = require("../models/Order");
const dayjs = require('dayjs');

const addOrderToDatabase = async (updatedUser) => {

    console.log("ORDER", updatedUser);
    const latestProduct = updatedUser.products.pop()
    console.log("latestProduct", latestProduct);

  try {
    console.log("made it in addOrderToDatabase");    
    // Update the user's orders array with the new order ID
    const order = await Order.create({
      "purchaseDate": dayjs().format("YYYY-MM-DD HH:mm:ss"),
      "user": updatedUser._id,
      "fulfilled": false,
        "products": latestProduct
      //   "productId": latestProduct
    });

    console.log("Created and pushed product:", order);
    return order;
  } catch (error) {
    console.log(error);
    console.error(error);
    throw new Error("Error creating order");
  }
}

// Export the addOrderToDatabase function
module.exports = addOrderToDatabase;
