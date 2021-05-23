module.exports = {
    GetTime: async (data, params, query) => {
      return new Promise((resolve, reject) => {
        var current = new Date();
        resolve(current);
      });
    },
}