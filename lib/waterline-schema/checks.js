//   ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗███████╗
//  ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝██╔════╝
//  ██║     ███████║█████╗  ██║     █████╔╝ ███████╗
//  ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ ╚════██║
//  ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗███████║
//   ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝
//
// Runs any last sanity checks on the generated schema's before returning the
// schema to Waterline.

var _ = require('@sailshq/lodash');

module.exports = function sanityChecks(schema) {
  // Process each model in the schema individually
  _.each(schema, function parseCollections(collectionInfo, collectionName) {
    // Hold an array of column names to validate uniqueness
    var columnNames = [];

    //  ╔═╗╔╦╗╔╦╗╦═╗╦╔╗ ╦ ╦╔╦╗╔═╗  ┬  ┌─┐┌─┐┌─┐┬┌┐┌┌─┐
    //  ╠═╣ ║  ║ ╠╦╝║╠╩╗║ ║ ║ ║╣   │  │ ││ │├─┘│││││ ┬
    //  ╩ ╩ ╩  ╩ ╩╚═╩╚═╝╚═╝ ╩ ╚═╝  ┴─┘└─┘└─┘┴  ┴┘└┘└─┘
    // Process each attribute in the schema individually
    _.each(collectionInfo.schema, function parseAttributes(attributeInfo) {
      // If the attribute is a virtual collection attribute, ignore it
      if (_.has(attributeInfo, 'collection')) {
        return;
      }

      // Ensure the attribute has a columnName property
      if (!_.has(attributeInfo, 'columnName')) {
        throw new Error('Attribute is missing a columnName property. Each attribute in the schema should have a computed columnName.');
      }

      columnNames.push(attributeInfo.columnName);
    });


    //  ╔═╗╔═╗╦  ╦ ╦╔╦╗╔╗╔  ╔╗╔╔═╗╔╦╗╔═╗  ┬ ┬┌┐┌┬┌─┐ ┬ ┬┌─┐┌┐┌┌─┐┌─┐┌─┐
    //  ║  ║ ║║  ║ ║║║║║║║  ║║║╠═╣║║║║╣   │ ││││││─┼┐│ │├┤ │││├┤ └─┐└─┐
    //  ╚═╝╚═╝╩═╝╚═╝╩ ╩╝╚╝  ╝╚╝╩ ╩╩ ╩╚═╝  └─┘┘└┘┴└─┘└└─┘└─┘┘└┘└─┘└─┘└─┘
    // Validate that the model doesn't have duplicate column names
    var uniqueColumnNames = _.uniq(columnNames);
    if (columnNames.length !== uniqueColumnNames.length) {
      throw new Error('The model `' + collectionName + '` has attributes with non-unique column names. Each attribute in the model must have a unique column name.');
    }
  });

  return schema;
};