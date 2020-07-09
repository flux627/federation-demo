const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server")

const typeDefs = gql`
  type Product {
    upc: String!
    name: String
    price: Int
    weight: Int
  }

  type Query {
    topProducts(first: Int = 5): [Product]
    _productByUpc(upc: String!): Product
    _productsByUpcs(upcs: [String!]!): [Product]
  }
`

const resolvers = {
  Query: {
    topProducts(_, args) {
      console.log('Fetching top products from Products service!', args)
      return products.slice(0, args.first)
    },

    _productByUpc: (_, { upc }) => {
      console.log('Fetching product from Products service!', { upc })
      return products.find(product => product.upc === upc)
    },

    _productsByUpcs: (_, { upcs }) => {
      console.log('Fetching products from Products service!', upcs)
      return upcs.map(upc => {
        return products.find(product => product.upc === upc)
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

server.listen({ port: 5003 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

const products = [
  {
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100
  },
  {
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000
  },
  {
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50
  }
]
