const { fetch } = require('cross-fetch')
const {
  ApolloServer,
  makeRemoteExecutableSchema,
} = require("apollo-server")
const { HttpLink } = require("apollo-link-http")
const {
  linkToExecutor,
  introspectSchema,
  stitchSchemas,
} = require("graphql-tools")

const createRemoteSchema = async (uri) => {
  const link = new HttpLink({ uri, fetch })
  const executor = linkToExecutor(link)
  const schema = await introspectSchema(executor)
  return makeRemoteExecutableSchema({
    schema,
    link,
  })
};

(async () => {
  const accountsSchema = await createRemoteSchema("http://localhost:5001/graphql")
  const inventorySchema = await createRemoteSchema("http://localhost:5004/graphql")
  const productsSchema = await createRemoteSchema("http://localhost:5003/graphql")
  const reviewsSchema = await createRemoteSchema("http://localhost:5002/graphql")

  const stitchedSchema = stitchSchemas({
    subschemas: [
      {
        schema: accountsSchema,
        merge: {
          User: {
            fieldName: "_userById",
            selectionSet: "{ id }",
            args: ({ id }) => ({ id })
          }
        }
      },
      {
        schema: inventorySchema,
        merge: {
          Product: {
            fieldName: "_productByUpc",
            selectionSet: "{ upc weight price }",
            args: ({ upc, weight, price }) => ({ upc, weight, price })
          }
        }
      },
      {
        schema: productsSchema,
        merge: {
          Product: {
            fieldName: "_productByUpc",
            selectionSet: "{ upc }",
            args: ({ upc }) => ({ upc })
          }
        }
      },
      {
        schema: reviewsSchema,
        merge: {
          User: {
            fieldName: "_userById",
            selectionSet: "{ id }",
            args: ({ id }) => ({ id })
          },
          Product: {
            fieldName: "_productByUpc",
            selectionSet: "{ upc }",
            args: ({ upc }) => ({ upc })
          },
          Review: {
            fieldName: "_userById",
            selectionSet: "{ id }",
            args: ({ id }) => ({ id })
          }
        }
      }],
    mergeTypes: true,
  })

  const server = new ApolloServer({
    schema: stitchedSchema,
  })

  server.listen({ port: 5000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
})()
