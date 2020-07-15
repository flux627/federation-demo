const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server")

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    username: String
  }

  type Query {
    me: User
    _usersByIds(ids: [ID!]!): [User]
  }
`;

const resolvers = {
  Query: {
    me() {
      console.log('-----------------------------------------')
      console.log("Fetching User (me) from Accounts service via 'me'\n")
      return users[0]
    },

    _usersByIds(_, { ids }) {
      console.log("Fetching Users from Accounts service via '_usersByIds':\n   ", ids)
      return ids.map(id => users.find(user => user.id === id))
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
