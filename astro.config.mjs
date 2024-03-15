import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import dayjs from "dayjs";
import fs from "fs";
import { defineConfig } from "astro/config";
import { parse } from "node-html-parser";
import { SITE } from "./src/config";
import vercel from "@astrojs/vercel/serverless";

const DEFAULT_FORMAT = "YYYY/MM/DD";
// TODO: 日期
function getCreateDateFormat(filePath) {
  console.log("filePath", fs.statSync(filePath).birthtime);
  return dayjs(fs.statSync(filePath).birthtime).format(DEFAULT_FORMAT);
}

function defaultLayoutPlugin() {
  return function (tree, file) {
    const filePath = file.history[0];
    const { frontmatter } = file.data.astro;
    file.data.astro.frontmatter.layout = "@layouts/post.astro";

    // 头图放到文档中的第一行，会自动帮你处理，也可以用 frontmatter 方式，赋值给 pic 字段
    if (tree.children[0]?.value) {
      const imageElement = parse(tree.children[0].value).querySelector("img");
      file.data.astro.frontmatter.pic = imageElement.getAttribute("src");
    }

    if (tree.children[1]?.children[1]?.value) {
      frontmatter.desc = tree.children[1].children[1].value;
    }

    frontmatter.desc = frontmatter.desc || SITE.description;
    frontmatter.pic = frontmatter.pic || SITE.pic;

    if (!frontmatter.date) {
      frontmatter.date = getCreateDateFormat(filePath);
    }

    // 兼容没有头图的情况
    // if (!pic) {
    //   file.data.astro.frontmatter.pic = SITE.pic;
    // }

    // //这里也可以直接在 frontmatter，赋值给 date 字段
    // if (!date) {
    //   const createDate = dayjs(fs.statSync(filePath).birthtime).format(
    //     "YYYY/MM/DD"
    //   );
    //   file.data.astro.frontmatter.date = createDate;
    // }
  };
}

export default defineConfig({
  integrations: [react(), tailwind()],
  markdown: {
    remarkPlugins: [defaultLayoutPlugin],
  },
});
