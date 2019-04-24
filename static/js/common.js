//2.获取url地址栏的参数
function getURL(k) {
  var str = decodeURI(location.search) //?..
  //如果?后面没有参数,返回false;
  if (str.length == 0) {
    return false
  }
  var str1 = str.slice(1) //name=zs&age=19
  var arr = str1.split('&')

  var obj = {}
  arr.forEach(function(v, i) {
    var key = v.split('=')[0]
    var value = v.split('=')[1]
    obj[key] = value
  })
  //传参返回字符串,否则返回对象
  return obj[k] || obj
}
// 在一次请求结束之后才能发送第二次请求
let firstTime = false
// 封装ajax请求
function fetch(options) {
  return new Promise(function(resolve, reject) {
    options.data.sysId = sysId
    options.data.appWebFlag = '2'
    $.ajax({
      type: options.type || 'get',
      url: BASE_URL + options.url,
      data: JSON.stringify(options.data || {}),
      contentType: 'application/json',
      beforeSend:options.beforeSend,
      success: resolve,
      error: reject,
      complete:options.complete
    })
  })
}

