using Microsoft.AspNetCore.Mvc;
using MyNoteOnline.Models;
using System.Diagnostics;
using System.IO;
using System.Linq;

//Chuyên dụng cho file và thư mục all

namespace MyNoteOnline.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        private const string rootPath = "assets/txt/";
        private string GetPhysicalPath(string relativePath)
        {
            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath.Replace("/", "\\"));
            return physicalPath;
        }

        [HttpGet]
        public IActionResult GetFiles(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                path = rootPath;
            }

            var physicalPath = GetPhysicalPath(path); //Truyền vào path đầu vào

            // Lấy tất cả files trong thư mục đó
            var files = Directory.GetFiles(physicalPath, "*.*", SearchOption.TopDirectoryOnly)
                .Select(file => new
                {
                    Name = Path.GetFileName(file),
                    Path = Path.Combine(path, Path.GetFileName(file)).Replace("\\", "/")
                });

            //Trả về kết quả là 1 cục JSON chứa danh sách folders và files
            return Json(new { Files = files });
        }

        [HttpGet]
        public IActionResult GetFileConent(string path)
        {
            //Chuyển sang dạng vật lý....
            var filePath = GetPhysicalPath(path);
            if (!System.IO.File.Exists(filePath))
            {
                return BadRequest();
            }

            var cotnent = System.IO.File.ReadAllText(filePath);

            return Content(cotnent);
        }

        [HttpPost]
        public IActionResult SaveFile([FromBody] SaveFileViewModel model)
        {
            //Chỉ định cụ thể path gốc để upload đúng chỗ
            if (!model.Path.StartsWith("assets/txt/"))
            {
                model.Path = "assets/txt/" + model.Path;

            }

            //Kiểm tra đuôi file đúng dạng .txt
            if (!model.Path.EndsWith(".txt"))
            {
                return BadRequest("Cảnh báo bị hack");
            }
            //Chuyển sang đường dẫn vật lý
            var filePath = GetPhysicalPath(model.Path);

            //Ghi nội dung vào file
            System.IO.File.WriteAllText(filePath, model.Content);

            //Hoàn thành nhiệm vụ nhưng ko trả về cái gì hết....
            return Ok();
        }

        [HttpPost]
        public IActionResult SaveFeedback([FromBody] string content)
        {
            //Đường dẫn tương đối
            string path = "fdata/data.txt";
            //Đường dẫn vật lý
            string filePath = GetPhysicalPath(path);

            //Lấy giá trị ở trong file lưu ra ngoài biến
            string currentContent = System.IO.File.ReadAllText(filePath);


            //Khai báo mẫu nội dung cần gửi
            string template = " {0}  {1}";

            // MM : phân biệt với phút  HH: phân biệt giờ sáng và giờ tối vd: 1h và 13h
            template = string.Format(template, DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss") ,content);

            //Cắt bỏ khoảng trắng hai đầu hoặc dấu  xuống hàng dư ở 2 đầu
            template = template.Trim();

            //Nối giá trị đang có với giá trị mới vào trong biến newContent
            string newContent = currentContent + "\n" + template;

            //Ghi nội dung trong biến newContent vào lại file đó
            System.IO.File.WriteAllText(filePath, newContent.Trim());
            return Ok();
        }
    }
}
