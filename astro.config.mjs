import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import dayjs from "dayjs";
import fs from "fs";
import { defineConfig } from "astro/config";
import { parse } from "node-html-parser";
import { SITE } from "./src/config";

const DEFAULT_FORMAT = "YYYY/MM/DD";
const WEEKLY_REPO_NAME = "tw93/weekly";

function getCreateDateFormat(filePath) {
  return dayjs(fs.statSync(filePath).birthtime).format(DEFAULT_FORMAT);
}

function getWeeklyDateFormat(num) {
  if (num < 100) {
    return dayjs("2022-10-10")
      .subtract(100 - num, "week")
      .format(DEFAULT_FORMAT);
  }
  return getCreateDateFormat(filePath);
}

function defaultLayoutPlugin() {
  return function (tree, file) {
    const filePath = file.history[0];
    const { frontmatter } = file.data.astro;
    frontmatter.layout = "@layouts/post.astro";

    if (tree.children[0]?.value && !frontmatter.pic) {
      const imageElement = parse(tree.children[0].value).querySelector("img");
      frontmatter.pic = imageElement.getAttribute("src");
    }

    if (tree.children[1]?.children[1]?.value) {
      frontmatter.desc = tree.children[1].children[1].value;
    }

    frontmatter.desc = frontmatter.desc || SITE.description;
    frontmatter.pic = frontmatter.pic || SITE.pic;

    if (!frontmatter.date) {
      frontmatter.date =
        SITE.repo === WEEKLY_REPO_NAME
          ? getWeeklyDateFormat(filePath.split("/posts/")[1].split("-")[0])
          : getCreateDateFormat(filePath);
    }

    if (SITE.repo === WEEKLY_REPO_NAME) {
      frontmatter.twitterImg = getTwitterImg(
        filePath.split("/posts/")[1].split("-")[0]
      );
    }
  };
}

export default defineConfig({
  integrations: [react(), tailwind()],
  markdown: {
    remarkPlugins: [defaultLayoutPlugin],
  },
});
