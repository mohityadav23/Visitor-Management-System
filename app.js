var express = require('express');
var server = express();
const https = require('https');
const ejs = require('ejs');
const gstore = require('gstore-node')();
const Datastore = require('@google-cloud/datastore');
const mimeTypes = require('mimetypes');
const fs = require('fs');
const projectId = 'fluted-protocol-222405';
var path = require("path");
const bodyParser = require("body-parser");
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
const SendOtp = require('sendotp');
const sendOtp = new SendOtp('233157AVexfWR25b7d86e9','Your verification code is {{otp}}');
var moment = require('moment');
const swal = require('sweetalert2');
var nodemailer = require('nodemailer');
var SMTP = require('nodemailer-smtp-transport');
const vision = require('@google-cloud/vision');
var templates = require('./routes/templates');


//Database
const datastore = new Datastore({
projectId: projectId,
});

gstore.connect(datastore);

//View engine setup

server.set ('views',path.join(__dirname,'views'));
server.set('view engine','ejs');
server.engine('html',require('ejs').renderFile);
//Set path for static assets
server.use(express.static(path.join(__dirname,'public')));

server.use('/', templates);

//1
var otp = Math.floor(1000 + Math.random()*9000);
server.post('/addname', (req, res) => {

  const user = {
      timestamp: new Date,
      FName: req.body.FName,
      LName: req.body.LName,
      Business: req.body.CName,
      Email: req.body.Email,
      Host: req.body.Host,
      Purpose: req.body.PofMeet,
      Phone: req.body.Phone,
      otp:otp,
      VID: req.body.nameSearch,
     
  }

  const Phone = req.body.Phone;
  const senderId = "VMTCPL";
  console.log(otp);

sendOtp.send(Phone,senderId,otp,function(error,data){
if(error){
throw(error)
}
console.log(data);
res.render('verificationStep.ejs',{alert: false,user:user});
});
});  

//2

server.get('/', function(req, res) {
  res.render('views/camera');
});

server.post('/otp', (req, res) => {

  const user = {
    timestamp: new Date,
    FName: req.body.FName,
    LName: req.body.LName,
    Business: req.body.CName,
    Email: req.body.Email,
    Host: req.body.Host,
    Purpose: req.body.PofMeet,
    Phone: req.body.Phone,
    otp: req.body.otp,
    VID: req.body.nameSearch,
  }


  const Phone = req.body.Phone;
  const otp1 = req.body.otp;  
  const otp = req.body.oup;

 sendOtp.verify(Phone,otp,function(error,data){

  if(data.type == 'success')res.render('camera.ejs',{user:user});
  if(data.type == 'error'){
    res.render('verificationStep.ejs', {alert: true,user:user})
  }
  });

});


//3

server.post('/adddata', (req, res) => {

  var userId = req.body.nameSearch;
  var Mobile = req.body.Phone;
  const user = [
    {
      name:'Date',
      value: new Date().toDateString(),
    },
    {
      name:'FName',
      value: req.body.FName,
    },
    {
      name:'LName',
      value: req.body.LName,
    },
    {
      name:'Business',
      value: req.body.CName,
    },
    {
      name:'Email',
      value: req.body.Email,
    },
    {
      name:'Host',
      value: req.body.Host,
    },
    {
      name:'Purpose',
      value: req.body.PofMeet,
    },
    {
      name:'Phone',
      value: req.body.Phone,
    },
    {
      name:'INtime',
      value: new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}),
    },
    {
      name:'OutTime',
      value: 'null',
    },
    {
      name:'VID',
      value: req.body.nameSearch,
    },
  
    {
      name:'snap',
      value: req.body.snap,
      excludeFromIndexes:true,
    },
];
 

  const user1 = {
    timestamp: new Date().toDateString(),
    FName: req.body.FName,
    LName: req.body.LName,
    Business: req.body.CName,
    Email: req.body.Email,
    Host: req.body.Host,
    Purpose: req.body.PofMeet,
    Phone: req.body.Phone,
    snap:req.body.snap,
    VID: req.body.nameSearch,
  }



