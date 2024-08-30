//Count
function updateCountStatus() {
    let text = $('#editor').val();
    let charCount = text.length;
    let lineCount = text.split('\n').length;
    let selectedCount = window.getSelection().toString().length;

    $('#charCount').text(`Characters: ${charCount}`);
    $('#lineCount').text(`Lines: ${lineCount}`);
    $('#selectedCount').text(`Selected: ${selectedCount}`);
}

//Show save status
function setSaveStatus(saved) {
    let statusIcon = $('#saveStatus i');
    if (saved) {
        statusIcon.removeClass('fa-times-circle text-danger');
        statusIcon.addClass('fa-check-circle text-success');
        $('#saveStatus').text(' Saved').prepend(statusIcon);
    } else {
        statusIcon.removeClass('fa-check-circle text-success');
        statusIcon.addClass('fa-times-circle text-danger');
        $('#saveStatus').text(' Unsaved').prepend(statusIcon);
    }
}

//Ready function
$(function () {
    //New
    $('#newBtn').click(function () {
        $('#editor').val('');
        $('#editor').attr('data-path', '');
        $('#editor').focus();
        updateCountStatus();
        setSaveStatus(false);
    });

    //Upload
    $('#uploadBtn').click(function () {
        $('#fileInput').click();
    });

    //File
    $('#fileInput').change(function (event) {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#editor').val(e.target.result);
                $('#editor').attr('data-path', '');
                updateCountStatus();
                setSaveStatus(false);
            };
            reader.readAsText(file);
        }
        $(this).val('');
    });

    //Save
    $('#saveBtn').click(function () {
        let text = $('#editor').val();
        let path = $('#editor').attr('data-path');

        if (!path) {
            let fileName = prompt('Enter new file name:');
            path = fileName;
            $('#editor').attr('data-path', path);
        }

        $.post({
            url: '/home/savefile',
            contentType: 'application/json',
            data: JSON.stringify({ path: path, content: text })
        })
            .done(function () {
                setSaveStatus(true);
                alert('Đã lưu nội dụng');
            })
            .fail(function (error) {

                alert('Vui lòng thử lại.' + error.responseText);
            });

    });

    //Download
    $('#downloadBtn').click(function () {
        let path = $('#editor').attr('data-path');
        if (path) {
            let a = document.createElement('a');
            a.href = path;
            a.download = path.split('/').pop();
            a.click();
        } else {
            alert('Vui lòng lưu file trước, sau đó bạn có thể download file về máy');
        }
    });



    //Editor input
    $('#editor').on('input', function () {
        updateCountStatus();
        setSaveStatus(false);
    });

    //Turn off spell check
    $("#editor").attr("spellcheck", "false");

    //Editor keyboard
    $('#editor').keydown(function (event) {
        // Ctrl+S on editor
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            $('#saveBtn').click();
        }
        // Tab on editor
        else if (event.key === 'Tab') {
            event.preventDefault();
            let start = this.selectionStart;
            let end = this.selectionEnd;
            let text = $(this).val();
            let newText = text.substring(0, start) + '    ' + text.substring(end);
            $(this).val(newText);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });

    //Selection
    $(document).on('selectionchange', function () {
        updateCountStatus();
    });

    //Ctrl S on body
    $(document).keydown(function (event) {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            $('#saveBtn').click();
        }
    });

    //Init status
    setSaveStatus(false);

    // Show Open Modal
    $('#openBtn').click(function () {
        $('#openModal').modal('show');

        //Kết nối với server
        $.get('/home/getfiles', { path: '' })
            .done(function (data) {
                let fileTree = $('#file-tree');
                fileTree.empty();

                //Render files
                data.files.forEach(file => {
                    let fileItem = `<li class="file">
                              <a href="#" data-url="${file.path}" data-value="">${file.name}</a>
                            </li>`;
                    fileTree.append(fileItem);
                });
            })
            .fail(function () {
                alert('Server báo lỗi');
            });

        let $rootLi = $("li.folder-root");

        if ($rootLi.hasClass("open")) {
            // Đang mở -> đóng
            $rootLi.removeClass("open");
            $rootLi.children("ul").slideUp();
        }
    });

    // Show Help Modal
    $('#helpBtn').click(function () {
        $('#helpModal').modal('show');
    });

    // Handle feedback
    $('#sendFeedback').click(function () {
        let feedback = $('#feedback').val();
        if (feedback.trim() !== '') {
            $.post({
                url: '/home/SaveFeedback',
                contentType: 'application/json',
                data: JSON.stringify( feedback )
            })
                .done(function () {
                    alert('Đã lưu thông tin');
                    $('#feedback').val('');
                })
                .fail(function (error) {

                    alert('Vui lòng thử lại.');
                });

            $('#helpModal').modal('hide');
        } else {
            alert('Vui lòng nhập nội dung bạn cần phản hồi!.');
        }
    });

    // Folder click
    $("#file-tree .toggle").on("click", function (e) {
        e.preventDefault();
        let $parentLi = $(this).parent("li");

        if ($parentLi.hasClass("folder")) {
            if ($parentLi.hasClass("open")) {
                // Đang mở -> đóng
                $parentLi.removeClass("open");
                $parentLi.children("ul").slideUp();
            } else {
                // Đang đóng -> mở
                $parentLi.addClass("open");
                $parentLi.children("ul").slideDown();
                console.log($(this).attr("data-url"));
            }
        }
    });

    // File click
    $("#file-tree").on("click", " li.file a", function (e) {
        e.preventDefault();
        let path = $(this).attr("data-url");
        //Gọi Server lấy nội dung :
        $.get('/home/GetFileConent', { path: path })
            .done(function (data) {
                $("#editor").val(data);
                $("#editor").attr('data-path', path);
                $("#editor").focus();
                updateCountStatus();
                setSaveStatus(true);

                $("#openModal").modal('hide');

            })
            .fail(function () {
                alert('Server báo lỗi');
            });

        // Đóng modal
        $("#openModal").modal('hide'); // Sử dụng phương thức Bootstrap để đóng modal
    });
});


