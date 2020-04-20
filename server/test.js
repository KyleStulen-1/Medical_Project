var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host: '73.32.82.191',
    user: 'team7vue',
    password:'team7team7',
    database:'Team7-Medical'
});
var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.set('view engine', 'ejs'); 


exports.register = function(req,res){
    // console.log("req",req.body);
    

    
      var username = req.body.username;
      var password = req.body.password;
      var name = req.body.name;
      
      var email = req.body.email;
      var phone = req.body.phone;
      var address = req.body.address;
      var sex = req.body.sex;
      var ICEname = req.body.ICEname;
      var number = req.body.number;

      
      
    
    var sql = "INSERT INTO `patient`(username,password,name,email,phone_number,adress,sex,person_ICE,phone_ICE) VALUES (?,?,?,?,?,?,?,?,?) ";
    connection.query(sql,[username,password,name,email,phone,address,sex,ICEname,number],function(error,results,fields){
      if(error){
        throw error;
        
      }
      else{
        res.send("register successfully");
        res.end();
      }
    });
  
  
  }

function getemployeeType(empID){
	var sql2 = "SELECT employee_Type FROM `Team7-medical`.`employee` WHERE employee_ID = ?";
	connection.query(sql2,[empID],function(error,results,fields){
		if(error) throw error;
		else{
			var type = results[0].employee_Type;
			return type;
		}
	});
}

exports.employeeauth = function(req, res) {
	var employeeID = req.body.employeeID;
	var username = req.body.username;
	var password = req.body.password;
	
	
	if (username && password) {
		var sql = "SELECT * FROM `Team7-medical`.`employee` WHERE Employee_ID = ? AND username = ? AND password = ?";
		var sql2 = "SELECT employee_Type FROM `Team7-medical`.`employee` WHERE employee_ID = ?";
		connection.query(sql , [employeeID, username, password], function(error, results, fields) {
			
			if(error) throw error;
			// else{
			// 	connection.query(sql2,[employeeID],function(error,results,fields){
			// 		res.redirect('/dhome');
			// 	})
			// }
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.employeeID = employeeID;
				req.session.employee_Type = results[0].employee_Type;
				if(results[0].employee_Type == "Doctor") res.redirect('/dhome');
				if(results[0].employee_Type == "Nurse") res.redirect('/nursehome');
				
					
					
			
				
			} 
			
				

			else {
		res.send('Incorrect Username and/or Password!');
		console.log(results);
			}			
			res.end(); 
		});
	} else {
    res.send('Please enter Username and Password!');
    

		res.end();
	}
	// connection.query(sql2,[employeeID],function(error,results,fields){
	// 	if(error) throw error;
	// 	else{
	// 		if(results[0].employee_Type == "Doctor") res.redirect('/dhome');
	// 	}
	// })	
}
exports.auth = function(req, res) {
	var username = req.body.username;
    var password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM `Team7-medical`.`patient` WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.patientID = results[0].patient_ID;
				console.log(results[0].patient_ID);
				res.redirect('/home');
			} else {
        res.send('Incorrect Username and/or Password!');
			}			
			res.end(); 
		});
	} else {
    res.send('Please enter Username and Password!');
    

		res.end();
	}
}
exports.dappointment = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT * FROM `team7-medical`.`apointment` WHERE doctor_ID = ? ';
	
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			res.render('employee_schedule',{userdata : results});
		}
		else{
			throw error;
		}
	});
}
exports.cancel = function(req,res){
	var id = req.body.id;
	var sql = "UPDATE `apointment` SET status = 1 WHERE apointment_ID = ?";
	
	connection.query(sql,id,function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/dappointment');
		}
	});
}

exports.employeeprescription = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT * FROM `team7-medical`.`prescription` WHERE perscribed_by_doctor_ID = ? ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('employee_prescriptions',{userdata : results, user_ID : id});
		}
		else{
			throw error;
		}
	});
}

