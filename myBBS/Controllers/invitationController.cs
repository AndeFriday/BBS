using myBBS.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;

namespace myBBS.Controllers
{
    public class invitationController : Controller
    {
        string mylayui = "<script src='/Scripts/jquery-1.10.2.min.js'></script><script src='/Content/themes/layer/layer.js'></script>";
        // GET: invitation
        public ActionResult invitation()
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
        public ActionResult getTitle()
        {
            object objResult = "";
            int pages = int.Parse(Request.Params["pages"]);
            int pagesCount = int.Parse(Request.Params["pagesCount"]);

            string requirement1 = "(titleName = titleName or titleAuthorId = titleAuthorId)";
            string requirement2 = "titleExpend = titleExpend";
            string requirement3 = "titleState = titleState";
            string requirement4 = "titleTime = titleTime";
            string requirement5 = "titleAdminId=titleAdminId";

            List<User> user = new List<User>();
            if (Request.Params["titleNameOrAuthor"] != null && Request.Params["titleNameOrAuthor"].ToString() != "0" && Request.Params["titleNameOrAuthor"].Length > 0)
            {
                string sqlUser = "select userOnlyId from userOnly where username like '%" + Request.Params["titleNameOrAuthor"].ToString() + "%'";
                SqlDataReader readerUser = sqlHelper.ExecuteReader(sqlUser);
                if (readerUser.HasRows)
                {
                    if (readerUser.Read())
                    {
                        requirement1 = "titleName like '%" + Request.Params["titleNameOrAuthor"].ToString() + "%' or titleAuthorId = " + Convert.ToInt32(readerUser["userOnlyId"]);
                    }
                }

            }
            if (Request.Params["titleExpend"] != null && Request.Params["titleExpend"].ToString() != "0")
            {
                requirement2 = "titleExpend = '" + Request.Params["titleExpend"].ToString() + "'";
            }
            if (Request.Params["titleState"] != null && Request.Params["titleState"].ToString() != "0")
            {
                requirement3 = "titleState = '" + Request.Params["titleState"].ToString() + "'";
            }
            if (Request.Params["titleTime"] != null && Request.Params["titleTime"].ToString() != "0")
            {
                requirement4 = " Convert(varchar,titleTime,120) like '%" + Request.Params["titleTime"].ToString() + "%'";

            }
            if (Request.Params["titleAdminId"] != null && Request.Params["titleAdminId"].ToString() != "0")
            {
                string myname = mySession.getSessionName();
                string sqlAdminId = "select adminid from admin where adminname= '" + myname + "'";
                string adminid = "";
                SqlDataReader readerAdmin = sqlHelper.ExecuteReader(sqlAdminId);
                if (readerAdmin.HasRows)
                {
                    while (readerAdmin.Read())
                    {
                        adminid = readerAdmin["adminid"].ToString();
                    }
                }
                requirement5 = "titleAdminId = '" + adminid + "'";

            }
            string sqlAll = "select count(*) from title  where " + requirement1 + " and " + requirement2 + " and " + requirement3 + " and " + requirement4 + " and " + requirement5;
            double mCount = (Int32)sqlHelper.ExecuteScalar(sqlAll);
            double sqlCount = Math.Ceiling(mCount / pagesCount);
            string sql = "select top " + (pagesCount) + " * from title  where titleId not in (select top " + (pages - 1) * pagesCount + " titleId from title) and " + requirement1 + " and " + requirement2 + " and " + requirement3 + " and " + requirement4 + " and " + requirement5;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<title> title = new List<title>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    //获得所属版区
                    string sqlExpend = "select expendName from expend where expendNum ='" + reader["titleExpend"] + "'";
                    SqlDataReader readerExpend = sqlHelper.ExecuteReader(sqlExpend);
                    string titlexxpend = "";
                    if (readerExpend != null)
                    {
                        if (readerExpend.HasRows)
                        {
                            while (readerExpend.Read())
                            {
                                titlexxpend = readerExpend["expendName"].ToString();
                            }

                        }
                    }
                    //获得状态
                    string sqlState = "select titleStateName from titleState where titleStateNum ='" + reader["titleState"] + "'";
                    SqlDataReader readerState = sqlHelper.ExecuteReader(sqlState);
                    string titlstate = "";
                    if (readerState != null)
                    {
                        if (readerState.HasRows)
                        {
                            while (readerState.Read())
                            {
                                titlstate = readerState["titleStateName"].ToString();
                            }

                        }
                    }
                    //获得发表者
                    string sqlUser = "select username from userOnly where userOnlyId =" + Convert.ToInt32(reader["titleAuthorId"]) + "";
                    SqlDataReader readerUser = sqlHelper.ExecuteReader(sqlUser);
                    string titlUser = "";
                    if (readerUser != null)
                    {
                        if (readerUser.HasRows)
                        {
                            while (readerUser.Read())
                            {
                                titlUser = readerUser["username"].ToString();
                            }

                        }
                    }
                    //获得发表者
                    string sqlAdmin = "select adminname from admin where adminid ='" + Convert.ToInt32(reader["titleAdminId"]) + "'";
                    SqlDataReader readerAdmin = sqlHelper.ExecuteReader(sqlAdmin);
                    string titleadmin = "";
                    if (readerAdmin != null)
                    {
                        if (readerAdmin.HasRows)
                        {
                            while (readerAdmin.Read())
                            {
                                titleadmin = readerAdmin["adminname"].ToString();
                            }

                        }
                    }
                    //添加到title
                    title.Add(new title
                    {
                        titleId = Convert.ToInt32(reader["titleId"]),
                        titleName = reader["titleName"].ToString(),
                        titleExpend = titlexxpend,
                        titleState = titlstate,
                        titleAuthor = titlUser,
                        titleTime = reader["titleTime"].ToString(),
                        titleBody = reader["titleBody"].ToString(),
                        titleReaded = Convert.ToInt32(reader["titleReaded"]),
                        titleAdmin = titleadmin,
                    });
                }
            }