datastore.save({
key: datastore.key(['VData', userId]),
data: user,
 
 }).then(() => {
//  res.send("Iteam Saved to Database");

  res.render('iCard.ejs',{user:user1});
  datastore.upsert({
    key: datastore.key(['RUser', Mobile]),
    data: user,
     })

  }).catch((err) => {
    console.log(err);

    res.status(400).send(err);
  });
  
});

server.post('/submit', (req, res,) => {
const UserId = req.body.idcard;
const Mkey = datastore.key(['VData', UserId])
var resultArry = [];
datastore.get(Mkey).then(results => {
const entity = results[0];
resultArry.push(entity);
var newData = JSON.stringify(resultArry);
const parsed = JSON.parse(newData); 
const User = parsed;
console.log(User);
const Date =User[0].Date;
const FName= User[0].FName;
const LName= User[0].LName;
const Business= User[0].Business;
const Email= User[0].Email;
const Host= User[0].Host;
const Purpose= User[0].Purpose;
const Phone= User[0].Phone;
const Intime= User[0].INtime;
const VID = User[0].VID;
const snap = User[0].snap;
//OutTime: new Date().toDateString();

res.render('logoff.ejs',{Date,FName,LName,Business,Email,Host,Purpose,Phone,Intime,VID,snap});
 

}).catch((err) => {
  console.log(err)  
  //var id = "InVaild ID-Card, Please Check the ID Card Number";
 res.render('logoff_num.ejs',{alert: true});
});
});


// logout from 
server.post('/updatedata', (req, res) => {

  var userId = req.body.nameSearch;
  var event = new Date

  const user = [
    {
      name:'Date',
      value: req.body.Date,
    },
    {
      name:'FName',
      value: req.body.FName,
    },
    {
      name:'LName',
      value: req.body.LName,
    },
    {
      name:'Business',
      value: req.body.CName,
    },
    {
      name:'Email',
      value: req.body.Email,
    },
    {
      name:'Host',
      value: req.body.Host,
    },
    {
      name:'Purpose',
      value: req.body.PofMeet,
    },
    {
      name:'Phone',
      value: req.body.Phone,
    },
    {
      name:'INtime',
      value: req.body.Intime,
    },
    {
      name:'OutTime',
      value: new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}),
    },
    {
      name:'VID',
      value: req.body.nameSearch,
    },
  
    {
      name:'snap',
      value: req.body.snap,
      excludeFromIndexes:true,
    },
];






datastore.upsert({
  key: datastore.key(['VData', userId]),
  data: user
 
   }).then(() => {
  //  res.send("Iteam Saved to Database");
    res.redirect("/index3.html");
  
    }).catch((err) => {
      console.log(err)
     // res.render('error.ejs',{user:"Kiran"});
    });
  
  });
  
// logout From Dashbord



server.post('/loggingoff', (req, res) => {

  var userId = req.body.nameSearch;
  var event = new Date

  const user = [
    {
      name:'Date',
      value: req.body.Date,
    },
    {
      name:'FName',
      value: req.body.FName,
    },
    {
      name:'LName',
      value: req.body.LName,
    },
    {
      name:'Business',
      value: req.body.CName,
    },
    {
      name:'Email',
      value: req.body.Email,
    },
    {
      name:'Host',
      value: req.body.Host,
    },
    {
      name:'Purpose',
      value: req.body.PofMeet,
    },
    {
      name:'Phone',
      value: req.body.Phone,
    },
    {
      name:'INtime',
      value: req.body.Intime,
    },
    {
      name:'OutTime',
      value: new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}),
    },
    {
      name:'VID',
      value: req.body.nameSearch,
    },
  
    {
      name:'snap',
      value: req.body.snap,
      excludeFromIndexes:true,
    },
];


datastore.upsert({
  key: datastore.key(['VData', userId]),
  data: user
 
   }).then(() => {
  //  res.send("Iteam Saved to Database");
    res.redirect("/index2.ejs");
  
    }).catch((err) => {
      console.log(err)
     // res.render('error.ejs',{user:"Kiran"});
    });
  
  });






