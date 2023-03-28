import { hopeTheme } from "vuepress-theme-hope";

export default {
  theme: hopeTheme({
    plugins: {
      blog: {
          excerptLength: 0
      },
    },
  }),
};