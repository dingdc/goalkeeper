# 自动化截取刷卡记录
## 指定日期，指定员工姓名或工号，截取刷卡记录。
## 判断状态
   * 正常
   * 异常
     * 請假
     * 遲到
     * 早退 
     * 工時不足
     * 只刷一次

获取到打卡时间：把同一天打卡时间放进kq_arr
  
    迟到     ------- 第一次打卡8：50：59之后（kq_cur最后一个）
    早退     ------- 最后一次打卡16：50之前（kq_cur第一个）
    打卡一次 ------- 只刷一次（kq_cur长度为1）
    工时不足 ------- 第一次最后一次打卡间隔小于 9h + 59s

    没有打卡 ------- 查看打卡时间，后一天是否为前一天加1，
                          若是则不做处理，不是则对缺失时间进行判断，
                              缺失时间若为星期天，不做处理，缺失时间不是星期天，把缺失时间添加到缺勤数组kq_queqin
    节日假期为手动写入数组
   
let kq_queqin = []     缺勤
let kq_once = []       打卡一次
let kq_late = []       迟到
let kq_early = []      早退
let kq_worktime = []   工時不足

# How to use
git clone https://github.com/alex632/kq.git
> node index.js

# Insights
    Event driven & asynchronism are good. However they are somewhat not easy to comprehend.
    Customized Web Crawler.
