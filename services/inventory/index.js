const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server")

const typeDefs = gql`
  type Product {
    upc: String!
    inStock: Boolean
    shippingEstimate: Int
  }

  type Query {
    _productByUpc(
      upc: String!,
      weight: Int,
      price: Int
    ): Product
  }
`

const resolvers = {
  Product: {
    shippingEstimate(product) {
      if (product.price > 1000) return 0 // free for expensive items
      return Math.round(product.weight * 0.5) || null // estimate is based on weight
    }
  },
  Query: {
    _productByUpc(_, { upc, ...fields }) {
      console.log("Fetching Product from Inventory service via '_productByUpc':\n   ", { upc, ...fields })
      const product = {
        ...inventory.find(product => product.upc === upc),
        ...fields
      }
      return product
    }
  }
}

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers
  })
})

server.listen({ port: 5004 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

const inventory = [
  { upc: "1", inStock: true },
  { upc: "2", inStock: false },
  { upc: "3", inStock: true }
]