            objResult = new { title = title, pageCount = sqlCount };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getExpendAndState()
        {
            object objResult = "";
            objResult = new { expend = myexpend(), state = mystate() };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }
        //删除帖子
        public ActionResult deleteTitle()
        {
            object objResult = "";
            int titleId = int.Parse(Request.Params["titleId"]);
            //删除版区表信息
            string sql = "delete title where titleId=@titleId";
            SqlParameter pam = new SqlParameter("@titleId", titleId);
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

        //改变状态
        public ActionResult changeState()
        {
            object objResult = "";
            int titleId = int.Parse(Request.Params["titleId"]);
            string titleState = Request.Params["titleState"];
            string mytitleState = "";
            //判断是否已经是该状态
            string sqlifState = "select titleState from title where titleId=" + titleId;
            SqlDataReader readerState = sqlHelper.ExecuteReader(sqlifState);
            if (readerState.HasRows)
            {
                while (readerState.Read())
                {
                    mytitleState = readerState["titleState"].ToString();
                }
            }
            if (mytitleState == titleState)
            {
                objResult = new { state = "err", msg = "请勿多次设置" };

            }
            else
            {
                string sqlupdate = "update title set titleState=@titleState where titleId=@titleId";
                SqlParameter[] paraups = new SqlParameter[] {
                    new SqlParameter("@titleId",titleId),
                    new SqlParameter("@titleState",titleState),

                };
                int count = sqlHelper.ExecuteNonQuery(sqlupdate, paraups);
                if (count >= 1)
                {
                    objResult = new { state = "success", msg = "操作成功" };
                }
                else
                {
                    objResult = new { state = "err", msg = "操作失败" };
                }
            }

            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得帖子能让
        public ActionResult getTitleDet()
        {
            object objResult = "";
            int titleId = int.Parse(Request.Params["titleId"]);
            string sql = "select * from title where titleId =" + titleId;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<title> title = new List<title>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    //获得所属版区
                    string sqlExpend = "select expendName from expend where expendNum ='" + reader["titleExpend"] + "'";
                    SqlDataReader readerExpend = sqlHelper.ExecuteReader(sqlExpend);
                    string titlexxpend = "";
                    if (readerExpend != null)
                    {
                        if (readerExpend.HasRows)
                        {
                            while (readerExpend.Read())
                            {
                                titlexxpend = readerExpend["expendName"].ToString();
                            }

                        }
                    }
                    //获得状态
                    string sqlState = "select titleStateName from titleState where titleStateNum ='" + reader["titleState"] + "'";
                    SqlDataReader readerState = sqlHelper.ExecuteReader(sqlState);
                    string titlstate = "";
                    if (readerState != null)
                    {
                        if (readerState.HasRows)
                        {
                            while (readerState.Read())
                            {
                                titlstate = readerState["titleStateName"].ToString();
                            }

                        }
                    }
                    //获得发表者
                    string sqlUser = "select username from userOnly where userOnlyId =" + Convert.ToInt32(reader["titleAuthorId"]) + "";
                    SqlDataReader readerUser = sqlHelper.ExecuteReader(sqlUser);
                    string titlUser = "";
                    if (readerUser != null)
                    {
                        if (readerUser.HasRows)
                        {
                            while (readerUser.Read())
                            {
                                titlUser = readerUser["username"].ToString();
                            }

                        }
                    }
                    //获得发表者
                    string sqlAdmin = "select adminname from admin where adminid ='" + Convert.ToInt32(reader["titleAdminId"]) + "'";
                    SqlDataReader readerAdmin = sqlHelper.ExecuteReader(sqlAdmin);
                    string titleadmin = "";
                    if (readerAdmin != null)
                    {
                        if (readerAdmin.HasRows)
                        {
                            while (readerAdmin.Read())
                            {
                                titleadmin = readerAdmin["adminname"].ToString();
                            }

                        }
                    }
                    //添加到管理员
                    title.Add(new title
                    {
                        titleId = Convert.ToInt32(reader["titleId"]),
                        titleName = reader["titleName"].ToString(),
                        titleExpend = titlexxpend,
                        titleState = titlstate,
                        titleAuthor = titlUser,
                        titleTime = reader["titleTime"].ToString(),
                        titleBodyHtml = System.Web.HttpUtility.HtmlEncode(reader["titleBody"]),
                        titleReaded = Convert.ToInt32(reader["titleReaded"]),
                        titleAdmin = titleadmin,
                    });
                }
            }
            objResult = new { title = title };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }
        //获得所有版区
        public static object myexpend()
        {
            string sqlexpend = "select expendNum,expendName  from expend";
            SqlDataReader readerexpend = sqlHelper.ExecuteReader(sqlexpend);
            List<expend> expend = new List<expend>();
            if (readerexpend != null)
            {
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
            }
            else {
               
            }
            
            return expend;
        }

        //获得所有版区
        public static object mystate()
        {
            string sqlstate = "select titleStateName,titleStateNum  from titleState";
            SqlDataReader readerstate = sqlHelper.ExecuteReader(sqlstate);
            List<titleState> titlestate = new List<titleState>();
            if (readerstate.HasRows)
            {
                while (readerstate.Read())
                {
                    titlestate.Add(new titleState
                    {
                        titleStateName = readerstate["titleStateName"].ToString(),
                        titleStateNum = readerstate["titleStateNum"].ToString(),
                    });
                }
            }
            return titlestate;
        }

    }
}