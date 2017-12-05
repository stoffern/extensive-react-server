var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull
} = require('graphql');

const TicketType = new GraphQLObjectType({
  name: 'TicketType',
  fields: {
    id: {
      type: GraphQLString
    },
    message: {
      type: GraphQLString
    }
  }
});

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: GraphQLInt
    },
    name: {
      type: GraphQLString
    },
    tickets: {
      type: new GraphQLList(TicketType),
      resolve(member) {
        return [
          {id: 1, message: `Member: ${member.id}, Ticket: 1`},
          {id: 2, message: `Member: ${member.id}, Ticket: 2`}
        ];
      }
    }
  }
});

const ProjectType = new GraphQLObjectType({
  name: 'ProjectType',
  fields: {
    id: {
      type: GraphQLInt
    },
    name: {
      type: GraphQLString
    },
    members: {
      type: new GraphQLList(MemberType),
      resolve(project) {
        return [
          {id: 1, name: `Project: ${project.id}, Member: 1`},
          {id: 2, name: `Project: ${project.id}, Member: 2`}
        ];
      }
    }
  }
});

const RootType = new GraphQLObjectType({
  name: 'RootType',
  fields: {
    projects: {
      type: new GraphQLList(ProjectType),
      resolve() {
        return [
          {id: 1, name: `Project 1`},
          {id: 2, name: `Project 2`}
        ];
      }
    },
    project: {
      type: ProjectType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve(parent, {id}) {
        return {id: id, name: `Project ${id}`}
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: RootType
});

module.exports = schema;