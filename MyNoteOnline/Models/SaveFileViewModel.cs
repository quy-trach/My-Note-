using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MyNoteOnline.Models
{
    public class SaveFileViewModel
    {
        //Một chuỗi không có gì cả.... (Tính chất bao đóng)

        public string Path { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