//4
  server.get('/Home', (req, res) => {

// Get checkout pending users data
const query = datastore.createQuery('VData').filter('OutTime','=','null');
datastore.runQuery(query).then(results => {
const tasks = results[0];
var newData = JSON.stringify(tasks);
const parsed = JSON.parse(newData); 
const data = parsed;
const Tcount = parsed.length;
// Completed
// Get This week user table


//Week staus
var startofweeks = moment().startOf('isoweek').toDate();
var startofweek = startofweeks.toDateString();
console.log(startofweek);
const query1 = datastore.createQuery('VData').filter('Date','>=',startofweek);
datastore.runQuery(query1).then(results => {
  const tasks1 = results[0];
  var newData1 = JSON.stringify(tasks1);
  const parsed1 = JSON.parse(newData1); 
 console.log(parsed1);


const Tcountofweek = parsed1.length;

const nuInterview = parsed1.reduce(function(n,type){
  return n + (type.Purpose == 'Interview');
},0);

const nuMeeting = parsed1.reduce(function(n,type){
  return n + (type.Purpose == 'Meeting');
},0);

const nuDelivery = parsed1.reduce(function(n,type){
  return n + (type.Purpose == 'Delivery');
},0);

const nuTemporary = parsed1.reduce(function(n,type){
  return n + (type.Purpose == 'Temporary Employee');
},0);
const nuPersonal = parsed1.reduce(function(n,type){
  return n + (type.Purpose == 'Personal Visit');
},0);
// This Month

var startofmonths = moment().startOf('isomonth').toDate();
var startofmonth =startofmonths.toDateString();
console.log(startofmonth);
const query2 = datastore.createQuery('VData').filter('Date','>=',startofmonth);
datastore.runQuery(query2).then(results => {
  const tasks2 = results[0];
  var newData2 = JSON.stringify(tasks2);
  const parsed2 = JSON.parse(newData2); 
 console.log(parsed2);


const Tcountofmonth = parsed2.length;
console.log(Tcountofmonth);
const muInterview = parsed2.reduce(function(n,type){
  return n + (type.Purpose == 'Interview');
},0);

const muMeeting = parsed2.reduce(function(n,type){
  return n + (type.Purpose == 'Meeting');
},0);

const muDelivery = parsed2.reduce(function(n,type){
  return n + (type.Purpose == 'Delivery');
},0);

const muTemporary = parsed2.reduce(function(n,type){
  return n + (type.Purpose == 'Temporary Employee');
},0);
const muPersonal = parsed2.reduce(function(n,type){
  return n + (type.Purpose == 'Personal Visit');
},0);

//getting pre regsitered User Data

const query = datastore.createQuery('PData').filter('Intime','=','Null');
datastore.runQuery(query).then(results => {
const ptasks = results[0];
var pnewData = JSON.stringify(ptasks);
const pparsed = JSON.parse(pnewData); 
const Pdata = pparsed;
const pTcount = pparsed.length;
//get todays pre regsitered User Data

const Todaysdate = moment().format('DD/MM/YYYY');
const query = datastore.createQuery('PData').filter('MeetingDate','=',Todaysdate);
datastore.runQuery(query).then(results => {
const ptasks2 = results[0];
var pnewData2 = JSON.stringify(ptasks2);
const pparsed2 = JSON.parse(pnewData2); 
const PTdata = pparsed2;
const PTTcount = pparsed2.length;
console.log(Todaysdate)


console.log("Kiran Shetty")

res.render('index2.ejs',{data:data,Tcount,pdata:Pdata,PTTdata:PTdata,pTcount,PTTcount,nuMeeting,nuPersonal,nuTemporary,nuDelivery,nuInterview,Tcountofweek,muMeeting,muPersonal,muTemporary,muDelivery,muInterview,Tcountofmonth}); 
   
    });
  });
  });
  });
});
});

//calender


// Sending mail from a form using nodemailer

