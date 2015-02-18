/**
@iot.sql = SELECT avg(temp) AS avg_temp FROM nest.thermostat WHERE  avg(temp) >= $max_temp
@iot.sql.params = sqlParams
*/
exports.highTemperature = function(msg){
}

/**
*/
exports.sqlParams = function(sql){
   return {};
}