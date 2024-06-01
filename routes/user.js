const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const multer = require("../middleware/multer.config");
const auth = require("../middleware/auth");

//auth
router.post("/admin/signup", userCtrl.createAdmin);
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.get("/logout", userCtrl.logout);

//user db
router.get("/user", auth, userCtrl.getAllUsers);
router.get("/user/search", auth, userCtrl.searchUsers);
router.get("/user/:id", auth, userCtrl.getOneUser);
router.put("/user/:id", auth, userCtrl.updateUser);
router.delete("/user/:id", auth, userCtrl.deleteUser);
router.patch("/user/follow/:id", auth, userCtrl.follow);
router.patch("/user/unfollow/:id", auth, userCtrl.unfollow);

//Upload
router.post("/user/upload/:id", auth, multer, userCtrl.uploadUserProfil);

module.exports = router;
