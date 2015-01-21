/**
 * Created with PhpStorm.
 * User: Administrator
 * Date: 14-12-4
 * Time: 下午5:11
 * To change this template use File | Settings | File Templates.
 */
define(function (require, exports, module) {
    require("$/simplePagination");
    var $ = require("jq");
    var MkListToPage;
    //dom列表分页
    !function(){
        var def ={
            container:"",
            total_page: 1,
            continuous_page: 5,
            current_page: 1,
            preview_show: true,
            first_show: true,
            next_show: true,
            last_show: true,
            edge_page: 2,
            skip_show: false,

            total_text:"共{totalPage}页",         //总页数文案
            first_text:"首页",                    //各种文案
            last_text:"末页",
            prevText:"上一页",
            nextText:"下一页",

            autoSkipTo:0,

            //当翻页(自动或者手动)时候执行，并返回当前被展示的元素
            //function($els)
            onelshow: $.noop,


            //自定义配置
            onpage: $.noop,
            row:9,                      //每页显示多少，默认9,
            autoSkipTo:1,               //默认跳转到页，如果小于1不跳转,
            skipFunc:function($list,pageno, row){
                $list.hide().removeClass("showing");
                var cur = 0;
                var willShowEls = $();
                $list.each(function(i){
                    var t= $(this);
                    var pnofix = pageno - 1;
                    if(i >= pnofix * row && i < (pnofix + 1) * row){
                        willShowEls[willShowEls.length++] = this;

                    }
                    cur ++;
                });

                willShowEls.show();

                var sett = this.sett;
                sett.onelshow.call(this,willShowEls);

                //加载图片
                willShowEls.find("img[_src]:not(.scrollEle img)").unblockImg()
            },

            a:"a"
        };



        MkListToPage = function($list,config){
            var me = this;
            var sett = me.sett = $.extend({},def,config);
            $list.parent().show();
            sett.pages = ~~(($list.length-1)/sett.row) + 1;
            sett.onPageClick = function(num,e){
                sett.skipFunc.call(me,$list , num, sett.row);
                sett.onpage.call(me,num,e);
            };
            var pg = me.page = $(sett.container).pagination(sett);
            pg.call = function(method, para){
                return pg.pagination(method, para);
            }

            if(sett.autoSkipTo > 0){
                pg.call("selectPage",1);
            }
        }

        var fn = MkListToPage.prototype;
        window.MkListToPage = MkListToPage;
    }();

    return MkListToPage;
});