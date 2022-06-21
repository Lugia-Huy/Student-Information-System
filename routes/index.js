var express = require("express");
var passport = require("passport");
var router = express.Router();
var multer  = require('multer');
var News = require("../models/thongbao_db");
var Department = require("../models/phongban_db");
var Topic = require("../models/chude_db");
var User = require("../models/user_db");
var Post = require("../models/post_db");
var Comment = require("../models/comment");

var upload = multer({ dest: './public/uploads/' });


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      res.status(401)
      return res.send('Not allowed')
    }

    next()
  }
}

function getId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11)
    ? match[2]
    : null;
}
/*
 * trang chu
 */
router.get("/", isLoggedIn, authRole('admin'), function (req, res, next) {
  News.find({})
    .sort({ _id: -1 })
    .then((news) => {
      Post.find({})
        .sort({ _id: -1 })
        .then((post) => {
          Comment.find({})
            .then((comment) => {
              res.render("index", {
                products: news,
                posts: post,
                comments: comment,
                currentuser: req.user,
                title: "Trang chủ",
              });
            });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});


/*
 * bai viet
 */
router.post("/thembaiviet", upload.single('postsImage'), (req, res) => {
  console.log(req.body);
  //getId()

  var videoId = getId(req.body.postsLinkyoutube);
  var post = new Post();
  var image = req.file.path.split('\\').slice(1).join("/");
  post.user = req.user.name;
  post.user_cover = req.user.cover;
  post.content = req.body.postsContent;
  post.linkyoutube = req.body.postsLinkyoutube;
  post.linkembed = videoId;
  post.linkimage = image;
  post.created = new Date();

  post
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/comment/:id", (req, res) => {
  console.log(req.body);
  var com = new Comment();
  com.user = req.user.name;
  com.user_cover = req.user.cover;
  com.post = req.params.id;
  com.content = req.body.comment;
  com.created = new Date();

  com
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/post/:id/delete', function(req, res){
  Post.remove({_id: req.params.id}, 
    function(err){
      if(err) res.json(err);
    }).then((data) => {
      Post.remove({_id: req.params.id}, 
      function(err){
        if(err) res.json(err);
        else    res.redirect('/');
      });
    });
});

router.get('/comment/:id/delete', function(req, res){
  Comment.remove({_id: req.params.id}, 
    function(err){
      if(err) res.json(err);
      else    res.redirect('/');
    });
});

router.post("/post/:id/update", (req, res) => {
  var id = req.params.id;
  var videoId = getId(req.body.newpostYoutube);
  Post.findOneAndUpdate(
    {
      _id: id, // search query
    },
    {
      $set: {
        content : req.body.newpostContent,
        linkyoutube : req.body.newpostYoutube,
        linkembed : videoId,
        linkimage : req.body.newpostImage,
      },
    },
    {
      runValidators: true, // validate before update
    }
  )
    .then((doc) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.error(err);
    });
});

/*
 * dang nhap & dang xuat
 */
router.get("/login", function (req, res, next) {
  res.render("login", { title: "Đăng nhập" });
});

router.get("/logout", (req, res) => {
  req.logOut();
  return res.redirect("/login");
});

/*
 * thong tin ca nhan
 */
router.get("/profile", isLoggedIn,authRole('admin'), function (req, res, next) {
  /*User.find({})
    .sort({ _id: -1 })
    .sort({ _id: -1 })
    .then((user) => {*/
  res.render("profile", {
    currentuser: req.user,
    title: "Thông tin cá nhân",
  });
  /*
      });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });*/
});
// tao tai khoan
router.get("/themuser", isLoggedIn, authRole('admin'),function (req, res, next) {
  Department.find({})
    .then((department) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("themuser", {
            products: department,
            currentuser: req.user,
            title: "Tạo tài khoản",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});

router.post("/themuser", upload.single('userImage'), (req, res) => {
  console.log(req.body);
  var image = req.file.path.split('\\').slice(1).join("/");
  var user = new User();
  user.mssv = req.body.userIdstudent;
  user.name = req.body.userName;
  user.email = req.body.userEmail;
  user.sdt = req.body.userNumberphone;
  user.password = req.body.userPass;
  user.faculty = req.body.userFaculty;
  user.cover = image;
  user.role = req.body.userRole;

  user
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

//edit tai khoan
router.get("/profile/edit/:id", isLoggedIn, authRole('admin'),(req, res) => {
  User.find({})
    .sort({ _id: -1 })
    .then((users) => {
      res.render("profileedit", {
        currentuser: req.user,
        title: "Sửa thông tin cá nhân",
      });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});

router.post("/profile/edit/:id", upload.single('userImage'), (req, res) => {
  var id = req.params.id;
  var image = req.file.path.split('\\').slice(1).join("/");
  User.findOneAndUpdate(
    {
      _id: id, // search query
    },
    {
      $set: {
        mssv: req.body.userIdstudent,
        name: req.body.userName,
        email: req.body.userEmail,
        sdt: req.body.userNumberphone,
        password: req.body.userPass,
        faculty: req.body.userFaculty,
        cover : image,
      }, // field:values to update
    },
    {
      runValidators: true, // validate before update
    }
  )
    .then((doc) => {
      res.redirect("/profile");
    })
    .catch((err) => {
      console.error(err);
    });
});

/*
 * phong ban/khoa
 */
router.get("/phongban", isLoggedIn, authRole('admin'),(req, res) => {
  Department.find({})
    .then((department) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("phongban", {
            products: department,
            currentuser: req.user,
            title: "Phòng ban",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});
//them phong ban-hide
router.get("/themphongban", isLoggedIn,authRole('admin'), function (req, res, next) {
  User.find({})
    .sort({ _id: -1 })
    .then((users) => {
      res.render("themphongban", {
        currentuser: req.user,
        title: "Tạo phòng ban",
      });
    });
});

router.post("/themphongban", (req, res) => {
  console.log(req.body);
  var department = new Department();
  department.name = req.body.departmentName;
  department.content = req.body.departmentContent;

  department
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("/phongban");
    })
    .catch((err) => {
      console.log(err);
    });
});

/*
 * chu de
 */
router.get("/chude", isLoggedIn,authRole('admin'),(req, res) => {
  Topic.find({})
    .then((topic) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("chude", {
            products: topic,
            currentuser: req.user,
            title: "Chủ đề",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});
//them chu de-hide
router.get("/themchude", isLoggedIn, authRole('admin'),function (req, res, next) {
  User.find({})
    .sort({ _id: -1 })
    .then((users) => {
      res.render("themchude", {
        currentuser: req.user,
        title: "Tạo chủ đề",
      });
    });
});

router.post("/themchude", (req, res) => {
  console.log(req.body);
  var topic = new Topic();
  topic.name = req.body.topicName;
  topic.content = req.body.topicContent;

  topic
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("/chude");
    })
    .catch((err) => {
      console.log(err);
    });
});

/*
 * thong bao
 
router.get("/thongbao", isLoggedIn, (req, res) => {
  News.find({})
    .sort({ _id: -1 })
    .then((news) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("thongbao", {
            products: news,
            currentuser: req.user,
            title: "Thông báo",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});
*/
router.get("/thongbao/:page", isLoggedIn, authRole('admin'),(req, res) => {
  var perPage = 10
  var page = req.params.page || 1

  News.find({})
    .sort({ _id: -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then((news) => {
      News.count().exec(function (err, count) {
          if (err) return next(err)
          res.render('thongbao', {
            products: news,
            currentuser: req.user,
            pages: Math.ceil(count / perPage),
            title: "Thông báo",
          })
      })
    })
});

//chi tiet thong bao
router.get("/thongbao/chitiet/:id", isLoggedIn, authRole('admin'),(req, res) => {
  var id = req.params.id;
  News.findOne({ _id: id })
    .then((news) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("chitiet", {
            products: news,
            currentuser: req.user,
            title: "Thông báo",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});

//loc thong bao theo phong ban/khoa
router.get("/thongbao/:phongban", isLoggedIn, authRole('admin'),(req, res) => {
  var str = req.params.phongban;
  console.log("deparmetn selected: ", str);

  //var newDepartment = decodeURIComponent(str);
  News.find({ department: str })
    .then((news) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("thongbao", {
            products: news,
            currentuser: req.user,
            title: "Thông báo",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});

//loc thong bao theo chu de
router.get("/thongbao/:chude", isLoggedIn, authRole('admin'),(req, res) => {
  var str = req.params.chude;
  console.log("key: ", str);
  //var newDepartment = decodeURIComponent(str);
  News.find({ topic: str })
    .then((news) => {
      User.find({})
        .sort({ _id: -1 })
        .then((users) => {
          res.render("thongbao", {
            products: news,
            currentuser: req.user,
            title: "Thông báo",
          });
        });
    })
    .catch((err) => {
      console.log("Error: ", err);
      throw err;
    });
});

//tao thong bao moi
router.get("/thongbao/themthongbao", isLoggedIn, authRole('admin'),function (req, res, next) {
  Department.find({}).then((department) => {
    Topic.find({})
      .then((topic) => {
        User.find({})
          .sort({ _id: -1 })
          .then((users) => {
            res.render("themthongbao", {
              departments: department,
              topics: topic,
              currentuser: req.user,
              title: "Thêm thông báo",
            });
          });
      })
      .catch((err) => {
        console.log("Error: ", err);
        throw err;
      });
  });
});

router.post("/thongbao/themthongbao", (req, res) => {
  console.log(req.body);
  var news = new News();
  news.name = req.body.newsName;
  news.topic = req.body.newsTopic;
  news.department = req.body.newsDepartment;
  news.content = req.body.newsContent;
  news.created = new Date();

  news
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("/thongbao/1");
    })
    .catch((err) => {
      console.log(err);
    });
});

//sua thong bao
router.get("/thongbao/suathongbao/:id", isLoggedIn, authRole('admin'),function (req, res, next) {
  var id = req.params.id;
  News.findOne({ _id: id }).then((news) => {
    Department.find({}).then((department) => {
      Topic.find({})
        .then((topic) => {
          User.find({})
            .sort({ _id: -1 })
            .then((users) => {
              res.render("suathongbao", {
                products: news,
                departments: department,
                topics: topic,
                currentuser: req.user,
                title: "Sửa thông báo",
              });
            });
        })
        .catch((err) => {
          console.log("Error: ", err);
          throw err;
        });
    });
  });
});

router.post("/thongbao/suathongbao/:id", (req, res) => {
  var id = req.params.id;
  News.findOneAndUpdate(
    {
      _id: id, // search query
    },
    {
      $set: {
        name: req.body.newsName,
        topic: req.body.newsTopic,
        department: req.body.newsDepartment,
        content: req.body.newsContent,
      },
    },
    {
      runValidators: true, // validate before update
    }
  )
    .then((doc) => {
      res.redirect("/thongbao/1");
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/news/:id/delete', function(req, res){
  News.remove({_id: req.params.id}, 
     function(err){
  if(err) res.json(err);
  else res.redirect('/thongbao/1');
});
});

module.exports = router;