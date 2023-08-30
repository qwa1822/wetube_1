const form = document.getElementById("commentForm");

const videoContainer = document.getElementById("videoContainer");

const deleteComment = document.querySelectorAll("#delete__comment");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments");
  const newComment = document.createElement("li");

  newComment.dataset.id = id;
  newComment.className = "video__comment";
  newComment.style.listStyle = "none";
  const icon = document.createElement("i");

  icon.className = `fas fa-comment`;
  const span = document.createElement("span");

  const span2 = document.createElement("span");
  span2.id = "delete__comment";
  span2.innerText = "❌";

  span.innerText = ` ${text}`;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);

  videoComments.prepend(newComment);

  span2.addEventListener("click", handleDelete);
};

const handleDelete = async event => {
  const deleteComment = event.target.parentElement;

  const {
    dataset: { id },
  } = deleteComment;

  const videoId = videoContainer.dataset.id;

  console.log(videoId);
  const response = await fetch(`/api/videos/${videoId}/comment/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId: id }),
  });

  if (response.status === 200) {
    deleteComment.remove();
  }
};

const handleSubmit = async e => {
  e.preventDefault();

  const textArea = form.querySelector("textarea");

  const text = textArea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  textArea.value = "";
  const { newCommentId } = await response.json();

  if (response.status === 201) {
    addComment(text, newCommentId);
  }

  // window.location.reload();
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteComment) {
  deleteComment.forEach(item => item.addEventListener("click", handleDelete));
}
