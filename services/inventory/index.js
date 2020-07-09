const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server")

const typeDefs = gql`
  type Product {
    upc: String!
    inStock: Boolean
    shippingEstimate: Int
  }

  input FieldSet {
    upc: String!
    weight: Int
    price: Int
  }

  type Query {
    _productByUpc(
      upc: String!,
      weight: Int,
      price: Int
    ): Product

    _productsByUpcs(
      fieldSets: [FieldSet!]!
    ): [Product!]!
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
      console.log('Fetching Product from Inventory service!', { upc, ...fields })
      return {
        ...fields,
        ...inventory.find(product => product.upc === upc),
      }
    },

    _productsByUpcs(_, { fieldSets }) {
      console.log('Fetching Products from Inventory service!', fieldSets)
      return fieldSets.map(fieldSet => {
        return {
          ...fieldSet,
          ...inventory.find(product => product.upc === fieldSet.upc),
        }
      })
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
