/*!
  * Copyright(c) 2015 Shelloid Systems LLP.
 * MIT Licensed
*/


/**

*/
exports.index = function(req, res, ctx){
	var db = req.db("invitedb");
    db
    .query("SELECT a.email email, a.name name, a.regd_at regd_at, a.validated validated, " + 
	       "b.email who_invited " + 
	       "FROM interested_users a LEFT JOIN interested_users b ON b.ref_code = a.who_invited", 
		   [])
    .success(function (rows) {
		var data = [];
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			data.push([row.email, row.name, row.regd_at, 
			        row.validated == 1 ? true : false, row.who_invited]);
		}
		res.send({data:data});
	})
	.execute();
}

