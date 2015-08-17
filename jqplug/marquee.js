define(function(require){
    /***
     * 作者 wange1228 https://github.com/wange1228
     @name Marquee-Slide
     @description 基于 jQuery 的多功能无缝滚动插件
     @url https://github.com/wange1228/marquee-slide
     @version 0.4.3
     @author 万戈
     @blog http://wange.im
     ***/

    var Timer = require("ctimer");
    var jQuery = require("jq");
    !function(a){var b;b=function(){function b(b,c){this.elements={wrap:b,ul:b.children(),li:b.children().children()},this.settings=a.extend({},a.fn.marquee.defaults,c),this.cache={allowMarquee:!0}}return b.prototype.init=function(){this.setStyle(),this.move(),this.bind()},b.prototype.setStyle=function(){var a,b,c,d,e,f,g,h;switch(d=this.elements.li.outerWidth(!0),c=this.elements.li.outerHeight(!0),b=Math.max(parseInt(this.elements.li.css("margin-top"),10),parseInt(this.elements.li.css("margin-bottom"),10)),this.settings.type){case"horizontal":h=this.settings.showNum*d,g=c,f=9999,e="auto",a="left",this.cache.stepW=this.settings.stepLen*d,this.cache.prevAnimateObj={left:-this.cache.stepW},this.cache.nextAnimateObj={left:0},this.cache.leftOrTop="left";break;case"vertical":h=d,g=this.settings.showNum*c-b,f="auto",e=9999,a="none",this.cache.stepW=this.settings.stepLen*c-b,this.cache.prevAnimateObj={top:-this.cache.stepW},this.cache.nextAnimateObj={top:0},this.cache.leftOrTop="top"}this.elements.wrap.css({position:"relative",width:h,height:g,overflow:"hidden"}),this.elements.ul.css({position:"relative",width:f,height:e}),this.elements.li.css({"float":a})},b.prototype.bind=function(){var a,b,c,d,e,f;f=this,null!=(a=this.settings.prevElement)&&a.click(function(a){a.preventDefault(),f.prev()}),null!=(b=this.settings.nextElement)&&b.click(function(a){a.preventDefault(),f.next()}),null!=(c=this.settings.pauseElement)&&c.click(function(a){a.preventDefault(),f.pause()}),null!=(d=this.settings.resumeElement)&&d.click(function(a){a.preventDefault(),f.resume()}),null!=(e=this.elements.wrap)&&e.hover(function(){f.pause()},function(){f.resume()})},b.prototype.move=function(){var a,b,c;if(c=this,this.settings.auto){switch(this.settings.direction){case"forward":b=c.prev;break;case"backward":b=c.next}a=c.settings.interval,setTimeout(function(){b.call(c),setTimeout(arguments.callee,a)},a),this.cache.moveBefore=this.cache.moveAfter=function(){return null}}else this.cache.moveBefore=function(){return c.cache.allowMarquee=!1},this.cache.moveAfter=function(){return c.cache.allowMarquee=!0}},b.prototype.prev=function(){var a,b,c;c=this,this.cache.allowMarquee&&(this.cache.moveBefore.call(this),this.settings.prevBefore.call(this),b=this.elements.ul,a=b.children().slice(0,this.settings.stepLen),a.clone().appendTo(b),b.animate(this.cache.prevAnimateObj,this.settings.speed,function(){b.css(c.cache.leftOrTop,0),a.remove(),c.cache.moveAfter.call(c),c.settings.prevAfter.call(c)}))},b.prototype.next=function(){var a,b,c;c=this,this.cache.allowMarquee&&(this.cache.moveBefore.call(this),this.settings.nextBefore.call(this),b=this.elements.ul,a=b.children().slice(-this.settings.stepLen),a.clone().prependTo(b),b.css(c.cache.leftOrTop,-this.cache.stepW).animate(this.cache.nextAnimateObj,this.settings.speed,function(){a.remove(),c.cache.moveAfter.call(c),c.settings.nextAfter.call(c)}))},b.prototype.pause=function(){this.settings.pauseBefore.call(this),this.cache.allowMarquee=!1,this.settings.pauseAfter.call(this)},b.prototype.resume=function(){this.settings.resumeBefore.call(this),this.cache.allowMarquee=!0,this.settings.resumeAfter.call(this)},b}(),a.fn.marquee=function(c){this.each(function(){var d;d=new b(a(this),c),d.init()})},a.fn.marquee.defaults={auto:!0,interval:3e3,direction:"forward",speed:500,showNum:1,stepLen:1,type:"horizontal",prevElement:null,prevBefore:function(){},prevAfter:function(){},nextElement:null,nextBefore:function(){},nextAfter:function(){},pauseElement:null,pauseBefore:function(){},pauseAfter:function(){},resumeElement:null,resumeBefore:function(){},resumeAfter:function(){}}}(jQuery);

    var Marquee = function(el,config){
        var me = this;
        me.el = $(el);
        me.proxy_btn_prev = $("<i></i>");
        me.proxy_btn_next = $("<i></i>");
        me.proxy_btn_pause = $("<i></i>");
        me.proxy_btn_resume = $("<i></i>");

        me.sett = $.extend({}, def, config, {
            pauseElement:me.proxy_btn_pause,
            resumeElement:me.proxy_btn_resume,
            nextElement:me.proxy_btn_next,
            prevElement:me.proxy_btn_prev
        });


        //依旧支持旧版的控制方式
        config = config || {};
        if(config.pauseElement) $(config.pauseElement).click(function(){
            me.pause();
        });
        if(config.resumeElement) $(config.resumeElement).click(function(){
            me.resume();
        });
        if(config.nextElement) $(config.nextElement).click(function(){
            me.next();
        });
        if(config.prevElement) $(config.prevElement).click(function(){
            me.prev();
        });



        //自定义的自动播放
        me.tock = new Timer({
            delay:me.sett.interval,
            autoStart:false,
            callback:function(){
                me.prev();
            }
        });


        if(me.sett.auto) me.tock.start();

        me.el.marquee($.extend({},me.sett,{auto:false}));

        if(me.sett.autoPause){
            me.el.mouseEnter(function(){
                me.pause();
            });

            me.el.mouseOut(function(){
                me.resume();
            });
        }
    }


    var def = {
        auto:true,
        /**
         * 鼠标停留的时候自动停止
         */
        autoPause:true,
        interval:3000
    };

    $.extend(Marquee.prototype, {
        next:function(){
            var me = this;
            me.proxy_btn_next.click();
            me.tock.recount();
        },
        prev:function(){
            var me = this;
            me.proxy_btn_prev.click();
            me.tock.recount();

        },
        pause:function(){
            var me = this;
            me.proxy_btn_pause.click();

        },
        resume:function(){
            var me = this;
            me.proxy_btn_resume.click();
            me.tock.recount();
        }

    });

    return Marquee;
});