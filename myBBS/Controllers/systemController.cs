using myBBS.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Web;
using System.Web.Mvc;

namespace myBBS.Controllers
{
    public class systemController : Controller
    {
        string mylayui = "<script src='/Scripts/jquery-1.10.2.min.js'></script><script src='/Content/themes/layer/layer.js'></script>";
        // GET: system
        public ActionResult systemControl()
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

        //查询所有敏感词
        public ActionResult getsensitive()
        {
            object objResult = "";
            string sql = "select * from sensitive";
            List<Sensitive> sensitive = new List<Sensitive>();
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    sensitive.Add(new Sensitive
                    {
                        sensitiveId = Convert.ToInt32(reader["sensitiveId"].ToString()),
                        sensitiveName = reader["sensitiveName"].ToString()
                    });
                }
            }
            objResult = new { ensitivedata = sensitive };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //更新敏感词
        public ActionResult updatesensitive()
        {
            object objResult = "";
            int sensitiveId = int.Parse(Request.Params["sensitiveId"]);
            string sensitiveName = Request.Params["sensitiveName"].ToString();

            string sqlif = "select count(*) from sensitive where sensitiveName=@sensitiveName and sensitiveId not in (@sensitiveId)";
            SqlParameter[] parasif = new SqlParameter[] {
                new SqlParameter("@sensitiveName",sensitiveName),
                new SqlParameter("@sensitiveId",sensitiveId)
            };
            int countif = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlif, parasif));
            if (countif > 0)
            {
                objResult = new { state = "err", msg = "该敏感词已存在，请勿多次添加" };
            }
            else
            {
                string sql = "update sensitive set sensitiveName=@sensitiveName where sensitiveId=@sensitiveId";
                SqlParameter[] para = new SqlParameter[] {
                    new SqlParameter("@sensitiveId",sensitiveId),
                    new SqlParameter("@sensitiveName",sensitiveName),
                };
                int count = sqlHelper.ExecuteNonQuery(sql, para);
                if (count > 0)
                {
                    objResult = new { state = "success", msg = "修改成功" };
                }
                else
                {
                    objResult = new { state = "err", msg = "修改失败，请重试" };
                }
            }

            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //删除敏感词
        public ActionResult deletesensitiven()
        {
            object objResult = "";
            int sensitiveId = int.Parse(Request.Params["sensitiveId"]);
            string sql = "delete sensitive where sensitiveId=@sensitiveId";
            SqlParameter pam = new SqlParameter("@sensitiveId", sensitiveId);
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

        //增加敏感词
        public ActionResult addsensitive()
        {
            object objResult = "";
            string sensitiveName = Request.Params["sensitiveName"].ToString();

            string sqlif = "select count(*) from sensitive where sensitiveName=@sensitiveName";
            SqlParameter[] parasif = new SqlParameter[] {
                new SqlParameter("@sensitiveName",sensitiveName),
            };
            int countif = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlif, parasif));
            if (countif > 0)
            {
                objResult = new { state = "err", msg = "该敏感词已存在，请勿多次添加" };
            }
            else
            {
                string sql = "insert into sensitive values(@sensitiveName)";
                SqlParameter[] para = new SqlParameter[] {
                    new SqlParameter("@sensitiveName",sensitiveName),
                };
                int count = sqlHelper.ExecuteNonQuery(sql, para);
                if (count >= 0)
                {
                    objResult = new { state = "success", msg = "添加成功" };
                }
                else
                {
                    objResult = new { state = "err", msg = "添加失败，请重试" };
                }
            }

            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //查询所有访问管理
        public ActionResult comeUserAll()
        {
            object objResult = "";
            int pages = int.Parse(Request.Params["pages"]);
            int pagesCount = int.Parse(Request.Params["pagesCount"]);

            string comeIp = "comeIp = comeIp";
            if (Request.Params["comeIp"] != null && Request.Params["comeIp"].ToString()!="") {
                comeIp = "comeIp like '%" + Request.Params["comeIp"].ToString()+ "%'";
            }
            string comeTime = "comeTime = comeTime";
            if (Request.Params["comeTime"] != null && Request.Params["comeTime"].ToString()!="")
            {
                comeTime = " Convert(varchar,comeTime,120) like '%" +  Request.Params["comeTime"].ToString() + "%'";
            }
            //获得总页数
            string sqlAll = "select count(*) from  come";
            double mCount = (Int32)sqlHelper.ExecuteScalar(sqlAll);
            double sqlCount = Math.Ceiling(mCount / pagesCount);
            string sql = "select top " + (pagesCount) + " * from come where comeId not in (select top " + (pages - 1) * pagesCount + " comeId from come) and "+comeIp +" and "+comeTime+"" ;
            List<comeuser> comeuser = new List<comeuser>();
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    string sql1 = "select expendName from expend where expendNum ='" + reader["comeExpend"] + "'";
                    SqlDataReader reader1 = sqlHelper.ExecuteReader(sql1);
                    string comeexpend = "";
                    if (reader1 != null)
                    {
                        if (reader1.HasRows)
                        {
                            while (reader1.Read())
                            {
                                comeexpend = reader1["expendName"].ToString();
                            }

                        }
                    }
                    comeuser.Add(new comeuser
                    {
                        comeId = Convert.ToInt32(reader["comeId"].ToString()),
                        comeIp = reader["comeIp"].ToString(),
                        comeExpend = comeexpend,
                        comeCan = reader["comeCan"].ToString(),
                        comeTime = reader["comeTime"].ToString(),
                    });
                }
            }
            objResult = new { pageCount = sqlCount, dataResult = comeuser };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        public ActionResult changeIp()
        {
            object objResult = "";
            string comeIp = Request.Params["comeIp"].ToString();
            int comeCan = int.Parse(Request.Params["comeCan"].ToString());
            string sql = "update come set comeCan=@comeCan where comeIp=@comeIp";
            SqlParameter[] para = new SqlParameter[] {
                    new SqlParameter("@comeIp",comeIp),
                    new SqlParameter("@comeCan",comeCan),
                };
            int count = sqlHelper.ExecuteNonQuery(sql, para);
            if (count > 0)
            {
                objResult = new { state = "success", msg = "修改成功" };
            }
            else
            {
                objResult = new { state = "err", msg = "修改失败，请重试" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }
    }

}