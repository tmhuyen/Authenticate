const controller = {};
const User = require("../models").User;

controller.showIndex = (req, res) => {
  res.render("index");
};

controller.showProfile = (req, res) => {
  res.render("my-profile");
};

controller.showLogin = (req, res) => {
  let reqUrl = req.query.reqUrl ? req.query.reqUrl : "/";
  if (req.session.user) {
    return res.redirect(reqUrl);
  }
  res.render("auth-login", { 
    layout: "auth",
    reqUrl,
    username: req.signedCookies.username,
    password: req.signedCookies.password,
  });
};

controller.showRegister = (req, res) => {
  res.render("auth-register", { layout: "auth" });
};

controller.register = async (req, res) => {
  let { username, password, firstName, lastName, terms } = req.body;
  if (terms) {
    try {
      await User.create({
        username,
        password,
        firstName,
        lastName,
      });
      return res.render("auth-login", {
        layout: "auth",
        message: "Register successfully",
      });
    } catch (error) {
      console.error(error);
      return res.render("auth-register", {
        layout: "auth",
        message: "Can not register new account",
      });
    }
  }
  return res.render("auth-register", {
    layout: "auth",
    message: "You must agree to our privacy policy",
  });
};

controller.login = async (req, res) => {
  let { username, password, rememberMe} = req.body;
  let user = await User.findOne({ 
    attributes: ["id", "username", "firstName", "lastName", "imagePath", "isAdmin"],
    where: { username, password },
   });
   if (user) {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : "/";
    req.session.user = user;
    if (rememberMe) {
      res.cookie("username", username, {
        maxAge: 60*60*1000, 
        httpOnly: false, 
        signed: true});
      res.cookie("password", password, {
        maxAge: 60*60*1000, 
        httpOnly: true, 
        signed: true});
    }
    return res.redirect(reqUrl);
   }
   return res.render("auth-login", {  
    layout: "auth", 
    message: "Invalid Username or Password" 
  });
}

controller.logout = (req, res, next) => {
  req.session.destroy(function (error){
    if (error) return next(error);
    res.redirect("/login");
  });
};

//route middleware to ensure user is logged in
controller.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user; // make user info available to template
    return next();
  }
  res.redirect(`/login?reqUrl=${req.originalUrl}`);
};

controller.editUser = async (req, res) => {
  let { id, username, firstName, lastName, mobile, isAdmin } = req.body;
  try {
    await models.User.update(
      {
        firstName,
        lastName,
        mobile,
        
      },
      { where: { id } }
    );
    res.send("Edit user successfully!");
  } catch (error) {
    res.send("Can not edit user!");
    console.error(error);
  }
};
module.exports = controller;
