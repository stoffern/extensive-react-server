/**
 * @flow
 * @relayHash 977591dba716b9b13c20187f6243997b
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type RoutesQueryResponse = {|
  +projects: ?$ReadOnlyArray<?{|
    +id: ?number;
    +name: ?string;
    +members: ?$ReadOnlyArray<?{|
      +name: ?string;
    |}>;
  |}>;
|};
*/


/*
query RoutesQuery {
  projects {
    id
    name
    members {
      name
    }
  }
}
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoutesQuery",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": null,
        "concreteType": "ProjectType",
        "name": "projects",
        "plural": true,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "args": null,
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "args": null,
            "name": "name",
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "MemberType",
            "name": "members",
            "plural": true,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "RootType"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "RoutesQuery",
  "query": {
    "argumentDefinitions": [],
    "kind": "Root",
    "name": "RoutesQuery",
    "operation": "query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": null,
        "concreteType": "ProjectType",
        "name": "projects",
        "plural": true,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "args": null,
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "args": null,
            "name": "name",
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "MemberType",
            "name": "members",
            "plural": true,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "text": "query RoutesQuery {\n  projects {\n    id\n    name\n    members {\n      name\n    }\n  }\n}\n"
};

module.exports = batch;
