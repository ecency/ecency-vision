import { Entry } from "../../../../store/entries/types";
import { renderPostBody } from "@ecency/render-helper";

export function renderLiketu(entry: Entry) {
  const postTree = document.createElement("div");
  const shadow = postTree.attachShadow({ mode: "open" });

  shadow.innerHTML = renderPostBody(entry, true, true);
  console.log(shadow.innerHTML);
  const images = Array.from(shadow.querySelectorAll("img"));
  const content = Array.from(shadow.querySelectorAll("p"));
  const text = content[content.length - 1].innerText;

  shadow.innerHTML = `<div class="ecency-liketu-post">
    <div class="images-slider overflow-x-auto flex gap-3">
      ${images.map(
        (image) => `<img class="w-full max-h-[400px] block" src="${image.src}" alt=""/>`
      )}
    </div>
    ${text ? `<div class="liketu-text mt-4">${text}<d/iv>` : ""}
  </div>`;

  return shadow.innerHTML;
}
