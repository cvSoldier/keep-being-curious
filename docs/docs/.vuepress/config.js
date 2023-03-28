import { hopeTheme } from "vuepress-theme-hope";

export default {
  theme: hopeTheme({
    repo: "cvSoldier/keep-being-curious/tree/master/docs",
    repoLabel: "GitHub",
    plugins: {
      blog: {
          excerptLength: 0
      },
    },
  }),
};