server.post('/sendemail', function(req, response) {

  const puser = {
    timestamp : new Date().toDateString(),
    FName : req.body.FName,
    LName : req.body.LName,
    Business : req.body.CName,
    Email : req.body.Email,
    Host : req.body.Host,
    HostEmail:req.body.hemail,
    Purpose : req.body.PofMeet,
    Phone : req.body.Phone,
    VID : req.body.nameSearch,
    MeetingDate : req.body.Date,
    Intime:'Null',
  }

  var timestamp = req.body.Date;
  var FName = req.body.FName;
  var LName = req.body.LName;
  var Business = req.body.CName;
  var Email = req.body.Email;
  var Host = req.body.Host;
  var Purpose = req.body.PofMeet;
  var Phone = req.body.Phone;
  var VID = req.body.nameSearch;
  var transporter = nodemailer.createTransport(SMTP({
    service:'gmail',
    //host: 'smtp.gmail.com',
    //port: 465,
    //secure: false,

    auth: {
      user: 'kiran.shetty@teamcomputers.com',
      pass:'iqywscggpfysmogf',
     // clientId: "383889636733-v65gj0f3qcefd3rrcog17f9b2rl5k5ni.apps.googleusercontent.com",
      //clientSecret: "jgDZJyg0frNI3HHQtmiVKVcF",
      //refreshToken: "1/ttwSPaHj6TqgKangbBdHomzQayhSsw3_xIA3XKiOQccLrYWFxcxKzaPAJhhQYYJs",
      //accessToken: 'ya29.GlslBhbHaNEmDAXXsx0p_kidWPa1GIePiRhFpE0LboKU-lV7dIWzKaivvNXdSqh3IAg4crPxNNZjYicUQk2gwOD3wVeRYwYgkBWs71hGwsyNoUlnfugy6l4PBrou',
    }

  
  }));

  

  var mailOptions = {
      from: 'TCPL-Visitor Management System<kiran.shetty@teamcomputers.com>',
      to: req.body.Email,
      subject: 'Your Pre-registered ID Card for TCPL Visit',
      html:'<body><p>Hello,</p><p>Please find the Pre-Registered ID Card</p><p>Keep the below id card  handy (opened in your phone/tablet) for a seamless check-in at the event </p><p>Event Date-'+timestamp+'</p><a href="https://goo.gl/maps/G8irdStRvuF2" target="_blank"><img src="https://www.freeiconspng.com/uploads/location-icon-png-14.png" style="width:50px; height:60px" title=" Team Computer Location" alt="Location"></a> <div style ="background-color: #000; width: 70px;margin: 0 auto;height: 15px;border-radius: 5px 5px 0 0;"></div><div style= "width: 225px;padding: 4px;margin: 0 auto;background-color: #1f1f1f;border-radius: 5px;position: relative;"><div style="background-color: #fff;padding: 10px;border-radius: 10px;text-align: center;box-shadow: 0 0 1.5px 0px #b9b9b9;"><div class="header"><img style ="width: 70px;margin-top: 2px;"src="https://www.teamcomputers.com/images/logo.png"></div><h2 style ="font-size: 15px;margin: 5px 0;">'+FName+' ' +LName+'</h2><h2 style ="font-size: 10px;margin: 5px 0;">From: '+Business+'</h2><h2 style ="font-size: 10px;margin: 5px 0;">Host : '+Host+'</h2><h2 style ="font-size: 10px;margin: 5px 0;">Mobile: '+Phone+'</h2><hr><h2 style ="font-size: 13px;margin: 5px 0;">ID Number: '+VID+'</h2><hr><p style="font-size: 7px;margin: 2px;"><strong>"TEAM COMPUTERS PVT.LTD"</strong><h3 style="font-size: 12px; margin: 2.5px 0;font-weight: 300;">www.teamcomputers.com</h3><p style="font-size: 7px;margin: 2px;">No.1, Mohammadpur, Bhikaji Cama Place New Delhi</p><p style="font-size: 5px;margin: 2px;">Ph: 1800 102 4200 | E-mail: customercare@teamcomputers.com</p><hr><h4 style="font-size:8px; font-weight: bold;margin: 2.5px 0;color: #0aaa0a;">Note : Please share ID card on check-in</h4><h4 style="font-size:9px; font-weight: bold;margin: 2.5px 0;color: #ee1414;">Vaild till:"'+timestamp+'"</h4></body>',
    }

 // transporter.on('log', console.log);
  transporter.sendMail(mailOptions, function(err, res) {
      if (err) {
          console.log(err);
      } else {
        const userId = req.body.nameSearch;
        datastore.save({
          key: datastore.key(['PData', userId]),
          data: puser,
           
           })
          response.render('prere-conf.ejs',{alert: true});
      }
      //transporter.close();
  });
});


