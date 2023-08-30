import User from "../models/User";
import Video from "../models/video";
import Comment from "../models/Comment";
import bcrypt from "bcrypt";

// DeleteVideo,
// editVideo,
// getUpload,
// handleWatchVideo,
// postEdit,
// postUpload,
// see,

// handleEdit, handleHome, search

export const handleEdit = async (req, res) => {
  const { id } = req.params;

  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "page not found" });
  }
  console.log(video.owner, _id);
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Noth authorize");
    return res.status(403).redirect("/");
  }

  req.flash("sccuess", "changeS saved");

  return res.render("edit", { pageTitle: "hello EditWorld", video });
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", {
    pageTitle: "Edit Profile",
  });
};
export const EditPost = async (req, res) => {
  const {
    session: {
      user: { _id, username: sessionName, email: sessioEmail, avatarUrl },
    },

    body: { name, email, username, location },
    file,
  } = req;

  let answerBox = [];
  if (sessionName !== name) {
    answerBox.push({ username });
  }
  if (sessioEmail !== email) {
    answerBox.push({ email });
  }

  if (answerBox.length > 0) {
    let findOneUser = await User.findOne({
      $or: answerBox,
    });

    if (findOneUser && findOneUser._id.toString() !== _id) {
      return res.status(400).render("edit-profile", {
        pageTitie: "Error Profile",
        ErrorMessage: "is name/email already in token",
      });
    }
  }

  let newUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    {
      new: true,
    }
  );

  req.session.user = newUser;

  return res.redirect("/uesrs/edit");
};

export const editVideo = async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "page not found" });
  }
  return res.render("edit", { pageTitle: "hello EditWorld", video });
};

export const DeleteVideo = async (req, res) => {
  const { id } = req.params;

  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect("/");
};

export const getUpload = (req, res) => {
  return res.render("upload");
};

export const handleWatchVideo = (req, res) => {};

export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,

    hashtags: Video.formatHashtags(hashtags),
  });

  return res.redirect(`/videos/${id}`);
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  const { video, thumb } = req.files;

  console.log(video, thumb);
  const {
    user: { _id },
  } = req.session;

  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: Video.changePathFormula(thumb[0].path),
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    console.log(newVideo);
    return res.redirect("/");
  } catch (error) {
    return res.status(404).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const see = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");

  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Cant change Password");
    return res.redirect("/");
  }

  return res.render("users/change-password", {
    pageTitle: "change Password",
  });
};
export const postChangePassword = async (req, res) => {
  // 비밀번호를 비교하고,
  // 비밀번호가 다르면 errormessage 출력

  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const userPw = await bcrypt.compare(oldPassword, user.password);

  if (!userPw) {
    return res.render("users/change-password", {
      pageTitle: "Error Passowrd",
      errorMessage: "OldPassword not match  ",
    });
  }

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Error Passowrd",
      errorMessage: "password not match ",
    });
  }

  user.password = newPassword;
  req.flash("info", "Password Update");

  await user.save();

  return res.redirect("/uesrs/logout");
};

export const RegesiterView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();

  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    body: { commentId },
    params: { id },
  } = req;

  console.log(req.body);

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }
  video.comments = video.comments.filter(item => item.id !== commentId);
  video.save();

  await Comment.findByIdAndDelete(commentId);
  return res.sendStatus(200);
};
