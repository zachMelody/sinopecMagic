// ==UserScript==
// @name         上海石化智能练兵
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  try to take over the world!
// @author       You
// @match        https://sia.sinopec.com/ept/pages/front/exam_review.html*
// @match https://sia.sinopec.com/ept/pages/exam/exam_info.html?ptId=729&nounExtendLogo=post_exam
// @match https://sia.sinopec.com/ept/pages/front/index.html*
// @match https://sia.sinopec.com/*
// @updateURL https://raw.githubusercontent.com/zachMelody/sinopecMagic/main/main.user.js
// @downloadURL https://raw.githubusercontent.com/zachMelody/sinopecMagic/main/main.user.js
// @icon         https://www.google.com/s2/favicons?domain=sinopec.com
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @run-at      document-idle
// ==/UserScript==

(function() {
    'use strict';
    console.log("答题脚本初始化...");

    function post(data){
        GM_xmlhttpRequest({
            method: "POST",
            url: 'http://127.0.0.1:5000/api',
            data: data,
            onload: function(response){
                console.log("请求成功");
                console.log(response.responseText);
            },
            onerror: function(response){
                console.log("请求失败");
            }
        });
    }

    //打开在线岗位练兵考试页面
    function fixedOpenPostExam(ptId, nounExtendLogo) {
        $.ajax({
            url: configInfo.learn_url + "/operationController/createSafeKey.do",
            type: "POST",
            data: {
                activityType : "POSTEXAM",
                activityId : ptId
            },
            dataType: "json",
            success: function(result) {

                if(result && result.success && result.responseData) {

                    var url = "../exam/exam_info.html?ptId=" + ptId + "&nounExtendLogo=" + nounExtendLogo;
                    window.open(url, "user_exam");
                }
            },
            error: function() {
                layer.alert('操作失败！<br>服务器访问异常！', {
                    skin: 'layui-layer-lan',
                    icon: 2,
                    title: '警告'
                });
            }
        });
    }

    //新建标签页
    function jump(url){
        $('<a target="_blank"></a>').attr('href',url)[0].click();
    }
    // 完全体答题页面
    function fixPageBtn(){
        console.log("完全体答题页面...");
        let targetTd = $("#postExamTable > table > tbody > tr > td:nth-child(6)");
        let btn = $('<button>1. 进入答题准备阶段</button>');
        btn.click(function(){
            fixedOpenPostExam(729,'post_exam')
        });
        targetTd.append(btn);
        btn.prependTo('body');

        // <a href="javascript:void(0)" onclick="openPostExam(729,'post_exam')">进入</a>
        //targetTd.append("<a href='javascript:void(0)' onclick='fixedOpenPostExam(729,'post_exam')'>进入。。</a>");
    }

    // 在准备开始界面，发送题库
    function sendQuestionsBtn(){
        console.log("准备发送题目按钮...");
        let btn = $('<button>2. 发送并显示题目</button>');
        btn.click(function(){
            let jsonContent = JSON.stringify($UserExam.examPaperInfo.partitions[0]);
            GM_xmlhttpRequest({
                method: "POST",
                url: 'http://127.0.0.1:5000/api',
                data: jsonContent,
                headers: {"Content-Type" : "application/json"},

                onload: function(response){
                    console.log("请求成功");
                    console.log(response.responseText);
                    answers = response.responseText.data;
                },
                onerror: function(response){
                    console.log("请求失败");
                }
            });
        });
        btn.prependTo('body');

    }

    //在页面加入控制按钮
    function add(){
        var b=$('<button>忽略：保存HTML</button>');

        let showAnswersBtn = $('<button>忽略：showAnswersBtn</button>');
        showAnswersBtn.prependTo('body');
        showAnswersBtn.click(function(){
            showAnswers();
        });

        b.prependTo('body');
        b.click(function(){
            b.remove();
            snapshot();
            add();
        });
    }

    // 展示答案
    function showAnswers() {
        console.log("展示答案");
        console.log(answers);
        let show_html = `<table border="1">
  <tr>
    <th>Month</th>
    <th>Savings</th>
  </tr>
  <tr>
    <td>January</td>
    <td>$100</td>
  </tr>
</table>`
    }

    function snapshot(){
        post(document.documentElement.outerHTML);
    }

    let answers = 0;
    add();
    fixPageBtn();
    sendQuestionsBtn();

    //do something



})();
