// Export the addProductToUser function
const User = require("../models/User");

const addProductToUser = async (productId, userId) => {
    try {
      console.log("made it in addProductToUser");    
      // Update the user's orders array with the new order ID
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { products: productId } },
        { new: true }
      );
  
      console.log("Created and pushed product:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(error);
      throw new Error("Error creating order");
    }
  }
  
  // Export the addProductToUser function
  module.exports = addProductToUser;
  