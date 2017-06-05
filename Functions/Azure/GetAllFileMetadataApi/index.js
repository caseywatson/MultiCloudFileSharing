var toFileMetadata = function(tableEntity) {
    return {
        fileId: tableEntity.RowKey,
        fileName: tableEntity.FileName,
        fileType: tableEntity.FileType,
        fileDate: tableEntity.FileDate,
        fileSource: tableEntity.FileSource
    };
};

module.exports = function (context, req) {
    var fileMetadataResponse = [];
    var fileMetadataTable = context.bindings.fileMetadataTable;

    for (var i = 0; i < fileMetadataTable.length; i++) {
        fileMetadataResponse.push(toFileMetadata(fileMetadataTable[i]));
    }

    context.done(null, { body: fileMetadataResponse });
};