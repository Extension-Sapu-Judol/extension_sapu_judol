import { Axios, AxiosError } from "axios";
import type { PlasmoCSConfig } from "plasmo";
import browser from "webextension-polyfill";

import { axiosInstance } from "./services/api";

export const config: PlasmoCSConfig = {
  matches: ["*://www.youtube.com/*"]
};

type CommentData = {
  id: string;
  text: string;
  is_judol?: boolean;
};

let sentCommentIds = new Set<string>();
let intervalId: ReturnType<typeof setInterval> | null = null;

async function isSapuJudolEnabled(): Promise<boolean> {
  const result = await browser.storage.local.get("sapuJudolEnabled");
  const enabled = (result as { sapuJudolEnabled?: boolean }).sapuJudolEnabled;
  return enabled ?? true;
}

// Get Video ID from URL
function getYouTubeVideoId(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get("v");
}

// Get all comments and set ID
function getYouTubeComments(): CommentData[] {
  const commentElements =
    document.querySelectorAll<HTMLElement>("#content-text");
  const comments: CommentData[] = [];
  const videoId = getYouTubeVideoId();

  if (!videoId) return [];

  commentElements.forEach((el, index) => {
    const text = el.textContent?.trim();
    const commentId = `${videoId}-${index}`;

    if (text) {
      el.setAttribute("data-comment-id", commentId);
      comments.push({ id: commentId, text });
    }
  });

  return comments;
}

// Send comments to backend and change text if need it
async function setYoutubeComment(comment: CommentData) {
  try {
    if (document.visibilityState !== "visible") return;

    const el = document.querySelector<HTMLElement>(
      `#content-text[data-comment-id="${comment.id}"]`
    );

    if (el && comment.is_judol) {
      el.textContent = "Komentar disensor oleh Sapu Judol.";
    }
  } catch (err) {
    console.warn(`[Sapu Judol] Gagal memproses komentar ${comment.id}`, err);
  }
}

// Run every 2 seconds to check for new comments
async function observeComments() {
  if (intervalId) clearInterval(intervalId);

  const enabled = await isSapuJudolEnabled();
  if (!enabled) {
    console.log("[Sapu Judol] Extension sedang dinonaktifkan.");
    return;
  }

  intervalId = setInterval(async () => {
    const comments = getYouTubeComments();

    const filteredComments = await axiosInstance.post(
      "/filter_comments",
      comments
    );

    console.log(filteredComments.data);
    if (!(filteredComments instanceof AxiosError))
      filteredComments.data.comments.forEach((comment) => {
        if (!sentCommentIds.has(comment.id)) {
          setYoutubeComment(comment);
          sentCommentIds.add(comment.id);
        }
      });
  }, 2000);
}

// Run when if first comments is available
function waitForYouTubeComments() {
  const checkInterval = setInterval(() => {
    const commentSection = document.querySelector("ytd-comments");
    if (commentSection) {
      clearInterval(checkInterval);
      observeComments();
    }
  }, 1000);
}

// Deteck video navigation on Youtube
function observePageNavigation() {
  let lastUrl = location.href;

  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log("[Sapu Judol] Navigasi video baru terdeteksi.");
      sentCommentIds.clear();

      if (intervalId) clearInterval(intervalId); // Stop old loop
      waitForYouTubeComments(); // Start over again
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Initialization
waitForYouTubeComments();
observePageNavigation();
