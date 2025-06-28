import { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from "dotenv";

dotenv.config()
const config: CodegenConfig = {
    schema: 'https://www.warcraftlogs.com/api/v2/client',
    documents: ['src/**/*.ts'],
    generates: {
        'src/__generated__/graphql-types.ts': {
            plugins: ["typescript", "typescript-operations"],
            presetConfig: {
                gqlTagName: 'gql',
            }
        }
    },
    ignoreNoDocuments: true,
    config: {
        headers: {
            Authorization: `Bearer ${process.env.WARCRAFT_LOGS_API_TOKEN}`,
        },
        avoidOptionals: true
    },
};

export default config;