const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server")

const typeDefs = gql`
  type Review { # @key(fields: "id")
    id: ID!
    body: String
    author: User # @provides(fields: "username")
    product: Product
  }

  type User { # @extend @key(fields: "id")
    id: ID! # @external
    username: String # @external
    numberOfReviews: Int
    reviews: [Review]
  }

  type Product { #  @extend @key(fields: "upc")
    upc: String! # @external
    reviews: [Review]
  }

  type Query {
    _userById(id: ID!): User
    _reviewById(id: ID!): Review
    _productByUpc(upc: String!): Product
  }
`

const resolvers = {
  Review: {
    author(review) {
      return { __typename: "User", id: review.authorId }
    },
  },
  User: {
    reviews(user) {
      return reviews.filter(review => review.authorId === user.id)
    },
    numberOfReviews(user) {
      return reviews.filter(review => review.authorId === user.id).length
    },
    username(user) {
      const found = usernames.find(username => username.id === user.id)
      return found ? found.username : null
    }
  },
  Product: {
    reviews(product) {
      return reviews.filter(review => review.product.upc === product.upc)
    }
  },
  Query: {
    _reviewById: (_, { id }) => {
      console.log('Fetching Review from Reviews service!', { id })
      return reviews.find(review => review.id === id)
    },
    _userById: (_, { id }) => {
      console.log('Fetching User from Reviews service!', { id })
      return { id }
    },
    _productByUpc: (_, { upc }) => {
      console.log('Fetching Product from Reviews service!', { upc })
      return { upc }
    },
  }
}

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers
  })
})

server.listen({ port: 5002 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

const usernames = [
  { id: "1", username: "@ada" },
  { id: "2", username: "@complete" }
]
const reviews = [
  {
    id: "1",
    authorId: "1",
    product: { upc: "1" },
    body: "Love it!"
  },
  {
    id: "2",
    authorId: "1",
    product: { upc: "2" },
    body: "Too expensive."
  },
  {
    id: "3",
    authorId: "2",
    product: { upc: "3" },
    body: "Could be better."
  },
  {
    id: "4",
    authorId: "2",
    product: { upc: "1" },
    body: "Prefer something else."
  }
]
