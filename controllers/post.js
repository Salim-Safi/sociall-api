const Post = require("../models/Post");
const User = require("../models/User");
const storage = require("../firebase");
const { ref, uploadBytesResumable, deleteObject } = require("firebase/storage");

module.exports.readPost = (req, res, next) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then((posts) => res.status(200).json(posts))
    .catch((error) => res.status(400).json({ error }));
};

module.exports.createPost = (req, res, next) => {
  const postObject = { ...req.body };
  delete postObject._id;
  delete postObject._userId;

  let fileName;
  if (req.file) {
    const storageRef = ref(
      storage,
      `${"/post/" + req.file.originalname.split(" ").join("_") + Date.now()}`
    );

    const filePath = storageRef.fullPath;
    fileName = filePath.split("/").pop();
    const metadata = {
      contentType: req.file.mimetype,
    };

    uploadBytesResumable(storageRef, req.file.buffer, metadata).then(
      (snapshot) => {
        console.log("file oploaded");
      }
    );
  }

  const post = new Post({
    ...postObject,
    userId: req.auth.userId,
    video: req.body.video,
    likers: [],
    comments: [],
    picture: req.file ? fileName : null,
  });

  post
    .save()
    .then(() => res.status(201).json({ message: "Post enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

module.exports.updatePost = (req, res, next) => {
  const postObject = { ...req.body };
  delete postObject._userId;
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (
        !(req.auth.role === "administrateur" || post.userId == req.auth.userId)
      ) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Post.updateOne(
          { _id: req.params.id },
          { ...postObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Post modifiés !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

module.exports.deletePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (
        !(req.auth.role === "administrateur" || post.userId == req.auth.userId)
      ) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        if (post.picture !== null) {
          const desertRef = ref(storage, `${"/post/" + post.picture}`);

          deleteObject(desertRef)
            .then(() => {
              console.log("File deleted successfully");
            })
            .catch((error) => {
              console.log("Uh-oh, an error occurred! " + error);
            });
        }

        Post.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Post supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      Post.updateOne(
        { _id: req.params.id },
        { $addToSet: { likers: req.auth.userId }, _id: req.params.id }
      ).catch((error) => res.status(400).json({ error }));
      User.updateOne(
        { _id: req.auth.userId },
        { $addToSet: { likes: req.params.id } }
      )
        .then(() => res.status(200).json({ message: "Like ajouté !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.unlikePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      Post.updateOne(
        { _id: req.params.id },
        { $pull: { likers: req.auth.userId }, _id: req.params.id }
      ).catch((error) => res.status(400).json({ error }));
      User.updateOne(
        { _id: req.auth.userId },
        { $pull: { likes: req.params.id } }
      )
        .then(() => res.status(200).json({ message: "Like supprimé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.commentPost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      Post.updateOne(
        { _id: req.params.id },
        {
          $push: {
            comments: {
              commentereId: req.auth.userId,
              text: req.body.text,
              timestamp: new Date().getTime(),
            },
          },
        }
      )
        .then(() => res.status(200).json({ message: "Commentaire ajouté !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.editCommentPost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      const theComment = post.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );

      if (theComment.commentereId !== req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      }

      if (!theComment) return res.status(404).send("Comment not found");
      theComment.text = req.body.text;

      return post
        .save()
        .then(() => res.status(201).json({ message: "Commentaire modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteCommentPost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (
        !(
          req.auth.role === "administrateur" ||
          post.comments[0].commentereId == req.auth.userId
        )
      ) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Post.updateOne(
          { _id: req.params.id },
          {
            $pull: {
              comments: {
                _id: req.body.commentId,
              },
            },
          }
        )
          .then(() =>
            res.status(200).json({ message: "Commentaire supprimé !" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
