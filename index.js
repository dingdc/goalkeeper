//
// 自动化截取刷卡资料
//


'use strict';	// Whole-script strict mode applied.

const http = require('http');   // NOTE: import default module
const fs = require('fs');       // NOTE: import default module
const querystring = require('querystring'); // NOTE: import default module

//
// Step 1: Open login page to get cookie 'ASP.NET_SessionId' and hidden input '_ASPNetRecycleSession'.
//
var _ASPNET_SessionId;
var _ASPNetRecycleSession;

function openLoginPage() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===200) {
                let fo = fs.createWriteStream('tmp/step1-LoginPage.html');
                fo.write(html);
                fo.end();
                let cookie = response.headers['set-cookie'][0];
                let patc = new RegExp('ASP.NET_SessionId=(.*?);');
                let mc = patc.exec(cookie);
                if (mc) {
                    _ASPNET_SessionId = mc[1];
                    console.log(`Cookie ASP.NET_SessionId: ${_ASPNET_SessionId}`);
                }
                let patm =  new RegExp('<input type="hidden" name="_ASPNetRecycleSession" id="_ASPNetRecycleSession" value="(.*?)" />');
                let mm = patm.exec(html);
                if (mm) {
                    _ASPNetRecycleSession = mm[1];
                    console.log(`Element _ASPNetRecycleSession: ${_ASPNetRecycleSession}`);
                }
                console.log('Step1 login page got.\n');
                login();
            } else {
                let msg = `Step1 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    let req = http.request("http://twhratsql.whq.wistron/OGWeb/LoginForm.aspx", callback);

    req.on('error', e => {
        let msg = `Step1 Problem: ${e.message}`;
        console.error(msg);
    });

    req.end();
}

//
// Step 2: POST data to login to get cookie 'OGWeb'.
//
var OGWeb;

function login() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===302) {
                let fo = fs.createWriteStream('tmp/step2-login.html');
                fo.write(html);
                fo.end();
                let cookie = response.headers['set-cookie'][0];
                let patc = new RegExp('OGWeb=(.*?);');
                let mc = patc.exec(cookie);
                if (mc) {
                    OGWeb = mc[1];
                    console.log('Cookie OGWeb got.');
                }
                console.log('Step2 done.\n');
                step3();
            } else {
                let msg = `Step2 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    let postData = querystring.stringify({
        '__ctl07_Scroll': '0,0',
        '__VIEWSTATE': '/wEPDwULLTEyMTM0NTM5MDcPFCsAAmQUKwABZBYCAgMPFgIeBXN0eWxlBTFiZWhhdmlvcjp1cmwoL09HV2ViL3RxdWFya19jbGllbnQvZm9ybS9mb3JtLmh0Yyk7FhACCA8UKwAEZGRnaGQCCg8PFgIeDEVycm9yTWVzc2FnZQUZQWNjb3VudCBjYW4gbm90IGJlIGVtcHR5LmRkAgwPDxYCHwEFGlBhc3N3b3JkIGNhbiBub3QgYmUgZW1wdHkuZGQCDQ8PFgIeB1Zpc2libGVoZGQCDg8UKwAEZGRnaGQCEg8UKwADDxYCHgRUZXh0BSlXZWxjb21lIFRvIOe3r+WJteizh+mAmuiCoeS7veaciemZkOWFrOWPuGRkZ2QCFA8UKwADDxYCHwMFK0Jlc3QgUmVzb2x1dGlvbjoxMDI0IHggNzY4OyBJRSA2LjAgb3IgYWJvdmVkZGdkAhsPFCsAAmQoKWdTeXN0ZW0uRHJhd2luZy5Qb2ludCwgU3lzdGVtLkRyYXdpbmcsIFZlcnNpb249Mi4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iMDNmNWY3ZjExZDUwYTNhBDAsIDBkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYCBQVjdGwwNwUITG9naW5CdG6vo0TFNrmm9RKH7uSQ+NY2OXccyA==',
        '__VIEWSTATEGENERATOR': 'F163E3A2',
        '_PageInstance': '1',
        '__EVENTVALIDATION': '/wEWBAK20LBAAsiTss0OArOuiN0CArmtoJkDPmmwqug37xjPhGglEwK8JU9zleg=',
        'UserPassword': 'S0808001',
        'UserAccount': 'S0808001',
        'LoginBtn.x': '74',
        'LoginBtn.y': '10',
        '_ASPNetRecycleSession': _ASPNetRecycleSession
    });
    let req = http.request({
        hostname: "twhratsql.whq.wistron",
        path: "/OGWeb/LoginForm.aspx",
        method: "POST",
        headers: {
            'Cookie': 'ASP.NET_SessionId='+_ASPNET_SessionId,   // NOTED.
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, callback);

    req.on('error', e => {
        let msg = `Step2 Problem: ${e.message}`;
        console.error(msg);
    });

    req.write(postData);
    req.end();
}

//
// Step 3: Open EntryLogQueryForm.aspx page to get hidden input '_ASPNetRecycleSession', '__VIEWSTATE' and '__EVENTVALIDATION'.
//
var __VIEWSTATE = '';
var __EVENTVALIDATION = '';

function step3() {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if (response.statusCode===200) {
                let fo = fs.createWriteStream('tmp/step3.html');
                fo.write(html);
                fo.end();
                let patm =  new RegExp('<input type="hidden" name="_ASPNetRecycleSession" id="_ASPNetRecycleSession" value="(.*?)" />');
                let mm = patm.exec(html);
                if (mm) {
                    _ASPNetRecycleSession = mm[1];
                    console.log(`Element _ASPNetRecycleSession: ${_ASPNetRecycleSession}`);
                }
                let patv =  new RegExp('<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="(.*?)"');
                let mv = patv.exec(html);
                if (mv) {
                    __VIEWSTATE = mv[1];
                    console.log('Element __VIEWSTATE got');
                }
                let pate =  new RegExp('<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="(.*?)"');
                let me = pate.exec(html);
                if (me) {
                    __EVENTVALIDATION = me[1];
                    console.log('Element __EVENTVALIDATION got');
                }
                console.log('Step3 done.\n');
                askAll();
            } else {
                let msg = `Step3 HTTP error: ${response.statusMessage}`;
                console.error(msg);
            }
        });
    }

    let req = http.request({
        hostname: "twhratsql.whq.wistron",
        path: "/OGWeb/OGWebReport/EntryLogQueryForm.aspx",
        //method: "GET",    // Default can be omitted.
        headers: {
            'Cookie': `ASP.NET_SessionId=${_ASPNET_SessionId}; OGWeb=${OGWeb}`  // important
        }
    }, callback);

    req.on('error', e => {
        let msg = `Step3 Problem: ${e.message}`;
        console.error(msg);
    });

    req.end();
}

