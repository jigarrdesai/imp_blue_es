var elasticsearch = require('elasticsearch');
var esql = require('esql');

var elasticClient = new elasticsearch.Client({  
    host: '107.155.87.74:6200',
    log: 'trace'
});

var indexName = "ibsms";//indexname

/**
* Delete an existing index
*/
function deleteIndex() {  
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
* create the index
*/
function initIndex() {  
    console.log("initIndex" + indexName);
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/**
* check if the index exists
*/
function indexExists() {  
  console.log("indexExists "  + indexName);
    return  elasticClient.indices.exists({
        index: indexName
    });
   // console.log(indexExists);
   // return indexExists;
}
exports.indexExists = indexExists;  
          

function initOraMapping() {  

    console.log("initOraMapping");

    return elasticClient.indices.putMapping({
        index: indexName,
        type: "document",
        body: {
            properties: {
                id: { type: "string", "index": "not_analyzed" },
                number: { type: "string" },
                sms: { type: "string" },      
                longcode: { type: "string"},
                operator:{ type:"string","index": "not_analyzed"},
                circle:{type:"string","index": "not_analyzed"},
                msgType: { type: "string"},
                keyword:{ type:"string","index": "not_analyzed"},
                unicode:{ type:"string","index": "not_analyzed"},
                responseMessage:{ type:"string"},
                createdAt:{type:"long"},
                createdBy:{type:"string", "index": "not_analyzed"},
                isActive:{ type:"boolean"},
                isDelete:{ type:"boolean"},
                updatedAt:{ type:"long" },
                updatedBy:{ type:"string", "index": "not_analyzed" }
            }
        },
         refresh: true
    });
}
exports.initOraMapping = initOraMapping;


function updateOraMapping() {  

    console.log("initOraMapping");

    return elasticClient.indices.putMapping({
        index: indexName,
        type: "document",
        body: {
             properties: {
                id: { type: "string", "index": "not_analyzed" },
                number: { type: "string" },
                sms: { type: "string" },      
                longcode: { type: "string"},
                operator:{ type:"string","index": "not_analyzed"},
                circle:{type:"string","index": "not_analyzed"},
                msgType: { type: "integer"},
                keyword:{ type:"string","index": "not_analyzed"},
                unicode:{ type:"string","index": "not_analyzed"},
                responseMessage:{ type:"string"},
                createdAt:{type:"long"},
                createdBy:{type:"string", "index": "not_analyzed"},
                isActive:{ type:"boolean"},
                isDelete:{ type:"boolean"},
                updatedAt:{ type:"long" },
                updatedBy:{ type:"string", "index": "not_analyzed" }
            }
        },
         refresh: true
    });
}
exports.initOraMapping = initOraMapping;

function addDocument(document) {  
    console.log("addDocument : " + JSON.stringify(document));

    return elasticClient.index({
        index: indexName,
        type: "document",
        body: document,
        refresh: true
    });
}
exports.addDocument = addDocument;


function deleteDocument(document) {  
    console.log("deleteDocument : " + JSON.stringify(document));

    return elasticClient.delete({
        index: indexName,
        type: "document",
        id: document.esId,
        refresh: true
    });
}
exports.deleteDocument = deleteDocument;

function updateDocument(document) {  
    console.log("updateDocument : " + JSON.stringify(document));

    return elasticClient.update({
        index: indexName,
        type: "document",
        id: document.esId,
        body:{
            doc:document
        },
        refresh: true
    });
}
exports.updateDocument = updateDocument;


function getSuggestions(input) {  
    return elasticClient.suggest({
        index: indexName,
        type: "document",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: "bestSuited.name",
                    fuzzy: true
                }
            }
        }
    })
}
exports.getSuggestions = getSuggestions;

function getDocuments(queryJson) {  

    var queryBody = {};

    var filterJson = [];

    var esQuery = {};

    console.log("documents : " + JSON.stringify(queryJson));

   
  
    console.log(queryJson.bestSuited);

    
    var dsl = esql('match number = $1, unicode = $2', queryJson.number, queryJson.unicode);

    console.log("DSL : " + dsl);
  
    if( queryJson.number === 'ALL'){

      esQuery = {
          "match_all": {}
        }

    } else{

        var number = queryJson.number;

        var numberJson = {
                  "query": { 
                    "match" : {
                      "number": number
                    }
                 }
        }

        esQuery = numberJson;
    }
  

 

    if( queryJson.unicode === "ALL"){

    } else {

        
        var unicodeJson = {
                  "query": { 
                    "match" : {
                      "unicode": queryJson.unicode
                    }
                 }
        }

        

        esQuery = unicodeJson;
    }

    if(queryJson.number != "ALL" && queryJson.unicode !="ALL"){

        var esQuery = {

                  "query_string" : {
                      "fields" : ["number", "unicode"],
                      "query" : queryJson.number +  " AND " + queryJson.unicode
                  }
        }
    }

    var isActiveJson = {
              "term": {
                "isActive": queryJson.isActive
              }
            };

    filterJson.push(isActiveJson);
  
    var isDeleteJson = {
              "term": {
                "isDelete": queryJson.isDelete
              }
            };

    filterJson.push(isDeleteJson);

  

   var dateJson = {
          "range": {
            "createdAt": {
              "gte": queryJson.startDate,
              "lte": queryJson.endDate
            }
          }
        };
    filterJson.push(dateJson);    

  


    var queryBody = {
              "query": {
                "filtered": {
                "query": esQuery,

                 
                     "filter": {
                        "and":filterJson
                     }
                  
                }
               },
              "sort" : [
                {[queryJson.sortBy] : {"order" : queryJson.sort}}
              ],
              "from": queryJson.from,
              "size": queryJson.size,
              _source: true
    }




    return result = elasticClient.search({
        index: indexName,
        type: "document",
        body: queryBody
    });


}
exports.getDocuments = getDocuments;