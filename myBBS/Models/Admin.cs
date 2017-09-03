using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myBBS.Models
{
    public class Admin
    {
        
        public int adminId { get; set; }
        public string adminname { get; set; }
        public string adminpwd { get; set; }

        public decimal adminphone { get; set; }

        public string adminadress { get; set; }
        public string adminexpend { get; set; }
        public string adminstatus { get; set; }

        public string adminemail { get; set; }
    }
   
}