// already registered visitor lookup 
server.get('/Ruser', function(req, res) {
  res.render('existingvisitor',{alert: false});
});

server.post('/rsubmit', (req, res,) => {
  const UserId = req.body.rPhone;
  console.log(UserId)
  const Mkey = datastore.key(['RUser', UserId])
  var resultArry = [];
  datastore.get(Mkey).then(results => {
  const entity = results[0];
  resultArry.push(entity);
  var newData = JSON.stringify(resultArry);
  const parsed = JSON.parse(newData); 
  const User = parsed;
  const Date =User[0].Date;
  const FName= User[0].FName;
  const LName= User[0].LName;
  const Business= User[0].Business;
  const Email= User[0].Email;
  const Host= User[0].Host;
  const Purpose= User[0].Purpose;
  const Phone= User[0].Phone;
  const snap = User[0].snap;
  //OutTime: new Date().toDateString();
  
  res.render('existingvisitordata.ejs',{Date,FName,LName,Business,Email,Host,Purpose,Phone,snap});
   
  }).catch((err) => {
    console.log(err)  
    //var id = "InVaild ID-Card, Please Check the ID Card Number";
   res.render('existingvisitor.ejs',{alert: true});
  });
});



server.post('/addname2', (req, res) => {

  const user = {
      timestamp: new Date,
      FName: req.body.FName,
      LName: req.body.LName,
      Business: req.body.CName,
      Email: req.body.Email,
      Host: req.body.Host,
      Purpose: req.body.PofMeet,
      Phone: req.body.Phone,
      otp:otp,
      VID: req.body.nameSearch,
      snap:req.body.snap,
  }

  const Phone = req.body.Phone;
  const senderId = "VMTCPL";

sendOtp.send(Phone,senderId,otp,function(error,data){
if(error){
throw(error)
}
console.log(data);
res.render('verfication2.ejs',{alert: false,user:user});
});
});  



//verfiy OTP Of Registered users
server.post('/otp2', (req, res) => {

  const user = {
    timestamp: new Date,
    FName: req.body.FName,
    LName: req.body.LName,
    Business: req.body.CName,
    Email: req.body.Email,
    Host: req.body.Host,
    Purpose: req.body.PofMeet,
    Phone: req.body.Phone,
    otp: req.body.otp,
    VID: req.body.nameSearch,
    snap:req.body.snap
  }
 
  var userId = req.body.nameSearch;
  var Mobile = req.body.Phone;
  const user1 = [
    {
      name:'Date',
      value: new Date().toDateString(),
    },
    {
      name:'FName',
      value: req.body.FName,
    },
    {
      name:'LName',
      value: req.body.LName,
    },
    {
      name:'Business',
      value: req.body.CName,
    },
    {
      name:'Email',
      value: req.body.Email,
    },
    {
      name:'Host',
      value: req.body.Host,
    },
    {
      name:'Purpose',
      value: req.body.PofMeet,
    },
    {
      name:'Phone',
      value: req.body.Phone,
    },
    {
      name:'INtime',
      value: new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}),
    },
    {
      name:'OutTime',
      value: 'null',
    },
    {
      name:'VID',
      value: req.body.nameSearch,
    },
  
    {
      name:'snap',
      value: req.body.snap,
      excludeFromIndexes:true,
    },
];



  const Phone = req.body.Phone;
  const otp1 = req.body.otp;  
  const otp = req.body.oup;

 sendOtp.verify(Phone,otp,function(error,data){

  if(data.type == 'success'){
    datastore.save({
      key: datastore.key(['VData', userId]),
      data: user1,
       
       }).then(() => {
      //  res.send("Iteam Saved to Database");
      
      res.render('iCard2.ejs',{user:user});
        datastore.upsert({
          key: datastore.key(['RUser', Mobile]),
          data: user1,
           })
      
        }).catch((err) => {
          console.log(err);
      
          res.status(400).send(err);
        });


  }
 
  if(data.type == 'error'){
    res.render('verfication2.ejs', {alert: true,user:user})
  }
  });

});


