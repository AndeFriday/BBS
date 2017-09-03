using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myBBS.Models
{
    public class User
    {
        public int userOnlyid { get; set; }
        public string username { get; set; }
        public string userpwd { get; set; }
        public decimal userphone { get; set; }
        public string userstatus { get; set; }
     
    }
}