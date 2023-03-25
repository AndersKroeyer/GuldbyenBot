import { GraphQLClient } from 'graphql-request';

export const graphClient: GraphQLClient =
    new GraphQLClient('https://www.warcraftlogs.com/api/v2/client')
