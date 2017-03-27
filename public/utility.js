module.exports = {
  generateQueryString: function (data) {
    var ret = []
    for (var d in data)
      if (data[d])
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]))
    return ret.join("&")
  },

  base64Encoding: function (data) {
    return new Buffer(data).toString('base64')
  },

  base64Decoding: function (data) {
    return new Buffer(data, 'base64')
  },
  
  getUnixTimeStamp: function () {
    return Math.floor((new Date).getTime() / 1000)
  },

  stringReplace: function (source, find, replace) {
    return source.replace(find, replace)
  }
}
