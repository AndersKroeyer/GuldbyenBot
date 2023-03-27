import { graphClient } from '../graphQLClient';
import { gql } from 'graphql-request';
import {
  ReportDataReportArgs,
  Query,
  ReportEventsArgs,
  EventDataType,
  ReportActor,
} from '../__generated__/graphql-types';

export const getPulls = async (code: string): Promise<number[]> => {
  const variables: ReportDataReportArgs = { code: code };

  const data = await graphClient.request<Query>(
    gql`
      query ($code: String) {
        reportData {
          report(code: $code) {
            fights {
              id
            }
          }
        }
      }
    `,
    variables,
  );

  return data.reportData.report.fights.map((x) => x.id);
};

export const getActors = async (code: string): Promise<ReportActor[]> => {
  const variables: ReportDataReportArgs = { code: code };

  const data = await graphClient.request<Query>(
    gql`
      query ($code: String) {
        reportData {
          report(code: $code) {
            masterData {
              actors {
                id
                name
                petOwner
                type
              }
            }
          }
        }
      }
    `,
    variables,
  );

  return data.reportData.report.masterData.actors;
};
