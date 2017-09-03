/**
 * Created by YimiZSK on 2017/3/24.
 */
/**
 * Created by YimiZSK on 2017/3/22.
 */
layui.use('element', function(){
    var element = layui.element(); //导航的hover效果、二级菜单等功能，需要依赖element模块
    //监听导航点击
    element.on('nav(listUser)', function(elem){
        var showBox=$(elem).attr('data-list');
        $(showBox).removeClass('hidden').siblings().addClass('hidden');
    });
});

layui.use(['form', 'layedit', 'laydate','laypage'], function(){
    var form = layui.form(),
        layer = layui.layer
    laypage=layui.laypage;


 //自定义验证规则
            form.verify({
                adminname: function (value) {
                    if (value.length <= 0) {
                        return '用户名不能为空';
                    }
                },
                adminphone: [/^1(3|4|5|7|8)\d{9}$/, '电话号码格式不正确'],
                adminemail: [/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/, '邮箱格式不正确'],
                //密码修改
                adminnewPwd: [/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/, '检测密码应由6-21字母和数字组成，不能是纯数字或纯英文'],
                adminrenewPwd: function (value) {
                    var newPwd = $('input[name="adminnewPwd"]').val();
                    if (value != newPwd) {
                        return '两次密码输入不同';
                    }
                }
            });



    //监听提交（用户修改）
    form.on('submit(updateUser)', function(data){
        var that=this;
        var a=$(this).parents('form').find('input');
        if(!parseInt($(this).attr('lay-state'))){
            $(this).addClass('layui-btn-danger');
            a.removeClass('layui-disabled-normal');
            a.removeAttr("disabled"); ;
            $(this).attr('lay-state','1')
        }else{
           
            layer.confirm('确认修改？', {
                btn: ['确认','取消'] //按钮
            }, function (index) {
                //做ajax请求
                $.ajax({
                    type: "post",
                    data: data.field,
                    url: '/AdminUser/adminUpdateInfo',
                    dataType: 'json',
                    success: function (dataResult) {
                        if (dataResult.state == 1 && dataResult.res == "success") {
                            layer.close(index);
                            layer.msg(dataResult.message);
                        } else {
                            layer.alert('修改失败', {
                                skin: 'layui-layer-lan',
                                closeBtn: 0,
                                anim: 4 //动画类型
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
                goBack();
            }, function(){
                goBack();
            });

            function goBack() {
                console.log(that);
                $(that).removeClass('layui-btn-danger');
                a.addClass('layui-disabled-normal');
                a.attr("disabled",'disabled'); ;
                $(that).attr('lay-state','0');
            }
        }
        return false;
    });

    //监听提交（密码修改）
    form.on('submit(updatePwd)', function(data) {
        $.ajax({
            type: "post",
            data: data.field,
            url: '/AdminUser/adminUpdatePwd',
            dataType: 'json',
            success: function (dataResult) {
                if (dataResult.state == 1 ) {
                    layer.msg(dataResult.message);
                } else {
                    layer.alert(dataResult.message, {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 
                    });
                }
                console.log(dataResult);
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

//百度图标
var myChart = echarts.init(document.getElementById('main'));
// 指定图表的配置项和数据
$.ajax({
    type:'get',
    url:'themes/data/attendance.json',
    dataType: "json",
    success:function (data) {
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(data);
    }
});