//
// Step 4: POST data to inquire.
//
/**
 * 截取某人的刷卡资料。
 * @param {*} beginDate 开始日期
 * @param {*} endDate 截止日期
 * @param {*} employeeIdOrName 工号或名字
 * @param {*} nextPage if go to next page
 * @param {*} nextStep 完成后调用此function
 */
function inquire(beginDate, endDate, employeeIdOrName, nextPage, nextStep) {

    function callback(response) {
        let chunks = [];
        response.addListener('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            let buff = Buffer.concat(chunks);
            let html = buff.toString();
            if ( response.statusCode === 200 ) {
                let result = parseKQ(html);
               
                let fo = fs.createWriteStream(`tmp/step4-inquire-${employeeIdOrName}-${result.curPage}.html`);
                fo.write(html);
                fo.end();
                if ( result.curPage < result.numPages ) {
                    inquire(beginDate, endDate, employeeIdOrName, true, nextStep);
                   
                } else {
                    
                    console.log(`Inquiry about ${employeeIdOrName} is done.`);
                    if ( nextStep ) {   
                        nextStep();
                    }
                }
            } else {
                console.error(`Inquiry HTTP error: ${response.statusMessage}`);
            }
           
           
        });
       
    }

    var beginTime = '0:00';
    var endTime = '23:59';

    let postObj = {
        'TQuarkScriptManager1': 'QueryResultUpdatePanel|QueryBtn',
        'TQuarkScriptManager1_HiddenField': ';;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:411fea1c:865923e8;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:91bd373d:d7d5263e:f8df1b50;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:e7c87f07:bbfda34c:30a78ec5;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:9b7907bc:9349f837:d4245214;;AjaxControlToolkit, Version=1.0.20229.20821, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:c5c982cc-4942-4683-9b48-c2c58277700f:e3d6b3ac;',
        '__ctl07_Scroll': '0,0',
        '__VIEWSTATEGENERATOR': 'A21EDEFC',
        '_ASPNetRecycleSession': _ASPNetRecycleSession,
        '__VIEWSTATE': __VIEWSTATE,
        '_PageInstance': 26,
        '__EVENTVALIDATION': __EVENTVALIDATION,
        'AttNoNameCtrl1$InputTB': '上海欽江路',
        'BeginDateTB$Editor': beginDate,
        'BeginDateTB$_TimeEdit': beginTime,
        'EndDateTB$Editor': endDate,
        'EndDateTB$_TimeEdit': endTime,
        'EmpNoNameCtrl1$InputTB': employeeIdOrName
    };
    if ( nextPage ) {
        postObj['GridPageNavigator1$NextBtn'] = 'Next Page';
    } else {
        postObj['QueryBtn'] = 'Inquire';
    }

    let postData = querystring.stringify(postObj);

    let req = http.request({
        hostname: "twhratsql.whq.wistron",
        path: "/OGWeb/OGWebReport/EntryLogQueryForm.aspx",
        method: "POST",
        headers: {
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; MAARJS)',	// mimic IE 11 // important
            'X-MicrosoftAjax': 'Delta=true',    // important
            'Cookie': `ASP.NET_SessionId=${_ASPNET_SessionId}; OGWeb=${OGWeb}`,  // important
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, callback);

    req.on('error', e => {
        console.error(`Step4 Problem: ${e.message}`);
    });

    req.end(postData);
}

