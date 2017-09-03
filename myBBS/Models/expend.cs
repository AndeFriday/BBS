using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myBBS.Models
{
    public class expend
    {
        public int expendId { get; set; }
        public string expendName { get; set; }

        public string expendNum { get; set; }
        public int expendCount { get; set; }

        public string expendAdmin { get; set; }
        public string expendInfo { get; set; }

        public string expendDay { get; set; }
    }
}