//Pre Registered User Singin and save in database

server.post('/adddatato', (req, res) => {

  var userId = req.body.nameSearch;
  var Mobile = req.body.Phone;
  var timestamp = req.body.Date;
  var FName = req.body.FName;
  var LName = req.body.LName;
  var Business = req.body.CName;
  var Email = req.body.Email;
  var Host = req.body.Host;
  var Purpose = req.body.PofMeet;
  var Phone = req.body.Phone;
  var VID = req.body.nameSearch;
  var emailu = req.body.hemail;



  const user = [
    {
      name:'Date',
      value: new Date().toDateString(),
    },
    {
      name:'FName',
      value: req.body.FName,
    },
    {
      name:'LName',
      value: req.body.LName,
    },
    {
      name:'Business',
      value: req.body.CName,
    },
    {
      name:'Email',
      value: req.body.Email,
    },
    {
      name:'Host',
      value: req.body.Host,
    },
    {
      name:'Purpose',
      value: req.body.PofMeet,
    },
    {
      name:'Phone',
      value: req.body.Phone,
    },
    {
      name:'INtime',
      value: new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}),
    },
    {
      name:'OutTime',
      value: 'null',
    },
    {
      name:'VID',
      value: req.body.nameSearch,
    },
  
    {
      name:'snap',
      value: "https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_960_720.png",
      excludeFromIndexes:true,
    },
];
 

  const user1 = {
    timestamp: new Date().toDateString(),
    FName: req.body.FName,
    LName: req.body.LName,
    Business: req.body.CName,
    Email: req.body.Email,
    Host: req.body.Host,
    Purpose: req.body.PofMeet,
    Phone: req.body.Phone,
    snap:req.body.snap,
    VID: req.body.nameSearch,
  }

  const puser = {
    timestamp : req.body.timestamp,
    FName : req.body.FName,
    LName : req.body.LName,
    Business : req.body.CName,
    Email : req.body.Email,
    Host : req.body.Host,
    HostEmail:req.body.hemail,
    Purpose : req.body.PofMeet,
    Phone : req.body.Phone,
    VID : req.body.nameSearch,
    MeetingDate : req.body.Date,
    Intime:new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}),
  }





datastore.save({
key: datastore.key(['VData', userId]),
data: user,
 
 }).then(() => {
//  res.send("Iteam Saved to Database");

  
  datastore.upsert({
    key: datastore.key(['RUser', Mobile]),
    data: user,
     })
     var transporter = nodemailer.createTransport(SMTP({
       service:'gmail',
       auth: {
         user: 'kiran.shetty@teamcomputers.com',
         pass:'iqywscggpfysmogf',
       }     
     }));
     var mailOptions = {
         from: 'TCPL-Visitor Management System<kiran.shetty@teamcomputers.com>',
         to: req.body.hemail,
         subject: 'Host Notification..visitor is arrived.!',
         html:'<h4>Dear '+Host+'</h4><p>'+FName+' '+LName+' from '+Business+' is checkin and waiting for you at reception</p><p>You can reach him on Mobile: '+Phone+'</p><p></p><p>Regadrs,</p><h4>Visitor Management </h4>',
     }
    // transporter.on('log', console.log);
     transporter.sendMail(mailOptions)
            // response.render('prere-conf.ejs',{alert: true});
  
const userId = req.body.nameSearch;
        datastore.upsert({
        key: datastore.key(['PData', userId]),
        data: puser,
        })
res.render('iCard.ejs',{user:user1});            
  }).catch((err) => {
    console.log(err);
    res.status(400).send(err);
  });  
});







var port = 8080;
server.listen(port, function() {
console.log('server listening on port ' + port);
})