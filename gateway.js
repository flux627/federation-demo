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
  // loadSchema,
  // GraphQLFileLoader,
  // wrapSchema,
  // FilterRootFields
} = require("graphql-tools")
// const { validateSchemaCoverage } = require("./validateSchemaCoverage")
const { validateUniqueOperationFields } = require("./validateUniqueOperationFields")

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
  // const targetSchema = await loadSchema(
  //   'targetSchema.graphql',
  //   { loaders: [new GraphQLFileLoader()] },
  // )

  const subschemas = {
    accounts: await createRemoteSchema("http://localhost:5001/graphql"),
    inventory: await createRemoteSchema("http://localhost:5004/graphql"),
    products: await createRemoteSchema("http://localhost:5003/graphql"),
    reviews: await createRemoteSchema("http://localhost:5002/graphql"),
  }

  if (!validateUniqueOperationFields(subschemas)) {
    process.exit(1)
  }

  const stitchedSchema = stitchSchemas({
    subschemas: [
      {
        schema: subschemas.accounts,
        merge: {
          // User: {
          //   fieldName: "_userById",
          //   selectionSet: "{ id }",
          //   args: ({ id }) => ({ id })
          // },
          User: {
            fieldName: "_usersByIds",
            selectionSet: "{ id }",
            resolveMany: true,
            key: ({ id }) => id,
            args: (ids) => ({ ids })
          }
        }
      },
      {
        schema: subschemas.inventory,
        merge: {
          // Product: {
          //   fieldName: "_productByUpc",
          //   selectionSet: "{ upc weight price }",
          //   args: ({ upc, weight, price }) => ({ upc, weight, price })
          // },
          Product: {
            fieldName: "_productsByUpcs",
            selectionSet: "{ upc weight price }",
            resolveMany: true,
            key: ({ upc, weight, price }) => ({ upc, weight, price }),
            args: (fieldSets) => ({ fieldSets })
          },
        }
      },
      {
        schema: subschemas.products,
        merge: {
          // Product: {
          //   fieldName: "_productByUpc",
          //   selectionSet: "{ upc }",
          //   args: ({ upc }) => ({ upc })
          // },
          Product: {
            fieldName: "_productsByUpcs",
            selectionSet: "{ upc }",
            resolveMany: true,
            key: ({ upc }) => upc,
            args: (upcs) => ({ upcs })
          },
        }
      },
      {
        schema: subschemas.reviews,
        merge: {
          // User: {
          //   fieldName: "_userById",
          //   selectionSet: "{ id }",
          //   args: ({ id }) => ({ id })
          // },
          // Product: {
          //   fieldName: "_productByUpc",
          //   selectionSet: "{ upc }",
          //   args: ({ upc }) => ({ upc })
          // },
          // Review: {
          //   fieldName: "_userById",
          //   selectionSet: "{ id }",
          //   args: ({ id }) => ({ id })
          // },

          User: {
            fieldName: "_usersByIds",
            selectionSet: "{ id }",
            resolveMany: true,
            key: ({ id }) => id,
            args: (ids) => ({ ids })
          },
          Product: {
            fieldName: "_productsByUpcs",
            selectionSet: "{ upc }",
            resolveMany: true,
            key: ({ upc }) => upc,
            args: (upcs) => ({ upcs })
          },
          Review: {
            fieldName: "_usersByIds",
            selectionSet: "{ id }",
            resolveMany: true,
            key: ({ id }) => id,
            args: (ids) => ({ ids })
          },
        }
      }],
    mergeTypes: true,
  })

  // const filteredStitchedSchema = wrapSchema(
  //   stitchedSchema,
  //   [new FilterRootFields((_, fieldName) => !fieldName.startsWith('_'))]
  // )

  // if (!validateSchemaCoverage(targetSchema, filteredStitchedSchema)) {
  //   process.exit(1)
  // }

  const server = new ApolloServer({
    schema: stitchedSchema,
  })

  server.listen({ port: 5000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
})()
