import { config } from 'dotenv'
config()

import { nexusPrismaPlugin } from '@generated/nexus-prisma'
import Photon from '@generated/photon'
import { makeSchema } from '@prisma/nexus'
import { GraphQLServer } from 'graphql-yoga'
import * as path from 'path'
import * as allTypes from './resolvers'
import { Context } from './types'
import { isDev } from './utils'

const PORT = process.env.PORT || 4002

const photon = new Photon({
  debug: isDev,
})

const nexusPrisma = nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
})

const schema = makeSchema({
  types: [allTypes, nexusPrisma],
  outputs: {
    typegen: path.join(__dirname, '../generated/nexus-typegen.ts'),
    schema: path.join(__dirname, '/schema.graphql'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@generated/photon',
        alias: 'photon',
      },
      {
        source: path.join(__dirname, 'types.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
})

const server = new GraphQLServer({
  schema,
  // middlewares: [permissions], // TODO: Fix after https://github.com/maticzav/graphql-shield/issues/361
  context: (request: any) => {
    return {
      ...request,
      photon,
    }
  },
})

server.start(
  {
    port: PORT,
  },
  () => console.log(`🚀 Server ready at http://localhost:${PORT}`)
)
