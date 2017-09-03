using myBBS.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace myBBS.Controllers
{
    public class userAndAdminController : Controller
    {
        string mylayui = "<script src='/Scripts/jquery-1.10.2.min.js'></script><script src='/Content/themes/layer/layer.js'></script>";
        //用户界面请求
        public ActionResult userPages()
        {
            object objResult = "";
            if (!mySession.isSession())
            {
                return Content(mylayui + "<script> window.onload=function () { console.log('a');layer.msg('登录过期，请重新登录。',{time: 1000},function(){location.href='login'});}</script>");
            }
            string myname = mySession.getSessionName();
            string sql = "select * from admin where adminname='" + myname + "'";
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    ViewData["adminname"] = reader["adminname"].ToString();
                }
            }
            return View();
        }

        //获得分页数据
        public ActionResult getAdminOrUser()
        {
            object objResult = "";
            string role = Request.Params["role"].ToString().Trim();
            int pages = int.Parse(Request.Params["pages"]);
            int pagesCount = int.Parse(Request.Params["pagesCount"]);

            string requirement1 = "";
            string requirement2 = "";
            string requirement3 = "";
            if (role == "admin")
            {
                requirement1 = "adminexpend = adminexpend";
                if (Request.Params["adminexpend"] != null && Request.Params["adminexpend"].ToString() != "0")
                {
                    requirement1 = "adminexpend = '" + Request.Params["adminexpend"].ToString() + "'";
                }

                requirement2 = "status = status";
                if (Request.Params["status"] != null && Request.Params["status"].ToString() != "0")
                {
                    requirement2 = "status = '" + Request.Params["status"].ToString() + "'";
                }

                requirement3 = "(adminname = adminname or adminphone = adminphone)";
                if (Request.Params["nameOrPhone"] != null && Request.Params["nameOrPhone"].ToString() != "")
                {
                    requirement3 = "adminname like '%" + Request.Params["nameOrPhone"].ToString() + "%' or adminphone like '%" + Request.Params["nameOrPhone"].ToString() + "%'";
                }
            }
            else
            {
                requirement1 = "userstatus = userstatus";
                if (Request.Params["userstatus"] != null && Request.Params["userstatus"].ToString() != "0")
                {
                    requirement1 = "userstatus = '" + Request.Params["userstatus"].ToString() + "'";
                }
                requirement2 = "(username = username or userphone = userphone)";
                if (Request.Params["userNameOrPhone"] != null && Request.Params["userNameOrPhone"].ToString() != "0" && Request.Params["userNameOrPhone"].ToString().Length > 0)
                {
                    requirement2 = "username like '%" + Request.Params["userNameOrPhone"].ToString() + "%' or userphone like '%" + Request.Params["userNameOrPhone"].ToString() + "%'";

                }
                requirement3 = "userpwd = userpwd";
            }
            //获得总页数
            string sqlAll = "select count(*) from " + role + " where " + requirement1 + " and " + requirement2 + " and " + requirement3; ;
            double mCount = (Int32)sqlHelper.ExecuteScalar(sqlAll);
            double sqlCount = Math.Ceiling(mCount / pagesCount);
            string sql = "select top " + (pagesCount) + " * from " + role + " where " + role + "id not in (select top " + (pages - 1) * pagesCount + " " + role + "id from " + role + ") and " + requirement1 + " and " + requirement2 + " and " + requirement3;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<Admin> admin = new List<Admin>();
            List<User> user = new List<User>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    if (role == "admin")
                    {
                        //查询版区
                        string sql1 = "select expendName from expend where expendNum ='" + reader["adminexpend"] + "'";
                        SqlDataReader reader1 = sqlHelper.ExecuteReader(sql1);
                        string adminExpend = "";
                        if (reader1 != null)
                        {
                            if (reader1.HasRows)
                            {
                                while (reader1.Read())
                                {
                                    adminExpend = reader1["expendName"].ToString();
                                }

                            }
                        }
                        //查询角色
                        string sql2 = "select statusName from adminType where adminTypeid ='" + Convert.ToInt32(reader["status"]) + "'";
                        SqlDataReader reader2 = sqlHelper.ExecuteReader(sql2);
                        string adminStatus = "";
                        if (reader2 != null)
                        {
                            if (reader2.HasRows)
                            {
                                while (reader2.Read())
                                {
                                    adminStatus = reader2["statusName"].ToString();
                                }

                            }
                            //添加到管理员
                            admin.Add(new Admin
                            {
                                adminId = Convert.ToInt32(reader["adminid"]),
                                adminname = reader["adminname"].ToString(),
                                adminphone = Convert.ToDecimal(reader["adminphone"]),
                                adminadress = reader["adminadress"].ToString(),
                                adminexpend = adminExpend,
                                adminemail = reader["adminemail"].ToString(),
                                adminstatus = adminStatus
                            });
                        }

                    }
                    else
                    {
                        string sql3 = "select userStatus from userType where userTypeid ='" + Convert.ToInt32(reader["userstatus"]) + "'";
                        SqlDataReader reader3 = sqlHelper.ExecuteReader(sql3);
                        string userStatus = "";
                        if (reader3 != null)
                        {
                            if (reader3.HasRows)
                            {
                                while (reader3.Read())
                                {
                                    userStatus = reader3["userStatus"].ToString();
                                }
                            }
                            else
                            {
                                userStatus = "暂无";
                            }
                        }

                        user.Add(new User
                        {
                            userOnlyid = Convert.ToInt32(reader["userOnlyid"]),
                            username = reader["username"].ToString(),
                            userphone = Convert.ToDecimal(reader["userphone"]),
                            userstatus = userStatus,
                        });
                    }

                }
            }
            if (role == "admin")
            {
                objResult = new { pageCount = sqlCount, dataResult = admin };
            }
            else
            {
                objResult = new { pageCount = sqlCount, dataResult = user };
            }


            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得该管理用户数据
        public ActionResult getAdmin()
        {
            int adminId = int.Parse(Request.Params["adminId"]);
            object objResult = getAdminInfo(adminId);
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //更新管理员数据
        public ActionResult updateAdmin()
        {
            object objResult = "";
            int adminId = int.Parse(Request.Params["adminId"]);
            string adminname = Request.Params["adminname"].ToString();
            string adminphone = Request.Params["adminphone"].ToString();
            string adminadress = Request.Params["adminadress"].ToString();
            string adminemail = Request.Params["adminemail"].ToString();
            string expend = Request.Params["expend"].ToString();
            string adminType = Request.Params["adminType"].ToString();
            //先查看用户名是否存在多个
            string sql = "select count(*) from admin where adminname=@adminname and adminid not in (@adminid)";
            SqlParameter[] paras = new SqlParameter[] {
                new SqlParameter("@adminname",adminname),
                new SqlParameter("@adminid",adminId)
            };
            int count1 = Convert.ToInt32(sqlHelper.ExecuteScalar(sql, paras));
            if (count1 > 0)
            {

                objResult = new { state = "err", msg = "用户名已存在，请输入其他用户名" };
            }
            else
            {
                string sessionName = mySession.getSessionName();
                int sessionstatus = 6;
                string sql1 = "select status from admin where adminname ='" + sessionName + "'";
                SqlDataReader reader = sqlHelper.ExecuteReader(sql1);
                if (reader != null)
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            sessionstatus = Convert.ToInt32(reader["status"]);
                        }
                    }
                }
                if (sessionstatus >= Convert.ToInt32(adminType))
                {
                    objResult = new { state = "err", msg = "权限不够，可以联系上级管理员提升" };
                }
                else
                {
                    string sqlupdate = "update admin set adminname=@adminname,adminphone=@adminphone,adminadress=@adminadress,adminexpend=@adminexpend,status=@status,adminemail=@adminemail where adminid=@adminid";
                    SqlParameter[] paraups = new SqlParameter[] {
                    new SqlParameter("@adminid",adminId),
                    new SqlParameter("@adminname",adminname),
                    new SqlParameter("@adminphone",adminphone),
                    new SqlParameter("@adminadress",adminadress),
                    new SqlParameter("@adminemail",adminemail),
                    new SqlParameter("@adminexpend",expend),
                    new SqlParameter("@status",adminType),
                };
                    int count2 = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlupdate, paraups));
                    if (count2 >= 0)
                    {
                        objResult = new { state = "success", msg = "修改成功", result = getAdminInfo(adminId) };
                    }
                    else
                    {
                        objResult = new { state = "err", msg = "修改失败，请重试" };
                    }
                }
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //删除管理员数据
        public ActionResult deleteAdmin()
        {
            object objResult = "";
            int adminId = int.Parse(Request.Params["adminId"]);
            string sql = "delete admin where adminid=@adminid";
            SqlParameter pam = new SqlParameter("@adminid", adminId);
            int count = sqlHelper.ExecuteNonQuery(sql, pam);
            if (count >= 1)
            {
                objResult = new { state = "success", msg = "删除成功" };
            }
            else
            {
                objResult = new { state = "err", msg = "删除失败" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //是否能操作
        public ActionResult isCanOperate()
        {
            object objResult = "";
            string sessionName = mySession.getSessionName();
            int sessionstatus = 6;
            string sql1 = "select status from admin where adminname ='" + sessionName + "'";
            SqlDataReader reader = sqlHelper.ExecuteReader(sql1);
            if (reader != null)
            {
                if (reader.HasRows)
                {
                    while (reader.Read())
                    {
                        sessionstatus = Convert.ToInt32(reader["status"]);
                    }
                }
            }
            //获得要操作的用户的角色等级
            int adminId = int.Parse(Request.Params["adminId"]);
            string sql2 = "select status from admin where adminid =" + adminId;
            SqlDataReader reader2 = sqlHelper.ExecuteReader(sql2);
            int adminstatus = 1;
            if (reader2.HasRows)
            {
                while (reader2.Read())
                {
                    adminstatus = Convert.ToInt32(reader2["status"]);
                }
            }

            if (sessionstatus >= adminstatus)
            {
                objResult = new { state = "err", msg = "权限不够，可以联系上级管理员提升" };
            }
            else
            {
                objResult = new { state = "success", msg = "可以进行操作" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //定义一个获取管理员用户信息的方法
        public static object getAdminInfo(int id)
        {
            object objResult = "";
            int adminId = id;
            string sql = "select * from admin where adminId=" + adminId;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<Admin> admin = new List<Admin>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    //查询版区
                    string sql1 = "select expendName from expend where expendNum ='" + reader["adminexpend"] + "'";
                    SqlDataReader reader1 = sqlHelper.ExecuteReader(sql1);
                    string adminExpend = "";
                    if (reader1 != null)
                    {
                        if (reader1.HasRows)
                        {
                            while (reader1.Read())
                            {
                                adminExpend = reader1["expendName"].ToString();
                            }

                        }
                    }
                    //查询角色
                    string sql2 = "select statusName from adminType where adminTypeid ='" + Convert.ToInt32(reader["status"]) + "'";
                    SqlDataReader reader2 = sqlHelper.ExecuteReader(sql2);
                    string adminStatus = "";
                    if (reader2 != null)
                    {
                        if (reader2.HasRows)
                        {
                            while (reader2.Read())
                            {
                                adminStatus = reader2["statusName"].ToString();
                            }

                        }
                        //添加到管理员
                        admin.Add(new Admin
                        {
                            adminId = Convert.ToInt32(reader["adminid"]),
                            adminname = reader["adminname"].ToString(),
                            adminphone = Convert.ToDecimal(reader["adminphone"]),
                            adminadress = reader["adminadress"].ToString(),
                            adminexpend = adminExpend,
                            adminemail = reader["adminemail"].ToString(),
                            adminstatus = adminStatus
                        });
                    }
                }
            }
            objResult = new { dataAdmin = admin, dataExpend = myexpend(), dataType = myadminType() };
            return objResult;
        }

        //添加新的管理员时候，显示版区和管理员
        public ActionResult getExpendAndStatus()
        {
            object objResult = "";
            objResult = new { dataExpend = myexpend(), dataType = myadminType() };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //添加新的管理员
        public ActionResult addAdmin()
        {
            object objResult = "";
            string adminname = Request.Params["adminname"].ToString();
            string adminphone = Request.Params["adminphone"].ToString();
            string adminadress = Request.Params["adminadress"].ToString();
            string adminemail = Request.Params["adminemail"].ToString();
            string expend = Request.Params["expend"].ToString();
            string adminType = Request.Params["adminType"].ToString();
            //查看用户名是否存在多个
            string sqlname = "select count(*) from admin where adminname=@adminname ";
            SqlParameter[] parasname = new SqlParameter[] {
                new SqlParameter("@adminname",adminname),
            };
            int countname = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlname, parasname));

            //查看电话号码是否存在多个
            string sqlphone = "select count(*) from admin where adminphone=@adminphone ";
            SqlParameter[] parasphone = new SqlParameter[] {
                new SqlParameter("@adminphone",adminphone),
            };
            //查看邮箱是否存在多个
            string sqlemail = "select count(*) from admin where adminemail=@adminemail ";
            SqlParameter[] parasemail = new SqlParameter[] {
                new SqlParameter("@adminemail",adminemail),
            };
            int countemail = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlemail, parasemail));
            int countphone = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlphone, parasphone));
            if (countname > 0)
            {

                objResult = new { state = "err", msg = "用户名已存在，请输入其他用户名" };
            }
            else if (countphone > 0)
            {

                objResult = new { state = "err", msg = "电话号码已存在，请输入其他电话号码" };
            }
            else if (countemail > 0)
            {

                objResult = new { state = "err", msg = "邮箱已存在，请输入其他邮箱" };
            }
            else
            {
                string sessionName = mySession.getSessionName();
                int sessionstatus = 6;
                string sql1 = "select status from admin where adminname ='" + sessionName + "'";
                SqlDataReader reader = sqlHelper.ExecuteReader(sql1);
                if (reader != null)
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            sessionstatus = Convert.ToInt32(reader["status"]);
                        }
                    }
                }
                if (sessionstatus >= Convert.ToInt32(adminType))
                {
                    objResult = new { state = "err", msg = "权限不够，可以联系上级管理员提升" };
                }
                else
                {
                    string adminpwd = "123456";
                    string sqladd = "insert into admin values(@adminname,@adminpwd,@adminphone,@adminadress,@adminexpend,@status,@adminemail)";
                    SqlParameter[] paraadds = new SqlParameter[] {
                    new SqlParameter("@adminname",adminname),
                    new SqlParameter("@adminpwd",adminpwd),
                    new SqlParameter("@adminphone",adminphone),
                    new SqlParameter("@adminadress",adminadress),
                    new SqlParameter("@adminemail",adminemail),
                    new SqlParameter("@adminexpend",expend),
                    new SqlParameter("@status",adminType),
                };
                    int count2 = Convert.ToInt32(sqlHelper.ExecuteScalar(sqladd, paraadds));
                    if (count2 >= 0)
                    {
                        objResult = new { state = "success", msg = "添加成功，初始密码为123456，为保证安全，请尽快修改密码" };

                    }
                    else
                    {
                        objResult = new { state = "err", msg = "添加失败，请重试" };
                    }
                }
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得所有版区
        public static object myexpend()
        {
            string sqlexpend = "select expendNum,expendName  from expend";
            SqlDataReader readerexpend = sqlHelper.ExecuteReader(sqlexpend);
            List<expend> expend = new List<expend>();
            if (readerexpend.HasRows)
            {
                while (readerexpend.Read())
                {
                    expend.Add(new expend
                    {
                        expendNum = readerexpend["expendNum"].ToString(),
                        expendName = readerexpend["expendName"].ToString(),
                    });
                }
            }
            return expend;
        }

        //获得管理员所有角色
        public static object myadminType()
        {
            string sqlAdminType = "select adminTypeid,statusName  from adminType";
            SqlDataReader readerAdminType = sqlHelper.ExecuteReader(sqlAdminType);
            List<adminType> adminType = new List<adminType>();
            if (readerAdminType.HasRows)
            {
                while (readerAdminType.Read())
                {
                    adminType.Add(new adminType
                    {
                        adminTypeid = Convert.ToInt32(readerAdminType["adminTypeid"]),
                        statusName = readerAdminType["statusName"].ToString(),
                    });
                }
            }
            return adminType;
        }

        //获得该用户数据
        public ActionResult getUser()
        {
            int userOnlyid = int.Parse(Request.Params["userOnlyid"]);
            object objResult = getUserInfo(userOnlyid);
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //删除用户
        public ActionResult deleteUser()
        {
            object objResult = "";
            int userOnlyid = int.Parse(Request.Params["userOnlyid"]);
            string sql = "delete [userOnly] where userOnlyid=@userOnlyid";
            SqlParameter pam = new SqlParameter("@userOnlyid", userOnlyid);
            int count = sqlHelper.ExecuteNonQuery(sql, pam);
            if (count >= 1)
            {
                objResult = new { state = "success", msg = "删除成功" };
            }
            else
            {
                objResult = new { state = "err", msg = "删除失败" };
            }

            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //更新密码
        public ActionResult userpwd()
        {
            object objResult = "";
            int userOnlyid = int.Parse(Request.Params["userOnlyid"]);
            string sql = "update userOnly set userpwd='bs123456' where userOnlyid=@userOnlyid";
            SqlParameter pam = new SqlParameter("@userOnlyid", userOnlyid);
            int count = sqlHelper.ExecuteNonQuery(sql, pam);
            if (count >= 1)
            {
                objResult = new { state = "success", msg = "密码重置成功" };
            }
            else
            {
                objResult = new { state = "err", msg = "密码重置失败" };
            }

            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //更新用户信息
        public ActionResult updateuser()
        {
            object objResult = "";
            int userOnlyid = int.Parse(Request.Params["userOnlyid"]);
            string username = Request.Params["userName"].ToString();
            string userphone = Request.Params["userphone"].ToString();
            string userstatus = Request.Params["userstatus"].ToString();
            //查看用户名是否存在多个
            string sqlname = "select count(*) from userOnly where username=@username and userOnlyid not in (@userOnlyid)";
            SqlParameter[] parasname = new SqlParameter[] {
                new SqlParameter("@username",username),
                new SqlParameter("@userOnlyid",userOnlyid),
            };
            int countname = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlname, parasname));
            //查看电话号码是否存在多个
            string sqlphone = "select count(*) from userOnly where userphone=@userphone and userOnlyid not in (@userOnlyid)";
            SqlParameter[] parasphone = new SqlParameter[] {
                new SqlParameter("@userphone",userphone),
                new SqlParameter("@userOnlyid",userOnlyid),
            };
            int countphone = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlphone, parasphone));
            if (countname > 0)
            {

                objResult = new { state = "err", msg = "用户名已存在，请输入其他用户名" };
            }
            else if (countphone > 0)
            {

                objResult = new { state = "err", msg = "电话号码已存在，请输入其他电话号码" };
            }
            else
            {
                string sql = "update userOnly set username=@username,userphone=@userphone,userstatus=@userstatus where userOnlyid=@userOnlyid";
                SqlParameter[] pam = new SqlParameter[] {
                    new SqlParameter("@username",username),
                    new SqlParameter("@userphone",userphone),
                    new SqlParameter("@userstatus",userstatus),
                    new SqlParameter("@userOnlyid",userOnlyid),
                };
                int count = sqlHelper.ExecuteNonQuery(sql, pam);
                if (count >= 1)
                {
                    objResult = new { state = "success", msg = "修改成功" };
                }
                else
                {
                    objResult = new { state = "err", msg = "修改失败" };
                }
            }


            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得用户信息
        public static object getUserInfo(int id)
        {
            object objResult = "";
            int userOnlyid = id;
            string sql = "select * from userOnly where userOnlyid=" + userOnlyid;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<User> user = new List<User>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    //查询角色
                    string sql2 = "select userStatus from userType where userTypeid ='" + Convert.ToInt32(reader["userstatus"]) + "'";
                    SqlDataReader reader2 = sqlHelper.ExecuteReader(sql2);
                    string userStatus = "";
                    if (reader2 != null)
                    {
                        if (reader2.HasRows)
                        {
                            while (reader2.Read())
                            {
                                userStatus = reader2["userStatus"].ToString();
                            }

                        }
                        //添加到管理员
                        user.Add(new User
                        {
                            userOnlyid = Convert.ToInt32(reader["userOnlyid"]),
                            username = reader["username"].ToString(),
                            userphone = Convert.ToDecimal(reader["userphone"]),
                            userstatus = userStatus
                        });
                    }
                }
            }
            objResult = new { dataUser = user, dataStatus = myStatus() };
            return objResult;
        }

        //添加新用户时,显示角色
        public ActionResult getmyStatus()
        {
            object objResult = "";
            objResult = new { dataStatus = myStatus() };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //添加新用户
        public ActionResult adduser()
        {
            object objResult = "";
            string username = Request.Params["userName"].ToString();
            string userphone = Request.Params["userphone"].ToString();
            string userstatus = Request.Params["userstatus"].ToString();
            //查看用户名是否存在多个
            string sqlname = "select count(*) from userOnly where username=@username ";
            SqlParameter[] parasname = new SqlParameter[] {
                new SqlParameter("@username",username),
            };
            int countname = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlname, parasname));
            //查看电话号码是否存在多个
            string sqlphone = "select count(*) from userOnly where userphone=@userphone";
            SqlParameter[] parasphone = new SqlParameter[] {
                new SqlParameter("@userphone",userphone),
            };
            int countphone = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlphone, parasphone));
            if (countname > 0)
            {

                objResult = new { state = "err", msg = "用户名已存在，请输入其他用户名" };
            }
            else if (countphone > 0)
            {

                objResult = new { state = "err", msg = "电话号码已存在，请输入其他电话号码" };
            }
            else
            {
                string userpwd = "123456";
                string sqladd = "insert into userOnly values(@username,@userphone,@userstatus,@userpwd)";
                SqlParameter[] paraadds = new SqlParameter[] {
                    new SqlParameter("@username",username),
                    new SqlParameter("@userphone",userphone),
                    new SqlParameter("@userstatus",userstatus),
                    new SqlParameter("@userpwd",userpwd),
                };
                int count = sqlHelper.ExecuteNonQuery(sqladd, paraadds);
                if (count >= 1)
                {
                    objResult = new { state = "success", msg = "添加成功，初始密码为" + userpwd };
                }
                else
                {
                    objResult = new { state = "err", msg = "添加失败" };
                }
            }


            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得用户等级
        public static object myStatus()
        {
            string sqlexpend = "select userTypeid,userStatus  from userType";
            SqlDataReader readerexpend = sqlHelper.ExecuteReader(sqlexpend);
            List<userType> userType = new List<userType>();
            if (readerexpend.HasRows)
            {
                while (readerexpend.Read())
                {
                    userType.Add(new userType
                    {
                        userTypeid = Convert.ToInt32(readerexpend["userTypeid"].ToString()),
                        userStatus = readerexpend["userStatus"].ToString(),
                    });
                }
            }
            return userType;
        }

    }
}