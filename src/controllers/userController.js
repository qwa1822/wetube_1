import User from "../models/User";
import Video from "../models/video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

require("dotenv").config();

export const getjoin = (req, res) => {
  return res.render("join", { pageTitle: "Create Account" });
};

export const logout = (req, res) => {
  req.session.destroy();

  return res.redirect("/");
};
export const postjoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;

  if (password !== password2) {
    return res.render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const exists = await User.exists({
    $or: [{ username }, { email }],
  });

  const pageTitle = "Join";
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "THis username/email is already taken",
    });
  }
  try {
    let user = await User.create({
      email,
      username,
      password,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("error", {
      pageTitle,
      errorMessage: "error ",
    });
  }
};

export const getlogin = (req, res) => {
  return res.render("login", { pageTitle: "login" });
};

export const postlogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  const pageTitle = "Login";
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exissts",
    });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Password",
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;

  let videos = [];

  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`^${keyword}`, "i"),
      },
    }).populate("owner");
  }

  return res.render("search", { pageTitle: "Search", videos });
};

export const handleHome = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  console.log(videos);
  const validvideos = videos.filter(item => item.owner !== null);
  console.log(videos);
  return res.render("home", { pageTitle: "Home", videos: validvideos });
};

export const startGithubLogin = (req, res) => {
  const clientId = "d0ddff898b8b3975ea9e";

  const baseUrl = `https://github.com/login/oauth/authorize`;

  const config = {
    client_id: "d0ddff898b8b3975ea9e",
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseUrl}?${params}`;

  return res.redirect(finalURL);
};

export const finalGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };

  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    // access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      email => email.primary === true && email.verified === true
    );

    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
      req.session.loggedIn = true;
      req.session.user = user;

      return res.redirect("/");
    }
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const kakaoStart = (req, res) => {
  const client_id = "7cf3d1d8dd1cc067af3dd8586e4cea7d";

  const kakao_base = "https://kauth.kakao.com/oauth/authorize";

  const config = {
    client_id: "7cf3d1d8dd1cc067af3dd8586e4cea7d",
    redirect_uri: "http://localhost:4000/uesrs/kakaofinish",
    response_type: "code",
  };

  const params = new URLSearchParams(config).toString();

  let lastPage = `${kakao_base}?${params}`;

  return res.redirect(lastPage);
};

export const kakaofinish = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const client_id = "7cf3d1d8dd1cc067af3dd8586e4cea7d";

  const config = {
    grant_type: "authorization_code",
    client_id: "7cf3d1d8dd1cc067af3dd8586e4cea7d",
    redirect_url: "http://localhost:4000/uesrs/kakao/finish",
    code: req.query.code,
  };

  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const apiUrl = "https://kapi.kakao.com/v2/user/me";

    const { access_token } = tokenRequest;
    const userDataResponse = await (
      await fetch(`${apiUrl}`, {
        headers: {
          Authorization: `Bearer ${access_token}`, // Fix: "Bearer" instead of "token"
        },
      })
    ).json();

    const kakaoAccount = userDataResponse.kakao_account;
    const kakaoProfile = kakaoAccount.profile;

    if (
      kakaoAccount.is__email_valid === false ||
      kakaoAccount.is__email__verified === false
    ) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: kakaoAccount.email });

    if (!user) {
      user = await User.create({
        name: kakaoProfile.name,
        socialOnly: true,
        username: kakaoProfile.nickname,
        email: kakaoAccount.email,
        password: "",
        location: "",
        avatarUrl: kakaoProfile.profile_image_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
  } else {
    return res.redirect("/login");
  }
};

export const See = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
  });

  console.log(user);

  if (!user) {
    return res.status(404).render("404", {
      pageTitle: "user not found",
    });
  }

  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
