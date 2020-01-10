// Packages
const mongoose = require("mongoose");
const { PubSub } = require("apollo-server-express");
const { GraphQLDateTime } = require("graphql-iso-date");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
// Models
const User = require("../models/user.model");
const Chat = require("../models/chat.model");

const pubSub = new PubSub();

const NEW_CHAT = "NEW_CHAT";

module.exports = {
  Query: {
    chats: async () => {
      try {
        const chats = await Chat.find({}).populate("User");

        return chats;
      } catch (error) {
        return;
      }
    }
  },
  Mutation: {
    createMessage: async (_, data) => {
      try {
        const chat = await Chat.create({
          User: data.userId,
          content: data.content
        });

        const newChat = await Chat.findOne({_id: chat._id}).populate('User')

        pubSub.publish(NEW_CHAT, { newChat });

        return newChat;
      } catch (error) {
        return;
      }
    },
    signUp: async (_, data) => {
      try {
        const user = await User.create({
          name: data.name,
          phoneNumber: data.phoneNumber,
          password: data.password
        });

        return {
          name: user.name,
          phoneNumber: user.phoneNumber,
          password: user.password
        };
      } catch (error) {
        return;
      }
    },
    logIn: async (_, data) => {
      const user = await User.findOne({ phoneNumber: data.phoneNumber });

      if (user) {
        if (user.password === data.password) {
          return user;
        } else {
          return;
        }
      } else {
        return;
      }
    }
  },
  Subscription: {
    newChat: {
      subscribe: () => pubSub.asyncIterator([NEW_CHAT])
    }
  },
  DateTime: GraphQLDateTime,
  ObjectId: new GraphQLScalarType({
    name: "ObjectId",
    description: "Mongoose ObjectId",
    parseValue: value => {
      return mongoose.Types.ObjectId(value);
    },
    serialize: value => {
      return value.toString();
    },
    parseLiteral: ast => {
      if (ast.kind === Kind.STRING) {
        return mongoose.Types.ObjectId(ast.value);
      }

      return null;
    }
  })
};
