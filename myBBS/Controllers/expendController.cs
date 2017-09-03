using myBBS.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace myBBS.Controllers
{
    public class expendController : Controller
    {
        string mylayui = "<script src='/Scripts/jquery-1.10.2.min.js'></script><script src='/Content/themes/layer/layer.js'></script>";
        // GET: expend
        public ActionResult expand()
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
        //分页
        public ActionResult getExpend()
        {
            object objResult = "";
            int pages = int.Parse(Request.Params["pages"]);
            int pagesCount = int.Parse(Request.Params["pagesCount"]);

            string expendName = "expendName = expendName";
            if (Request.Params["expendName"] != null && Request.Params["expendName"].ToString() != "")
            {
                expendName = "expendName like '%" + Request.Params["expendName"].ToString() + "%'";
            }
            //获得总页数
            string sqlAll = "select count(*) from  expend";
            double mCount = (Int32)sqlHelper.ExecuteScalar(sqlAll);
            double sqlCount = Math.Ceiling(mCount / pagesCount);
            string sql = "select top " + (pagesCount) + " * from expend where expendId not in (select top " + (pages - 1) * pagesCount + " expendId from expend) and " + expendName;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<expend> expend = new List<expend>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int accont = getExpendAccount(reader["expendNum"].ToString());
                    if (Request.Params["expendmin"] != null && Request.Params["expendmin"].ToString() != "" && Request.Params["expendmax"] != null && Request.Params["expendmax"].ToString() != "")
                    {
                        int expendmin = int.Parse(Request.Params["expendmin"]);
                        int expendmax = int.Parse(Request.Params["expendmax"]);
                        if (accont >= expendmin && accont <= expendmax)
                        {
                            expend.Add(new expend
                            {
                                expendId = Convert.ToInt32(reader["expendId"]),
                                expendName = reader["expendName"].ToString(),
                                expendCount = accont,
                                expendAdmin = reader["expendAdmin"].ToString(),
                                expendInfo = reader["expendInfo"].ToString()
                            });
                        }
                    }
                    else
                    {
                        expend.Add(new expend
                        {
                            expendId = Convert.ToInt32(reader["expendId"]),
                            expendName = reader["expendName"].ToString(),
                            expendCount = accont,
                            expendAdmin = reader["expendAdmin"].ToString(),
                            expendInfo = reader["expendInfo"].ToString()
                        });
                    }
                }
            }
            objResult = new { pageCount = sqlCount, dataResult = expend };
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得某一个版区的详细信息
        public ActionResult getExpendOne()
        {
            int expendId = int.Parse(Request.Params["expendId"]);
            object objResult = getExpendInfo(expendId);
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //是否能够操作
        public ActionResult isCan()
        {
            object objResult = "";
            string sessionName = mySession.getSessionName();
            int sessionstatus = 0;
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
            if (sessionstatus > 3)
            {
                objResult = new { state = "err", msg = "权限不够，请与上级管理员联系可以提升权限" };
            }
            else
            {
                objResult = new { state = "success", msg = "请操作" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //更新版区
        public ActionResult updateExpend()
        {
            object objResult = "";
            int expendId = int.Parse(Request.Params["expendId"]);
            string expendName = Request.Params["expendName"].ToString();
            string expendAdmin = Request.Params["expendAdmin"].ToString();
            string expendInfo = Request.Params["expendInfo"].ToString();
            //先查看版区名是否存在多个
            string sql = "select count(*) from expend where expendName=@expendName and expendId not in (@expendId)";
            SqlParameter[] paras = new SqlParameter[] {
                new SqlParameter("@expendName",expendName),
                new SqlParameter("@expendId",expendId)
            };
            int count1 = Convert.ToInt32(sqlHelper.ExecuteScalar(sql, paras));
            //查询管理者是都存在
            string sqladmin = "select count(*) from admin where adminName=@adminName";
            SqlParameter[] parasadmin = new SqlParameter[] {
                new SqlParameter("@adminName",expendAdmin),
            };
            int countadmin = Convert.ToInt32(sqlHelper.ExecuteScalar(sqladmin, parasadmin));
            if (count1 > 0)
            {
                objResult = new { state = "err", msg = "版区名已存在，请输入其他用户名" };
            }
            else if (countadmin <= 0)
            {
                objResult = new { state = "err", msg = "版区负责人不存在" };
            }
            else
            {
                string sqlupdate = "update expend set expendName=@expendName,expendAdmin=@expendAdmin,expendInfo=@expendInfo where expendId=@expendId";
                SqlParameter[] paraups = new SqlParameter[] {
                    new SqlParameter("@expendId",expendId),
                    new SqlParameter("@expendName",expendName),
                    new SqlParameter("@expendAdmin",expendAdmin),
                    new SqlParameter("@expendInfo",expendInfo)
                };
                int count2 = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlupdate, paraups));
                if (count2 >= 0)
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

        //删除版区
        public ActionResult deleteExpend()
        {
            object objResult = "";
            int expendId = int.Parse(Request.Params["expendId"]);
            //删除版区表信息
            string sql = "delete expend where expendId=@expendId";
            SqlParameter pam = new SqlParameter("@expendId", expendId);
            int count = sqlHelper.ExecuteNonQuery(sql, pam);
            //查询表区acountExpendNum
            string acountExpendNum = null;
            string sqlnum = "select expendNum from expend where expendId = '" + expendId + "'";
            SqlDataReader reader = sqlHelper.ExecuteReader(sqlnum);
            int countaccount = 1;
            while (reader.Read())
            {
                acountExpendNum = reader["expendNum"].ToString();
            }
            if (acountExpendNum != null)
            {
                string sqlaccount = "delete accountExpend where acountExpendNum=@acountExpendNum";
                SqlParameter pamaccount = new SqlParameter("@acountExpendNum", acountExpendNum);
                countaccount = sqlHelper.ExecuteNonQuery(sqlaccount, pamaccount);
            }
            //删除统计表信息


            if (count >= 1 && countaccount >= 1)
            {
                objResult = new { state = "success", msg = "删除成功" };
            }
            else
            {
                objResult = new { state = "err", msg = "删除失败" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //增加新版区
        public ActionResult addExpend()
        {
            object objResult = "";
            string expendName = Request.Params["expendName"].ToString();
            string expendAdmin = Request.Params["expendAdmin"].ToString();
            string expendInfo = Request.Params["expendInfo"].ToString();
            //先查看版区名是否存在多个
            string sql = "select count(*) from expend where expendName=@expendName";
            SqlParameter[] paras = new SqlParameter[] {
                new SqlParameter("@expendName",expendName),
            };
            int count1 = Convert.ToInt32(sqlHelper.ExecuteScalar(sql, paras));
            //查询管理者是都存在
            string sqladmin = "select count(*) from admin where adminName=@adminName";
            SqlParameter[] parasadmin = new SqlParameter[] {
                new SqlParameter("@adminName",expendAdmin),
            };
            int countadmin = Convert.ToInt32(sqlHelper.ExecuteScalar(sqladmin, parasadmin));
            if (count1 > 0)
            {
                objResult = new { state = "err", msg = "版区名已存在，请输入其他用户名" };
            }
            else if (countadmin <= 0)
            {
                objResult = new { state = "err", msg = "版区负责人不存在" };
            }
            else
            {
                //增加版区表
                Random ran = new Random();
                string expendNum = ran.Next(100, 200).ToString();
                string sqladd = " insert into expend values(@expendName,@expendNum,@expendAdmin,@expendInfo)";
                SqlParameter[] paraadds = new SqlParameter[] {
                    new SqlParameter("@expendName",expendName),
                    new SqlParameter("@expendNum",expendNum),
                    new SqlParameter("@expendAdmin",expendAdmin),
                    new SqlParameter("@expendInfo",expendInfo)
                };
                int count2 = Convert.ToInt32(sqlHelper.ExecuteScalar(sqladd, paraadds));

                //将新生的expendNum加载到expendAcount中
                DateTime.Now.ToShortTimeString();
                DateTime accountDay = Convert.ToDateTime(DateTime.Now.ToShortDateString());
                int account = 0;
                string sqlacountadd = " insert into accountExpend values(@accountDay,@acountExpendNum,@account)";
                SqlParameter[] paraaccountadds = new SqlParameter[] {
                    new SqlParameter("@accountDay",accountDay),
                    new SqlParameter("@acountExpendNum",expendNum),
                    new SqlParameter("@account",account)
                };
                int count3 = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlacountadd, paraaccountadds));

                if (count2 >= 0 && count3 >= 0)
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

        //获得百度插件的信息
        public ActionResult getAccount()
        {
            object objResult = "";
            string nowTime = Request.Params["nowTime"].ToString();
            DateTime account = Convert.ToDateTime(nowTime);

            string sqlTime = "select count(*) from accountExpend where accountDay = @accountDay ";
            SqlParameter para = new SqlParameter("@accountDay", account);
            int countTime = Convert.ToInt32(sqlHelper.ExecuteScalar(sqlTime, para));
            if (countTime > 0)
            {
                string sql = "select expendNum,expendName from expend";
                SqlDataReader reader = sqlHelper.ExecuteReader(sql);
                List<expend> expend = new List<expend>();
                int Count = 0;
                if (reader.HasRows)
                {
                    while (reader.Read())
                    {
                        Count = getExpendAccountDay(reader["expendNum"].ToString(), account);
                        expend.Add(new expend
                        {
                            expendName = reader["expendName"].ToString(),
                            expendCount = Count,
                            expendDay = DateTime.Now.ToShortDateString(),
                        });

                    }
                    objResult = new { dataexpend = expend, state = "success", msg = "获取成功" };
                }
            }
            else
            {
                objResult = new { state = "err", msg = "没有更多数据了" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }

        //获得版区信息
        public static object getExpendInfo(int id)
        {
            object objResult = "";
            int expendId = id;
            string sql = "select * from expend where expendId=" + expendId;
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            List<expend> expend = new List<expend>();
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    int accont = getExpendAccount(reader["expendNum"].ToString());
                    expend.Add(new expend
                    {
                        expendId = Convert.ToInt32(reader["expendId"]),
                        expendName = reader["expendName"].ToString(),
                        expendNum = reader["expendNum"].ToString(),
                        expendCount = accont,
                        expendAdmin = reader["expendAdmin"].ToString(),
                        expendInfo = reader["expendInfo"].ToString()
                    });

                }
            }
            objResult = new { dataexpend = expend };
            return objResult;
        }

        //获得版区所有访问量
        public static int getExpendAccount(string accountNum)
        {
            int accountAll = 0;
            string sql = "select SUM(account) as accountsum from accountExpend where acountExpendNum = '" + accountNum + "' ";
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            while (reader.Read())
            {
                if (reader["accountsum"] != DBNull.Value)
                {
                    accountAll = Convert.ToInt32(reader["accountsum"]);
                }
            }
            return accountAll;
        }

        //获得某一天的访问量
        public static int getExpendAccountDay(string accountNum, DateTime account)
        {
            int accountDay = 0;
            string sql = "select account  from accountExpend where accountDay = '" + account + "' and acountExpendNum = '" + accountNum + "'";
            SqlDataReader reader = sqlHelper.ExecuteReader(sql);
            while (reader.Read())
            {
                if (reader["account"] != DBNull.Value)
                {
                    accountDay = Convert.ToInt32(reader["account"]);
                }
            }
            return accountDay;
        }

        //获得所有帖子
        public ActionResult getExpendAll()
        {
            object obj = "";
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
            obj = new { allExpend = expend };
            return Json(obj, JsonRequestBehavior.AllowGet);
        }

        //获得所有敏感词
        public ActionResult getSensitiveAll()
        {
            object obj = "";
            string sqlsensitive = "select sensitiveName  from sensitive";
            SqlDataReader readersensitive = sqlHelper.ExecuteReader(sqlsensitive);
            List<Sensitive> sensitive = new List<Sensitive>();
            if (readersensitive.HasRows)
            {
                while (readersensitive.Read())
                {
                    sensitive.Add(new Sensitive
                    {
                        sensitiveName = readersensitive["sensitiveName"].ToString(),
                    });
                }
            }
            obj = new
            {
                allSensitive = sensitive
            };
            return Json(obj, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult setExpendTitle()
        {
            object objResult = "";
            string titleName = Server.HtmlDecode(Request.Params["titleName"].ToString());
            string titleExpend = Server.HtmlDecode(Request.Params["titleExpend"].ToString());
            string titleBody = Server.HtmlDecode(Request.Params["titleBody"]);
            string titleTime = DateTime.Now.Date.ToShortDateString();
            int titleReaded = 0;

            string sqlExpend = "select titleStateNum from titleState where titleStateName ='置顶'";
            SqlDataReader readerExpend = sqlHelper.ExecuteReader(sqlExpend);
            string titleState = "";
            if (readerExpend != null)
            {
                if (readerExpend.HasRows)
                {
                    while (readerExpend.Read())
                    {
                        titleState = readerExpend["titleStateNum"].ToString();
                    }

                }
            }
            int titleAuthorId = 1001;
            string adminName = mySession.getSessionName();
            string sqlAdmin = "select adminid from admin where adminname= '" + adminName + "'";
            SqlDataReader readerAdmin = sqlHelper.ExecuteReader(sqlAdmin);
            int titleAdminId = 1;
            if (readerAdmin != null)
            {
                if (readerAdmin.HasRows)
                {
                    while (readerAdmin.Read())
                    {
                        titleAdminId = Convert.ToInt32(readerAdmin["adminid"]);
                    }

                }
            }
            string sqladd = "insert into title values(@titleName,@titleExpend,@titleState,@titleAuthorId,@titleTime,@titleBody,@titleReaded,@titleAdminId)";
            SqlParameter[] paraadds = new SqlParameter[] {
                    new SqlParameter("@titleName",titleName),
                    new SqlParameter("@titleExpend",titleExpend),
                    new SqlParameter("@titleState",titleState),
                    new SqlParameter("@titleAuthorId",titleAuthorId),
                    new SqlParameter("@titleTime",titleTime),
                    new SqlParameter("@titleBody",titleBody),
                    new SqlParameter("@titleReaded",titleReaded),
                    new SqlParameter("@titleAdminId",titleAdminId),
            };
            int count = Convert.ToInt32(sqlHelper.ExecuteScalar(sqladd, paraadds));
            if (count >= 0)
            {
                objResult = new { state = "success", msg = "发表成功" };

            }
            else
            {
                objResult = new { state = "err", msg = "发表失败，请重试" };
            }
            return Json(objResult, JsonRequestBehavior.AllowGet);
        }
    }
}