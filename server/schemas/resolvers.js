const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const store = require("store");
const { AuthenticationError } = require("apollo-server");
const { signToken } = require("../utils/auth");


const  addProductToUser  = require("../utils/addProductToUser");
const addOrderToDatabase = require("../utils/addOrderToDatabase");



const userResolvers = {
  User: {
    orders: async (user) => {
      try {
        const orders = await Order.find({ user: user._id });
        return orders;
      } catch (error) {
        throw new Error("Error fetching orders");
      }
    },
    isCorrectPassword: async (user, { password }) => {
      try {
        return await bcryptjs.compare(password, user.password);
      } catch (error) {
        throw new Error("Error comparing passwords");
      }
    },
  },
  Query: {
    getUser: async (_, { userId }) => {
      try {
        const user = await User.findById(userId).populate({
          path: "following",
          populate: {
            path: "products",
          },
        });

        if (!user) {
          throw new Error("User not found");
        }
        console.log(user.following);
        return user;
      } catch (error) {
        console.log(error);
        throw new Error("Error fetching user");
      }
    },
    getAllUsers: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (error) {
        throw new Error("Error fetching users");
      }
    },
    getUserByEmail: async (_, { email }) => {
      try {
        const users = await User.findOne({ email });
        return users;
      } catch (error) {
        throw new Error("Error fetching users");
      }
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      try {
        console.log("INPUT ", input);
        const user = await User.create(input);
        userId = user._id.toString();
        console.log("Creat USERRRR", userId);
        user_id = store.set("userId", { userId: userId });
        console.log("USEERRRRR IDDDDD", user_id);

        return user;
      } catch (error) {
        console.log(error);
        throw new Error("Error creating user");
      }
    },
    updateUser: async (_, { userId, input }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, input, { new: true });
        return user;
      } catch (error) {
        throw new Error("Error updating user");
      }
    },
    deleteUser: async (_, { userId }) => {
      try {
        const user = await User.findByIdAndRemove(userId);
        return user;
      } catch (error) {
        throw new Error("Error deleting user");
      }
    },
    login: async (_, { email, password }) => {
      console.log("HERERERERER", email, password);
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError("No user found with this email");
        }
        console.log("login user", user);
        const validPassword = await user.isCorrectPassword(password);
        if (!validPassword) {
          throw new AuthenticationError("Incorrect password");
        }

        const token = signToken({
          email,
          _id: user._id.toString(),
        });

        // const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        //   expiresIn: "1d",
        // });

        return { user, token };
      } catch (error) {
        throw new Error("Error during login");
      }
    },
  },
};

const categoryResolvers = {
  Query: {
    getCategory: async (_, { categoryId }) => {
      try {
        const category = await Category.findById(categoryId);
        return category;
      } catch (error) {
        throw new Error("Error fetching category");
      }
    },
    getAllCategories: async () => {
      try {
        const categories = await Category.find();
        return categories;
      } catch (error) {
        throw new Error("Error fetching categories");
      }
    },
  },
  Mutation: {
    createCategory: async (_, { input }) => {
      try {
        const category = await Category.create(input);
        return category;
      } catch (error) {
        throw new Error("Error creating category");
      }
    },
    updateCategory: async (_, { categoryId, input }) => {
      try {
        const category = await Category.findByIdAndUpdate(categoryId, input, {
          new: true,
        });
        return category;
      } catch (error) {
        throw new Error("Error updating category");
      }
    },
    deleteCategory: async (_, { categoryId }) => {
      try {
        const category = await Category.findByIdAndRemove(categoryId);
        return category;
      } catch (error) {
        throw new Error("Error deleting category");
      }
    },
  },
};

