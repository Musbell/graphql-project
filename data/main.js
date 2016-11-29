/**
 * Created by musbell on 11/23/16.
 */
import {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from 'graphql';

import {
    globalIdField,
    fromGlobalId,
    nodeDefinitions,
    connectionDefinitions,
    connectionArgs,
    connectionFromArray,
    connectionFromPromisedArray
} from 'graphql-relay';

import {
    mutationWithClientMutationId,
    // other helpers
} from 'graphql-relay';

import ObjectID from  'mongodb'

const globalIdFetcher = (globalId, { db }) => {
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
        case 'QuotesLibrary':
            // We only have one quote library
            return quotesLibrary;
        case 'Quote':
            return db.collection('quotes').findOne(ObjectID(id));
        default:
            return null;
    }
};
const globalTypeResolver = obj => obj.type || QuoteType;
const { nodeInterface, nodeField } = nodeDefinitions(
    globalIdFetcher,
    globalTypeResolver
);


const QuoteType = new GraphQLObjectType({
    name: 'Quote',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField('Quote', obj => obj._id),
        text: { type: GraphQLString },
        author: { type: GraphQLString },
        likesCount: {
            type: GraphQLInt,
            resolve: obj => obj.likesCount || 0
        }
    }
});

const { connectionType: QuotesConnectionType } =
    connectionDefinitions({
        name: 'Quote',
        nodeType: QuoteType
    });

let connectionArgsWithSearch = connectionArgs;
connectionArgsWithSearch.searchTerm = { type: GraphQLString };
const QuotesLibraryType = new GraphQLObjectType({
    name: 'QuotesLibrary',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField('QuotesLibrary'),
        quotesConnection: {
            type: QuotesConnectionType,
            description: 'A list of the quotes in the database',
            args: connectionArgsWithSearch,
            resolve: (_, args, { db }) => {
                let findParams = {};
                if (args.searchTerm) {
                    findParams.text = new RegExp(args.searchTerm, 'i');
                }
                return connectionFromPromisedArray(
                    db.collection('quotes').find(findParams).toArray(),
                    args
                );
            }
        }
    }
});
const quotesLibrary = { type: QuotesLibraryType };
const thumbsUpMutation = mutationWithClientMutationId({
    name: 'ThumbsUpMutation',
    inputFields: {
        quoteId: { type: GraphQLString }
    },
    outputFields: {
        quote: {
            type: QuoteType,
            resolve: obj => obj
        }
    },
    mutateAndGetPayload: (params, { db }) => {
        // const { id } = fromGlobalId(params.quoteId);
        const { id } = params._id;
        return Promise.resolve(
            db.collection('quotes').updateOne(
                { _id: ObjectID(id) },
                { $inc: { likesCount: 1 } }
            )
        ).then(result =>
            db.collection('quotes').findOne(ObjectID(id)));
    }
});

const mutationType = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        thumbsUp: thumbsUpMutation
    }
});
const queryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        node: nodeField,
        quotesLibrary: {
            type: QuotesLibraryType,
            description: 'The Quotes Library',
            resolve: () => quotesLibrary
        }
    }
});


export var Schema = new GraphQLSchema({
    query: queryType,
    // Uncomment the following after adding some mutation fields:
    mutation: mutationType
});

