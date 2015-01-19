/**
@noauth
*/
exports.index = function(req, res){
  req.logout();
  res.redirect('/admin.html');
}