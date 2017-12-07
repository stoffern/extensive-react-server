/**
 * @flow
 * @relayHash 1d768794812efcf5d7fb8e7fb3c03f35
 */

/* eslint-disable */

"use strict";

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type Routes_Dashboard_QueryResponse = {|
  +projects: ?$ReadOnlyArray<?{|
    +name: ?string;
    +members: ?$ReadOnlyArray<?{|
      +name: ?string;
    |}>;
  |}>;
|};
*/

/*
query Routes_Dashboard_Query {
  projects {
    name
    members {
      name
    }
  }
}
*/

const batch /*: ConcreteBatch*/ = {
  fragment: {
    argumentDefinitions: [],
    kind: "Fragment",
    metadata: null,
    name: "Routes_Dashboard_Query",
    selections: [
      {
        kind: "LinkedField",
        alias: null,
        args: null,
        concreteType: "ProjectType",
        name: "projects",
        plural: true,
        selections: [
          {
            kind: "ScalarField",
            alias: null,
            args: null,
            name: "name",
            storageKey: null
          },
          {
            kind: "LinkedField",
            alias: null,
            args: null,
            concreteType: "MemberType",
            name: "members",
            plural: true,
            selections: [
              {
                kind: "ScalarField",
                alias: null,
                args: null,
                name: "name",
                storageKey: null
              }
            ],
            storageKey: null
          }
        ],
        storageKey: null
      }
    ],
    type: "RootType"
  },
  id: null,
  kind: "Batch",
  metadata: {},
  name: "Routes_Dashboard_Query",
  query: {
    argumentDefinitions: [],
    kind: "Root",
    name: "Routes_Dashboard_Query",
    operation: "query",
    selections: [
      {
        kind: "LinkedField",
        alias: null,
        args: null,
        concreteType: "ProjectType",
        name: "projects",
        plural: true,
        selections: [
          {
            kind: "ScalarField",
            alias: null,
            args: null,
            name: "name",
            storageKey: null
          },
          {
            kind: "LinkedField",
            alias: null,
            args: null,
            concreteType: "MemberType",
            name: "members",
            plural: true,
            selections: [
              {
                kind: "ScalarField",
                alias: null,
                args: null,
                name: "name",
                storageKey: null
              }
            ],
            storageKey: null
          }
        ],
        storageKey: null
      }
    ]
  },
  text:
    "query Routes_Dashboard_Query {\n  projects {\n    name\n    members {\n      name\n    }\n  }\n}\n"
};

module.exports = batch;
