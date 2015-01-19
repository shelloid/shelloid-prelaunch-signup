/**
@roles ["guest"]
*/
exports.signup = function(req, res, ctx){
	res.redirect("/index.html?provider=true&email=" + encodeURIComponent(req.user.username) + 
	"&name=" + encodeURIComponent(req.user.fullname));
}