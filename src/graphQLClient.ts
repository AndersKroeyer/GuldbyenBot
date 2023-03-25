import { GraphQLClient } from 'graphql-request';

export const client: GraphQLClient =
    new GraphQLClient('https://www.warcraftlogs.com/api/v2/client')
