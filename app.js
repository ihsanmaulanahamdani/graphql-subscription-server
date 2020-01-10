const fs = require("fs");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const { createServer } = require("http");

const resolvers = require("./graphql/resolver");
const typeDefs = fs.readFileSync("./graphql/test.gql", "utf8");

const port = 4000;

mongoose.connect(
  "mongodb+srv://ihsan:Abc12345@cluster0-hb8jo.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
);

const apollo = new ApolloServer({
  resolvers,
  typeDefs
});

const db = mongoose.connection;
const app = express();

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
  console.log("Success connect to Database!");
});

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

apollo.applyMiddleware({ app });

const httpServer = createServer(app);

apollo.installSubscriptionHandlers(httpServer);

httpServer.listen(port, () => {
  console.log(
    `GraphQL Server Ready on http://localhost:${port}${apollo.graphqlPath}`
  );
  console.log(
    `GraphQL Subscription Server Ready on ws://localhost:${port}${apollo.subscriptionsPath}`
  );
});

module.exports = app;
