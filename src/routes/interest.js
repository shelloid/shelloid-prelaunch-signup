/*!
  * Copyright(c) 2015 Shelloid Systems LLP.
 * MIT Licensed
*/

var emailTemplates = require('email-templates'),
    Mailgun = require('mailgun-js'),
    path = require('path'),
    md5 = require('MD5'),
	moment = sh.require("moment");

var templatesDir = path.resolve(sh.appCtx.basePath, 'src/email-templates');

/**
	@noauth
	@interface "/interest"
	@sql.selectInvited SELECT invite_code, validated, regd_at FROM
							  interested_users WHERE email = ? 
    @sql.updateInterested UPDATE interested_users SET regd_at=CURRENT_TIMESTAMP()
						  WHERE email = ?								
	@sql.insertInterested INSERT INTO interested_users (email, name, invite_code,
							who_invited) VALUES (?,?, ?, ?)					
*/
exports.index = function(req, res, ctx){
    var regId = md5(req.body.email + ":" + ctx.config.app.hashSecret);
	var db = req.db("invitedb");
    db
    .selectInvited([req.body.email])
    .success(function (rows) {
        if (rows.length > 0){
            if (rows[0].validated == 0) {
				var now = moment();
				var regd = moment(rows[0].regd_at);
				var d = 3*60 - now.diff(regd, 'seconds');

				if(d <= 0){
					sendEmail(req, res, rows[0].invite_code, ctx);
					db
					.updateInterested(function(){return [req.body.email];})
					.error(function(err){
						console.log("Updating regd_at failed for: " + req.body.email);
					});
					
				}else{
					res.send({msg: "Email already sent. Please wait for " 
					          + Math.floor(d/60) + " min " + (d%60) + " seconds before retrying.", status: 500});
				}
            } else {
               res.send({msg: "User already registered and confirmed.", status: 500});
            }
        } else {
            db
			.insertInterested(function(){
				return [req.body.email, req.body.name, regId, req.body.who_invited];
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
        url: ctx.config.baseUrl + "/register?id=" + regId
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