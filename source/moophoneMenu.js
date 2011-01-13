/*
moophoneMenu - an iPhone-like Menu v1.0

Copyright (c) 2010 Stefano Ceschi Berrini | steweb.it

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var moophoneMenu = new Class({
    
    Implements: [Options, Events],
    
    options:{
        mobile : true,
        wrapperWidth : 320,
        transition : Fx.Transitions.linear,
        duration : 200,
        backLabel : 'Indietro',
        hideRootNav : false,
        title: 'myMenu'
    },
    
    initialize: function(menu, options){
        
        this.menu = menu;
        this.menuID = this.uIdGenerator();
        
        this.setOptions(options);
        
        this.options.title = this.options.title ? this.options.title.substring(0, 20) : "&nbsp;";
        this.options.backLabel = this.options.backLabel ? this.options.backLabel.substring(0, 20) : "back";
        
        this.setMenuWrapper();
        this.setMenuWidth();
        
        this.buildMenu();
        
        if(this.options.mobile){
            window.onorientationchange=this.setMenuWidth();
        }
    },
    
    setMenuWrapper : function(){
        this.menuWrapper = new Element('div',{'class':'moophoneMenuWrapper'}).inject(this.menu.getParent()).adopt(this.menu);
    },
    
    //setting wrapper, menu and submenus width
    setMenuWidth : function(){
        
        this.wrapperWidth = (this.options.mobile) ? this.menuWrapper.getParent().offsetWidth : this.options.wrapperWidth;
        
        this.menu.getElements('ul').setStyles({
            'width':this.wrapperWidth,
            'left':this.wrapperWidth
        });
        
        this.menu.getParent().setStyles({
            'width':this.wrapperWidth
        });
        
        this.menu.setStyles({
            'width':this.wrapperWidth
        });
    },
    
    buildMenu : function(){
        
        var _self = this;
        
        this.isRoot = true; //first time, we're in the root
        
        this.navBar = new Element('div',{'class':'moophoneMenuNavBar'}).setStyles({
            'opacity':0
        }).inject(this.menuWrapper,'top');
        
        this.navMorph = new Fx.Morph(this.navBar,{duration:this.options.duration});
        this.navSlide = new Fx.Slide(this.navBar,{duration:this.options.duration,link:'chain'}); 
        
        this.menuMorph = new Fx.Morph(this.menu,{duration:this.options.duration,transition:this.options.transition});
        
        this.menu.getElements('li').each(function(el){
            el.parentUL = el.getParent();
            el.childUL = el.getElement('ul') ? el.getElement('ul') : null;
            
            if(el.childUL != null){
                el.addClass('moophoneMenuParent');
                el.childUL.setStyles({
                    'cursor':'default'
                });
            }
            
            el.addEvents({
                'click':function(evt){
                    evt.stopPropagation();
                    if(this.childUL){
                        this.parentTitle = _self.navTitle.innerHTML;
                        _self.setTitle(this.firstChild.nodeValue.trim());
                        this.getSiblings().each(function(el){
                            if(el.getElement('ul')){
                                el.getElement('ul').setStyle('display','none');
                            }
                        });
                        if(this.parentUL == _self.menu){
                            _self.menuMorph.start({'left':-_self.wrapperWidth}).chain(function(){
                               _self.showNavBar();
                            });
                        }else{
                            var oLeft = _self.menu.offsetLeft - _self.wrapperWidth;
                            _self.menuMorph.start({'left':oLeft}).chain(function(){
                                _self.showNavBar();
                            });
                        }
                        this.childUL.setStyle('display','block');
                        _self.isRoot = false;
                        _self.setNavBack(_self.parentTitle);
                    }
                }
            });
        });
        
        this.navTitle = new Element('p',{'class':'moophoneMenuNavBar-title'}).inject(this.navBar);
        this.navTitle.morphFx = new Fx.Morph(this.navTitle,{duration:200});
        
        this.parentTitle = this.options.title; //first time, menu title
        
        this.setTitle(this.options.title);
        
        this.navBack = new Element('div',{'class':'moophoneMenuBack'}).setStyles({'opacity':0}).inject(this.navBar);
        this.navBack.morphFx = new Fx.Morph(this.navBack,{duration:200});
        
        this.backArrow = new Element('div',{'class':'moophoneMenuBack-arrow'}).inject(this.navBack);
        this.backContent = new Element('div',{'class':'moophoneMenuBack-content'}).inject(this.navBack).innerHTML = '<span>'+this.options.backLabel+'</span>';
        this.backTail = new Element('div',{'class':'moophoneMenuBack-tail'}).inject(this.navBack);
        
        this.navBack.addEvents({
            'click':function(){
                    var oLeft = _self.menu.offsetLeft + _self.wrapperWidth;
                    if(oLeft == 0){
                        _self.isRoot = true;
                        _self.menuMorph.start({'left':oLeft});
                        _self.hideNavBar();
                        _self.isRoot = true;
                        _self.setTitle(_self.options.title)
                    }else{
                        _self.setTitle(_self.parentTitle)
                        _self.isRoot = false;
                        _self.menuMorph.start({'left':oLeft});
                        _self.setNavBack(_self.parentTitle);
                    }
            },
            'mousedown':function(){
                this.addClass('moophoneMenuBack-active')
            },
            'mouseup':function(){
                this.removeClass('moophoneMenuBack-active')
            },
            'mouseleave':function(){
                this.removeClass('moophoneMenuBack-active')
            }
        });
        
        this.menu.setStyle('display','block');
        
        if(!this.options.hideRootNav){
            this.showNavBar();
        }
        
    },
    
    showNavBar : function(){
        this.navBar.setStyle('display','block');
        this.navMorph.start({'opacity':1});
        this.menuMorph.start({'top':50});
    },
    
    hideNavBar : function(){
        if(this.options.hideRootNav){
            this.navSlide.slideOut();
            this.navMorph.start({'opacity':0});
            this.menuMorph.start({'top':0})
        }else{
            this.setNavBack(this.options.title);
        }
    },
    
    setTitle : function(title){
        var _self = this;
        this.navTitle.morphFx.start({'padding-left':20,'opacity':0}).chain(function(){
            _self.navTitle.innerHTML = title;
            _self.navTitle.morphFx.start({'padding-left':0,'opacity':1})
        });
    },
    
    setNavBack : function(label){
        var _self = this;
        this.navBack.morphFx.start({'margin-left':20,'opacity':0}).chain(function(){
            if(!_self.isRoot){
                _self.navBack.setStyle('display','block');
                _self.backContent.innerHTML = label;
                _self.navBack.morphFx.start({'margin-left':7,'opacity':1});
            }
        });
    },
    
    uIdGenerator : function(){
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    
});