exports.submitprescription = function(req,res){
	var id = req.session.employeeID;
	var patientID = req.body.patientID;
	var drugID = req.body.drugID;
	var sql = "INSERT INTO `prescription`(drug_ID,perscribed_by_doctor_ID,patient_ID) VALUES (?,?,?) ";
	connection.query(sql,[drugID,id,patientID],function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/employeeprescription');
		}
	});
}
exports.notes = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT * FROM `team7-medical`.`history/diagnosis` WHERE updated_By_Doctor_ID = ? ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('employee_summary',{userdata : results, user_ID : id});
		}
		else{
			throw error;
		}
	});

}			
exports.updatenotes = function(req,res){
	var today = new Date();
	var id = req.session.employeeID;
	var patientID = req.body.patientID;
	var location = req.body.location;
	var blood = req.body.blood;
	var weight = req.body.weight;
	var temp = req.body.temp;
	
	var pnote = req.body.pnote;
	var dnote = req.body.dnote;
	
	var sql = "INSERT INTO `history/diagnosis`(doctors_notes, patient_input, date, blood_pressure, weight_lb, temperature_F, patient_ID, updated_By_Doctor_ID, updated_In_Office) VALUES (?,?,?,?,?,?,?,?,?) ";
	connection.query(sql,[dnote,pnote,today,blood,weight,temp,patientID,id,location],function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/notes');
		}
	});
}	
	
exports.appointment = function(req,res){
	var id = req.session.patientID;
	var sql = 'SELECT * FROM `team7-medical`.`apointment` WHERE patient_ID = ? ';
	
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('patient_appointment',{userdata : results,user_ID:id});
		}
		else{
			throw error;
		}
		
	});
}
exports.scheduleappointment = function(req,res){
	var id = req.session.patientID;
	var day = req.body.day;
	var time = req.body.time;
	var location = req.body.location;
	var doctor = req.body.doctor;
	var notes = req.body.notes;
	var sql = "INSERT INTO `apointment`(Date, Time, apointment_reason, patient_ID, doctor_ID, office_ID) VALUES (?,?,?,?,?,?) ";
	var sql2 = "DELETE FROM `apointment` WHERE apointment_ID = ?";
	if(day != null){
		connection.query(sql,[day,time,notes,id,doctor,location],function(error,result,fields){
		if(error) throw error;
		else{
			res.redirect('/appointment');
		}
	})
	}
	else{
		
		var cancelappointment = req.body.cancelappointment;
		
		connection.query(sql2,[cancelappointment],function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/appointment');
		}
	});
	
}
}
exports.history = function(req,res){
	var id = req.session.patientID
	var sql = 'SELECT * FROM `team7-medical`.`history/diagnosis` WHERE patient_ID = ? ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('patient_history',{userdata : results, user_ID : id});
		}
		else{1
			throw error;
		}
	});

}			
exports.location = function(req,res){
	var id = req.session.patientID
	var sql = 'SELECT * FROM `team7-medical`.`office` ';
	connection.query(sql,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('locationandhours',{userdata : results, user_ID : id});
		}
		else{
			throw error;
		}
	});

}			
exports.patientprescription = function(req,res){
	var id = req.session.patientID;
	var sql = 'SELECT * FROM `team7-medical`.`prescription` WHERE patient_ID = ? ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('patient_prescription',{userdata : results, user_ID : id});
		}
		else{
			throw error;
		}
	});
}

exports.report1 = function(req,res){
	// console.log("***********************************************************************************");

	// console.log(req.session);
	// console.log("***********************************************************************************");
	// console.log(req.body);
	// console.log("***********************************************************************************");

	var id = req.session.employeeID;
	var patientID = req.body.patientID;
	var datefrom = req.body.datefrom.toString();
	var dateto = req.body.dateto.toString();
	// var datefrom ="2020-04-20"
	// var dateto ="2020-05-20"
	var option = req.body.option;
	console.log(option);
	var sql = "SELECT * FROM `team7-medical`.`apointment` WHERE apointment.Date >='"+datefrom+ "'AND apointment.Date <='"+dateto+"' AND patient_ID = ?";
	var sql2 = "SELECT * FROM `team7-medical`.`prescription` WHERE prescription.date_prescribed >='"+datefrom+ "'AND prescription.date_prescribed <='"+dateto+"' AND patient_ID = ?";
	if(option == "Appointment"){
	connection.query(sql,[patientID],function(error,results,fields){
		if(results.length > 0){
			
			res.render('report1', {userdata : results, user_ID : id});
				
			}
			else{
				console.log(datefrom);
				throw error;
			}
		});
	}

	if(option == "Prescription"){
		connection.query(sql2,[patientID],function(error,results,fields){
			if(results.length > 0){
				console.log(results);
				res.render('report2',{userdata : results, user_ID : id});
			}
			else{
				throw error;
			}
		});
	}
}



