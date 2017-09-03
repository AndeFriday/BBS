/**
 * Created by YimiZSK on 2017/3/22.
 */


layui.use(['form', 'layedit', 'laydate', 'laypage', 'element'], function () {
    var form = layui.form(),
        layer = layui.layer,
        laypage = layui.laypage,
        element = layui.element();

    dosensitive();
    //自定义验证规则
    form.verify({
        sensitiveName: function (value) {
            if(value.length < 0){
                return '敏感词不能为空';
            }
        }
    });

    //导航的hover效果、二级菜单等功能，需要依赖element模块
    //监听导航点击
    element.on('nav(listUser)', function(elem){
        var showBox=$(elem).attr('data-list');
        $(showBox).removeClass('hidden').siblings().addClass('hidden');
        if (showBox == "#userBox1") {
            dosensitive();
        } else {
            //首次打开页面
            layPageShow('pages2', '#comeShow');
        }
    });

    //请求敏感词
    function dosensitive() {
        $.ajax({
            url: '/system/getsensitive',
            type: "get",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                var html = '';
                $.each(data.ensitivedata, function (m, n) {
                    html += `
                            <div class ="layui-btn-group" data-id="${n.sensitiveId}">
                                        <span>${n.sensitiveName}</span>
                                        <button class ="layui-btn layui-btn-primary layui-btn-small" data-operate="updateSensitive"><i class ="layui-icon">&#xe642; </i></button>
                                        <button class ="layui-btn layui-btn-primary layui-btn-small" data-operate="deleteSensitive"><i class ="layui-icon">&#xe640; </i></button>
                                    </div>
                            `
                });
                $('#sensitive').html(html);
            },
        });
    }

    //敏感词修改事件
    $('body').on('click', 'button[data-operate="updateSensitive"]', function () {
        var sensitiveId = $(this).parent('.layui-btn-group').data('id');
        var sensitiveName = $(this).siblings('span').html();
        var sensitiveUpdate = `
             <form class ="layui-form" action="" style="margin-top: 20px;" id="adminUpdateForm">
                    <input type="hidden" name="sensitiveId" lay-filter="sensitiveId" value="${sensitiveId}">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">敏感词: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="sensitiveName" lay-filter="sensitiveName" autocomplete="off" value="${sensitiveName}" class ="layui-input " >
                        </div>
                    </div>
                     <button class ="layui-btn" lay-submit="" lay-filter="sensitiveUpdate" style="display:none" id="sensitiveUpdate"></button>
             </form>
            `
        layer.open({
            title: "敏感词修改",
            type: 1,
            area: ['350px', '200px'],
            content: sensitiveUpdate,
            btn: ['更新','关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
            btn1: function () {
                $('#sensitiveUpdate').click();
            },
            btn2: function () {
            }
        });
    });

    //监听修改点击事件
    form.on('submit(sensitiveUpdate)', function (data) {
        console.log(data.field);
        $.ajax({
            type: "post",
            data: data.field,
            url: '/system/updatesensitive',
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
                        skin: 'layer-ext-moon',
                        end: function () {
                            layer.closeAll();
                        }
                    });
                    //添加成功异步刷新页面
                    dosensitive();
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

    //删除敏感词
    $('body').on('click', 'button[data-operate="deleteSensitive"]', function () {
        var sensitiveId = $(this).parent('.layui-btn-group').data('id');
        $.ajax({
            type: "post",
            data: { sensitiveId: sensitiveId },
            url: '/system/deletesensitiven',
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
                        skin: 'layer-ext-moon',
                        end: function () {
                            layer.closeAll();
                        }
                    });
                    //异步刷新页面
                    dosensitive();
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
    });

    //增加敏感词
    $('body').on('click', 'button[data-operate="addSensitive"]', function () {
        var sensitiveAdd = `
             <form class ="layui-form" action="" style="margin-top: 20px;" id="adminUpdateForm">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">敏感词: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="sensitiveName" lay-filter="sensitiveName" autocomplete="off" value="" class ="layui-input " >
                        </div>
                    </div>
                     <button class ="layui-btn" lay-submit="" lay-filter="sensitiveAdd" style="display:none" id="sensitiveAdd"></button>
             </form>
            `
        layer.open({
            title: "敏感词添加",
            type: 1,
            area: ['350px', '180px'],
            content: sensitiveAdd,
            btn: ['添加', '关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
            btn1: function () {
                $('#sensitiveAdd').click();
            },
            btn2: function () {
            }
        });
    });

    //监听添加敏感词点击事件
    form.on('submit(sensitiveAdd)', function (data) {
        console.log(data.field);
        $.ajax({
            type: "post",
            data: data.field,
            url: '/system/addsensitive',
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
                        skin: 'layer-ext-moon',
                        end: function () {
                            layer.closeAll();
                        }
                    });
                    //添加成功异步刷新页面
                    dosensitive();
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

    //生成页面
    function layPageShow(pageele, ele, pageindex,search) {
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
    //展示在页面
    function show(data, ele) {
        var html = '';
        $.each(data, function (m, n) {
            html += `
                            <tr data-id="${n.comeId}">
                                    <td>${n.comeIp}</td>
                                    <td>${n.comeExpend}</td>
                                    <td>${n.comeTime}</td>`;
            if (n.comeCan == 0) {
                html += `<td>已禁止</td>
                     <td>
                                        <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="update">
                                            <i class ="layui-icon">&#xe60a; </i>
                                            取消禁止</button>
                                    </td>
                                </tr>
                                `
            } else {
                html += `<td>未禁止</td>
                     <td>
                                        <button class ="layui-btn  layui-btn-danger layui-btn-small" data-operate="update">
                                            <i class ="layui-icon">&#xe60a; </i>
                                            禁止访问</button>
                                    </td>
                                </tr>`
            }
        });
        $(ele).html(html);
    }
    //获得数据
    function getCourses(obj, search) {
        var count = 5;
        if (obj.pages == undefined) {
            obj.pages = 1;
        }
        if (search != undefined||search!=null) {
            obj.comeIp = search.comeIp;
            obj.comeTime = search.comeTime;
        }
        obj.pagesCount = count;
        //获取每个所选词
        console.log(obj);
        var getData;
        $.ajax({
            type: "post",
            data: obj,
            url: '/system/comeUserAll',
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

    //更新状态事件
    $('body').on('click', 'button[data-operate="update"]', function () {
        var obj = {};
        var state = $(this).hasClass('layui-btn-normal') ? 1 : 0;
        var comeip = $($(this).parent('td').parent('tr').children('td')[0]).html();
        obj.comeCan = state;
        obj.comeIp = comeip;
        console.log(obj);
        $.ajax({
            type: "post",
            data: obj,
            url: '/system/changeIp',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (dataResult) {
                if (dataResult.status == "err") {
                    layer.alert(dataResult.msg, {
                        title: "提示",
                        icon: 5,
                        skin: 'layer-ext-moon'
                    })
                } else {
                    layer.alert(dataResult.msg, {
                        title: "提示",
                        icon: 1,
                        skin: 'layer-ext-moon',
                        end: function () {
                            layPageShow('pages2', '#comeShow');
                        }
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
        });
    });

    //搜索
    form.on('submit(search)', function (data) {
        layPageShow('pages2', '#comeShow',1 ,data.field);
        return false;
    });
});

