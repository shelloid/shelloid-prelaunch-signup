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
    var regId = md5(req.body.email + ":" + ctx.config.app.hashSecret);
	var db = req.db("invitedb");
    db
    .query("SELECT invite_code, validated FROM interested_users WHERE email = ?", [req.body.email])
    .success(function (rows) {
        if (rows.length > 0){
            if (rows[0].validated == 0) {
                sendEmail(req, res, rows[0].invite_code, ctx);
            } else {
               res.send({msg: "User already registered and confirmed.", status: 500});
            }
        } else {
            db
			.query(function (){
				return 	["INSERT INTO interested_users (email, name, invite_code, who_invited) VALUES (?,?, ?, ?)",	[req.body.email, req.body.name, regId, req.body.who_invited] ];
			})
			.success(function (rows) {
				sendEmail(req, res, regId, ctx);
			})
			.error(function (err) {
				if (err && err.code && err.code.indexOf("ER_DUP_ENTRY") >= 0) {
					res.send({msg: "User already exists.", status: 500});
				}else{
					res.send({msg: err.message, status: 500});
				}
			});
        }
	})
	.error(function (err) {
		res.send({msg: err.message, status: 500});
	})
	.execute({transaction: true});
}

function sendEmail(req, res, regId, ctx){
    var locals = {
        to: req.body.email,
        subject: ctx.config.app.emailSubject,
        name: req.body.name,
        url: ctx.config.app.baseUrl + "/register?id=" + regId
    };
	
	var seq = sh.seq();
	seq
	.step(function(){
		emailTemplates(templatesDir, seq.next);
	})
	.step(function(template){
        template('expressInterestForm', locals, seq.next);
	})
	.step(function(html, text){
		var mailgun = new Mailgun({apiKey: ctx.config.app.mailgun.apiKey, 
			domain: ctx.config.app.mailgun.domain});
		var data = {
			from: ctx.config.app.mailgun.fromAddress,
			to: locals.to,
			subject: locals.subject,
			html: html,
			text: text
		};
		mailgun.messages().send(data, seq.next);
	})
	.step(function(){
		res.send({status: 200});
		seq.next();
	})
	.error(function(err){
		res.send({msg: "We can't sent email at the moment. Please try again later", status: 500});
		console.log("Error: ", err);	
	})
	.execute();
}