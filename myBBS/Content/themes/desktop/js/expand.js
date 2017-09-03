/**
 * Created by YimiZSK on 2017/3/22.
 */
(function ($) {
    $.fn.serializeJson = function () {
        var serializeObj = {};
        var array = this.serializeArray();
        var str = this.serialize();
        $(array).each(function () {
            if (serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        return serializeObj;
    };
})($);


layui.use(['form', 'layedit', 'laydate', 'laypage', 'element'], function () {
    var form = layui.form(),
        layer = layui.layer,
        laypage = layui.laypage,
        element = layui.element(),
        layedit = layui.layedit;
    var count = 5;
    //var demoIndex = layedit.build('demo'); //建立编辑器
    //form.on('submit(setExpendTitle)', function (data) {
    //    var title = layedit.getContent(demoIndex);
    //    //console.log(data);
    //    console.log(title);
    //    return false;
    //});
    
    //首次打开页面
    layPageShow('pages1', '#expendShow');

    //监听导航点击
    element.on('nav(listUser)', function (elem) {
 
        var showBox = $(elem).attr('data-list');
        console.log(showBox);
        $(showBox).removeClass('hidden').siblings().addClass('hidden');
        var pageele = "pages1";
        var ele = "#expendShow";
        //调用
        if (showBox == "#userBox1") {
            //渲染列表
            layPageShow(pageele, ele);
        } else if (showBox == "#userBox2") {
            //调用数据生成图标
            var date = new Date();
            getAccout(date.toLocaleDateString());
        } else {
            $.ajax({
                type: "post",
                url: '/expend/getExpendAll',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (dataResult) {
                    var html=`<select name="titleExpend" lay-verify="required" lay-search="" id="titleMyExpend">`;
                    $.each(dataResult.allExpend, function (m, n) {
                        html += `<option value=${n.expendNum}>${n.expendName}</option>`
                    })
                    html += ` </select>`;
                    $('#titleMyExpend').html(html);
                },
                error: function () {
                    layer.alert('服务器发呆去了，请重试', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                }
            })
        }
        form.render()
    });

    //自定义验证规则
    form.verify({
        expendName: function (value) {
            if (value.length < 4) {
                return '版区名至少四个字';
            }
        },
        expendAdmin: function (value) {
            if (value.length <= 0) {
                return '版区管理者不能为空';
            }
        },
        expendInfo: function (value) {
            console.log(value);
            if (value.length <= 0) {
                return '版区介绍不能为空';
            }
        }
    });

    /*页数显示*/
    function getCourses(obj, search) {
        if (obj.pages == undefined) {
            obj.pages = 1;
        }
        obj.pagesCount = count;
        if (search != undefined || search != null) {
            obj.expendName = search.expendName;
            obj.expendmin = search.expendmin;
            obj.expendmax = search.expendmax;
        }
        //获取每个所选词
        var getData;
        $.ajax({
            type: "post",
            data: obj,
            url: '/expend/getExpend',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (dataResult) {
                getData = dataResult;
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        return getData;
    }

    //页数变化数据变化
    function layPageShow(pageele, ele, pageindex, search) {
        /*首次加载时候获得页数*/
        var isFirst = true;
        var firstData = getCourses({ pages: 1 }, search);
        show(firstData.dataResult, ele);
        var mypages = firstData.pageCount;
        if (pageindex == null || pageindex == undefined || mypages < pageindex) {
            pageindex = 1;
        }
        laypage({
            cont: pageele,
            pages: mypages,
            curr: pageindex,
            groups: 5,
            skin: '#1E9FFF',
            jump: function (obj) {
                if (isFirst && (obj.curr == 1)) {
                    return false;
                }
                var getData = getCourses({ pages: obj.curr }, search);
                show(getData.dataResult, ele);
                isFirst = false;
            }
        });
    }

    //页面渲染
    function show(data, ele) {
        var html = '';
        $.each(data, function (m, n) {
            html += `
                <tr data-id="${n.expendId}">
                                    <td>${n.expendName}</td>
                                    <td>${n.expendAdmin}</td>
                                    <td style="display:none">${n.expendInfo}</td>
                                    <td>${n.expendCount}</td>
                                    <td>
                                        <button class ="layui-btn layui-btn-warm layui-btn-small" data-operate="details">
                                            <i class ="layui-icon">&#xe60a; </i>
                                            查看</button>
                                        <button class ="layui-btn layui-btn-danger layui-btn-small" data-operate="update">
                                            <i class ="layui-icon">&#xe642; </i>
                                            修改</button>
                                        <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="delete">
                                            <i class ="layui-icon">&#xe640; </i>
                                            删除</button>
                                    </td>
                                </tr>
                                `;

        });
        $(ele).html(html);
    }

    var userDetails = "";
    //点击详情事件
    $('body').on('click', 'button[data-operate="details"]', function () {
        var expendid = $(this).parent('td').parent('tr').data('id');
        var obj = { expendId: expendid };
        var getData;
        $.ajax({
            type: "post",
            data: obj,
            url: '/expend/getExpendOne',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (dataResult) {
                getData = dataResult;
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        var expendDetails;
        $.each(getData.dataexpend, function (n, m) {
            expendDetails = `
                 <form class ="layui-form" action="" style="margin-top: 20px;">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">版区名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="expendName"  autocomplete="off" value="${m.expendName}" class ="layui-input layui-disabled-normal" disabled>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区负责人: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="expendAdmin"  autocomplete="off" value="${m.expendAdmin}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区访问量: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="expendCount"  autocomplete="off" value="${m.expendCount}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区信息: </label>
                            <div class ="layui-input-inline">
                                <textarea  name="expendInfo"  class ="layui-textarea layui-disabled-normal" disabled>${m.expendInfo}</textarea>
                            </div>
                        </div>
                    </div>
                </form>
                `;
        })
        layer.open({
            title: "版区详情",
            type: 1,
            area: ['350px', '500px'],
            content: expendDetails,
            btn: ['关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
        });
    });

    //修改事件
    $('body').on('click', 'button[data-operate="update"]', function () {
        var expendId = $(this).parent('td').parent('tr').data('id');
        var expendName = $($(this).parents('tr').children()[0]).html();
        var expendAdmin = $($(this).parents('tr').children()[1]).html();
        var expendInfo = $($(this).parents('tr').children()[2]).html();
        //判断是否是版区管理以上级别
        $.ajax({
            type: "get",
            url: '/expend/isCan',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (dataResult) {
                if (dataResult.status == "err") {
                    layer.alert(data.msg, {
                        title: "提示",
                        icon: 5,
                        skin: 'layer-ext-moon'
                    })
                } else {
                    canupdate();
                }
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        function canupdate() {
            var updateExpand = `
                <form class ="layui-form showUserDetails" action="">
                    <input type="hidden" name="expendId" value="${expendId}" id="expendId"/>
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">版区名称: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="expendName"  lay-verify="expendName" autocomplete="off" value="${expendName}" class ="layui-input" >
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区负责人: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="expendAdmin" lay-verify="expendAdmin" autocomplete="off" value="${expendAdmin}" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区介绍: </label>
                            <div class ="layui-input-inline">
                                <textarea name="expendInfo" lay-verify="expendInfo" class ="layui-textarea " >${expendInfo}</textarea>
                            </div>
                        </div>
                    </div>
                    <button class ="layui-btn" lay-submit="update" lay-filter="update" style="display:none" id="update"></button>
                </form>
                `;
            layer.open({
                title: "版区修改",
                type: 1,
                area: ['350px', '380px'],
                content: updateExpand,
                btn: ['修改', '关闭'],
                btnAlign: 'c',//按钮居中
                shade: 0.3, //遮罩
                btn1: function () {
                    $('#update').click();
                },
                btn2: function () {
                }
            });
        }
        form.on('submit(update)', function (data) {
            console.log(data.field);
            $.ajax({
                type: "post",
                data: data.field,
                url: '/expend/updateExpend',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (data) {
                    if (data.state == "err") {
                        layer.alert(data.msg, {
                            title: "来自添加管理员的提示",
                            icon: 5,
                            skin: 'layer-ext-moon'
                        })
                    } else {
                        layer.alert(data.msg, {
                            title: "来自添加管理员的提示",
                            icon: 1,
                            skin: 'layer-ext-moon',
                            end: function () {
                                layer.closeAll();
                            }
                        });
                        //添加成功异步刷新页面
                        var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
                        console.log(nowindex);
                        layPageShow("pages1", "#expendShow", nowindex);

                    }

                },
                error: function () {
                    layer.alert('服务器发呆去了，请重试', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                }
            });
            return false;
        });
    });

    //删除事件
    $('body').on('click', 'button[data-operate="delete"]', function () {
        var name = $($(this).parents('tr').children()[0]).html();
        var expendId = $(this).parent('td').parent('tr').data('id');
        var obj = { expendId: expendId };
        layer.confirm('确认删除' + name + '吗', {
            title: "操作提示",
            btn: ['确认', '取消'] //按钮
        }, function () {
            $.ajax({
                type: "post",
                data: obj,
                url: '/expend/deleteExpend',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (data) {
                    console.log(data);
                    if (data.state == "err") {
                        layer.alert(data.msg, {
                            title: "提示",
                            icon: 5,
                            skin: 'layer-ext-moon'
                        })
                    } else {
                        layer.alert(data.msg, {
                            title: "提示",
                            icon: 1,
                            skin: 'layer-ext-moon',
                            end: function () {
                                layer.closeAll();
                            }
                        });
                        var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
                        layPageShow("pages1", "#expendShow", nowindex);
                    }
                },
                error: function () {
                    layer.alert('服务器发呆去了，请重试', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                }
            });
        }, function () {
            //点击取消的操作
        });
    });

    //增加新版区
    $('body').on('click', 'button[data-operate="addExpand"]', function (e) {
        var addExpand = `
              <form class ="layui-form showUserDetails" action="">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">版区名称: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="expendName"  lay-verify="expendName" autocomplete="off" value="" class ="layui-input" >
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区负责人: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="expendAdmin" lay-verify="expendAdmin" autocomplete="off" value="" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区介绍: </label>
                            <div class ="layui-input-inline">
                                <textarea name="expendInfo" lay-verify="expendInfo" class ="layui-textarea " ></textarea>
                            </div>
                        </div>
                    </div>
                    <button class ="layui-btn" lay-submit="update" lay-filter="add" style="display:none" id="add"></button>
                </form>
            `;
        layer.open({
            title: "添加新版区",
            type: 1,
            area: ['350px', '400px'],
            content: addExpand,
            btn: ['添加', '取消'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
            btn1: function () {
                $('#add').click();
            },
            btn2: function () {
            },
        });
        form.on('submit(add)', function (data) {
            console.log(data.field);
            $.ajax({
                type: "post",
                data: data.field,
                url: '/expend/addExpend',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (data) {
                    console.log(data);
                    if (data.state == "err") {
                        layer.alert(data.msg, {
                            title: "来自添加版区的提示",
                            icon: 5,
                            skin: 'layer-ext-moon'
                        })
                    } else {
                        layer.alert(data.msg, {
                            title: "来自添加版区的提示",
                            icon: 1,
                            skin: 'layer-ext-moon',
                            end: function () {
                                layer.closeAll();
                            }
                        });
                        //添加成功异步刷新页面
                        var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
                        console.log(nowindex);
                        layPageShow("pages1", "#expendShow", nowindex);

                    }

                },
                error: function () {
                    layer.alert('服务器发呆去了，请重试', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                }
            });
            return false;
        });
    });

    //搜索
    form.on('submit(search)', function (data) {
        if (data.field.expendmin == "" && data.field.expendmax == "" && data.field.expendName == "") {
            layer.alert('请输入搜索条件', {
                skin: 'layui-layer-lan',
                anim: 2 //动画类型
            });
        }
        else if (data.field.expendmin > data.field.expendmax) {
            layer.alert('请输入正确的范围', {
                skin: 'layui-layer-lan',
                anim: 2 //动画类型
            });
        } else {
            layPageShow('pages1', '#expendShow', 1, data.field);
        }

        return false;
    });

    function getAccout(nowTime) {
        var obj = { nowTime: nowTime };
        $.ajax({
            type: "post",
            data: obj,
            url: '/expend/getAccount',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (dataResult) {
                if (dataResult.state == "err") {
                    layer.alert(dataResult.msg, {
                        title: "来自版区的提示",
                        icon: 5,
                        skin: 'layer-ext-moon'
                    })
                } else {
                    doOption(dataResult);
                }
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
    }
    //百度
    (function () {
        $('#main').css('width', $(".layui-show").width() + "px");
    }());
    //生成新的option
    var legendArr = [];
    var xAsisData = [];
    var seriesData = [];

    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },

        legend: {
            data: legendArr

        },

        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },

        xAxis: [
            {
                type: 'category',
                data: xAsisData
            }
        ],

        yAxis: [
            {
                type: 'value'
            }
        ],
        series: seriesData
    };

    function doOption(data) {
        $.each(data.dataexpend, function (m, n) {
            legendArr[m] = n.expendName;
            xAsisData[0] = "数据来自于：" + n.expendDay;
            seriesData[m] = {
                name: n.expendName,
                type: "bar",
                data: [n.expendCount],
            };
        });
        var myChart = echarts.init(document.getElementById('main'));
        myChart.setOption(option);
    }

    setTimeout(function () {
        window.onresize = function () {
            $('#main').css('width', ($("#userBox2").width() - 20) + "px");
            myChart.resize();
        }
    }, 200)

    //点击确认获得数据
    form.on('submit(getDate)', function (data) {
        getAccout(data.field.date);
        return false;
    });

    var editor = new baidu.editor.ui.Editor();
    editor.render("myEditor");
    $('body').on('click', '#setExpendTitle', function () {
        $('#setTitle').click();
       
    });
    form.on('submit(setTitle)', function (data) {
        var obj=data.field;
        obj.titleBody = editor.body.innerHTML;
        var hassensitive = dosensitive(editor.body.innerHTML);
        if (hassensitive.length > 0) {
            //存在敏感词
            var msg = "不允许出现以下敏感词：" + hassensitive.join("、");
            layer.alert(msg, {
                title: "提示",
                icon: 5,
                skin: 'layer-ext-moon'
            })
        } else {
            $.ajax({
                type: "post",
                data: obj,
                url: '/expend/setExpendTitle',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (data) {
                    if (data.state == "err") {
                        layer.alert(data.msg, {
                            title: "提示",
                            icon: 5,
                            skin: 'layer-ext-moon'
                        })
                    } else {
                        layer.alert(data.msg, {
                            title: "提示",
                            icon: 1,
                            skin: 'layer-ext-moon'
                        })
                    }
                },
                error: function () {
                    layer.alert('服务器发呆去了，请重试', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                }
            })
        }
        
       
        return false;
    });

    function dosensitive(html) {
        var getsensitiveName = [];
        $.ajax({
            type: "get",
            url: '/expend/getSensitiveAll',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                
                $.each(data.allSensitive, function (m, n) {
                    if (html.indexOf(n.sensitiveName) != -1) {
                        getsensitiveName[getsensitiveName.length] = n.sensitiveName
                    }
                });
              
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        })
        return getsensitiveName;
    }
});

