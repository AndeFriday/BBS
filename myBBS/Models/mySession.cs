using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace myBBS.Models
{
    public class mySession
    {
        #region 通用方法  
        public static void setSession(string username)
        {
            HttpContext.Current.Session["UserName"] = username;
            return ;
        }
        public  static string getSessionName()
        {
            string sessionName = "";
            if (HttpContext.Current.Session["UserName"] != null)
            {
                sessionName =  HttpContext.Current.Session["UserName"].ToString();
            }
            else
            {
                sessionName=null;
            }
            return sessionName;
        }
        public static bool isSession()
        {
            bool isHas = HttpContext.Current.Session["UserName"] != null ? true : false;

            return isHas;
        }
        #endregion
    }
}