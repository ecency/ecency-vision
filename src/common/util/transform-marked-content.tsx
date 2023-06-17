import htmlParse from "html-react-parser";
import { Element } from "domhandler";
import React from "react";

export const transformMarkedContent = (content: string) => {
  return htmlParse(content, {
    replace: (domNode) => {
      // Only text and <mark> elements
      if (domNode.type === "text" || (domNode instanceof Element && domNode.name === "mark")) {
        return domNode;
      }

      return <></>;
    }
  });
};
