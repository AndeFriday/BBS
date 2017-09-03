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
        element = layui.element();
    var count = 5;
    //首次打开页面(1)
    layPageShow('admin', 'pages1', '#adminShow');
    //首次打开页面
    searchShow("admin");
    searchShow("user");
    /*页数显示*/
    function getCourses(obj, search) {
        if (obj.pages == undefined) {
            obj.pages = 1;
        }
        if (search != undefined || search != null) {
            obj.adminexpend = search.expend;
            obj.status = search.adminType;
            obj.nameOrPhone = search.nameOrPhone;
            obj.userNameOrPhone = search.userNameOrPhone;
            obj.userstatus = search.userstatus;
        }
        obj.pagesCount = count;
        //获取每个所选词
        var getData;
        var loadindex = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        $.ajax({
            type: "post",
            data: obj,
            url: '/userAndAdmin/getAdminOrUser',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async:false,
            success: function (dataResult) {
                getData = dataResult;
                layer.close(loadindex);
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

    //分页显示
    function layPageShow(role,pageele,ele,pageindex,search) {
        /*首次加载时候获得页数*/
        var isFirst = true;
        var firstData = getCourses({ role: role, pages: 1 }, search);
        show(firstData.dataResult,ele);
        var mypages = firstData.pageCount;
        if (pageindex == null || pageindex == undefined || mypages < pageindex) {
            pageindex = 1;
        }
        laypage({
            cont:pageele,
            pages: mypages,
            curr:pageindex,
            groups: 5,
            skin: '#1E9FFF',
            jump: function (obj) {
                if (isFirst && (obj.curr == 1)) {
                    return false;
                }
                layer.msg('第 ' + obj.curr + ' 页');
                var getData = getCourses({ pages: obj.curr, role: role }, search);
                show(getData.dataResult,ele);
                isFirst = false;
            }
        });
    }
   
    //搜索显示
    function searchShow(role) {
        var html = '';
        if (role == "admin") {
            var mydata = getExpendAndStatu();
            html += `
            <div class ="layui-form-item layui-form-item-nobottommargin">
                                        <div class ="layui-inline">
                                            <label class ="layui-form-label">版区：</label>
                                            <div class ="layui-input-inline  layui-input-short">
                                                <select name="expend">
                                                    <option value="0">全部</option>
                                                `;
            $.each(mydata.dataExpend, function (a, b) {
                html += `<option value="${b.expendNum}">${b.expendName}</option>`
            });
            html += `
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class ="layui-form-item layui-form-item-nobottommargin">
                                        <div class ="layui-inline">
                                            <label class ="layui-form-label">角色：</label>
                                            <div class ="layui-input-inline  layui-input-short">
                                            <select name="adminType">
                                                <option value="0">全部</option>`
            $.each(mydata.dataType, function (c, d) {
                html += `<option value="${d.adminTypeid}">${d.statusName}</option>`
            });
            html += `
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class ="layui-form-item layui-form-item-nobottommargin">
                                        <div class ="layui-inline">
                                            <label class ="layui-form-label">用户名/手机: </label>
                                            <div class ="layui-input-inline  layui-input-short">
                                                <input type="text" name="nameOrPhone" lay-verify="" autocomplete="off" placeholder="请输入" class ="layui-input">
                                            </div>
                                            <button class ="layui-btn " lay-submit="search" lay-filter="search">确认</button>
                                        </div>
                                    </div>
            `;
            $('#expendSearch').html(html);
        } else {
            var mydata = getuserRole();
            var userRole = `<select name="userstatus">
                            <option value="0">全部</option>`;
            $.each(mydata.dataStatus, function (a, b) {
                userRole += `
                      <option value="${b.userTypeid}">${b.userStatus}</option>
                    `
            });
            userRole += `</select>`;
            $('#userRoleOption').html(userRole)
        }
        form.render();
    }

    //用户搜索
    form.on('submit(search)', function (data) {
        layPageShow('admin', 'pages1', '#adminShow', 1, data.field);
        return false;
    });
    //用户搜索
    form.on('submit(usersearch)', function (data) {
        layPageShow('userOnly', 'pages2', '#userShow', 1, data.field);
        return false;
    });
    //监听导航点击
    element.on('nav(listUser)', function (elem) {
        var showBox = $(elem).attr('data-list');
        $(showBox).removeClass('hidden').siblings().addClass('hidden');
        var role = $(elem).attr('data-role');
        var pageele;
        var ele;
        if (role == "admin") {
            pageele = "pages1"
            ele = "#adminShow";
        } else {
            pageele = "pages2"
            ele = "#userShow";
        }
        //第一次调用
        layPageShow(role,pageele,ele);
    });

    //页面渲染
    function show(data,ele) {
        var html = '';
        $.each(data, function (m, n) {
            if (ele == "#adminShow") {
                html += ` <tr data-id="${n.adminId}">
                                    <td>${n.adminname}</td>
                                    <td>${n.adminphone}</td>
                                    <td>${n.adminexpend}</td>
                                    <td>${n.adminstatus}</td>
                                    <td>
                                        <button class="layui-btn layui-btn-warm layui-btn-small" data-operate="admindetails">
                                            <i class="layui-icon">&#xe60a;</i>
                                            详情</button>
                                        <button class="layui-btn layui-btn-danger layui-btn-small" data-operate="adminupdate">
                                            <i class="layui-icon">&#xe642;</i>
                                            修改</button>
                                        <button class="layui-btn layui-btn-normal layui-btn-small" data-operate="admindelete">
                                            <i class="layui-icon">&#xe640;</i>
                                            删除</button>
                                    </td>
                                </tr>`;
            } else {
                html += ` <tr data-id="${n.userOnlyid}">
                                    <td>${n.username}</td>
                                    <td>${n.userphone}</td>
                                    <td>${n.userstatus}</td>
                                    <td>
                                        <button class="layui-btn layui-btn-warm layui-btn-small" data-operate="userdetails">
                                            <i class="layui-icon">&#xe60a;</i>
                                            详情</button>
                                        <button class="layui-btn layui-btn-danger layui-btn-small" data-operate="userupdate">
                                            <i class="layui-icon">&#xe642;</i>
                                            修改</button>
                                        <button class="layui-btn layui-btn-normal layui-btn-small" data-operate="userdelete">
                                            <i class="layui-icon">&#xe640;</i>
                                            删除</button>
                                             <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="userpwd">
                                            <i class ="layui-icon">&#xe640; </i>
                                            重置密码</button>
                                    </td>
                                </tr>`;
            }
        });
        $(ele).html(html);
    }

    //自定义验证规则
    form.verify({
        adminname: function (value) {
            if (value.length <=0) {
                return '用户名不能为空';
            }
        },
        adminphone: [/^1(3|4|5|7|8)\d{9}$/, '手机号码格式不正确'],
        adminemail: [/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/, '邮箱格式不正确'],
        adminadress: function (value) {
            if (value.length <= 0) {
                return '地址不能为空';
            }
        },
        username: function (value) {
            if (value.length <= 0) {
                return '用户名不能为空';
            }
        },
        userphone: [/^1(3|4|5|7|8)\d{9}$/, '手机号码格式不正确'],
    });

    //监听指定开关
    form.on('switch(switchTest)', function (data) {
        layer.msg('开关checked：' + (this.checked ? 'true' : 'false'), {
            offset: '6px'
        });
        layer.tips('温馨提示：请注意开关状态的文字可以随意定义，而不仅仅是ON|OFF', data.othis)
    });

    //监听提交
    form.on('submit(updateUser)', function (data) {
        var that = this;
        var a = $(this).parents('form').find('input');
        if (!parseInt($(this).attr('lay-state'))) {
            $(this).addClass('layui-btn-danger');
            a.removeClass('layui-disabled-normal');
            a.removeAttr("disabled");;
            $(this).attr('lay-state', '1')
        } else {

            layer.confirm('确认修改？', {
                btn: ['确认', '取消'] //按钮
            }, function () {
                layer.alert(JSON.stringify(data.field), {
                    title: '最终的提交信息'
                });
                goBack();
                //做ajax请求
            }, function () {
                goBack();
            });

            function goBack() {
                console.log(that);
                $(that).removeClass('layui-btn-danger');
                a.addClass('layui-disabled-normal');
                a.attr("disabled", 'disabled');;
                $(that).attr('lay-state', '0');
            }
        }
        return false;
    });

    //查看管理员详情
    $('body').on('click', 'button[data-operate="admindetails"]', function () {
        var adminid = $(this).parent('td').parent('tr').data('id');
        var obj = { adminId: adminid };
        var mydata;
        $.ajax({
            type: "post",
            data: obj,
            url: '/userAndAdmin/getAdmin',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                mydata = data;
                console.log(data);
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        var adminDetails;
        $.each(mydata.dataAdmin, function (n, m) {
            adminDetails = `
                 <form class ="layui-form" action="" style="margin-top: 20px;">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">用户名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="adminname"  autocomplete="off" value="${m.adminname}" class ="layui-input layui-disabled-normal" disabled>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">手机号码: </label>
                            <div class ="layui-input-inline">
                                <input type="tel" name="adminphone"  autocomplete="off" value="${m.adminphone}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">工作邮箱: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminemail"  autocomplete="off" value="${m.adminemail}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">所在处: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminadress"  autocomplete="off" value="${m.adminadress}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminexpend"  autocomplete="off" value="${m.adminexpend}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">角色: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminstatus"  autocomplete="off" value="${m.adminstatus}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                </form>
                `;
        })
        
        layer.open({
            title: "管理员详情",
            type: 1,
            area: ['350px', '500px'],
            content: adminDetails,
            btn: ['关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
        });
    });

    //修改管理员信息
    $('body').on('click', 'button[data-operate="adminupdate"]', function () {
        var adminid = $(this).parent('td').parent('tr').data('id');
        var eletr = $(this).parent('td').parent('tr');
        var obj = { adminId: adminid };
        //判断是否能操作
        $.ajax({
            type: "post",
            data: obj,
            url: '/userAndAdmin/isCanOperate',
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
                    doUpdate();
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
        function doUpdate() {
            var mydata;
            $.ajax({
                type: "post",
                data: obj,
                url: '/userAndAdmin/getAdmin',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (data) {
                    mydata = data;
                },
                error: function () {
                    layer.alert('服务器发呆去了，请重试', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                }
            });
            var adminupdata;
            $.each(mydata.dataAdmin, function (n, m) {
                adminupdata = `
                 <form class ="layui-form" action="" style="margin-top: 20px;" id="adminUpdateForm">
                    <input type="hidden" name="adminId" value="${m.adminId}">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">用户名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="adminname" lay-verify="adminname" autocomplete="off" value="${m.adminname}" class ="layui-input " >
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">手机号码: </label>
                            <div class ="layui-input-inline">
                                <input type="tel" name="adminphone" lay-verify="adminphone" autocomplete="off" value="${m.adminphone}" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">工作邮箱: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminemail"  lay-verify="adminemail"  autocomplete="off" value="${m.adminemail}" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">所在处: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminadress"  autocomplete="off" value="${m.adminadress}" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区: </label>
                            <div class ="layui-input-inline">
                                <select name="expend">
                                `;
                $.each(mydata.dataExpend, function (a, b) {
                    if (m.adminexpend == b.expendName) {
                        adminupdata += `
                      <option value="${b.expendNum}" selected>${b.expendName}</option>
                    `
                    } else {
                        adminupdata += `
                      <option value="${b.expendNum}">${b.expendName}</option>
                    `
                    }

                });
                adminupdata += `
                                 </select>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">角色: </label>
                            <div class ="layui-input-inline">
                                   <select name="adminType">`;
                $.each(mydata.dataType, function (c, d) {
                    if (m.adminstatus == d.statusName) {
                        adminupdata += `
                      <option value="${d.adminTypeid}" selected>${d.statusName}</option>
                    `
                    } else {
                        adminupdata += `
                      <option value="${d.adminTypeid}">${d.statusName}</option>
                    `
                    }

                });
                adminupdata += `
                                 </select>
                            </div>
                        </div>
                    </div>
                </form>
                `;
            })

            layer.open({
                title: "管理员详情",
                type: 1,
                area: ['350px', '500px'],
                content: adminupdata,
                btnAlign: 'c',//按钮居中
                shade: 0.3, //遮罩
                btn: ['确认', '取消'],//按钮
                btn1: function () {
                    var postdata = $('#adminUpdateForm').serializeJson();
                    console.log(postdata);
                    $.ajax({
                        type: "post",
                        data: postdata,
                        url: '/userAndAdmin/updateAdmin',
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
                                //将页面这一行数据更新
                                var newtr = '';
                                $.each(data.result.dataAdmin, function (f,g) {
                                    newtr += `
                                    <td>${g.adminname}</td>
                                    <td>${g.adminphone}</td>
                                    <td>${g.adminexpend}</td>
                                    <td>${g.adminstatus}</td>
                                    <td>
                                        <button class ="layui-btn layui-btn-warm layui-btn-small" data-operate="admindetails">
                                            <i class ="layui-icon">&#xe60a; </i>
                                            详情</button>
                                        <button class ="layui-btn layui-btn-danger layui-btn-small" data-operate="adminupdate">
                                            <i class ="layui-icon">&#xe642; </i>
                                            修改</button>
                                        <button class ="layui-btn layui-btn-normal layui-btn-small" data-operate="admindelete">
                                            <i class ="layui-icon">&#xe640; </i>
                                            删除</button>
                                    </td>
                                    `;
                                })
                                eletr.html(newtr);
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
                    });
                },
                btn2: function () {
                    console.log(2);
                }
            });
            form.render('select');
        }
    });

    //删除管理员
    $('body').on('click', 'button[data-operate="admindelete"]', function () {
        var that = this;
        var name = $($(this).parents('tr').children()[0]).html();
        var adminid = $(this).parent('td').parent('tr').data('id');
        var eletr = $(this).parent('td').parent('tr');
        var obj = { adminId: adminid };
        //判断是否能操作
        $.ajax({
            type: "post",
            data: obj,
            url: '/userAndAdmin/isCanOperate',
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
                    doDelete();
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
        function doDelete() {
            layer.confirm('确认删除' + name + '吗', {
                title: "操作提示",
                btn: ['确认', '取消'] //按钮
            }, function () {
                //删除的操作
                $.ajax({
                    type: "post",
                    data: obj,
                    url: '/userAndAdmin/deleteAdmin',
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
                                icon: 5,
                                skin: 'layer-ext-moon'
                            });
                            layPageShow('admin', 'pages1', '#adminShow',2);
                            //$(that).parents('tr').remove('tr[data-id="' + adminid + '"]');          
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
        }
    });

    //获得版区和角色信息
    function getExpendAndStatu() {
        var mydata;
        $.ajax({
            type: "get",
            url: '/userAndAdmin/getExpendAndStatus',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                mydata = data;
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        return mydata;
    }

    //增加新管理员
    $('body').on('click', 'button[data-operate="adminAdd"]', function () {
        var that = this;
        var mydata = getExpendAndStatu();
        var addAdmin =  `
                 <form class ="layui-form" action="" style="margin-top: 20px;" id="adminAdd">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">用户名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="adminname" lay-verify="adminname" autocomplete="off" value="" class ="layui-input " >
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">手机号码: </label>
                            <div class ="layui-input-inline">
                                <input type="tel" name="adminphone" lay-verify="adminphone" autocomplete="off" value="" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">工作邮箱: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminemail" lay-verify="adminemail" autocomplete="off" value="" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">所在处: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminadress" lay-verify="adminadress" autocomplete="off" value="" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">版区: </label>
                            <div class ="layui-input-inline">
                                <select name="expend">
                                `;
        $.each(mydata.dataExpend, function (a, b) {
            addAdmin += `<option value="${b.expendNum}">${b.expendName}</option>`
        });
        addAdmin += `
                                 </select>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">角色: </label>
                            <div class ="layui-input-inline">
                                   <select name="adminType">`;
        $.each(mydata.dataType, function (c, d) {
            addAdmin += `<option value="${d.adminTypeid}">${d.statusName}</option>`
        });
        addAdmin += `
                                 </select>
                            </div>
                        </div>
                    </div>
                     <button class ="layui-btn" lay-submit="" lay-filter="adminAdd" style="display:none" id="btnAdminAdd"></button>
                </form>
                `;
        //监听添加提交
        form.on('submit(adminAdd)', function (data) {
            $.ajax({
                type: "post",
                data:data.field,
                url: '/userAndAdmin/addAdmin',
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
                        layPageShow('admin', 'pages1', '#adminShow');
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
        layer.open({
            title: "添加新管理员",
            type: 1,
            area: ['350px', '480px'],
            content: addAdmin,
            btn: ['添加', '取消'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
            btn1: function () {
                $('#btnAdminAdd').click();
                //var data = $('#adminAdd').serializeJson();
            },
            btn2: function () {
                //取消添加
            },
        });
        form.render('select')
    });

    //点击成员详情事件
    $('body').on('click', 'button[data-operate="userdetails"]', function () {
        var userId = $(this).parent('td').parent('tr').data('id');
        var obj = { userOnlyid: userId };
        var mydata;
        $.ajax({
            type: "post",
            data: obj,
            url: '/userAndAdmin/getUser',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                mydata = data;
                console.log(data);
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        var userDetails;

        $.each(mydata.dataUser, function (n, m) {
            userDetails = `
                 <form class ="layui-form" action="" style="margin-top: 20px;">
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">用户名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="adminname"  autocomplete="off" value="${m.username}" class ="layui-input layui-disabled-normal" disabled>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">手机号码: </label>
                            <div class ="layui-input-inline">
                                <input type="tel" name="adminphone"  autocomplete="off" value="${m.userphone}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">角色: </label>
                            <div class ="layui-input-inline">
                                <input type="text" name="adminstatus"  autocomplete="off" value="${m.userstatus}" class ="layui-input layui-disabled-normal" disabled>
                            </div>
                        </div>
                    </div>
                </form>
                `;
        })

        layer.open({
            title: "管理员详情",
            type: 1,
            area: ['350px', '300px'],
            content: userDetails,
            btn: ['关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
        });
    });

    //更新成员事件
    $('body').on('click', 'button[data-operate="userupdate"]', function () {
        var userId = $(this).parent('td').parent('tr').data('id');
        var obj = { userOnlyid: userId };
        var mydata;
        $.ajax({
            type: "post",
            data: obj,
            url: '/userAndAdmin/getUser',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                mydata = data;
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        var userDetails;
        $.each(mydata.dataUser, function (n, m) {
            userDetails = `
                 <form class ="layui-form" action="" style="margin-top: 20px;">
                    <input type="hidden" name="userOnlyid"  autocomplete="off" value="${m.userOnlyid}" class ="layui-input " >
                    <div class ="layui-form-item">
                        <label class ="layui-form-label">用户名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="username" lay-verify="username" autocomplete="off" value="${m.username}" class ="layui-input " >
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">手机号码: </label>
                            <div class ="layui-input-inline">
                                <input type="tel" name="userphone" lay-verify="userphone" autocomplete="off" value="${m.userphone}" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">角色: </label>
                            <div class ="layui-input-inline">
                                <select name="userstatus">
                                `;
            $.each(mydata.dataStatus, function (a, b) {
                if (m.userstatus == b.userStatus) {
                    userDetails += `
                      <option value="${b.userTypeid}" selected>${b.userStatus}</option>
                    `
                } else {
                    userDetails += `
                      <option value="${b.userTypeid}">${b.userStatus}</option>
                    `
                }

            });
            userDetails+=       `
                                </select>
                            </div>
                        </div>
                    </div>
                    <button class ="layui-btn" lay-submit="" lay-filter="updateUser" style="display:none" id="updateUser"></button>
                </form>
                `;
        })
       
        layer.open({
            title: "管理员详情",
            type: 1,
            area: ['350px', '300px'],
            content: userDetails,
            btn: ['更新','关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
            btn1: function () {
                $('#updateUser').click();
            },
            btn2: function () { }
        });
        form.render('select');
        form.on('submit(updateUser)', function (data) {
            $.ajax({
                type: "post",
                data: data.field,
                url: '/userAndAdmin/updateuser',
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
                                var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
                                layPageShow('userOnly', 'pages2', '#userShow', nowindex);
                                layer.closeAll();
                            }
                        });

                        //添加成功异步刷新页面
                        layPageShow('admin', 'pages1', '#adminShow');
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

    //删除成员事件
    $('body').on('click', 'button[data-operate="userdelete"]', function () {
        var userId = $(this).parent('td').parent('tr').data('id');
        var obj = { userOnlyid: userId };
        var name = $($(this).parents('tr').children()[0]).html();
        layer.confirm('确认删除' + name + '吗', {
            title: "操作提示",
            btn: ['确认', '取消'] //按钮
        }, function () {
            $.ajax({
                type: "post",
                data: obj,
                url: '/userAndAdmin/deleteUser',
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
                                var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
                                layPageShow('userOnly', 'pages2', '#userShow', nowindex);
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

    //重置成员密码
    $('body').on('click', 'button[data-operate="userpwd"]', function () {
        var userId = $(this).parent('td').parent('tr').data('id');
        var obj = { userOnlyid: userId };
        var name = $($(this).parents('tr').children()[0]).html();
        layer.confirm('确认重置' + name + '的密码', {
            title: "操作提示",
            btn: ['确认', '取消'] //按钮
        }, function () {
            $.ajax({
                type: "post",
                data: obj,
                url: '/userAndAdmin/userpwd',
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

    //增加新成员
    $('body').on('click', 'button[data-operate="userAdd"]', function (e) {
        var mydata = getuserRole();
        var userDetails = `
                 <form class ="layui-form" action="" style="margin-top: 20px;">

                    <div class ="layui-form-item">
                        <label class ="layui-form-label">用户名: </label>
                        <div class ="layui-input-inline">
                            <input type="text" name="username" lay-verify="username" autocomplete="off" value="" class ="layui-input " >
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">手机号码: </label>
                            <div class ="layui-input-inline">
                                <input type="tel" name="userphone" lay-verify="userphone" autocomplete="off" value="" class ="layui-input " >
                            </div>
                        </div>
                    </div>
                    <div class ="layui-form-item">
                        <div class ="layui-inline">
                            <label class ="layui-form-label">角色: </label>
                            <div class ="layui-input-inline">
                                <select name="userstatus">
                                `;
        $.each(mydata.dataStatus, function (a, b) {
            userDetails += `
                      <option value="${b.userTypeid}">${b.userStatus}</option>
                    `
        });
        userDetails += `
                                </select>
                            </div>
                        </div>
                    </div>
                    <button class ="layui-btn" lay-submit="" lay-filter="addUser" style="display:none" id="addUser"></button>
                </form>
                `;
        layer.open({
            title: "添加新用户",
            type: 1,
            area: ['350px', '300px'],
            content: userDetails,
            btn: ['添加', '关闭'],
            btnAlign: 'c',//按钮居中
            shade: 0.3, //遮罩
            btn1: function () {
                $('#addUser').click();
            },
            btn2: function () { }
        });
        form.render('select');
        form.on('submit(addUser)', function (data) {
            console.log(data.field);
            $.ajax({
                type: "post",
                data: data.field,
                url: '/userAndAdmin/adduser',
                contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
                dataType: "json",
                async: false,
                success: function (data) {
                    if (data.state == "err") {
                        layer.alert(data.msg, {
                            title: "来自添加用户的提示",
                            icon: 5,
                            skin: 'layer-ext-moon'
                        })
                    } else {
                        layer.alert(data.msg, {
                            title: "来自添加用户的提示",
                            icon: 1,
                            skin: 'layer-ext-moon',
                            end: function () {
                                var nowindex = parseInt($($('.layui-laypage-curr>em')[1]).html());
                                layPageShow('userOnly', 'pages2', '#userShow', nowindex);
                                layer.closeAll();
                            }
                        });

                        //添加成功异步刷新页面
                        layPageShow('admin', 'pages1', '#adminShow');
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

    //获得用户所有角色
    function getuserRole() {
        var mydata;
        $.ajax({
            type: "post",
            url: '/userAndAdmin/getmyStatus',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",//必须有
            dataType: "json",
            async: false,
            success: function (data) {
                mydata = data;
            },
            error: function () {
                layer.alert('服务器发呆去了，请重试', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
        });
        return mydata;
    }
});

