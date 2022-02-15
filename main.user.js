// ==UserScript==
// @name         sinopecMagic
// @namespace   sinopecMagic
// @version      1.7
// @description  This is a sinopecMagic
// @author       zachMelody
// @match        https://sia.sinopec.com/ept/pages/front/exam_review.html*
// @match https://sia.sinopec.com/ept/pages/exam/exam_info.html?ptId=729&nounExtendLogo=post_exam
// @match https://sia.sinopec.com/ept/pages/front/index.html*
// @match https://sia.sinopec.com/*
// @match http://localhost:63342/%E5%B2%97%E4%BD%8D%E7%BB%83%E5%85%B5/%E9%A2%98%E7%9B%AE.html*
// @icon         https://www.google.com/s2/favicons?domain=sinopec.com
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @run-at      document-idle
// ==/UserScript==

https: (function () {
  'use strict';
  let API_URL = 'http://192.168.3.204:8012';
  console.log('答题脚本初始化...');

  function post(data) {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${API_URL}/api`,
      data: data,
      onload: function (response) {
        console.log('请求成功');
        sendQuestionsFlag = true;

        console.log(response.responseText);
      },
      onerror: function (response) {
        console.log('请求失败');
      },
    });
  }

  //打开在线岗位练兵考试页面
  function fixedOpenPostExam(ptId, nounExtendLogo) {
    $.ajax({
      url: configInfo.learn_url + '/operationController/createSafeKey.do',
      type: 'POST',
      data: {
        activityType: 'POSTEXAM',
        activityId: ptId,
      },
      dataType: 'json',
      success: function (result) {
        if (result && result.success && result.responseData) {
          var url =
            '../exam/exam_info.html?ptId=' +
            ptId +
            '&nounExtendLogo=' +
            nounExtendLogo;
          window.open(url, 'user_exam');
        }
      },
      error: function () {
        layer.alert('操作失败！<br>服务器访问异常！', {
          skin: 'layui-layer-lan',
          icon: 2,
          title: '警告',
        });
      },
    });
  }

  //新建标签页
  function jump(url) {
    $('<a target="_blank"></a>').attr('href', url)[0].click();
  }
  // 完全体答题页面
  function fixPageBtn() {
    console.log('完全体答题页面...');
    let targetTd = $('#postExamTable > table > tbody > tr > td:nth-child(6)');
    let btn = $('<button>1. 进入答题准备阶段</button>');
    btn.click(function () {
      fixedOpenPostExam(1079, 'post_exam');
    });
    targetTd.append(btn);
    btn.prependTo('body');

    // <a href="javascript:void(0)" onclick="openPostExam(729,'post_exam')">进入</a>
    //targetTd.append("<a href='javascript:void(0)' onclick='fixedOpenPostExam(729,'post_exam')'>进入。。</a>");
  }
  // 发送题库功能
  function sendQuestions() {
    let jsonContent = JSON.stringify($UserExam.examPaperInfo.partitions[0]);
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${API_URL}/api`,
      data: jsonContent,
      headers: { 'Content-Type': 'application/json' },

      onload: function (response) {
        console.log('请求成功');
        console.log(response.responseText);
        // answers = response.responseText.data;
      },
      onerror: function (response) {
        console.log('请求失败');
      },
    });
  }
  // 在准备开始界面，发送题库
  function sendQuestionsBtn() {
    console.log('准备发送题目按钮...');
    let btn = $('<button>2. 发送并显示题目</button>');
    btn.click(sendQuestions);
    btn.prependTo('body');
  }

  //在页面加入控制按钮
  function add() {
    let b = $('<button>忽略：保存HTML</button>');

    let showAnswersBtn = $('<button id="moded">3. 显示答案</button>');
    showAnswersBtn.prependTo('body');
    showAnswersBtn.click(function () {
      showAnswers();
    });

    b.prependTo('body');
    b.click(function () {
      b.remove();
      snapshot();
      add();
    });
  }

  // 展示答案
  function showAnswers() {
    console.log('展示答案');
    let answers = 0;
    GM_xmlhttpRequest({
      method: 'GET',
      responseType: 'json',
      url: `${API_URL}/result`,
      onload: function (response) {
        console.log('请求成功');
        answers = response.response.data;
        console.log(response.response);
        console.log(typeof response.response);
        drawTable(answers);
      },
      onerror: function (response) {
        console.log('请求失败');
      },
    });
  }
  // 绘制
  function drawTable(answers) {
    let table_html = `<table style="
    position: fixed;
    right: 0;
    top: 0%;
    width: 300px;
    table-layout: fixed;
    background-color: rgb(9 203 255 / 20%);
">
  <tr>
    <th>题号</th>
    <th>答案</th>
    <th>题型</th>
    <th>题目</th>
  </tr>
  <tr>
    <td>Alfreds Futterkiste</td>
    <td>Maria Anders</td>
    <td>Germany</td>
    <td>Germany2</td>
  </tr>
  <style type="text/css">
  td {white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100px;}
  </style>
</table>`;
    $(table_html).prependTo('body');
    console.log(answers);
    answers.forEach(function (element) {
      let tmp_str = `<tr>
        <td>${element.num}</td>
        <td style="color: red;">${element.answer}</td>
        <td>${element.question}</td>
        <td>${element.type}</td>
      </tr>`;
      $('table').append(tmp_str);
    });
    let map = new Map();
    map.set('A', 0);
    map.set('B', 1);
    map.set('C', 2);
    map.set('D', 3);
    map.set('对', 0);
    map.set('错', 1);
    answers.forEach(function (element) {
      $(`#que_${element.num}`)
        .children('.row')
        .append(`<p style="color:red">${element.answer}</p>`);
      //let search_url = `https://www.google.com/search?q=${element.question}`;
      //$(`#que_${element.num}`).children('.row').append(`<a href="${search_url}" target="_blank"> 搜题 </a>`)
      try {
        // 选择
        let radio_list = $(`#que_${element.num}`).find('.radio input');
        if (radio_list.length == 0) {
          radio_list = $(`#que_${element.num}`).find('.checkbox input');
        }

        if (radio_list.length >= 1 && radio_list.length <= 6) {
          let answerList = element.answer.split('');
          answerList.forEach(function (element) {
            let idx = map.get(element);
            radio_list[idx].click();
          });
        }
      } catch (error) {
        console.error(error);
      }
    });

    // 搜题

    for (let i = 1; i <= 50; i++) {
      let topic = $(`#que_${i} > div.row > div.col-xs-10`);
      let que_str = topic[0].textContent;
      let mod_que_str = que_str.substring(10, que_str.length - 9);
      let search_url = `https://www.google.com/search?q=${mod_que_str}`;
      let search_url2 = `https://www.baidu.com/s?wd=${mod_que_str}`;
      $(`#que_${i}`)
        .children('.row')
        .append(
          `<a href="${search_url2}" target="_blank"> 搜题♥百度_____     </a>`
        );
      $(`#que_${i}`)
        .children('.row')
        .append(`<a href="${search_url}" target="_blank"> ____搜题♥谷歌 </a>`);
    }
  }

  function snapshot() {
    post(document.documentElement.outerHTML);
  }

  add();
  fixPageBtn();
  sendQuestionsBtn();

  setInterval(function () {
    if ($('#moded')[0] == null) {
      add();
      fixPageBtn();
      sendQuestionsBtn();
      console.log('刷新按钮');
    } else {
      console.log('已加载按钮');
    }
  }, 1000);

  let sendQuestionsFlag = false;
  //do something
  function checkUrl() {
    let url = window.location.href;
    switch (url) {
      case 'https://sia.sinopec.com/learn/index.html':
        if (confirm('是否跳转智能练兵页面？')) {
          window.location.href =
            'https://sia.sinopec.com/ept/pages/front/index.html';
        }
        break;
      case 'https://sia.sinopec.com/ept/pages/front/index.html':
        if (confirm('是否开始准备？')) {
          fixedOpenPostExam(1079, 'post_exam');
        }
        break;
      case 'https://sia.sinopec.com/ept/pages/exam/exam_info.html?ptId=1079&nounExtendLogo=post_exam':
        if (confirm('是否开始答题')) {
          sendQuestions();
          alert(sendQuestionsFlag ? '获取答案成功' : '获取答案失败');
          if (sendQuestions && confirm('请再次确认是否开始答题')) {
            startExam();
          } else {
            try {
              window.close();
            } catch (e) {}
          }
        }
        break;
      case 'https://sia.sinopec.com/ept/pages/exam/exam_answer.html':
        if (confirm('是否显示答案？')) {
          showAnswers();
        }
        break;
      default:
        console.log(`Sorry, we are out of ${url}.`);
    }
  }
  const myTimeout = setTimeout(checkUrl, 1500);
})();
