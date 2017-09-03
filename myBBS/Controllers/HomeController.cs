using myBBS.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;


namespace myBBS.Controllers
{
    public class HomeController : Controller
    {
        string mylayui = "<script src='/Scripts/jquery-1.10.2.min.js'></script><script src='/Content/themes/layer/layer.js'></script>";
        //登录页面请求
        public ActionResult login()
        {
            return View();
        }

        //桌面请求
        public ActionResult index()
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

        //个人中心请求
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        //个人中心操作
        public ActionResult getUser()
        {
            return View();
        }


        //主题请求
        public ActionResult themes()
        {
            return View();
        }

        //定义一个登录
        public ActionResult adminLogin()
        {
            string adminname = Request.Params["adminname"].ToString().Trim();
            string adminpwd = Request.Params["adminpwd"].ToString().Trim();
            object objResult = "";
            string sql = "select * from admin where adminname='" + adminname + "' and adminpwd='" + adminpwd + "' ";
            SqlDataReader dr = sqlHelper.ExecuteReader(sql);
            if (dr.HasRows)
            {
                //Session["userName"] = adminname;  //把用户id保存到session中
                mySession.setSession(adminname);
                objResult = new { isHas = true, message = "登陆成功", myname = Session["userName"] };
            }
            else
            {
                objResult = new { isHas = false, message = "该用户或密码错误" };
            }
            dr.Close();
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //重复登录
        public ActionResult adminReLogin()
        {
            string adminname = mySession.getSessionName(); ;
            string adminpwd = Request.Params["adminpwd"].ToString().Trim();
            object objResult = "";
            string sql = "select * from admin where adminname='" + adminname + "' and adminpwd='" + adminpwd + "' ";
            SqlDataReader dr = sqlHelper.ExecuteReader(sql);
            if (dr.HasRows)
            {
                //Session["userName"] = adminname;  //把用户id保存到session中
                mySession.setSession(adminname);
                objResult = new { isHas = true, message = "登陆成功", myname = Session["userName"] };
            }
            else
            {
                objResult = new { isHas = false, message = "密码错误" };
            }
            dr.Close();
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }
    }
}