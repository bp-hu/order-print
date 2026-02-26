export const PORT = 4300;

export default {
  urlRewrite: {
    "http://120.48.87.222/api/(.+)": "http://120.48.87.222:8000/api/$1",
    "http://120.48.87.222/": `http://127.0.0.1:${PORT}/`,
  },
};
