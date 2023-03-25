import { client } from './graphQLClient';
import { request, gql } from 'graphql-request';
import { ReportData, ReportDataReportArgs, Query } from "./__generated__/graphql-types"

export const getPulls = async (code: string): Promise<number[]> => {
    const variables: ReportDataReportArgs = { code: code };

    const data = await client.request<Query>(gql`
        query ($code: String) {
            reportData {
                report(code: $code) {
                    fights {
                        id
                    }
                }
            }
        }
    `, variables);

    return data.reportData.report.fights.map(x => x.id);
}



export const getZealotEvents = async (): Promise<void> => {





}