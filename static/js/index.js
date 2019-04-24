$(function() {
  
  // 判断用户是否为预览版,预览版不显示点赞和评论
  // setTimeout(()=>{
  if( getURL('prev') === 'true' ){
    $('.imgFive .icon').addClass('current')
  }else {
    $('.imgFive .icon').removeClass('current')
  }
  if(!getURL('userId')){
    mui.alert('您无权访问此页面,为非法用户!','警告','关闭',function(){
      w_close()
    })
    return
  }
  $('.container').imagesLoaded(function() {
    $('.loading').addClass('current')
    $('.container').removeClass('current')
    // images have loaded
    // 点击dialog框确认按钮时,标记是点赞还是评论
    var flag = null
    // 判断用户是否点赞过
    var isGree = sessionStorage.getItem('isGree')
    if (isGree) {
      $('.icon .gree >img').attr('src', './static/images/img02/yes02.png')
    } else {
      $('.icon .gree >img').attr('src', './static/images/img02/yes01.png')
    }
    var codeTimer = null  //验证码倒计时
    //0. 进入页面发送ajax请求
    //0.1 查询优秀报关员分享的信息
    fetch({
      type: 'post',
      url: '/login/declarant/getDeclarantDetail',
      data: {
        reqData: {
          page: {
            pageIndex: 1,
            pageSize: 10
          },
          userId: getURL('userId')
        }
      }
    }).then(res => {
      if(res.code !== '0000'){
        mui.alert('系统开了会小差,请重新尝试~~~','提示','重新尝试',function(){
          w_close()
        })
        return
      }
      if (res.code !== '' && res.result !== null) {
        
        let stories = [...res.result.stories]
        let S_stories = stories.filter(v => {
          return v.picType === 'S'
        })
        let C_stories = stories.filter(v => {
          return v.picType === 'C'
        })
        let CS_stories = stories.filter(v => {
          return v.picType === 'CS'
        })
        var htmlStr1 = template('tpl_person', res.result)
        var htmlStr2 = template('tpl_myStory', { stories: S_stories })
        var htmlStr3 = `<img src="${CS_stories[0].picUrl}" alt="">
                        <span class="close mui-icon mui-icon-closeempty"></span>
                        <p class="saveGlory">长按图片保存你的专属荣誉</p>`
        $('.imgThree .glory').html(`<img src="${C_stories[0].picUrl}" alt="">`)
        $('.shareImg').html(htmlStr3)
        $('.personDesc').html(htmlStr1)
        $('.myStory').html(htmlStr2)
        $('.imgOne .name').html(res.result.userName)
        $('.message .items>ul').width()
        // 8. 轮播图区域开始
        var mySwiper1 = new Swiper('.story', {
          autoplay: 2000,
          direction: 'vertical',
          loop: true,
          observer:true,
          observeParents:true,
          // pagination: '.swiper-pagination',
          // runCallbacksOnInit: false,
          onTransitionStart: function(e) {
            var index = e.realIndex
            var value = $('.swiper-slide')
              .eq(index + 1)
              .data('description')
            $('.imgDes').html(value)
          }
        })
      }else {
        mui.alert('系统正在努力加载中,请刷新!','提示','刷新',function(){
          window.location.reload()
        })
        return
      }
    })

    //0.2渲染第一页优秀报关员评论的信息，分页
    let nextPage = 1
    let total = 0 // 记录总条数
    renderOne()
  
    // 1.获取相关对象
    var bgImg = document.querySelector('.bgImg')
    var right = document.querySelector('.right')
    var left = document.querySelector('.left')
    var pImg = document.querySelector('.people img')
    var index = 1 //记录人物图片
    var screen = Math.max(innerHeight, innerWidth)
    var mMax = getWidth() - screen // 向左最大的移动距离
    // 2.当长按right按钮时,切换img的地址
    right.addEventListener('touchstart', function(e) {
      e.preventDefault()
      // 左侧按钮隐藏
      left.classList.add('current')
      // 背景动画开启
      bgAnimate(bgImg, -mMax, 3, function() {
        right.classList.add('current')
      })
      //人物行走动画开启
      pMove('front')
    })

    // 3.当松开right按钮时 清除定时器
    right.addEventListener('touchend', function(e) {
      //左侧按钮显示
      left.classList.remove('current')
      // 背景动画暂停
      clearInterval(bgImg.timeId)
      // 清除人物行走定时器
      clearInterval(pImg.timeId)
      pImg.src = './static/images/0.png'
    })
    // 4.当长按左侧按钮时,背景动画从左向右移动
    left.addEventListener('touchstart', function(e) {
      e.preventDefault()
      // 右侧按钮隐藏
      right.classList.add('current')
      // 背景动画开启
      bgAnimate(bgImg, 0, 2, function() {
        left.classList.add('current')
      })
      pMove('back')
    })
    // 5.当松开right按钮时 动画停止
    left.addEventListener('touchend', function() {
      //右侧按钮显示
      right.classList.remove('current')
      clearInterval(bgImg.timeId)
      clearInterval(pImg.timeId)
      pImg.src = './static/images/0.png'
    })

    // 6.添加进场动画
    //第一屏背景移动,人物移动,当第一屏动画结束后,人物停止
    var firstLi = $('.bgImg li')
      .eq(0)
      .width()
    pMove('front')
    bgAnimate(bgImg, -firstLi, 2, function() {
      right.classList.remove('current')
      left.classList.remove('current')
      clearInterval(pImg.timeId)
      pImg.src = './static/images/0.png'
    })
    // 7.动态计算 ul的宽度
    $(window).resize(getWidth)
    // function() {
    //   //只要窗口缩放,bgImg的位置设置为0
    //   mMax = getWidth() - Math.max(innerHeight, innerWidth)
    //   bgImg.style.left = 0
    //   // 右侧按钮显示
    // }
    // 8.点击再看一遍按钮从头开始
    $('.watchAgin').click(function() {
      $('.people img').fadeOut(500)
      $('.bgImg').animate(
        {
          left: 0
        },
        2000,
        'swing',
        function() {
          $('.people img').fadeIn(500)
        }
      )
      right.classList.remove('current')
      left.classList.add('current')
    })
    // 9.点击分享按钮 ,分享的图片显示,其他元素隐藏
    $('.btn-share').click(function() {
      $('.shareImg').show()
      $('.container')
        .children('.control')
        .hide()
    })
    //9.1点击close按钮 图片隐藏
    $('.shareImg').on('click', '.close', function() {
      $('.shareImg').hide()
      $('.container')
        .children('.control')
        .show()
    })
    //10. 控制模态框的显示与隐藏
    // 思路:1.如果首次点击点赞按钮 弹出dialog框,点击确定按钮发送点赞的请求
    //2.请求成功 缓存用户通过点赞注册的手机号
    //3.再次点击点赞按钮 判断缓存有没有通过点赞注册手机号 有的话禁止点赞

    //1.如果首次点击评论按钮 弹出dialog框,点击确定按钮发送评论的请求
    //2.请求成功缓存用户通过评论注册的手机号
    //3.再次点击评论如果有--评论或点赞--注册的手机号 则弹出prompt框
    //10.1 点击点赞按钮,模态框显示
    var reg = /^(1)(3|4|5|6|7|8|9)\d{9}$/
    $('.imgFive .gree').click(function() {
      // var mobile = sessionStorage.getItem('mobile')
      var isGree = sessionStorage.getItem('isGree')
      var mobile = sessionStorage.getItem('mobile')
      if (isGree) {
        mui.toast('您已经点过赞了哦')
        return
      }
      // 如果是评论的手机号则可以直接点赞
      if (mobile) {
        // 发送点赞的请求
        setGree('', mobile)
        return
      }
      // 否则弹出dialog框
      flag = $(this).data('flag')
      $('.dialog').show()
      $('.mui-backdrop').show()
      setTimeout(()=>{$('.dialog .mobile').focus()},500)
    })
    //10.2 设置评论功能
    //点击评论按钮显示模态框
    $('.imgFive .comment').click(function() {
      //无论没有有手机号,就弹出评论框
      // 判断有没有手机号,有直接评论,没有则弹出dialog框
      // var mobile = sessionStorage.getItem('mobile')
      // flag = $(this).data('flag')
      // setComment('',mobile)
      $('.dialog2').show()
      $('.mui-backdrop').show()
      setTimeout(()=>{$('.dialog2 .content').focus()},500)
    })
    // 点击dialog2 取消按钮
    $('.dialog2 .btn-cancel').click(function() {
      $('.dialog2').hide()
      $('.mui-backdrop').hide()
      $('.dialog2 #form2')[0].reset()
    })
    // 点击dialog2 确认按钮
    $('.dialog2 .btn-confirm').unbind('click').click(function() {
      // 看看本地是否存在手机号
      var mobile = sessionStorage.getItem('mobile')
      var content = $('.dialog2 .content').val()
      $('.getCode').text('获取验证码').prop('disabled',false)
      if (!content.trim().length) {
        mui.toast('输入的评论不能为空')
        setTimeout(()=>{$('.dialog2 .content').focus()},500)
        
        return
      }
      if(!mobile) { //不存在
        flag = 2
        $('.dialog').show()
        $('.mui-backdrop').show()
        setTimeout(()=>{$('.dialog .mobile').focus()},500)
        $('.dialog2').hide()
        // $('.mui-backdrop').hide()
        return
      }
      

      // 发送评论的请求
      setComment('',mobile,content)
    })
    //10.3 点击dialog框中的取消按钮 模态框隐藏

    $('.dialog .btn-cancel').click(function() {
      $('.dialog').hide()
      $('.mui-backdrop').hide()
      $('.dialog #form')[0].reset()
      $('.dialog2 #form2')[0].reset()
      $('.getCode').text('获取验证码').prop('disabled',false)
      clearInterval(codeTimer)
      codeTimer = null
      // mui.toast('点赞取消')
    })
    //10.4 点击发送验证码按钮
    $('.getCode').click(function() {
      setTimeout(()=>{$('.codeLine .code').focus()},500)
      
      var mobile = $('input[name="mobile"]').val()
      if (!reg.test(mobile)) {
        // mui.toast('手机号码为空或格式不正确')
        return
      }
      fetch({
        type: 'post',
        url: '/login/login/getValidateCode',
        data: {
          reqData: {
            mobile: mobile,
            type: 'regist'
          }
        }
      }).then(res => {
        // console.log(res)
        if (res.code === '0002') {
          mui.toast('验证码发送成功')
        }
      })
    })
    //10.5 设置dialog框中确认按钮的功能
    $('.dialog #form .btn-confirm').click(function(e) {
      var mobile = $('input[name="mobile"]').val()
      var code = $('input[name="code"]').val()
      // 判断表单是否为空,否则发送ajax请求
      if (!reg.test(mobile)) {
        mui.toast('手机号码为空或格式不正确')
        setTimeout(()=>{$('input[name="mobile"]').focus()},500)
        
        return
      }
      if (code.trim().length === 0) {
        mui.toast('验证码不能为空')
        setTimeout(()=>{$('.codeLine .code').focus()},500)
        return
      }
      if(!codeTimer){
        mui.toast('还未获取验证码')
        return
      }
      if (flag == 1) {
        //发送点赞的ajax请求了
        setGree(code, mobile)
        // $('.dialog').hide()
      }
      if (flag == 2) {
        //发送评论的ajax请求
        var content = $('.dialog2 .content').val()
        
        // $('.dialog #form')[0].reset()
        // $('.dialog2 #form')[0].reset()
        setComment(code, mobile,content)
      }
    })
    //11. 设置验证码倒计时功能
    
    $('.getCode').click(function() {
      var mobile = $('input[name="mobile"]').val()
      if (!reg.test(mobile)) {
        mui.toast('请先输入正确的手机号哦')
        return
      }
      // $('.codeLine .code').prop('disabled',false)
      if (codeTimer) return
      var time = 59
      this.innerText = `剩余时间${time--}秒`
      codeTimer = setInterval(() => {
        if (time <= 0) {
          clearInterval(codeTimer)
          this.innerText = '点击重新发送'
          this.disabled = false
          codeTimer = null
        } else {
          this.disabled = true
          this.innerText = '剩余时间' + time + '秒'
          time--
        }
      }, 1000)
    })

    // 12.点击加载更多按钮,下一屏数据
    $('.message .tips').click(function(){
      render(nextPage)
    })

    // 封装背景动画函数
    function bgAnimate(ele, target, step, fn) {
      ele.timeId = setInterval(function() {
        var posX = ele.offsetLeft
        if (Math.abs(posX - target) <= step) {
          ele.style.left = target + 'px'
          clearInterval(ele.timeId)
          fn && fn()
          return
        }
        if (posX > target) {
          ele.style.left = posX - step + 'px'
        }
        if (posX < target) {
          ele.style.left = posX + step + 'px'
        }
      }, 10)
    }
    // 封装人物行走动画
    function pMove(page) {
      pImg.timeId = setInterval(function() {
        pImg.src = `./static/images/${page}/${
          index < 10 ? '0' + index : index
        }.png`
        index++
        if (index > 12) {
          index = 1
        }
      }, 150)
    }
    // 封装动态计算ul的宽度
    function getWidth() {
      var ulWidth = 2
      $('.bgImg>li').each((i, v) => {
        ulWidth += $(v).width()
      })
      $('.bgImg').width(ulWidth)

      return ulWidth
    }
    // 渲染当前页的留言板数据
    function render() {
      nextPage ++
      if(nextPage > total){
        $('.tips').text('没有更多留言了')
        return 
      }
      fetch({
        type: 'post',
        url: '/login/declarant/getComments',
        data: {
          reqData: {
            page: {
              pageIndex: nextPage || 1,
              pageSize: 10
            },
            userId: getURL('userId')
          }
        },
        beforeSend:function(){
          //loading类名及时判断请求是否结束依据
          if($('.message .tips').hasClass('loading')) {
            return false  // 请求到此结束
          }
          //请求发送之前
          $('.tips').addClass('loading').text('正在加载...')
        },
        complete:function(){
          //请求完成后
          $('.tips').removeClass('loading').text('点击加载更多...')
        }
      }).then(res => {
        if (res.code === '0000') {
          var htmlStr = template('tpl_Minfo', res.result)
          $('.message').find('.items').append(htmlStr)
        }
      })
    }
    // 渲染留言板第一页/评论和点赞数
    function renderOne() {
      fetch({
        type: 'post',
        url: '/login/declarant/getComments',
        data: {
          reqData: {
            page: {
              pageIndex: 1,
              pageSize: 10
            },
            userId: getURL('userId')
          }
        },
        beforeSend:function(){
          //loading类名及时判断请求是否结束依据
          if($('.message .tips').hasClass('loading')) {
            return false  // 请求到此结束
          }
          //请求发送之前
          $('.tips').addClass('loading').text('正在加载...')
        },
        complete:function(){
          //请求完成后
          $('.tips').removeClass('loading').text('点击加载更多...')
        }
      }).then(res => {
        if (res.code === '0000') {
          // var pagenum = []
          total = Math.ceil(res.result.commentCount / res.page.pageSize)
          // for (var i = 0; i < count; i++) {
          //   pagenum.push(i)
          // }
          // res.pagenum = pagenum
          if(res.result.commentCount == 0){
            $('.tips').text('暂无留言')
          }
          var htmlStr = template('tpl_Minfo', res.result)
          $('.icon .number-gree').text(res.result.praiseCount)
          $('.icon .number-comment').text(res.result.commentCount)
          $('.message').find('.items').html(htmlStr)
        }
      })
    }

    // 发送点赞的ajax请求
    function setGree(code, mobile) {
      fetch({
        type: 'post',
        url: '/login/declarant/saveDeclarantComment',
        data: {
          reqData: {
            code: code,
            // "commentContent": "string",
            commentType: 'P',
            mobile: mobile,
            userId: getURL('userId')
          }
        }
      }).then(res => {
        // console.log(res)
        var message = res.message
        if (res.code === '0000') {
          sessionStorage.setItem('mobile', mobile)
          sessionStorage.setItem('isGree', 'true')
          if(res.result) {
              // 赞数 + 1,并缓存用户手机号,且做个通过点赞缓存手机号的标记
            var greeNumber = +$('.icon .number-gree').text()
            // 模态框隐藏
            $('.dialog').hide()
            $('.mui-backdrop').hide()
            $('.dialog #form')[0].reset()
            // 显示+1动画效果
            $('.icon .number-gree').text(greeNumber + 1)
            // 更换点赞的背景图片
            $('.icon .gree>img').attr('src', './static/images/img02/yes02.png')
            // 显示动画效果
            $('.icon .addOne').stop().show().animate({top: -20},function() {
                  $('.icon .addOne').css({top: 0}).hide()
                })
            $('.getCode').text('获取验证码')
            }else {
              mui.toast('您已经点过赞啦~~~')
              $('.dialog #form')[0].reset()
              $('.dialog').hide()
              $('.mui-backdrop').hide()
               //重置手机验证码
               clearInterval(codeTimer)
               codeTimer = null
               $('.getCode').text('获取验证码').prop('disabled',false)
            }
        } else {
          mui.toast(message)
          //重置手机验证码
          $('.dialog #form .code').val('')
          setTimeout(()=>{$('.codeLine .code').focus()},500)
          // clearInterval(codeTimer)
          // codeTimer = null
          // $('.dialog #form .getCode').text('重新获取验证码').prop('disabled',false)
        }
      })
    }

    // 发送评论功能的ajax请求
    function setComment(code, mobile,content) {
        // 发送评论功能请求
        fetch({
          type: 'post',
          url: '/login/declarant/saveDeclarantComment',
          data: {
            reqData: {
              code: code,
              commentContent: content,
              commentType: 'C',
              mobile: mobile,
              userId: getURL('userId')
            }
          }
        }).then(res => {
          var message = res.message
          if (res.code === '0000') {
            // 如果没有存储手机号就存储
            if (!sessionStorage.getItem('mobile')) {
              sessionStorage.setItem('mobile', mobile)
            }
            $('.dialog2 #form2')[0].reset()
            $('.dialog2').hide()
            $('.dialog').hide()
            $('.mui-backdrop').hide()
            //重置手机验证码
            clearInterval(codeTimer)
            codeTimer = null
            $('.getCode').text('重新获取验证码').prop('disabled',false)  
            //渲染留言板张数
            renderOne()
            nextPage = 1
            // mySwiper2.slideTo(0, 1000, false);//切换到第一个slide，速度为1秒
          }else {
            $('.dialog #form .code').val('')
            mui.toast(message)
            setTimeout(()=>{$('.codeLine .code').focus()},500)
            
            //重置手机验证码
            // clearInterval(codeTimer)
            // codeTimer = null
            // $('.dialog #form .getCode').text('重新获取验证码').prop('disabled',false)  
          }
        })
      }
      function w_close(){
        if(typeof(WeixinJSBridge)!="undefined"){
          WeixinJSBridge.call('closeWindow');
        }else{
          if (navigator.userAgent.indexOf("MSIE") > 0) {  
            if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {  
              window.opener = null; window.close();  
            } else {  
              window.open('', '_top'); window.top.close();  
            }  
          } else if (navigator.userAgent.indexOf("Firefox") > 0) {  
            window.location.href = 'about:blank ';  
            //window.history.go(-2);  
          } else {  
            window.opener = null;   
            window.open('', '_self', '');  
            window.close();  
          }
        }
      }
    }
  )
// },2000)
})
