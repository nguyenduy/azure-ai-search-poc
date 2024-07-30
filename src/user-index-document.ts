// import { SearchIndex } from "@azure/search-documents";

// export const UserIndexDefinitions = {
//   name: "user-index",
//   fields: [
//     {
//       name: "userType",
//       type: "Edm.String",
//       searchable: false,
//       filterable: true,
//       sortable: true,
//       facetable: true,
//       retrievable: true,
//     },

//     {
//       name: "emailAddress",
//       type: "Edm.String",
//       searchable: true,
//       filterable: true,
//       sortable: true,
//       facetable: false,
//       retrievable: true,
//     },
//     {
//       name: "identityDetails",
//       type: "Edm.ComplexType",
//       fields: [
//         {
//           name: "lastName",
//           type: "Edm.String",
//           searchable: true,
//           filterable: true,
//           sortable: true,
//           facetable: false,
//           retrievable: true,
//         },
//         {
//           name: "restOfName",
//           type: "Edm.String",
//           searchable: true,
//           filterable: true,
//           sortable: true,
//           facetable: false,
//           retrievable: true,
//         },
//         {
//           name: "generationalSuffix",
//           type: "Edm.String",
//           searchable: false,
//           filterable: true,
//           sortable: true,
//           facetable: true,
//           retrievable: true,
//         },
//         {
//           name: "gender",
//           type: "Edm.String",
//           searchable: false,
//           filterable: true,
//           sortable: true,
//           facetable: true,
//           retrievable: true,
//         },
//         {
//           name: "dateOfBirth",
//           type: "Edm.DateTimeOffset",
//           searchable: false,
//           filterable: true,
//           sortable: true,
//           facetable: true,
//           retrievable: true,
//         },
//       ],
//     },
//     {
//       name: "applyingTo",
//       type: "Collection(Edm.String)",
//       searchable: false,
//       filterable: true,
//       sortable: false,
//       facetable: true,
//       retrievable: true,
//     },
//     {
//       name: "role",
//       type: "Edm.String",
//       searchable: false,
//       filterable: true,
//       sortable: true,
//       facetable: true,
//       retrievable: true,
//     },
//     {
//       name: "accessBlocked",
//       type: "Edm.Boolean",
//       searchable: false,
//       filterable: true,
//       sortable: true,
//       facetable: true,
//       retrievable: true,
//     },
//     {
//       name: "tags",
//       type: "Collection(Edm.String)",
//       searchable: false,
//       filterable: true,
//       sortable: false,
//       facetable: true,
//       retrievable: true,
//     },
//     {
//       name: "createdAt",
//       type: "Edm.DateTimeOffset",
//       searchable: false,
//       filterable: true,
//       sortable: true,
//       facetable: true,
//       retrievable: true,
//     },
//     {
//       name: "updatedAt",
//       type: "Edm.DateTimeOffset",
//       searchable: false,
//       filterable: true,
//       sortable: true,
//       facetable: true,
//       retrievable: true,
//     },
//     {
//       name: "externalId",
//       type: "Edm.String",
//       searchable: false,
//       filterable: true,
//       sortable: false,
//       facetable: false,
//       retrievable: true,
//     },
//     {
//       name: "id",
//       type: "Edm.String",
//       key: true,
//       searchable: false,
//       filterable: true,
//       sortable: false,
//       facetable: false,
//     },
//     {
//       name: "schemaVersion",
//       type: "Edm.String",
//       searchable: false,
//       filterable: true,
//       sortable: true,
//       facetable: true,
//       retrievable: true,
//     },
//   ],
// } as SearchIndex;

export interface UserIndexDocument {
  userType: string;
  emailAddress: string;
  identityDetails: {
    lastName: string;
    restOfName: string;
    generationalSuffix: string;
    gender: string;
    dateOfBirth: string;
  };
  applyingTo: string[];
  role: string;
  accessBlocked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  externalId: string;
  _id: string;
  schemaVersion: string;
}