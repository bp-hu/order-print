export const PORT = 4300;

export default {
  urlRewrite: {
    "https://canonprint.cn/(?!api)": `http://127.0.0.1:${PORT}/`,
  },
};
