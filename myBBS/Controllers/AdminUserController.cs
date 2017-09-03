using myBBS.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace myBBS.Controllers
{
   
    public class AdminUserController : Controller
    {
        string mylayui = "<script src='/Scripts/jquery-1.10.2.min.js'></script><script src='/Content/themes/layer/layer.js'></script>";
        // GET: AdminUser
        public ActionResult userCenter()
        {
            string myname = mySession.getSessionName();
            string sql = "select * from admin where adminname='" + myname + "'";
            object objResult = "";
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    ViewData["adminid"] = reader["adminid"].ToString();
                    ViewData["adminname"] = reader["adminname"].ToString();
                    ViewData["adminpwd"] = reader["adminpwd"].ToString();
                    ViewData["adminphone"] = reader["adminphone"].ToString();
                    ViewData["adminadress"] = reader["adminadress"].ToString();
                    ViewData["adminexpend"] = reader["adminexpend"].ToString();
                    ViewData["adminemail"] = reader["adminemail"].ToString();
                    ViewData["status"] = reader["status"].ToString();
                }
            }else
            {
                return Content(mylayui + "<script> window.onload=function () { console.log('a');layer.msg('登录过期，请重新登录。',{time: 1000},function(){location.href='login'});}</script>");
            }
            return View();
        }

        //更新管理员信息
        public ActionResult adminUpdateInfo()
        {
            string adminid = Request.Params["adminid"].ToString().Trim();
            string adminname = Request.Params["adminname"].ToString().Trim();
            string adminphone = Request.Params["adminphone"].ToString().Trim();
            string adminemail = Request.Params["adminemail"].ToString().Trim();
            string adminadress = Request.Params["adminadress"].ToString().Trim();
            object objResult = "";
            string sql = "update admin set adminname=@adminname,adminphone=@adminphone,adminemail=@adminemail,adminadress=@adminadress where adminid=@adminid";
            SqlParameter[] paras = new SqlParameter[] {
                new SqlParameter("@adminid",adminid),
                new SqlParameter("@adminname",adminname),
                new SqlParameter("@adminphone",adminphone),
                new SqlParameter("@adminemail",adminemail),
                new SqlParameter("@adminadress",adminadress),
            };
            int count = sqlHelper.ExecuteNonQuery(sql, paras);
            if (count == 1)
            {
                objResult = new { state = 1, message = "修改成功", res = "success" };
            }
            else
            {
                objResult = new { state = 2, message = "修改失败，请重试", res = "error" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }



        //更新管理员密码
        public ActionResult adminUpdatePwd()
        {
            string adminid = Request.Params["adminid"].ToString().Trim();
            string adminoldpwd = Request.Params["adminoldpwd"].ToString().Trim();
            string adminnewpwd = Request.Params["adminnewpwd"].ToString().Trim();
            object objResult = "";
            string sql1 = "select count(*) from admin where adminid=@adminid and adminpwd=@adminoldpwd";
            SqlParameter[] paras1 = new SqlParameter[] {
                new SqlParameter("@adminid",adminid),
                new SqlParameter("@adminoldpwd",adminoldpwd),
            };
            int isTrue = Convert.ToInt32(sqlHelper.ExecuteScalar(sql1, paras1));
            if (isTrue == 0)
            {
                objResult = new { state = 0, message = "原始密码错误" };
            }
            else
            {
                string sql2 = "update admin set adminpwd=@adminnewpwd where adminid=@adminid";
                SqlParameter[] paras2 = new SqlParameter[] {
                    new SqlParameter("@adminid",adminid),
                    new SqlParameter("@adminnewpwd",adminnewpwd),
                };
                int count = sqlHelper.ExecuteNonQuery(sql2, paras2);
                if (count == 1)
                {
                    objResult = new { state = 1, message = "密码重置成功" };
                }
                else
                {
                    objResult = new { state = 2, message = "密码修改失败,请重试" };
                }
            }

            return Json(objResult, JsonRequestBehavior.AllowGet);
        }
    }
}