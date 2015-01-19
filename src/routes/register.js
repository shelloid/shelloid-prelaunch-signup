/*!
  * Copyright(c) 2015 Shelloid Systems LLP.
 * MIT Licensed
*/

var emailTemplates = require('email-templates'),
    Mailgun = require('mailgun-js'),
    path = require('path'),
    md5 = require('MD5');

var templatesDir = path.resolve(sh.appCtx.basePath, 'src/email-templates');

/**
	@noauth
*/
exports.index = function(req, res, ctx){
    var email, id, process_code;
	var db = req.db("invitedb");
    db
	.query("SELECT id, email FROM interested_users WHERE invite_code = ?", [req.query.id])
	.success(function (rows) {
		if (rows.length <= 0) {
			res.status(500).render('error', {message: "Invalid Registration code",error: null});
		} else {
			email = rows[0].email;
			id = rows[0].id;
			process_code = process(id);
		}
	})
	.query(function () {
		return ["UPDATE interested_users SET validated = 1, ref_code = ? WHERE email = ?", 
				[process_code, email] ]
	})
	.success(function (rows) {
		sendEmail(email, ctx.config.baseUrl + "?id=" + process_code, res, ctx);
	})
	.error(function (err) {
		console.log(err);
		res.status(500).render('error', {message: err.message});
	})
	.execute({transaction: true});
};

function process (id){
    var strId = id + "";
    return "V" + strId.charAt(0) + "R" + strId.charAt(1) + "F" + strId.substr(1);
}

function sendEmail(email, url, res, ctx){
    var locals = {
        to: email,
        subject: ctx.config.app.emailSubject,
        url: url
    };
	
	var seq = sh.seq();
	
	seq
	.step(function(){
		emailTemplates(templatesDir, seq.next);
	})
	.step(function(template){
		template('refCodeForm', locals, seq.next);
	})
	.step(function(html, text){
		var mailgun = new Mailgun({apiKey: ctx.config.app.mailgun.apiKey, domain: ctx.config.app.mailgun.domain});
		var data = {
			from: ctx.config.app.mailgun.fromAddress,
			to: locals.to,
			subject: locals.subject,
			html: html,
			text: text
		};
		mailgun.messages().send(data,seq.next);
	})
	.step(function (body) {
		res.status(200).render('register', {url: url});
		seq.next();
	})
	.error(function(err){
		res.send({msg: "We can't sent email at the moment. Please try again later", status: 500});
		console.log("Error: ", err);	
	})
	.execute();	
}