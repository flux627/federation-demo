const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server")

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    username: String
  }

  type Query {
    me: User
    _userById(id: ID!): User
  }
`;

const resolvers = {
  Query: {
    me() {
      console.log("Fetching User (me) from Accounts service!")
      return users[0]
    },

    _userById(_, { id }) {
      console.log("Fetching User from Accounts service!", { id })
      return users.find(user => user.id === id)
    }
  },
}

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers
  })
})

server.listen({ port: 5001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada"
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete"
  }
]
