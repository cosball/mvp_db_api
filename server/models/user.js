'use strict';
var generator = require('generate-password');
var g = require('loopback/lib/globalize');  
var EXPIRY_DAYS = 2 * 24 * 60 * 60 * 1000;

var config = require('../../server/config.json');
var path = require('path');
var app = require('../../server/server');
var senderAddress = 'productsupport@thevaultlab.com';
module.exports = function(User) {

  User.disableRemoteMethodByName('patchOrCreate')
  User.disableRemoteMethodByName('replaceOrCreate')
  User.disableRemoteMethodByName('upsertWithWhere')
  User.disableRemoteMethodByName('updateAll')
  User.disableRemoteMethodByName('createChangeStream')
  //User.disableRemoteMethodByName('prototype.updateAttributes')
  User.disableRemoteMethodByName('prototype.__create__accessTokens');     
  User.disableRemoteMethodByName('prototype.__delete__accessTokens');     
  User.disableRemoteMethodByName('prototype.__findById__accessTokens');   
  User.disableRemoteMethodByName('prototype.__updateById__accessTokens'); 
  User.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  User.disableRemoteMethodByName('prototype.__findById__transLogs');   
  User.disableRemoteMethodByName('prototype.__updateById__transLogs'); 
  User.disableRemoteMethodByName('prototype.__destroyById__transLogs');  
  User.disableRemoteMethodByName('prototype.__findById__blacklists');   
  User.disableRemoteMethodByName('prototype.__updateById__blacklists'); 
  User.disableRemoteMethodByName('prototype.__destroyById__blacklists');    
  
  //send password reset link when requested
  User.on('resetPasswordRequest', function(info) {
    
    var link = config.webhost + '/#/reset-password-page'+'?access_token='+info.accessToken.id;
    var html = '<br>Hi '+info.user.firstname+' '+info.user.lastname+
        ",<br><br>Thanks for your email. We've received your password reset request.<br>To continue, click on the link below to reset your password.<br><br>"+'<a href="' + link + '">'+link+'</a>' 
    //var html = 'Click <a href="' + link + '">'+link+'</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: senderAddress,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });

    var translog = {
        transactionType: "ForgotPassword",
        createdAt: new Date(),
        creator: info.user.username,
        result: "SUCCESS",
        userId: info.user.id,
        forgotPasswd: {user_name: info.user.username},
        description: "User " + info.user.username + " forgots his/her password."
    }

    var Translog = app.models.transLog;
    Translog.create(translog, function(err, added) {
      console.log(err); console.log(added)          
    }); 

  });
    
  User.afterRemote('setPassword', async function(ctx) {
      User.findById(ctx.args.id,
        function(err, user) {
          var translog = {
              transactionType: "ResetPassword",
              createdAt: new Date(),
              creator: user.username,
              result: "SUCCESS",
              userId: user.id,
              resetPasswd: {user_name: user.username},
              description: "User " + user.username + " resets his/her password."
            }

          var Translog = app.models.transLog;
          Translog.create(translog, function(err, added) {
            console.log(err); console.log(added)          
          } 
          );
      });
  });

  User.afterRemote("changePassword", async function(context) {
    User.findById(context.args.id,
      function(err, user) {
        var options = {}
        user.patchAttributes(
          {firstSignIn: false}, 
          options, (err, updated) => {console.log(err); console.log(updated)});

        var translog = {
            transactionType: "ChangePassword",
            createdAt: new Date(),
            creator: user.username,
            result: "SUCCESS",
            userId: user.id,
            changePasswd: {user_name: user.username},
            description: "User " + user.username + " changes his/her password."
        }

        var Translog = app.models.transLog;
        Translog.create(translog, function(err, added) {
          console.log(err); console.log(added)          
        }); 
    });

    return;
  });

  User.validatePassword = function(plain) {
    var err;
    let MAX_PASSWORD_LENGTH = 40;
    let MIN_PASSWORD_LENGTH = 12;
    if (!plain || typeof plain !== 'string') {
      err = new Error(g.f('Invalid password.'));
      err.code = 'INVALID_PASSWORD';
      err.statusCode = 422;
      throw err;
    }

    // Bcrypt only supports up to 72 bytes; the rest is silently dropped.
    var len = Buffer.byteLength(plain, 'utf8');
    if (len > MAX_PASSWORD_LENGTH) {
      err = new Error(g.f('The password entered was too long. Max length is %d (entered %d)',
        MAX_PASSWORD_LENGTH, len));
      err.code = 'PASSWORD_TOO_LONG';
      err.statusCode = 422;
      throw err;
    }

    var len = Buffer.byteLength(plain, 'utf8');
    if (len < MIN_PASSWORD_LENGTH) {
      err = new Error(g.f('The password entered was too short. Min length is %d (entered %d)',
        MIN_PASSWORD_LENGTH, len));
      err.code = 'PASSWORD_TOO_SHORT';
      err.statusCode = 422;
      throw err;
    }

    var lowplain = plain.toLowerCase();
    if (lowplain.indexOf("password") != -1) {
      err = new Error(g.f('The password entered has the word password on it'));
      err.code = 'PASSWORD_HAS_PASSWORD';
      err.statusCode = 422;
      throw err;      
    }
  };

  //render UI page after password reset
  /*User.afterRemote('setPassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password r
    });eset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });*/

  User.afterRemote('login', async function(context) {
    User.findById(context.result.userId,
      function(err, user) {
        var lastSignIn = user.currentSignIn;
        var currentSignIn = new Date();
        var tempPassExpired = user.tempPassExpired;
        var options = {}
        if (!user.tempPassExpired) {
          var nowtime = new Date();
          if (user.tempPassExpiry < nowtime) {
            tempPassExpired = true;
          }
        }

        user.patchAttributes(
          {lastSignIn: lastSignIn, currentSignIn: currentSignIn, tempPassExpired: tempPassExpired}, 
          options, (err, updated) => {console.log(err); console.log(updated)});

        var translog = {
            transactionType: "Login",
            createdAt: new Date(),
            creator: user.username,
            result: "SUCCESS",
            userId: user.id,
            loginSignUp: {user_name: user.username},
            description: "User " + user.username + " logs in."
          }
        var Translog = app.models.transLog;
        Translog.create(translog, function(err, added) {
          console.log(err); console.log(added)          
        } 
        );
    });
    return;
  });


  User.afterRemote('logout', async function(context) {
    User.findById(context.req.accessToken.userId,
      function(err, user) {
        var translog = {
            transactionType: "Logout",
            createdAt: new Date(),
            creator: user.username,
            result: "SUCCESS",
            userId: user.id,
            logout: {user_name: user.username},
            description: "User " + user.username + " logouts."
          }

        var Translog = app.models.transLog;
        Translog.create(translog, function(err, added) {
          console.log(err); console.log(added)          
        } 
        );
    });
    return;
  });


  User.beforeRemote( 'create', function( ctx, modelInstance, next) {
      if (ctx.args.data.password == undefined) {
        ctx.args.data.password = generator.generate({
          length: 13,
          numbers: true
        });
        ctx.args.data.tempPassExpiry = new Date(Date.now()+EXPIRY_DAYS);
        ctx.args.data.tempPassExpired = false;
        ctx.args.data.emailVerified = true;
      }
      else {
        ctx.args.data.firstSignIn = false;
      }
      ctx.args.data.createdAt = new Date();
      next();
  });

  User.afterRemote('create', async function(ctx) {
    var translog = {
        transactionType: "AddUser",
        createdAt: new Date(),
        creator: ctx.args.data.creator,
        result: "SUCCESS",
        userId: ctx.result.id,
        addUser: {user_name: ctx.args.data.username},
        description: "User " + ctx.args.data.creator + " creates user " + ctx.args.data.username + "." 
      }
    var Translog = app.models.transLog;
    Translog.create(translog, function(err, added) {
      console.log(err); console.log(added)          
    }); 

    //var link = 'http://' + ctx.req.headers.host + '/#/landing';
//    var link = config.webhost + '/#/landing';
//    var html = '<br><img src="cid:vault" alt="Vault">'+
//        '<br><h2>Welcome to the NEMVault Beta!</h2>'+
//        'Hi '+ctx.args.data.firstname+', thank you for signing up for access to the NEMVault Beta.'+
//        "<br><br>Your account has been created and you can now login with the following credentials:"+
//        "<br><br>Username : "+ctx.args.data.email+
//        "<br>Temporary password : " + ctx.args.data.password+
//        "<br><br>This temporary password is valid only for 48 hours."+
//        "<br>Please note that you will be prompted to set a new password upon logging in for the first time."+
//        '<br><br><a href="' + link + '">'+'<img src="cid:login" alt="Vault Login">'+'</a>'+
//        "<br><br>We hope you enjoy your experience with the beta and please let us know how we can further improve it "+
//        '<a href="' + 'http://bit.ly/nvbfeedback' + '">'+'here'+'</a>'+
//        "<br><br>Regards,<br>The Vault Team."
//    console.log(ctx.args.data.password)
//    console.log(html)
//    User.app.models.Email.send({
//      to: ctx.args.data.email,
//      from: senderAddress,
//      subject: 'New Account',
//      html: html,
//      attachments: [
//          {
//           filename: 'B8DC0B75423E46A2B3728E462FE47275.png',
//           path: __dirname +'/img/B8DC0B75423E46A2B3728E462FE47275.png',
//           cid: 'vault'  
//          },
//          {
//           filename: '368A520F1DFD42C7AA8A4073FAAA2B6B.png',
//           path: __dirname +'/img/368A520F1DFD42C7AA8A4073FAAA2B6B.png',
//           cid: 'login'  
//          }
//      ]      
//    }, function(err) {
//      if (err) {console.log(err);console.log('> error sending new account email', ctx.args.data.email);return};
//      console.log('> sending new account email to:', ctx.args.data.email);
//    });     
     return;
  });


  User.beforeRemote('prototype.patchAttributes', function( ctx, modelInstance, next) {
      ctx.args.data.updatedAt = new Date();
      next();
  });

  User.afterRemote('prototype.patchAttributes', async function(ctx) {
      var translog = {
          transactionType: "EditUser",
          createdAt: new Date(),
          creator: ctx.args.data.updatedBy,
          result: "SUCCESS",
          userId: ctx.result.id,
          editUser: {user_name: ctx.result.username},
          description: "User " + ctx.args.data.updatedBy + " edits user " + ctx.result.username + "."
      }
      var Translog = app.models.transLog;
      Translog.create(translog, function(err, added) {
        console.log(err); console.log(added)          
      }); 
  });

  User.signup = function(userId, signup, cb) {

    User.findById(userId, undefined, (err, user) => {
      if (err) return cb(err);

      if (!user) {
        const err = new Error(`User ${userId} not found`);
        Object.assign(err, {
          code: 'USER_NOT_FOUND',
          statusCode: 401,
        });
        return cb(err);
      }

      var translog = {
          transactionType: "Signup",
          createdAt: new Date(),
          creator: user.username,
          result: "SUCCESS",
          userId: userId,
          signup: signup,
          description: signup.email + " signs up."
      }
      var Translog = app.models.transLog;
      Translog.create(translog, function(err, added) {
        if (err) {
          return cb(err)
        } else {
          console.log(added)
          cb(null,null)
        }  
      });
    }); 
  }

  User.remoteMethod(
      'signup',
      {
        description: 'Process user signup',
        accepts: [
          {arg: 'id', type: 'any', http: getUserIdFromRequestContext},
          {arg: 'signup', type: 'object', required: true, http: {source: 'body'}}
        ],
        http: {verb: 'post', path: '/signup'}
      }
    );

  User.contactus = function(userId, contactus, cb) {

    User.findById(userId, undefined, (err, user) => {
      if (err) return cb(err);

      if (!user) {
        const err = new Error(`User ${userId} not found`);
        Object.assign(err, {
          code: 'USER_NOT_FOUND',
          statusCode: 401,
        });
        return cb(err);
      }

      var translog = {
          transactionType: "ContactUs",
          createdAt: new Date(),
          creator: user.username,
          result: "SUCCESS",
          userId: userId,
          contactus: contactus,
          description: contactus.email + " contacted us."
      }

      var Translog = app.models.transLog;
      Translog.create(translog, function(err, added) {
        if (err) {
          return cb(err)
        } else {
          console.log(added)
        
          var attachment_msg = '';
          var html = '';
          var toEmail = '';

          if (contactus.attachment) {
            attachment_msg = '<br><br>with file attachment on the this link '+'<a href="' + contactus.attachment + '">'+contactus.attachment+'</a>'
          }
          console.log('attach = ', attachment_msg);

          if (contactus.category == 'inquiry') {
            html = '<br><br>Hi Admin,'+
                       '<br><br>New inquiry received from '+ contactus.fullname + ' (' + contactus.email + ') with the following message:'+
                       '<br><br>'+contactus.message+
                       attachment_msg+
                       '<br><br>Best regards,<br>The Vault Team.'
            toEmail = 'inquiry@thevaultlab.com'
          } else {

            html = '<br><br>Hi Support'+
                       '<br><br>New support request received from '+ contactus.fullname + ' (' + contactus.email + ') with the following message:'+
                       '<br><br>'+contactus.message+
                       attachment_msg+
                       '<br><br>Best regards,<br>The Vault Team.'
            toEmail = 'support@thevaultlab.com'
          }

          console.log(html)
          User.app.models.Email.send({
            to: toEmail,
            from: senderAddress,
            subject: 'Contact Us',
            html: html
          }, function(err) {
            if (err) {console.log(err);console.log('> error sending new account email', toEmail);return};
            console.log('> sending new account email to:', toEmail);
            cb(null,null)
          });     
        }  
      });            
    });
  }

  User.remoteMethod(
      'contactus',
      {
        description: 'Process contact us request',
        accepts: [
          {arg: 'id', type: 'any', http: getUserIdFromRequestContext},
          {arg: 'contactus', type: 'object', required: true, http: {source: 'body'}}
        ],
        http: {verb: 'POST', path: '/contactus'}
      }
  );

  function getUserIdFromRequestContext(ctx) {
      const token = ctx.req.accessToken;
      if (!token) return;

      const hasPrincipalType = 'principalType' in token;
      if (hasPrincipalType && token.principalType !== User.modelName) {
        // We have multiple user models related to the same access token model
        // and the token used to authorize reset-password request was created
        // for a different user model.
        const err = new Error(g.f('Access Denied'));
        err.statusCode = 403;
        throw err;
      }

      return token.userId;
  }

  User.afterRemoteError('logout', async function(context) {
    if (context.error.message == "accessToken is required to logout")
        context.error.message = "Invalid session. Please login again."
    return;
  });
};
