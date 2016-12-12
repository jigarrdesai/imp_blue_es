var express = require('express');  


var router = express.Router();

var elastic = require('../modules/elasticsearch');

/* GET suggestions */
router.get('/suggest/:input', function (req, res, next) {  
  elastic.getSuggestions(req.params.input).then(function (result) { res.json(result) },function(error) {
        res.json(result); // Error!
    });
});

/* POST document to be indexed */
router.post('/', function (req, res, next) {  
	console.log(req.body);
  elastic.addDocument(req.body).then(function (result) { res.json(result) },function(error) {
        res.json(result); // Error!
    });
});

router.delete('/', function (req, res, next) {  
	console.log(req.body);
    elastic.deleteDocument(req.body).then(function (result) {
    	console.log("delete result : " +result);
   		res.json(result);
    },function(error) {
        res.json(result); // Error!
    });
});

router.put('/', function (req, res, next) {  
	console.log(req.body);
    elastic.updateDocument(req.body).then(function (result) {
    	console.log("delete result : " +result);
   		res.json(result);
    },function(error) {
        res.json(result); // Error!
    });
});

router.get('/', function (req, res, next) {  
	console.log("documents body : " + JSON.stringify(req.query));

    var from = req.query.from || "0";
    var size = req.query.size || "10";
    var number = req.query.number || "ALL";
    var unicode = req.query.unicode || "ALL";
    var operator = req.query.operator || "ALL";
    var sortBy = req.query.sortBy || "id" ;
    var sort = req.query.sort || "asc" ;
    var startDate = req.query.startDate || "1479930000" ; 
    var endDate = req.query.endDate || "4099151379";
    var isActive = req.query.isActive || true ;
    var isDelete = req.query.isDelete || false ;
    

     var queryJson = {
        "from":from,
        "size":size,
        "number":number,
        "circle": req.query.circle,
        "createdAt": req.query.createdAt,
        "createdBy": "longcode",
        "id": req.query.id,
        "isActive": isActive,
        "isDelete": isDelete,
        "keyword": req.query.keyword,
        "longcode": req.query.longcode,
        "msgType": req.query.msgType,
        "operator": operator,
        "responseMessage": req.query.responseMessage,
        "sms": req.query.sms,
        "unicode": unicode,
        "updatedAt": req.query.updatedAt,
        "updatedBy":"longcode",
        "sortBy":sortBy,
        "sort": sort,
        "startDate": startDate,
        "endDate": endDate
      }

     
  
   // res.json("OK");
  
   elastic.getDocuments(queryJson).then(function (result) {
    	console.log("documents result : " +result);
   		   res.json({count:result.hits.total,results:result.hits.hits});
    },function(error) {
        res.json(error); // Error!
    });
});




module.exports = router;