const orderResolvers = {
  Order: {
    user: async (order) => {
      try {
        const user = await User.findById(order.user);
        return user;
      } catch (error) {
        throw new Error("Error fetching user");
      }
    },
    products: async (order) => {
      try {
        const products = await Product.find({ _id: { $in: order.products } });
        return products;
      } catch (error) {
        throw new Error("Error fetching products");
      }
    },
  },
  Query: {
    getOrder: async (_, { orderId }) => {
      try {
        const order = await Order.findById(orderId);
        return order;
      } catch (error) {
        throw new Error("Error fetching order");
      }
    },
    getAllOrders: async () => {
      try {
        const orders = await Order.find();
        console.log("Resolver GetAllOrders return: ", orders);
        return orders;
      } catch (error) {
        console.log(error);
        throw new Error("Error fetching orders");
      }
    },
    getOrdersByUserId: async (_, __, context) => {
      try {
        const user = await User.findById(context.user._id).populate({
          path: 'products'
        });
        console.log("THS USERRRRRRR", user);
    
        if (!user) {
          throw new Error('User not found');
        }
    
        return user
      } catch (error) {
        console.log(error);
        throw new Error('Error fetching products for the user');
      }
    },
  },

  Mutation: {
    createOrder: async (_, { input }, context) => {
      console.log("HEREEEEEEEEE", input);

      try {
        const order = await Order.create({ ...input, user: context.user._id }); // Use input directly to create order
        return order;
      } catch (error) {
        console.error("Error creating order:", error); // Log the actual error
        throw new Error("Error creating order");
      }
    },
    updateOrder: async (_, { orderId, input }) => {
      try {
        const order = await Order.findByIdAndUpdate(orderId, input, {
          new: true,
        });
        return order;
      } catch (error) {
        throw new Error("Error updating order");
      }
    },
    deleteOrder: async (_, { orderId }) => {
      try {
        const order = await Order.findByIdAndRemove(orderId);
        return order;
      } catch (error) {
        throw new Error("Error deleting order");
      }
    },



    createOrderForUser: async (_, {productId}, context) => {
      // let updatedUser;
      try {
        console.log("createOrderForUser data", productId, context.user._id);
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $push: { orders: productId } },   
          { new: true }
        );
        console.log("updated user" , updatedUser);

        const addedOrder = await addOrderToDatabase(updatedUser);

        console.log("ADDED order" , addedOrder);
        return {updatedUser, addedOrder};
      } catch (error) {
        console.log(error);
      }
    }


  },
};

const productResolvers = {
  Query: {
    getAllProductsByCategoryId: async (_, { categoryId }) => {
      try {
        console.log("categoryID", categoryId);
        console.log("WORKING?");
        const products = await Product.find({
          category: categoryId,
        });
        return products;
      } catch (error) {
        console.log(error);
        throw new Error("Error fetching products by category");
      }
    },
    getAllProducts: async () => {
      try {
        const products = await Product.find().populate("category");
        // console.log(products);
        return products;
      } catch (error) {
        throw new Error("Error fetching products");
      }
    },
    getProductsFromFollowing: async (_, { id }) => {
      const mainUser = await User.findById(id);

      console.log("Main USer id; ", mainUser);

      return mainUser;
    },
  },


  Mutation: {
    createProduct: async (_, { input }, context) => {
      console.log("context.user", context.user);
      try {
        // console.log("made it in create product with context", context.user._id);
        const product = await Product.create({
          ...input,
          user_id: context.user._id
        });
        console.log("newly created product",product);
        const addedProduct = await addProductToUser(product._id, context.user._id);

        return { product, addedProduct };
      } catch (error) {
        console.log(error);
        throw new Error("Error creating product");
      }
    },



    addImage: async (_, { input }) => {
      console.log("made it into addImage with this input", input);
      try {
        const product = await Product.create({
          ...input,
          image: imgUpload.secure_url,
        });

        const addedProduct = await addProductToUser(product._id, context);

        return product;
      } catch (error) {
        console.log(error);
        throw new Error("Error creating product");
      }
    },
    
  },
};

const resolvers = [
  userResolvers,
  categoryResolvers,
  orderResolvers,
  productResolvers,
  // { Upload: GraphQLUpload },
];

module.exports = resolvers;