/**
 * Parse the input html to get 刷卡 data.
 * @param {*} html 
 * @return number of current page and number of total pages.
 */
let kq_list = []
let kq_cur = []
function parseKQ(html) {
    
    // Get number of pages.
    let curPage = 1;
    let numPages = 1;
    let rexTotal = new RegExp('<span id="GridPageNavigator1_CurrentPageLB">(.*?)</span>[^]*?<span id="GridPageNavigator1_TotalPageLB">(.*?)</span>');
    let match = rexTotal.exec(html);
    if ( match ) {
        curPage = parseInt(match[1]);
        numPages = parseInt(match[2]);
        console.log(`Page: ${curPage} / ${numPages}`);
        // console.log(match[1])
        // console.log(match[2])
    }

    // Update __VIEWSTATE __EVENTVALIDATION
    let rexVS = new RegExp("__VIEWSTATE[\|](.*?)[\|]");
    let matVS = rexVS.exec(html);
    if ( matVS ) {
        __VIEWSTATE = matVS[1];
    }
    let rexEV = new RegExp("__EVENTVALIDATION[\|](.*?)[\|]");
    let matEV = rexEV.exec(html);
    if ( matEV ) {
        __EVENTVALIDATION = matEV[1];
    }

    // Print 刷卡 data
   
    console.log(` /Department  /EID          /Name              /Clock Time    /state`);
    while (true) {
        let rex =  new RegExp('<td>(.*?)</td><td>&nbsp;</td><td><.*?>(.*?)</a></td><td>(.*?)</td><td>.*?</td><td>(.*?)</td>',
            'g');   // NOTE: 'g' is important
        let m = rex.exec(html);
       
        if (m) {
            let m1 = `${m[1]}`
            let m2 = `${m[2]}`
            let m3 = `${m[3]}`
            let m4 = `${m[4]}`
            
            //kq_arr 每一条打卡数据
            let kq_arr = new Array(m1,m2,m3,m4)
            //kq_list 所有打卡数据
            kq_list.push(kq_arr)
            // console.log(kq_list)
            console.log(`  ${m[1]}  ${m[2]}  ${m[3]} ${m[4]}`);


            html = html.substr(rex.lastIndex);    
        } else {
			break;
        }   
    }

    
    return {curPage: curPage, numPages: numPages};
     
    
}
let kq_queqin = []
let kq_once = []
let kq_late = []
let kq_early = []
let kq_worktime = []
function askAll() {
    inquire(
    '2020-12-24', '2021-1-11', 'JACK C ZHANG', false,
    // ()=> inquire('2020-12-28', '2021-1-26', 'S2008001', false,
    // ()=> inquire('2020-12-24', '2021-1-6', 'ANNE', false,
    // ()=> inquire('2020-12-25', '2021-1-08', 'LEO MY CHEN', false,
    // ()=> inquire('2021-01-17', '2021-1-27', 'S0203002', false,
    ()=> inquire('2020-12-24', '2021-1-6', 'TINA MJ PANG', false,
    ()=> inquire('2020-12-25', '2021-1-08', 'JAMES SJ YU', false,
    ()=> inquire('2020-12-17', '2020-12-27', 'ROMY QI', false,
    ()=> inquire('2021-01-17', '2021-1-27', 'S2009001', false,
    ()=> inquire('2021-01-17', '2021-1-27', 'GINA YANG', false,
    ()=> inquire('2020-12-24', '2021-1-11', 'LEO MY CHEN', false,
    ()=> inquire('2021-01-17', '2021-1-27', 'RACHAEL YUAN', false,
    ()=> inquire('2021-01-4', '2021-1-14', 'DANKING LI', false,
    
    //自己部门所有人
    
    function() {
        //遍历kq_list
        for(let i=0; i < kq_list.length-1; i++){
        //若打卡人name相同，并且打卡date相同，把打卡时间push到kq_arr 
        if(kq_list[i][2]===kq_list[i+1][2] && kq_list[i][3].slice(0,7)===kq_list[i+1][3].slice(0,7)){
            kq_cur.push(kq_list[i][3]);
        }else{
            kq_cur.push(kq_list[i][3]);
            // console.log(kq_cur);

                //1. 只打卡一次(判断打卡次数为1)
            if(kq_cur.length === 1){
                kq_list[i].push("只打一次")
                kq_once.push(kq_list[i])
            }
            
            if(kq_cur.length > 1){
                //2. 第一次打卡 > 08:50 ------迟到（获取第一次打卡数据，即kq_cur数组的最后一个）
                let frequency = kq_cur.length-1;
                let come = kq_cur[frequency];
                // console.log(come)
                let date1 = new Date(come);
                let clock1 = date1.toLocaleTimeString()

                let date2 = new Date('','','',8,50,59)
                let morn = date2.toLocaleTimeString()
               
                if(clock1 > morn){                  
                    kq_list[i].push("迟到"); 
                    kq_late.push(kq_list[i])             
                }

                //3. 最后一次打卡 < 4:50（获取最后一次打卡数据，即kq_cur数组的第一个）
                let date3 = new Date(kq_cur[0]);
                // console.log(date3)
                let clock2 = date3.toLocaleTimeString()
        
                let date4 = new Date('','','',16,50,0)
                let after = date4.toLocaleTimeString()

                if(clock2 < after){ 
                    //将最后一次打卡标记为早退                 
                    kq_list[i-frequency].push("早退");
                    kq_early.push( kq_list[i-frequency])
                }


                //4. 直接获取第一次和最后一次打卡时间差小于9小时
                // let duration = (date3 - date1)/(1000 * 60 * 60)
                //(date3 - date1) < 1000 * 60 * 60 * 9 + 59 * 1000
                if(date3 - date1 < 1000 * 60 * 60 * 9 - 59 * 1000){
                    kq_list[i].push("工时不足");
                    kq_list[i-1].push("工时不足");
                    kq_worktime.push( kq_list[i])
                }
                //bug：打卡奇数次记异常，偶数次则用偶数次减奇数次打卡，取总时间，1分钟内可能多次打卡，造成打卡次数为单身，
          
            }
            //5. 判断请假（非星期天没有打卡）  bug：只考虑了工作日和非工作日，没有考虑假期
            //如果名字和后一天相同，日期不同，判断下一天是不是=上一天加1，是则正常，不是则判断是不是星期天
           if(kq_list[i][2]===kq_list[i+1][2] && kq_list[i][3].slice(0,7)!=kq_list[i+1][3].slice(0,7)){
                //判断后一天是不是等于前一天加1
                let daycur1 =  new Date(kq_list[i][3]) ;
                let daycur2 =  new Date(kq_list[i+1][3]);
                let period = (daycur1-daycur2)/(1000 * 60 * 60 * 24);
                // console.log(period)
               
                if(period+0.3 < 1){
                }else if(period>2){
                    for(let n=1;n<period-0.3;n++){
                        daycur2.setDate(daycur2.getDate()+1)
                        // console.log(daycur2)
                        let sun = daycur2.getDay()
                        // 缺失日期是不是周六周日
                        if(sun===6||sun===0){
                            // console.log('缺失时间为星期天')
                        }else{
        
                            let kq_department = kq_list[i][0];
                            let kq_id = kq_list[i][1];
                            let kq_name = kq_list[i][2];
                            //格式化日期为"2021-12-20"
                            function d(date){
                                return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                            }
                            let kq_date = d(daycur2);

                            let queqin = new Array(kq_department,kq_id,kq_name,kq_date,"缺勤/请假/假期")
                            kq_queqin.push(queqin);
                        }
                    }
                    
                }


       }


            kq_cur = []
            
        }
    
    }
    //遍历kq_list
    // for(let i=0; i < kq_list.length-1; i++){
    //     if(kq_list[i].length===4){
    //         kq_list[i].push('正常');
    //     }
    //     if(kq_list[i].length > 5 ){
    //         console.log( kq_list[i][0],kq_list[i][1],kq_list[i][2],kq_list[i][3],kq_list[i][5]+'+'+kq_list[i][4])
    //     }else{
    //         console.log( kq_list[i][0],kq_list[i][1],kq_list[i][2],kq_list[i][3],kq_list[i][4])
    //     }  
    // }
    console.log(' ')
    console.log(' ')

    //缺勤人员
    if(kq_queqin.length){
        console.log('\x1B[31m                      缺勤/请假/假期人员名单 \x1B[0m')
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(`\x1B[36mDepartment    ID           name                缺勤/请假/假期时间  \x1B[0m`)
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        for(let q = 0;q<kq_queqin.length;q++){
            console.log(kq_queqin[q][0],' ',kq_queqin[q][1],' ',kq_queqin[q][2],' ',kq_queqin[q][3])
        }
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(' ')
        console.log(' ')
        
    }
    
    //打卡一次
    if(kq_once.length){
        console.log('\x1B[31m                    只打卡一次人员名单 \x1B[0m')
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(`\x1B[36mDepartment    ID           name                  打卡时间  \x1B[0m`)
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        for(let i = 0;i<kq_once.length;i++){
            console.log(kq_once[i][0],' ',kq_once[i][1],' ',kq_once[i][2],' ',kq_once[i][3])
        }
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(' ')
        console.log(' ')
        
    }
    
    //早退
    if(kq_early.length){
        console.log('\x1B[31m                      早退人员名单 \x1B[0m')
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(`\x1B[36mDepartment    ID           name                早退时间  \x1B[0m`)
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        for(let i = 0;i<kq_early.length;i++){
            console.log(kq_early[i][0],' ',kq_early[i][1],' ',kq_early[i][2],' ',kq_early[i][3])
        }
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(' ')
        console.log(' ')
       
    }
    //工时不足
    if(kq_worktime.length){
        console.log('\x1B[31m                    工时不足人员名单 \x1B[0m')
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(`\x1B[36mDepartment    ID           name                打卡时间  \x1B[0m`)
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        for(let i = 0;i<kq_worktime.length;i++){
            console.log(kq_worktime[i][0], ' ',kq_worktime[i][1],' ',kq_worktime[i][2],' ',kq_worktime[i][3])
        }
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(' ')
        console.log(' ')
    }

    //迟到
    if(kq_late.length){
        console.log('\x1B[31m                      迟到的人员名单 \x1B[0m')
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(`\x1B[36mDepartment    ID           name                迟到时间  \x1B[0m`)
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        for(let i = 0;i<kq_late.length;i++){
            console.log(kq_late[i][0],' ',kq_late[i][1],' ',kq_late[i][2],' ',kq_late[i][3])
        }
        console.log(`\x1B[36m—————————————————————————————————\x1B[0m`)
        console.log(' ')
        console.log(' ')
       
    }
    // console.log(kq_queqin);
    // console.log(kq_list)
    console.log("All done.") 
         
    } ))))) ))));
    
}

openLoginPage();    // Where it all begins.
