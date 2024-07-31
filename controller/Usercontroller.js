const User = require("../models/Usermodel");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profilemodel");
const Transaction = require("../models/Transactiondetailmodel");
const Referal = require("../models/referalmodel");
const nodemailer = require("nodemailer");
const { generateOTP } = require("../helper/utility");
const Web3 = require("web3");
const axios = require("axios");
const InApptoken = require("../models/Inapptokenmodel");
const CloseApptiming = require("../models/closeapptimimgmodal");
const Inapptokenmodel = require("../models/Inapptokenmodel");
// const { RateLimiterMemory } = require("rate-limiter-flexible");
// const limiter = new RateLimiterMemory({
//     points: 10, // Number of points (requests) allowed
//     duration: 60, // Time window in seconds
// });
const Referal_usedcode = require("../models/referalcodeusedmodel");
const handlebars = require("handlebars");
const fs = require("fs");

(exports.register = async (req, res) => {
  try {
    const { email, password, referalcode, social_login } = req.body;
    const emailverify = await User.findOne({ email: email });
    // console.log(emailverify.verify,"hjkjhj");

    if (social_login == false) {
      if (!emailverify || emailverify.verify == 0) {
        const Email = await User.findOne({ email: email });
        if (Email) {
          res.send({ Success: false, Message: "email already registered" });
        } else {
          if (referalcode) {
            const data = await Referal.findOne({ referalcode: referalcode });
            if (data) {
              const transporter = nodemailer.createTransport({
                host: "smtp.titan.email",
                port: 587, // Use the appropriate port for your email provider
                secure: false, // true for 465, false for other ports
                auth: {
                  user: "hello@spaceofmining.com",
                  pass: "'n#%$O/wFFV%!%$",
                },
              });
              const emailTemplateSource = fs.readFileSync(
                "space-mail-template.hbs",
                "utf8"
              );
              const emailTemplate = handlebars.compile(emailTemplateSource);
              const templateData = {
                link: `http://3.68.231.50:3007/api/emailverifiaction/${email}/${referalcode}/${password}`,
              };
              const renderedTemplate = emailTemplate(templateData);

              // Define email data
              const mailOptions = {
                from: "hello@spaceofmining.com",
                to: email,
                subject: "To Verifiy Email",
                html: renderedTemplate,
              };

              // Send the email
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log("Error: " + error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
              res.send({
                Success: true,
                Message: "email verification link sent to your email",
              });
            } else {
              res.send({
                Success: false,
                Message: "referal code is not exist",
              });
            }
          } else {
            res.send({ Success: false, Message: "Referal code is Mandatory" });
          }
        }
      } else if (emailverify.verify == 1) {
        if (referalcode) {
          const data = await Referal.findOne({ referalcode: referalcode });
          if (data) {
            //    const data = await User.findOne({username:username})
            const Email = await User.findOne({ email: email });
            if (Email) {
              res.send({ Success: false, Message: "email already registered" });
            } else {
              const data = User({
                // username:username,
                email: email,
                password: password,
                referalcode: referalcode,
              });
              const result = await data.save();
              if (result) {
                // const dat = await InApptoken({
                //     userId: result._id,
                //     Inapptokens: 10
                // })
                // const resu = await dat.save()
                if (result) {
                  const token = await Referal.findOne({
                    referalcode: referalcode,
                  });
                  if (token) {
                    const profile = await Profile.findOne({
                      userId: token.userId,
                    });
                    const profiletoken = await Profile.findOneAndUpdate(
                      { userId: token.userId },
                      {
                        $set: {
                          Inapptokens: 100 + profile.Inapptokens,
                        },
                      },
                      { new: true }
                    );
                    console.log(profiletoken);
                    const find = await Referal_usedcode.findOne({
                      referalcode: referalcode,
                    });
                    if (find) {
                      const array = find.referedusers;
                      array.push({ userId: result._id });
                      const usedreferal =
                        await Referal_usedcode.findOneAndUpdate(
                          { referalcode: referalcode },
                          {
                            $set: {
                              referedusers: array,
                            },
                          },
                          { new: true }
                        );
                      // if (usedreferal) {
                      res.send({
                        Success: true,
                        Message: "User registered with referal code",
                      });
                    } else {
                      console.log(result._id, "id");
                      const add = new Referal_usedcode({
                        userId: token.userId,
                        referalcode: referalcode,
                        referedusers: {
                          userId: result._id,
                        },
                      });
                      const value = await add.save();
                      res.send({
                        Success: true,
                        Message: "User registered with referal code",
                      });
                    }
                  } else {
                    res.send({
                      Success: true,
                      Message: "profile is not created",
                    });
                  }
                }
              }
              // res.send({Success:true,Message:"User registered"})
            }
          } else {
            res.send({ Success: false, Message: "referal code is not exist" });
          }
        } else {
          res.send({ Success: false, Message: "Referal code is Mandatory" });
        }
      }
    } else if (social_login == true) {
      if (referalcode) {
        const data = await Referal.findOne({ referalcode: referalcode });
        if (data) {
          console.log(
            referalcode,
            "referalcode data...................................................................................."
          );
          //    const data = await User.findOne({username:username})
          const Email = await User.findOne({ email: email });
          if (Email) {
            res.send({ Success: false, Message: "email already registered" });
          } else {
            const data = User({
              // username:username,
              email: email,
              // password:password,
              referalcode: referalcode,
              social_login: true,
            });
            const result = await data.save();
            if (result) {
              // const dat = await InApptoken({
              //     userId: result._id,
              //     Inapptokens: 10
              // })
              // const resu = await dat.save()
              if (result) {
                const token = await Referal.findOne({
                  referalcode: referalcode,
                });
                if (token) {
                  const profile = await Profile.findOne({
                    userId: token.userId,
                  });
                  const profiletoken = await Profile.findOneAndUpdate(
                    { userId: token.userId },
                    {
                      $set: {
                        Inapptokens: 100 + profile.Inapptokens,
                      },
                    },
                    { new: true }
                  );
                  console.log(profiletoken);
                  if (profile) {
                    const find = await Referal_usedcode.findOne({
                      referalcode: referalcode,
                    });
                    console.log(
                      find,
                      "used referal........................................................"
                    );
                    if (find) {
                      const array = find.referedusers;
                      array.push({ userId: result._id });
                      const usedreferal =
                        await Referal_usedcode.findOneAndUpdate(
                          { referalcode: referalcode },
                          {
                            $set: {
                              referedusers: array,
                            },
                          },
                          { new: true }
                        );
                      // if (usedreferal) {
                      console.log(usedreferal);
                      res.send({
                        Success: true,
                        Message: "User registered with referal code",
                      });
                    } else {
                      console.log(result._id, "id");
                      const add = await Referal_usedcode({
                        userId: token.userId,
                        referalcode: referalcode,
                        referedusers: {
                          userId: result._id,
                        },
                      });
                      const value = await add.save();
                      console.log(
                        value,
                        "usedreferal save data............................................................................"
                      );
                      res.send({
                        Success: true,
                        Message: "User registered with referal code",
                      });
                    }
                    // res.send({Success:true,Message:"User registered with referal code"})
                  } else {
                    res.send({
                      Success: true,
                      Message: "profile is not created",
                    });
                  }
                }
              }
            }
            // res.send({Success:true,Message:"User registered"})
          }
        } else {
          res.send({ Success: false, Message: "referal code is not exist" });
        }
      } else {
        // const data = await User.findOne({username:username})
        const Email = await User.findOne({ email: email });
        if (Email) {
          res.send({ Success: false, Message: "email already registered" });
        } else {
          const data = User({
            email: email,
            social_login: true,
            // password:password,
            // referalcode:referalcode
          });
          const result = await data.save();
          res.send({
            Success: true,
            Message: "User registered without referal code",
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
}),
  (exports.Login = async (req, res) => {
    try {
      const { email, password, referalcode, social_login } = req.body;
      if (social_login == false) {
        const data = await User.findOne({ email: email });
        if (data) {
          if (password == data.password) {
            const token = await jwt.sign({ _id: data._id }, "this is my", {
              expiresIn: "1d",
            });
            if (token) {
              const refreshtoken = await User.findOneAndUpdate(
                { email: email },
                {
                  $set: {
                    accesstoken: token,
                  },
                },
                { new: true }
              );
              console.log(refreshtoken);
              res.send({
                Success: true,
                Message: "user login",
                Accesstoken: token,
              });
            }
            // res.send({Success:true,Message:"user login",Accesstoken:token})
          } else {
            res.send({ Success: false, Message: "Password not matched" });
          }
        } else {
          res.send({ Success: false, Message: "Invalid Email" });
        }
      } else if (social_login == true) {
        const data = await User.findOne({ email: email });
        if (data) {
          const token = await jwt.sign({ _id: data._id }, "this is my", {
            expiresIn: "1d",
          });
          if (token) {
            const refreshtoken = await User.findOneAndUpdate(
              { email: email },
              {
                $set: {
                  accesstoken: token,
                },
              },
              { new: true }
            );
            console.log(refreshtoken);
            res.send({
              Success: true,
              Message: "user login with social login",
              Accesstoken: token,
            });
          }
          // res.send({Success:true,Message:"user login with social login",Accesstoken:token})
          // if(password==data.password){
          //     const token = await jwt.sign({ _id: data._id }, "this is my", { expiresIn: '1d' });
          //     res.send({Success:true,Message:"user login",Accesstoken:token})
          // }else{
          //     res.send({Success:false,Message:"Password not matched"})
          // }
        } else {
          res.send({ Success: false, Message: "register is compulsory" });
        }
        //    if(referalcode){
        //     const login = await User.findOne({email:email})
        //     if(login){
        //         const token = await jwt.sign({ _id: login._id }, "this is my", { expiresIn: '1d' });
        //         res.send({Success:true,Message:"user login and you are already used a referal",Accesstoken:token})
        //     }else{
        //     const data = await Referal.findOne({referalcode:referalcode})
        //     if(data){
        //         const register =  User({
        //             // username:username,
        //             email:email,
        //             referalcode:referalcode
        //         })
        //         const result = await register.save()
        //         if(result){
        //             const dat = await InApptoken({
        //                 userId:result._id,
        //                 Inapptokens:1
        //             })
        //             const resu = await dat.save()
        //             if(resu){
        //                 const token = await Referal.findOne({referalcode:referalcode})
        //                 if(token){
        //                     const profile = await Profile.findOne({userId:token.userId})
        //                     const profiletoken = await Profile.findOneAndUpdate({userId:token.userId},{$set:{
        //                         Inapptokens:1+(profile.Inapptokens)
        //                     }},{new:true})
        //                     console.log(profiletoken);
        //                     res.send({Success:true,Message:"User login with referal code"})
        //                 }else{
        //                     res.send({Success:true,Message:"profile is not created"})
        //                 }
        //             }
        //         }
        //     }else{
        //         res.send({Success:false,Message:"Referal code not exist"})
        //     }
        // }
        //    }else{
        //     const data = await User.findOne({email:email})
        //     if(data){
        //         if(social_login==data.social_login){
        //                       const token = await jwt.sign({ _id: data._id }, "this is my", { expiresIn: '1d' });
        //         res.send({Success:true,Message:"user login with social login",Accesstoken:token})
        //         }else{
        //             res.send({Success:false,Message:"user email is not registered with social login",Accesstoken:token})
        //         }
        //     }else{
        //              const register =  User({
        //         // username:username,
        //         email:email,
        //         social_login:true
        //         // referalcode:referalcode

        //     })
        //     const result = await register.save()
        //     const token = await jwt.sign({ _id: result._id }, "this is my", { expiresIn: '1d' });
        //     res.send({Success:true,Message:"user login",Accesstoken:token})
        //     }
        // //     if(data){
        // //         const token = await jwt.sign({ _id: data._id }, "this is my", { expiresIn: '1d' });
        // //         res.send({Success:true,Message:"user login with",Accesstoken:token})
        // //     }else{
        // //     const register =  User({
        // //         // username:username,
        // //         email:email,
        // //         social_login:true
        // //         // referalcode:referalcode

        // //     })
        // //     const result = await register.save()
        // //     const token = await jwt.sign({ _id: result._id }, "this is my", { expiresIn: '1d' });
        // //     res.send({Success:true,Message:"user login",Accesstoken:token})
        // // }
        //    }
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.sendtokens = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const { token, address, type, hash, status } = req.body;
      console.log(token);
      // const url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
      const url = "https://bsc-dataseed.binance.org/";
      const web3 = new Web3(new Web3.providers.HttpProvider(url));

      const af = [];
      var receipt = await web3.eth
        .getTransactionReceipt(hash)
        .then((value) => {
          console.log(value, "fff");
          af.push(value);
        })
        .catch((e) => {
          console.log(e.data, "sddsd");
          af.push(e.data);
        });
      if (af[0] == null) {
        const data = await Transaction({
          from: address,
          Type: "refundtoken",
          hash: hash,
          status: null,
          token: token,
          userId: id,
        });
        const result = await data.save();
        res.json({ status: 220, msg: "Your token is reverted in 10 minutes" });
      } else {
        console.log("sd");

        const array = [];
        const qo = af[0].logs;
        qo.map((dat) => {
          const ay = dat.data;
          array.push(ay);
          // console.log(ay);
        });
        console.log(array[0]);

        const bt = af[0].status;
        const dat = await web3.eth.getTransaction(hash, (req, res) => {
          if (res === null) {
            res.json("invalid ");
          }
        });
        console.log(dat);
        const result = dat.from;
        console.log(result);
        const ac = dat.to;
        console.log(ac);
        const ad = array[0];
        const adtostring = ad.toString();
        // const wei = parseInt(ad) / 1000000000000000000
        const wei = web3.utils.fromWei(adtostring, "ether");
        console.log(wei);
        const ha = await Transaction.findOne({ hash: hash });
        console.log(ha, "ha................................");
        console.log(wei);
        console.log(
          "Wallets",
          result,
          address,
          "\n",
          req.body,
          "\n",
          JSON.stringify(req.body)
        );
        console.log("a..................................................");
        if (ha) {
          res.json({ Success: false, Message: "hash already registered" });
        } else {
          // else if (bt == false) {
          //     res.json({ Success: false, Message: "transaction failed" })
          console.log(result.toLowerCase());
          console.log(address.toLowerCase());
          console.log(wei);
          console.log(token);
          console.log(ac);

          // }
          if (
            result.toLowerCase() == address.toLowerCase() &&
            wei == token &&
            ac == "0x23959230b02498E8A7b380f8f2C6F545634e1DB9"
          ) {
            //"0xD8087bDDBA4330CD44a20fFA84b4A1ee80c1a3D3") {
            console.log("i'm here...........................");
            const data = await Transaction({
              from: result,
              type: "addtoken",
              to: ac,
              hash: hash,
              status: bt,
              token: token,
              userId: id,
            });
            const Save = await data.save();
            res.send({ Success: true, Message: "Token sent" });
          }
        }
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.createprofile = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const { username } = req.body;
      const data = await User.findOne({ _id: id });
      const profile = await Profile.findOne({ userId: id });
      // const referaltoken = await InApptoken({userId:id})
      const token = await InApptoken.findOne({ userId: id });
      if (token) {
        if (!profile) {
          const profile = await Profile({
            username: username,
            email: data.email,
            userId: id,
            Inapptokens: 0 + parseInt(token.Inapptokens),
            image: `http://3.68.231.50:3007/character/${req.file.filename}`,
            password: data.password,
            referalcode: data.referalcode,
          });
          const result = await profile.save();
          res.send({ Success: true, Message: "Profile is Added" });
        } else {
          res.send({ Success: false, Message: "Profile already created" });
        }
      } else {
        if (!profile) {
          const profile = await Profile({
            username: username,
            email: data.email,
            userId: id,
            Inapptokens: 0,
            image: `http://3.68.231.50:3007/character/${req.file.filename}`,
            password: data.password,
            referalcode: data.referalcode,
          });
          const result = await profile.save();
          res.send({ Success: true, Message: "Profile is Added" });
        } else {
          res.send({ Success: false, Message: "Profile already created" });
        }
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.update_profile = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const { username, email, password } = req.body;
      const data = await Profile.findOne({ userId: id });
      if (data) {
        const update = await Profile.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              username: username,
              image: `http://3.68.231.50:3007/character/${req.file.filename}`,
              email: email,
              password: password,
            },
          },
          { new: true }
        );
        if (update) {
          const user = await User.findOneAndUpdate(
            { _id: id },
            {
              $set: {
                email: email,
                password: password,
              },
            },
            { new: true }
          );
          res.send({ Success: true, Message: "user profile is updated" });
        } else {
          res.send({ Success: false, Message: "Profile not updated" });
        }
        // res.send({Success:true,Message:"user profile is updated"})
      } else {
        res.send({ Success: false, Message: "user not exist" });
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.getprofile = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const data = await Profile.findOne({ userId: id });
      if (data) {
        res.send({ Success: true, Profile: data });
      } else {
        res.send({ Success: false, Message: "user not exist" });
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.getusers = async (req, res) => {
    try {
      const data = await User.find();
      if (data) {
        res.send({ Success: true, Users: data });
      } else {
        res.send({ Success: false, Message: "user not exist" });
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.importtoken = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const { type, token, hash } = req.body;
      const data = Transaction({
        userId: id,
        type: "ImportToken",
        token: token,
        hash: hash,
      });
      const result = await data.save();
      res.send({ Success: true, Message: "tokens imported" });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.getTransaction = async (req, res) => {
    try {
      const data = await Transaction.find();

      res.send({ Success: true, Transactions: data });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.sendreferal = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      //  const {referalcode,email}=req.body
      const referal = await Referal.findOne({ userId: id });
      if (referal) {
        console.log("here.....");
        const code = await Referal.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              referalcode: generateOTP(6),
            },
          },
          { new: true }
        );
        res.send({ Success: true, Referalcode: code.referalcode });
      } else {
        const data = await Referal({
          userId: id,
          referalcode: generateOTP(6),
        });
        const result = await data.save();
        res.send({ Success: true, Referalcode: result.referalcode });
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.getreward = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const Reward = await Profile.findOne({ userId: id });
      const data = await Profile.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            Inapptokens: 8 + Reward.Inapptokens,
          },
        },
        { new: true }
      );
      res.send({ Success: true, Message: "Reward received" });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.token = async (req, res) => {
    try {
      const { hash, address, count } = req.body;
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.email = async (req, res) => {
    try {
      //   const user = req.user
      // const id = user._id

      // const dat = req.params.id
      // res.render("index")
      const dat = req.params.id;
      const data = await User.findOne({
        $and: [{ _id: dat }, { passwordverification: true }],
      });
      if (data) {
        res.render("index");
      } else {
        // res.send({Success:false,Message:"link is expired"})
        res.render("linkExpired");
      }
    } catch (error) {
      res.status(400).send({ success: false, error });
    }
  }),
  (exports.resetPassword = async (req, res) => {
    try {
      // const {new}
      console.log("hhjhjhjj");
      const { id } = req.params;
      // console.log(email);
      // const emailId = `http://3.68.231.50:8082/email?${req.params.link}`
      console.log(id);
      const data = await User.findOne({ _id: id });
      if (data) {
        const password = req.body.password;
        console.log(password, "----------------this is password");
        // console.log(password)
        const confirmpass = req.body.confirmpass;
        console.log(confirmpass, "----------------this is confirmpassword");
        if (password == confirmpass) {
          const userdata = await User.findOneAndUpdate(
            { _id: id },
            { $set: { password: password, passwordverification: false } },
            { new: true }
          );
          if (userdata) {
            res.render("resetpasswordresponse");
          }
          // res.status(200).send({ success: true, message: "User password has been changed" })
        }
      } else {
        res.status(401).send({ success: true, message: "email not found" });
      }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  });
const resetPasswordMail = async (email, id) => {
  let mailTransporter = nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 587, // Use the appropriate port for your email provider
    secure: false, // true for 465, false for other ports
    auth: {
      user: "hello@spaceofmining.com",
      pass: "'n#%$O/wFFV%!%$",
    },
  });
  const user = await Profile.findOne({ email: email });
  console.log(
    user.username,
    "username................................................"
  );
  const emailTemplateSource = fs.readFileSync("reset-password.hbs", "utf8");
  const emailTemplate = handlebars.compile(emailTemplateSource);
  const templateData = {
    link: `http://3.68.231.50:3007/email/${id}`,
    username: user.username,
  };
  const renderedTemplate = emailTemplate(templateData);

  let mailDetails = {
    from: "hello@spaceofmining.com",
    to: email,
    subject: "To Reset Password",
    // html: `http://3.68.231.50:8082/email?${emailId}`
    html: renderedTemplate,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
};
(exports.forgetPassword = async (req, res) => {
  try {
    //const user = req.user
    // const id = user._id
    const email = req.body.email;
    const data = await User.findOne({ email: email });
    console.log(data);
    //console.log(data.id+"..>"+id);
    if (data) {
      // const value = await userdata.updateOne({
      //     email: email
      // })
      // console.log(value);
      const updateRequestForResetPassword = await User.findOneAndUpdate(
        {
          _id: data._id,
        },
        {
          $set: {
            passwordverification: true,
          },
        },
        { new: true }
      );
      console.log(updateRequestForResetPassword);
      // console.log(value);
      async function myFunction() {
        console.log("link is expired");
        const updateRequestForResetPassword = await User.findOneAndUpdate(
          {
            _id: data._id,
          },
          {
            $set: {
              passwordverification: false,
            },
          },
          { new: true }
        );
        console.log(updateRequestForResetPassword);
      }

      // Schedule myFunction to run after 1 minute (60000 milliseconds)
      setTimeout(myFunction, 60000);
      resetPasswordMail(data.email, data.id);

      res.status(200).send({
        success: true,
        message: "Check your mail to reset your password",
      });
    } else {
      res
        .status(401)
        .send({ success: true, message: "This email does not exists" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}),
  (exports.getaccountbalance = async (req, res) => {
    try {
      const { wallet_address } = req.body;
      const balanceOfABI = [
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              name: "balance",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ];
      const tokenContract = "0x23959230b02498E8A7b380f8f2C6F545634e1DB9";
      const tokenHolder = wallet_address;

      // Define the ERC-20 token contract
      const url = "https://bsc-dataseed.binance.org/";
      const web3 = new Web3(new Web3.providers.HttpProvider(url));
      const contract = new web3.eth.Contract(balanceOfABI, tokenContract);

      // async function getTokenBalance() {
      // Execute balanceOf() to retrieve the token balance
      const result = await contract.methods.balanceOf(tokenHolder).call(); // 29803630997051883414242659

      // Convert the value from Wei to Ether
      const tokenPriceAPI =
        "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd";
      const formattedResult = web3.utils.fromWei(result, "ether"); // 29803630.997051883414242659

      console.log(formattedResult);
      const bscRpcUrl = "https://bsc-dataseed.binance.org/";
      const respon = await axios.post(bscRpcUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [wallet_address, "latest"],
      });
      // Convert the balance from wei to BNB
      const balanceWei = parseInt(respon.data.result, 16);
      console.log(balanceWei);
      const balanceBNB = balanceWei / 1e18;
      // const balanceBNB = web3.utils.fromWei(balanceWei.toString(), "ether");
      const response = await fetchDataWithBackoff(tokenPriceAPI);
      console.log(response.data["binancecoin"].usd);
      if (response !== null) {
        const balanceINUSD =
          Number(balanceBNB) * response.data["binancecoin"].usd;
        console.log(balanceINUSD);
        res.send({
          balance: balanceINUSD.toFixed(2),
          SOMBalance: formattedResult,
        });
      } else {
        res.send({ Success: false, Message: "Error in fetching USD Amount" });
      }

      // const {wallet_address}=req.body
      // const balanceOfABI = [
      //     {
      //         "constant": true,
      //         "inputs": [
      //             {
      //                 "name": "_owner",
      //                 "type": "address"
      //             }
      //         ],
      //         "name": "balanceOf",
      //         "outputs": [
      //             {
      //                 "name": "balance",
      //                 "type": "uint256"
      //             }
      //         ],
      //         "payable": false,
      //         "stateMutability": "view",
      //         "type": "function"
      //     },
      // ];
      // const tokenContract = "0x23959230b02498E8A7b380f8f2C6F545634e1DB9"//0xD8087bDDBA4330CD44a20fFA84b4A1ee80c1a3D3
      // const tokenHolder = wallet_address

      // // Define the ERC-20 token contract
      // // const url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
      // const url = "https://bsc-dataseed.binance.org/"
      // const web3 = new Web3(new Web3.providers.HttpProvider(url))
      // const contract = new web3.eth.Contract(balanceOfABI, tokenContract)

      // // async function getTokenBalance() {
      // // Execute balanceOf() to retrieve the token balance
      // const result = await contract.methods.balanceOf(tokenHolder).call(); // 29803630997051883414242659

      // // Convert the value from Wei to Ether
      // const tokenPriceAPI = 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd';
      // const formattedResult = web3.utils.fromWei(result, "ether"); // 29803630.997051883414242659
      // console.log(formattedResult,"SOM tokens.......................................//");
      // const response = await fetchDataWithBackoff(tokenPriceAPI);
      // console.log(response.data['binancecoin'].usd);
      // if(response!==null){
      //     const balanceINUSD=formattedResult*response.data['binancecoin'].usd
      //     console.log(balanceINUSD);
      //     res.send({ balance: balanceINUSD,SOMBalance:formattedResult})

      // }else{
      //     res.send({Success:false,Message:"Error in fetching USD Amount"})
      // }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  });
const fetchDataWithBackoff = async (url, maxRetries = 5) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"]) || 1;
        console.log(`Rate limited. Retrying in ${retryAfter} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      } else {
        throw error;
      }
    }
    retries++;
  }
  throw new Error("Max retries exceeded");
};

(exports.getallimport_tokens = async (req, res) => {
  try {
    // await limiter.consume(1); // Consume a point (request)
    const { wallet_address } = req.body;
    const userAddress = wallet_address;
    // const url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
    const url = "https://bsc-dataseed.binance.org/";
    const web3 = new Web3(new Web3.providers.HttpProvider(url));
    const balanceWei = await web3.eth.getBalance(userAddress);
    const balanceBnb = web3.utils.fromWei(balanceWei, "ether");
    // const tokenPriceAPI = "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd";
    const response = await fetchDataWithBackoff(
      "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
    );
    console.log(response.data["binancecoin"].usd);
    // console.log(response.binancecoin.usd);
    const balanceINUSD = balanceBnb * response.data["binancecoin"].usd;
    const percentagechamgeURI = await fetchDataWithBackoff(
      "https://api.coingecko.com/api/v3/coins/binancecoin"
    );
    const marketSummary = percentagechamgeURI.data.market_data;
    const percentChange24h = marketSummary.price_change_percentage_24h;
    if (balanceBnb) {
      const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955"; //0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
      const userAddress = wallet_address;

      const usdtAbi = [
        {
          inputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          constant: true,
          inputs: [],
          name: "_decimals",
          outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "_name",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "_symbol",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "address", name: "spender", type: "address" },
          ],
          name: "allowance",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: true,
          inputs: [
            { internalType: "address", name: "account", type: "address" },
          ],
          name: "balanceOf",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "decimals",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "getOwner",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "addedValue", type: "uint256" },
          ],
          name: "increaseAllowance",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "mint",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "name",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "owner",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: false,
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "symbol",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "totalSupply",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "transfer",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "transferFrom",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          constant: false,
          inputs: [
            { internalType: "address", name: "newOwner", type: "address" },
          ],
          name: "transferOwnership",
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const usdtContract = new web3.eth.Contract(usdtAbi, usdtContractAddress);
      const balance = await usdtContract.methods.balanceOf(userAddress).call();
      const USDTBalance = web3.utils.fromWei(balance, "ether");
      const response = await fetchDataWithBackoff(
        "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd"
      );
      const usdtValueInUSD = response.data.tether.usd;
      const USDTinusd = USDTBalance * usdtValueInUSD;
      const USDTpercentageURI = await fetchDataWithBackoff(
        "https://api.coingecko.com/api/v3/coins/tether"
      );
      const marketSummary = USDTpercentageURI.data.market_data;
      const usdtpercentChange24h = marketSummary.price_change_percentage_24h;

      if (USDTBalance) {
        const usdcContractAddress =
          "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; //0x64544969ed7ebf5f083679233325356ebe738930
        const userAddress = wallet_address;

        const usdcAbi = [
          {
            inputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            name: "Approval",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
              },
            ],
            name: "OwnershipTransferred",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            name: "Transfer",
            type: "event",
          },
          {
            constant: true,
            inputs: [],
            name: "_decimals",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "_name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "_symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "address", name: "spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "spender", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { internalType: "address", name: "account", type: "address" },
            ],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "decimals",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "spender", type: "address" },
              {
                internalType: "uint256",
                name: "subtractedValue",
                type: "uint256",
              },
            ],
            name: "decreaseAllowance",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "getOwner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "spender", type: "address" },
              { internalType: "uint256", name: "addedValue", type: "uint256" },
            ],
            name: "increaseAllowance",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "mint",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [],
            name: "renounceOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "totalSupply",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "sender", type: "address" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "transferFrom",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "newOwner", type: "address" },
            ],
            name: "transferOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
        ]; // Replace with the actual USDC contract ABI

        const usdcContract = new web3.eth.Contract(
          usdcAbi,
          usdcContractAddress
        );
        const balance = await usdcContract.methods
          .balanceOf(userAddress)
          .call();
        const USDCBalance = web3.utils.fromWei(balance, "ether");
        const response = await fetchDataWithBackoff(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
        );
        const conversionRate = response.data["usd-coin"].usd;
        const usdctousd = conversionRate * USDCBalance;
        const usdcpercentageuri = await fetchDataWithBackoff(
          "https://api.coingecko.com/api/v3/coins/usd-coin"
        );
        const marketSummary = usdcpercentageuri.data.market_data;
        const usdcpercentChange24h = marketSummary.price_change_percentage_24h;
        if (USDCBalance) {
          const busdContractAddress =
            "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; //0x8301f2213c0eed49a7e28ae4c3e91722919b8b47
          const userAddress = wallet_address;
          const busdAbi = [
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_initialAmount",
                  type: "uint256",
                },
                { internalType: "string", name: "_tokenName", type: "string" },
                { internalType: "uint8", name: "_decimalUnits", type: "uint8" },
                {
                  internalType: "string",
                  name: "_tokenSymbol",
                  type: "string",
                },
              ],
              payable: false,
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "spender",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "Approval",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "from",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "Transfer",
              type: "event",
            },
            {
              constant: false,
              inputs: [
                { internalType: "address", name: "_owner", type: "address" },
                { internalType: "uint256", name: "value", type: "uint256" },
              ],
              name: "allocateTo",
              outputs: [],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              constant: true,
              inputs: [
                { internalType: "address", name: "", type: "address" },
                { internalType: "address", name: "", type: "address" },
              ],
              name: "allowance",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            {
              constant: false,
              inputs: [
                { internalType: "address", name: "_spender", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
              ],
              name: "approve",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              constant: true,
              inputs: [{ internalType: "address", name: "", type: "address" }],
              name: "balanceOf",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            {
              constant: true,
              inputs: [],
              name: "decimals",
              outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            {
              constant: true,
              inputs: [],
              name: "name",
              outputs: [{ internalType: "string", name: "", type: "string" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            {
              constant: true,
              inputs: [],
              name: "symbol",
              outputs: [{ internalType: "string", name: "", type: "string" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            {
              constant: true,
              inputs: [],
              name: "totalSupply",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
            {
              constant: false,
              inputs: [
                { internalType: "address", name: "dst", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
              ],
              name: "transfer",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              constant: false,
              inputs: [
                { internalType: "address", name: "src", type: "address" },
                { internalType: "address", name: "dst", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
              ],
              name: "transferFrom",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
          ];
          const busdContract = new web3.eth.Contract(
            busdAbi,
            busdContractAddress
          );
          const balance = await busdContract.methods
            .balanceOf(userAddress)
            .call();
          const BUSDBalance = web3.utils.fromWei(balance, "ether");
          const response = await fetchDataWithBackoff(
            "https://api.coingecko.com/api/v3/simple/price?ids=binance-usd&vs_currencies=usd"
          );
          const conversionRate = response.data["binance-usd"].usd;
          const busdtousd = conversionRate * BUSDBalance;
          const busduripercentagechange = await fetchDataWithBackoff(
            "https://api.coingecko.com/api/v3/coins/binance-usd"
          );
          const marketSummary = busduripercentagechange.data.market_data;
          const busdpercentChange24h =
            marketSummary.price_change_percentage_24h;
          if (BUSDBalance) {
            res.send({
              Success: true,
              BNB: balanceBnb,
              BNBinUSD: balanceINUSD,
              BNBpercentagechange: percentChange24h,
              USDT: USDTBalance,
              USDTinUSD: USDTinusd,
              USDTpercentagechange: usdtpercentChange24h,
              USDC: USDCBalance,
              USDCinUSD: usdctousd,
              USDCpercentagechange: usdcpercentChange24h,
              BUSD: BUSDBalance,
              BUSDinUSD: busdtousd,
              BUSDpercentagechange: busdpercentChange24h,
            });
          } else {
            res.send({ Success: false, Message: "BUSD is not fetched" });
          }
        } else {
          res.send({ Success: false, Message: "USDC is not fetched" });
        }
      } else {
        res.send({ Success: false, Message: "USDT is not fetched" });
      }
    } else {
      res.send({ Success: false, Message: "BNB is not fetched" });
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
}),
  (exports.post_time = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const { login_time } = req.body;
      const data = await User.findOneAndUpdate(
        { _id: id },
        { $set: { login_time: login_time } },
        { new: true }
      );
      res.send({ Success: true, Login_Time: data.login_time });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.get_time = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const data = await User.findOne({ _id: id });
      res.send({ Success: true, Login_Time: data.login_time });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.get_referalcode = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const data = await Referal.findOne({ userId: id });
      res.send({ Success: true, Login_time: data.referalcode });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.closeapp_timimg = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      console.log(id, "id");
      const { time, login_time } = req.body;
      const data = await CloseApptiming.findOne({ userId: id });
      console.log(data);
      if (data) {
        const result = await CloseApptiming.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              time: time,
            },
          },
          { new: true }
        );
        res.send({ Success: true, Message: "time updated" });
      } else {
        const user = new CloseApptiming({
          userId: id,
          time: time,
        });
        const result = await user.save();
        res.send({ Success: true, Message: "time added" });
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.logoutapp_timing = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      console.log(id, "id");
      const { loginTime } = req.body;
      console.log(req.body);
      const data = await CloseApptiming.findOne({ userId: id });
      console.log(data);
      if (data) {
        const result = await CloseApptiming.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              logout_time: loginTime,
            },
          },
          { new: true }
        );
        res.send({ Success: true, Message: "time updated" });
      } else {
        const user = new CloseApptiming({
          userId: id,
          logout_time: loginTime,
        });
        const result = await user.save();
        res.send({ Success: true, Message: "time added" });
      }
    } catch (e) {
      console.log("Error", e);
      res.send.message(e);
    }
  }),
  (exports.gettime = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      console.log(id, "gettime id......");
      const data = await CloseApptiming.findOne({ userId: id });
      res.send({ Success: true, time: data });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.get_usedreferalusers = async (req, res) => {
    try {
      const { referalcode } = req.body;
      const data = await Referal_usedcode.findOne({ referalcode: referalcode });
      console.log(
        data,
        "data........................................................................................."
      );
      if (data) {
        const profile = data.referedusers;
        console.log(profile);
        const array = [];
        for (var value of profile) {
          console.log(value.userId, ".......................");
          const find = await Profile.findOne({ userId: value.userId });
          if (find) {
            array.push({
              userId: value.userId,
              username: find.username,
              image: find.image,
            });
          }
        }

        console.log(array);
        res.send({ Success: true, Users: array });
      } else {
        res.send({ success: false, Message: "referal code is not exist" });
      }
      // const {referalcode}=req.body
      // const data = await Referal_usedcode.findOne({referalcode:referalcode})
      // if(data){
      //     res.send({Success:true,Users:data.referedusers})
      // }else{
      //     res.send({Success:false,Message:"referal code exist"})
      // }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.redeemtoken = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const { count, address, chain } = req.body;
      // if (chain == "BSC") {
      const web3 = new Web3(
        new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
      ); // new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
      // const data = await Wallet.findOne({ userId: id })

      // const wall = data.wallet.ingametoken
      const balanceOfABI = [
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              name: "balance",
              type: "uint256",
            },
          ],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ];
      const tokenContract = "0x23959230b02498E8A7b380f8f2C6F545634e1DB9"; //"0xD8087bDDBA4330CD44a20fFA84b4A1ee80c1a3D3"
      const tokenHolder = "0x5D8850E029C875e36De113c1d00C1072CA36B7cF"; //0xB45AA2e895B1Fa27e0d08c4F2472AFcD99ECC3a6

      // Define the ERC-20 token contract
      const contract = new web3.eth.Contract(balanceOfABI, tokenContract);

      // async function getTokenBalance() {
      // Execute balanceOf() to retrieve the token balance
      const result = await contract.methods.balanceOf(tokenHolder).call(); // 29803630997051883414242659

      // Convert the value from Wei to Ether
      const formattedResult = web3.utils.fromWei(result, "ether");
      console.log("REdeem Bal community ", formattedResult);
      if (parseInt(formattedResult) < parseInt(count)) {
        res.send({
          Success: false,
          Message: "Insufficient token in community wallet",
        });
      } else {
        // if (parseInt(wall) < parseInt(count)) {

        //     res.json({ success: false, msg: 'Insufficent fund in ingame token' })
        // } else {
        const privateKey =
          "fcb623d08cd0ab041339781569e9a95898fad2ffba2d0b6688ff59cdbc727533"; //Your Private key environment variable //8692413c6a18e16269c0977dd6618c1243b462408260def3aa5dccc1613ae317
        const tokenAddress = tokenContract; //'0x73B4141184255100B2706F32f9ef2917b5e90445' //'0xD297B4EfD7505CAA9c47572db1F5dd72544DAe3D' // Demo Token contract address
        const toAddress = address; // where to send it
        const fromAddress = tokenHolder; //'0xC5644fA8D81d6347e4C4cF97e4c95350617Ba36c' // your wallet //0x581aDFD922E552211d5C9Cc9549313974723D88A
        // const contractABI = [
        //     // transfer
        //     {
        //         'constant': false,
        //         'inputs': [
        //             {
        //                 'name': '_to',
        //                 'type': 'address'
        //             },
        //             {
        //                 'name': '_value',
        //                 'type': 'uint256'
        //             }
        //         ],
        //         'name': 'transfer',
        //         'outputs': [
        //             {
        //                 'name': '',
        //                 'type': 'bool'
        //             }
        //         ],
        //         'type': 'function'
        //     }
        // ]
        const contractABI = JSON.parse(
          '[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"address","name":"_BUSD","type":"address"},{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_USDT","type":"address"},{"internalType":"address","name":"_feeWallet","type":"address"},{"internalType":"uint256","name":"_price","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"invalidFee","type":"error"},{"inputs":[],"name":"notEnough","type":"error"},{"inputs":[],"name":"notValidCurrency","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"paid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"bought","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"paid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"sold","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"stableAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"buy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"stableAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"buyWithPermit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"stableAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"sell","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_Currency","type":"address"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeWallet","type":"address"}],"name":"setfeeWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
        );
        const array = [];
        const ha = [];
        let contract = new web3.eth.Contract(contractABI, tokenAddress, {
          from: fromAddress,
        });
        let amount = web3.utils.toHex(web3.utils.toWei(count)); //1 DEMO Token
        let data = contract.methods.transfer(toAddress, amount).encodeABI();
        sendErcToken();
        async function sendErcToken() {
          let txObj = {
            gas: web3.utils.toHex(100000),
            to: tokenAddress,
            value: "0x00",
            data: data,
            from: fromAddress,
          };
          const qw = await web3.eth.accounts.signTransaction(txObj, privateKey);
          if (!qw) {
            res.json("not valid");
          } else {
            const transaction = [];
            const qr = await web3.eth
              .sendSignedTransaction(qw.rawTransaction)
              .then((value) => {
                console.log(value);
                transaction.push(value.transactionHash);
                transaction.push(value.logs);
              })
              .catch((e) => {
                console.log(e);
                res.send({ success: false, msg: "redeem failed" });
              });
            console.log(qr);
            // const has = qr.transactionHash
            const has = transaction[0];
            ha.push(has);
            // const detail = qr.logs
            const detail = transaction[1];
            detail.map((da) => {
              // console.log(data);
              const dat = da.data;
              console.log(dat);
              array.push(dat);
            });
          }

          const arr = array[0];
          console.log(arr, "arr");
          const hex = web3.utils.hexToNumberString(arr);
          console.log(hex, "hex");
          // const wei = parseInt(hex) / 1000000000000000000
          const hextostring = hex.toString();
          const wei = web3.utils.fromWei(hextostring, "ether");
          const da = ha[0];
          console.log(da[0]);
          console.log(wei);
          const has = qw.transactionHash;
          console.log(has);
          const af = await web3.eth.getTransactionReceipt(da);
          const dat = af.status;
          const trans = await Transaction.findOne({ hash: da });
          if (trans) {
            res.json({ success: false, msg: "hash is already registered" });
            // }else if(dat==false){
            //     res.json("failed transaction")
            // }
          } else if (dat == false) {
            res.json({ success: false, msg: "Transaction failed" });
          } else if (count == wei) {
            // const data = wall
            // const sub = data - wei

            // console.log(sub);
            // const fi = await Wallet.findOneAndUpdate({ userId: id }, { $set: { "wallet.ingametoken": sub } }, { new: true })
            // const wallet = await User.findOneAndUpdate({ _id: id }, { $set: { token: fi.wallet.ingametoken } }, { new: true })

            const resu = await Transaction({
              hash: da,
              Type: "redeemtoken",
              from: af.from,
              status: dat,
              userId: id,
              to: address,
              token: count,
            });
            const result = await resu.save();
            console.log(result);
            const token = await Profile.findOne({ userId: id });
            const value = parseInt(token.Inapptokens) - parseInt(count);
            const tokenupdate = await Profile.findOneAndUpdate(
              { userId: id },
              { $set: { Inapptokens: value } },
              { new: true }
            );
            console.log(tokenupdate);
            res.json({ Success: true, Message: "Transaction success" });
          } else {
            res.json({ Success: false, Message: "Data not matched" });
          }
        }
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.getreferalcode = async (req, res) => {
    try {
      const user = req.user;
      const id = user._id;
      const data = await Referal.findOne({ userId: id });
      res.send({ Success: true, Code: data });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.refreshtoken = async (req, res) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      console.log(token);
      const data = await User.findOne({ accesstoken: token });
      if (data) {
        const refreshtoken = await jwt.sign({ _id: data._id }, "this is my", {
          expiresIn: "1d",
        });
        const tokenupdate = await User.findOneAndUpdate(
          { accesstoken: token },
          {
            $set: {
              accesstoken: refreshtoken,
            },
          },
          { new: true }
        );
        console.log(tokenupdate);
        res.send({ Success: true, refreshtoken: refreshtoken });
      } else {
        res.send({ Success: false, Message: "user not exist" });
      }
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }),
  (exports.emailverification = async (req, res) => {
    try {
      const email = req.params.id;
      const referalcode = req.params.code;
      const password = req.params.password;
      console.log(email);
      console.log(referalcode);
      console.log(password, "pass");
      if (referalcode) {
        const data = await Referal.findOne({ referalcode: referalcode });
        if (data) {
          //    const data = await User.findOne({username:username})
          const Email = await User.findOne({ email: email });
          if (Email) {
            res.send({ Success: false, Message: "email already registered" });
          } else {
            const data = User({
              // username:username,
              email: email,
              password: password,
              referalcode: referalcode,
            });
            const result = await data.save();
            if (result) {
              // const dat = await InApptoken({
              //     userId: result._id,
              //     Inapptokens: 10
              // })
              // const resu = await dat.save()
              if (result) {
                const token = await Referal.findOne({
                  referalcode: referalcode,
                });
                if (token) {
                  const profile = await Profile.findOne({
                    userId: token.userId,
                  });
                  const profiletoken = await Profile.findOneAndUpdate(
                    { userId: token.userId },
                    {
                      $set: {
                        Inapptokens: 100 + profile.Inapptokens,
                      },
                    },
                    { new: true }
                  );
                  console.log(profiletoken);
                  const find = await Referal_usedcode.findOne({
                    referalcode: referalcode,
                  });
                  if (find) {
                    const array = find.referedusers;
                    array.push({ userId: result._id });
                    const usedreferal = await Referal_usedcode.findOneAndUpdate(
                      { referalcode: referalcode },
                      {
                        $set: {
                          referedusers: array,
                        },
                      },
                      { new: true }
                    );
                    // if (usedreferal) {
                    const updateuser = await User.findOneAndUpdate(
                      { email: email },
                      {
                        $set: {
                          verify: 1,
                        },
                      },
                      { new: true }
                    );
                    console.log(updateuser);
                    // res.send({ Success: true, Message: "User registered with referal code" })
                    res.render("emailverification");
                  } else {
                    console.log(result._id, "id");
                    const add = new Referal_usedcode({
                      userId: token.userId,
                      referalcode: referalcode,
                      referedusers: {
                        userId: result._id,
                      },
                    });
                    const value = await add.save();
                    const updateuser = await User.findOneAndUpdate(
                      { email: email },
                      {
                        $set: {
                          verify: 1,
                        },
                      },
                      { new: true }
                    );
                    console.log(updateuser);
                    // res.send({ Success: true, Message: "User registered with referal code" })
                    res.render("emailverification");
                  }
                } else {
                  res.send({
                    Success: true,
                    Message: "profile is not created",
                  });
                }
              }
            }
            // res.send({Success:true,Message:"User registered"})
          }
        } else {
          res.send({ Success: false, Message: "referal code is not exist" });
        }
      } else {
        res.send({ Success: false, Message: "Referal code is Mandatory" });
      }
      // //    const data = await User.findOneAndUpdate({userId:dat},{$set:{
      //     verify:1
      //    }},{new:true})
      //    console.log(data);
      //    res.send({Success:true,Message:"email verified"})
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  });
