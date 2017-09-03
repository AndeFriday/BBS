using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myBBS.Models
{
    public class title
    {
        public int titleId { get; set; }
        public string titleName { get; set; }
        public string titleExpend { get; set; }
        public string titleState { get; set; }
        public string titleAuthor { get; set; }
        public string titleTime { get; set; }
        public string titleBody { get; set; }
        public int titleReaded { get; set; }
        public string titleAdmin { get; set; }
        public string titleBodyHtml { get; set; }
    }
}