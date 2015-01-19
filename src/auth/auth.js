/**
 @auth "local"
 @path "/admin/login"
 @success "/admin-console.html"
 @failure "/admin.html"
*/

exports.auth = function(req, done, err,ctx){
	if(ctx.config.app.adminPass !== "" &&
	   req.username == ctx.config.app.adminUser && 
	   req.password == ctx.config.app.adminPass){
		done({username: "admin"});
	}else{
		err.app("Invalid authentication attempt: " + req.username);
	}
}

/**
  @auth 	  "google"
  @pathPrefix "/login"
*/
exports.providerAuth  = function(req, done, err){
	if(req.profile.emails && req.profile.emails.length > 0){
		console.log("Successfully authenticated: " + req.profile.emails[0].value);
		done({username: req.profile.emails[0].value});
	}else{
		err("Invalid authentication attempt: " + req.profile.emails[0].value);
	}
}

/**
 @auth  "api"
*/
exports.apiAuth = function(req, done, err){
	done({id: 1});
}