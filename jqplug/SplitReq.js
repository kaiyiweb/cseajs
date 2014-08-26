/**
 * Created with WebStorm.
 * User: Administrator
 * Date: 14-8-25
 * Time: 下午5:11
 * To change this template use File | Settings | File Templates.
 */
define(function (require, exports, module) {
    var cl = require("ctool");
    var cj = require("ctooj");
    var $ = require("jq");
    var nullFunc = function(){ };

    //常量
    var constVar = {
        rowsMount:10
    }

    //带分页的，分段请求功能类
    !function(){
        var def = {
            //KISSY Page config
            container:"",
            total_page: 1,
            continuous_page: 5,
            current_page: 1,
            preview_show: true,
            first_show: true,
            next_show: true,
            last_show: true,
            edge_page: 2,
            skip_show: false,                   //显示跳转到

            //custome config
            reqPath:"",                        //允许使用模式如  /root/html_{pageno}.html
            //目前支持 {pageno}(当前页码)，{_}(web根路径)
            //可以写在分页div上 例： <div class="pageSize" data_reqPath="{_}zxhdManage/getActivityPageListZxhdManage.tg"></div>
            reqPara:{rows:5},               	//请求所带参数。默认传rows:5，表示每页显示5条
            dataType:"json",                     //类型可以"json"或者"html","null"
            //当类型为null的时候仅仅保留分页功能,不会发起数据请求
            onData: nullFunc,                   //当数据返回时 参数为所请求到的原始字符串
            onReq:nullFunc,                     //当请求时候执行
            /*
             * function(orgPara){
             *   var newPara = orgPara;
             *   newPara.type = "black";
             *   newRara.redirect = "//newUrlxxx";           //使用这句可以重定向请求地址
             *   return newPara;
             * }
             * */
            onSkip:nullFunc,                    //分页的时候调用
            onInit:nullFunc,                    //当Page对象初始化成功时候执行
            firstReqAuto:true,                 //创建后，是否立即进行一次请求
            defTotalPage:1,                     //如果未获取到页数信息，显示多少页
            pagenoFieldName:"page",             //请求参数：页码字段的name,如 do?page=1
            rowsFiledName:"rows",               //请求参数：每次返回的条目数字段的名称 如(rows的作用):do?rows=10&page=2
            rowsMount:undefined,                //请求参数：返回条目数量 如(10的作用):do?rows=10&page=2,该值取值优先级，用户config的值>行内设置的值>预设值
            hidePageNav:false,                 //当此项为true时候，隐藏分页按钮（用来发起自定义请求，实现如 换一批等功能）

            a:0
        };
        /**
         * 分页或者换一批请求，一个class
         *
         * */
        module.exports = function(cfg){
            var me = this;
            me.initedCb = $.Callbacks("memory");
            var setting = me.setting = me.st = $.extend(true, {}, def, cfg);
            var pageCont = me.container = $(setting.container);
            //先去
            setting.rowsMount = setting.rowsMount || pageCont.attr("rowsMount") || constVar.rowsMount;
            cj.getKissy(function(S){
                S.use("gallery/page/1.0/index",function(S,Page){
                    setting.reqPath = pageCont.attr("data_reqPath") || setting.reqPath;
                    setting.dataType = pageCont.attr("data_dataType") || setting.dataType;
                    pageCont.addClass("page_nav");

                    var pg = me.page = new Page(setting);
                    pg.on("page:skip",function(e){
                        me.st.onSkip.call(me,e);
                        me.currentPageno = e.pageNum;
                        if(me.st.dataType=="null"){     //空类型
                            return;
                        }
                        var para = setting.reqPara;
                        para[setting.pagenoFieldName] = e.pageNum;
                        para[setting.rowsFiledName] = me.st.rowsMount;                     //一次请求多少条
                        var back = setting.onReq.call(me,para);
                        if(back) para = back;
                        me.req(para);
                    });
                    if(setting.firstReqAuto) me.skip(1);
                    me.st.onInit.call(me,pg);
                    me.initedCb.fire();
                });/*s use end*/
            });/*getKissy end*/
        };

        var fn = module.exports.prototype;

        /**
         * 根据某参数请求
         * */
        fn.req = function(para){
            var me = this,sett = me.setting;
            cj.reqPlus(me.parseReqPath(para),para)
                .done(function(data){
                    if(sett.dataType=="html"){
                        //暂时无操作
                    }else if(sett.dataType=="json"){
                        if(typeof data == "string"){
                            try{ data = $.parseJSON(data); }
                            catch (e) {
                                throw "json解析失败，请检查dataType属性，或者服务器返数据格式";
                            }
                        }
                    }else{
                        throw "dataType字段不合法"
                    }
                    if(!sett.hidePageNav) me.setPageInfo(data);
                    sett.onData.call(me,data);

                })
                .fail(function(){
                    throw "网络连接失败！检查后台服务是否开启，是否报错，是否请求跨域！";
                })
            ;
        };

        /**
         * 跳转到第n页
         * */
        fn.skip = function(pageno){
            if(this.st.hidePageNav)    return;
            var me = this;

            //如果已经初始化过,直接跳页
            if(me.initedCb.fired()){
                doskip.call(me,pageno)
                return;
            }

            //没有初始化，等待初始化
            me.initedCb.add(function(){
                doskip.call(me,pageno)
            });
        };

        /**
         * 执行跳转
         * @param pageno
         */
        function doskip(pageno){
            var me = this;
            me.page.skip(pageno || 1);
        }

        /**
         * 跳转到第一页，并执行一次请求，
         * */
        fn.doo = function(){
            this.skip();
        };

        /**
         * 跳转到下一页
         * */
        fn.next = function(){
            var me = this;
            if(!me.pageInfo)    return;
            if(me.pageInfo.totalPage == me.currentPageno){
                cl.log("已经到最后一页");
                return;
            }
            this.skip(this.currentPageno+1);
        }

        /**
         * 设置总页数
         * */
        fn.setTotalPangeNum = function(num){
            if(this.st.hidePageNav)    return;
            var me = this;
            me.page.changetTotalPage(num || 1);
            me.page.renderPage();
        };

        /**
         * 解析路径中的变量
         * */
        fn.parseReqPath = function(realPara){
            var me = this;
            var path = me.st.reqPath;

            //重定向请求地址
            if(realPara.redirect){
                path = realPara.redirect;
                delete realPara.redirect;
            }
            path = path.replace("{pno}",me.currentPageno);
            //path = path.replaceAll("{_}",root);
            return path;
        }

        /**
         * 从html片断或者json数据中读取页配置信息对象并设置
         * */
        fn.setPageInfo = function(data){
            if(this.st.hidePageNav)    return;
            var me = this;
            var pageInfo={totalPage:1};
            if(me.st.dataType=="html"){
                if(/-({.+})-/.test(data)){
                    pageInfo = $.parseJSON(RegExp["$1"]);
                }else
                    cl.log("未找到pageinfo信息");
            }else if(me.st.dataType=="json"){
                pageInfo = data.pageInfo || {totalPage:data.totalPage,totalCount:data.totalCount};
            }//else end

            var totalPage = me.st.defTotalPage
            if(pageInfo.totalPage){
                totalPage=pageInfo.totalPage;
            }else if(pageInfo.totalCount){
                pageInfo.totalPage = totalPage = ~~(pageInfo.totalCount/me.st.rowsMount)+1;
            }
            me.setTotalPangeNum(totalPage);

            me.pageInfo = pageInfo;
        }
    }();
});