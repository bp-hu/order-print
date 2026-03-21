export const PORT = 4300;

export default {
  urlRewrite: {
    "http://47.102.196.29/(?!api)": `http://127.0.0.1:${PORT}/`,
  },
};
