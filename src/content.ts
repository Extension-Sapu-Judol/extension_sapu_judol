type CommentData = {
  id: number;
  text: string;
};

const getYouTubeComments = (): CommentData[] => {
  const commentElements =
    document.querySelectorAll<HTMLElement>("#content-text");
  const comments: CommentData[] = [];

  commentElements.forEach((el, index) => {
    const text = el.textContent?.trim();
    if (text) {
      // Tambahkan atribut data-comment-id ke elemen DOM
      el.setAttribute("data-comment-id", index.toString());

      // Simpan data komentar untuk diproses/logging
      comments.push({ id: index, text });
    }
  });

  return comments;
};

const setYoutubeComments = (comment: CommentData) => {
  const el = document.querySelector<HTMLElement>(
    `#content-text[data-comment-id="${comment.id}"]`
  );

  if (el) {
    el.textContent = "new text";
  }
};

let sentCommentIds = new Set<number>();

const observeComments = () => {
  setInterval(() => {
    const comments = getYouTubeComments();
    console.clear();
    comments.forEach((comment) => {
      if (!sentCommentIds.has(comment.id)) {
        setYoutubeComments(comment);
        sentCommentIds.add(comment.id);
      }
    });
  }, 2000);
};

const waitForYouTubeComments = () => {
  const interval = setInterval(() => {
    const commentSection = document.querySelector("ytd-comments");
    if (commentSection) {
      clearInterval(interval);
      observeComments();
    }
  }, 1000);
};

waitForYouTubeComments();
