/**
 * Created by YimiZSK on 2017/3/22.
 */

layui.use(['form', 'layedit', 'laydate', 'laypage', 'element'], function () {
    var form = layui.form(),
        layer = layui.layer,
        laypage = layui.laypage,
        element = layui.element(); //导航的hover效果、二级菜单等功能，需要依赖element模块

    var searchdata = getExpendAndState();
    searchShow(searchdata);
    layPageShow('pages1', '#titleShow');
    var searchdata = getExpendAndState();
    searchShow(searchdata);
    //监听导航点击
    element.on('nav(listUser)', function (elem) {
        var showBox = $(elem).attr('data-list');
        $(showBox).removeClass('hidden').siblings().addClass('hidden');
        console.log(showBox);
        if (showBox == "#userBox1") {
            var searchdata = getExpendAndState();
            searchShow(searchdata);
            layPageShow('pages1', '#titleShow');
        } else if (showBox == "#userBox2") {
            layPageShow('pages2', '#willTitleShow', 1, { titleState: 101 });
        } else {
            var searchdata = getExpendAndState();
            searchShow(searchdata);

            layPageShow('pages3', '#adminTitleShow', 1, { titleAdminId: "my" });
        }
    });

    //自定义验证规则
    form.verify({
        title: function (value) {
            if (value.length < 5) {
                return '标题至少得5个字符啊';
            }
        },
        pass: [/(.+){6,12}$/, '密码必须6到12位'],
        content: function (value) {
            layedit.sync(editIndex);
        }
    });



    /*页数显示*/
    function getCourses(obj, search) {
        var count = 5;
        if (obj.pages == undefined) {
            obj.pages = 1;
        }
        obj.pagesCount = count;
        if (search != undefined || search != null) {
            obj.titleNameOrAuthor = search.titleNameOrAuthor;
            obj.titleExpend = search.titleExpend;
            obj.titleState = search.titleState;
            obj.titleTime = search.titleTime;
            obj.titleAdminId = search.titleAdminId;
        }
        //获取每个所选词
        var getData;
        $.ajax({
            type: "post",
            data: obj,
            url: '/invitation/getTitle',
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
        show(firstData.title, ele);
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
                show(getData.title, ele);

                isFirst = false;
            }
        });

    }

    //页面渲染
    function show(data, ele) {
        var html = '';
        $.each(data, function (m, n) {
            html += `
                <tr data-id="${n.titleId}">
                                        <td>${n.titleName}</td>
                                        <td>${n.titleExpend}</td>
                                        <td>${n.titleAuthor}</td>
                                        <td>${n.titleTime}</td>
                                        <td>${n.titleState}</td>
                                        `;
            if (ele == "#titleShow") {
                html += `
                                        <td>
                                            <button class ="layui-btn layui-btn-warm layui-btn-small" data-operate="titleDetails">
                                                <i class ="layui-icon">&#xe60a; </i>
                                                查看</button>
                                            <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="titleDelete">
                                                <i class ="layui-icon">&#xe640; </i>
                                                删除</button>
                                            <button class ="layui-btn layui-btn-danger layui-btn-small" data-operate="titleTop">
                                                <i class ="layui-icon">&#xe604; </i>
                                                置顶</button>
                                            <button class ="layui-btn  layui-btn-small" data-operate="titleGood">
                                                <i class ="layui-icon">&#xe604; </i>
                                                加精</button>
                                        </td>
                                    </tr>
                `;
            } else if (ele == "#willTitleShow") {
                html += `
                                        <td>
                                            <button class ="layui-btn layui-btn-warm layui-btn-small" data-operate="titleDetails">
                                                <i class ="layui-icon">&#xe60a; </i>
                                                查看</button>
                                            <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="titleDelete">
                                                <i class ="layui-icon">&#xe640; </i>
                                                删除</button>
                                        </td>
                                    </tr>
                `;
            } else {
                html += `
                                        <td>
                                            <button class ="layui-btn layui-btn-warm layui-btn-small" data-operate="titleDetails">
                                                <i class ="layui-icon">&#xe60a; </i>
                                                查看</button>
                                            <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="titleDelete">
                                                <i class ="layui-icon">&#xe640; </i>
                                                删除</button>
                                            <button class ="layui-btn layui-btn-danger layui-btn-small" data-operate="titleTop">
                                                <i class ="layui-icon">&#xe604; </i>
                                                置顶</button>
                                            <button class ="layui-btn  layui-btn-small" data-operate="titleGood">
                                                <i class ="layui-icon">&#xe604; </i>
                                                加精</button>
                                        </td>
                                    </tr>
                `;
            }
        });
        $(ele).html(html);
    }
    //搜索显示
    function searchShow(data) {
        var html = '';
        html += `
            <div class ="layui-form-item layui-form-item-inline">
                                            <div class ="layui-inline">
                                                <label class ="layui-form-label">发帖人\帖名</label>
                                                <div class ="layui-input-inline">
                                                    <input type="text" class ="layui-input" name="titleNameOrAuthor">
                                                </div>
                                            </div>
                                        </div>
                                        <div class ="layui-form-item layui-form-item-inline">
                                            <div class ="layui-inline">
                                                <label class ="layui-form-label">版区名称: </label>
                                                <div class ="layui-input-inline">
                                                    <select name="titleExpend" lay-verify="required" lay-search="">
                                                        <option value="0">全部</option>
                                                    `;

        $.each(data.expend, function (m, n) {
            html += `<option value="${n.expendNum}">${n.expendName}</option>`
        })
        html += `
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class ="layui-form-item layui-form-item-inline">
                                            <div class ="layui-inline">
                                                <label class ="layui-form-label">状态: </label>
                                                <div class ="layui-input-inline">
                                                    <select name="titleState" lay-verify="required" >
                                                     <option value="0">全部</option>
                                                     `;
        $.each(data.state, function (m, n) {
            html += `<option value="${n.titleStateNum}">${n.titleStateName}</option>`
        })
        html += `
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class ="layui-form-item layui-form-item-inline">
                                            <div class ="layui-inline">
                                                <label class ="layui-form-label">日期</label>
                                                <div class ="layui-input-inline">
                                                    <input type="text" name="titleTime" id="date3"  placeholder="yyyy-mm" autocomplete="off" class ="layui-input" onclick="layui.laydate({elem: this})">
                                                </div>
                                            </div>
                                        </div>
                                        <div class ="layui-form-item layui-form-item-inline">
                                            <button class ="layui-btn " lay-submit="search" lay-filter="search">确认</button>
                                        </div>
            `;
        $('.titleSearch').html(html);
        form.render();
    }
    //搜索数据
    function getExpendAndState() {
        var getData;
        $.ajax({
            type: "post",
            url: '/invitation/getExpendAndState',
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

    var userDetails = "";
    //点击详情事件
    $('body').on('click', 'button[data-operate="details"]', function () {
        userDetails = $('.userDetails').html();
        layer.open({
            title: "用户详情",
            type: 1,
            area: ['350px', '500px'],
            content: userDetails,
            btn: ['关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
        });
    });


    //删除事件
    $('body').on('click', 'button[data-operate="titleDelete"]', function () {
        var name = $($(this).parents('tr').children()[0]).html();
        var titleId = $(this).parent('td').parent('tr').data('id');
        var obj = { titleId: titleId };
        layer.confirm('确认删除' + name + '吗', {
            title: "操作提示",
            btn: ['确认', '取消'] //按钮
        }, function () {
            $.ajax({
                type: "post",
                data: obj,
                url: '/invitation/deleteTitle',
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
                                operateSue();
                                layer.closeAll();
                            }
                        });
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

    //置顶
    $('body').on('click', 'button[data-operate="titleTop"]', function () {
        var titleId = $(this).parent('td').parent('tr').data('id');
        var options = $('select[name="titleState"]>option');
        var titleState;
        for (var i = 0; i < options.length; i++) {
            if ($(options[i]).html() == "置顶") {
                titleState = $(options[i]).val();
            }
        }
        var obj = { titleId: titleId, titleState: titleState };
        changeState(obj);
    });

    //加精事件
    $('body').on('click', 'button[data-operate="titleGood"]', function () {
        var titleId = $(this).parent('td').parent('tr').data('id');
        var options = $('select[name="titleState"]>option');
        var titleState;
        for (var i = 0; i < options.length; i++) {
            if ($(options[i]).html() == "加精") {
                titleState = $(options[i]).val();
            }
        }
        var obj = { titleId: titleId, titleState: titleState };
        changeState(obj);
    });

    //查询事件
    $('body').on('click', 'button[data-operate="titleDetails"]', function () {
        var titleId = $(this).parent('td').parent('tr').data('id');
        var obj = { titleId: titleId };
        $.ajax({
            type: "post",
            data: obj,
            url: '/invitation/getTitleDet',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                dotitleDetails(data);
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });

        function dotitleDetails(data) {
            console.log(data);
            var title = (data.title)[0];
            var html=`<div style="padding: 20px;">`;
            //题目
            html += `<p style="text-align: center;font-size: 20px;padding: 5px;margin: 10px;font-weight: 500;">${title.titleName}</p>`;
            //作者版区
            html += `
                <p style="text-align: center;margin-bottom: 16px; ">
                    <span style="margin: 0 10px;text-align: center;font-size: 15px;color: #8a8989; ">版区：${title.titleExpend}</span>
                    <span style="margin: 0 10px;text-align: center;font-size: 15px;color: #8a8989; ">作者：${title.titleAuthor}</span>
                    <span style="margin: 0 10px;text-align: center;font-size: 15px;color: #8a8989; ">发表时间：${title.titleTime}</span>
                </p>`;
            //获得主体内容
            var titleBodyhtml = title.titleBodyHtml;
            var el = $('<div></div>');
            el.html(titleBodyhtml);
            var htmlTar = el[0].innerText;
            html += htmlTar;
            html += "</div>";
            layer.open({
                title: '审核帖子',
                type: "审核帖子",
                area: ['600px', '80%'],
                content: html,
                btn: ['通过', '禁止'],
                btnAlign: 'c',//按钮居中
                shade: 0.3, //遮罩
                btn1: function () {
                    //发送ajax
                    var options = $('select[name="titleState"]>option');
                    var titleState;
                    for (var i = 0; i < options.length; i++) {
                        if ($(options[i]).html() == "已审核") {
                            titleState = $(options[i]).val();
                        }
                    }
                    var obj = { titleId: title.titleId, titleState: titleState };
                    changeState(obj);
                },
                btn2: function () {
                    console.log('关闭窗口');
                },
            });
        }

    });
    
    //更改状态
    function changeState(obj) {
        $.ajax({
            type: "post",
            data: obj,
            url: '/invitation/changeState',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                if (data.state == "err") {
                    layer.alert(data.msg, {
                        title: "提示",
                        icon: 5,
                        skin: 'layer-ext-moon',
                    })
                } else {
                    layer.alert(data.msg, {
                        title: "提示",
                        icon: 1,
                        skin: 'layer-ext-moon',
                        end: function () {
                            operateSue();
                            layer.closeAll();
                        }
                    });
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

    //搜索
    form.on('submit(search)', function (data) {
        operateSue(data.field);
        console.log(data);
        return false;
    });

    function operateSue(data) {
        var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
        var showBox = $('.containerShowBox:not(.hidden)').attr('id');
        if (showBox == "userBox1") {
            
            layPageShow('pages1', '#titleShow', nowindex, data);
        } else if (showBox == "userBox2") {
            layPageShow('pages2', '#willTitleShow', nowindex, data);
        } else {
            layPageShow('pages3', '#adminTitleShow', nowindex, data);
        }
    }
});

