exports.req = 
{
	contentType: "form",
	body:
	{
	   email: str.email,
	   name:  str.safe,
	   who_invited : optional(str.safe)
	}
}

exports.res = {
	contentType: "json",
	body:
	{
		status: num.integer,
		msg: optional(str.safe)
	}	
}