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
		done({username: "admin", roles: ["admin"]});
	}else{
		err.app("Invalid authentication attempt: " + req.username);
	}
}

/**
  @auth 	  "google"
  @pathPrefix "/signup"
  @success     "/provider/signup"
*/
exports.googleAuth  = function(req, done, err){
	if(req.profile.emails && req.profile.emails.length > 0){
		done({username: req.profile.emails[0].value, 
				fullname: req.profile.displayName, roles:["guest"]});
	}else{
		err("Email not available.");
	}
}

/**
  @ignore
  @auth 	  "facebook"
  @pathPrefix "/signup"
  @success     "/provider/signup"
*/
exports.facebookAuth  = function(req, done, err){
	if(req.profile){
		done({username: req.profile.username + "@facebook.com" , 
				fullname: req.profile.displayName, roles:["guest"]});
	}else{
		err("Email not available.");
	}
}

/**
 @auth  "api"
*/
exports.apiAuth = function(req, done, err){
	done({id: 1});
}