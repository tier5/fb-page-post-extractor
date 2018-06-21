(function (document, window) {
    document.addEventListener("DOMContentLoaded", function(event) {
        var getAllPostsButton = document.querySelector('#get-all-posts')
        var pageAccessTokenInput = document.querySelector('#page-access-token')
        var fbPageURLInput = document.querySelector('#fb-page-url')
        var loader = document.querySelector('.loader')

        getAllPostsButton.addEventListener('click', function () {
            
            loader.style.display = 'block'

            if(pageAccessTokenInput.value !== "" && pageAccessTokenInput.value !== null){
                
                var values = []

                $('.fb-page-url').each(function () {
                    if (this.value != '')
                        values.push(this.value)
                })

                var params = {
                    page_access_token: pageAccessTokenInput.value,
                    fb_page_url: values
                }

                $.ajax({
                    type: 'POST',
                    url: "/posts",
                    data: params,
                    success: function(res) {
                        var csvContent = "data:text/csv;charset=utf-8," + res
                        var encodedUri = encodeURI(csvContent)

                        var downloadLink = document.querySelector('#download-csv')
                        downloadLink.setAttribute("href", encodedUri)
                        downloadLink.setAttribute("download", "posts.csv")
                        downloadLink.style.display = "inline"
                        downloadLink.style.padding = "10px"
                        downloadLink.style.border = "1px solid #218838"

                        loader.style.display = 'none'
                    }
                })
            }
        })
    })
})(document, window)

$(document).ready(function() {
    var max_fields      = 10; //maximum input boxes allowed
    var wrapper         = $(".input_fields_wrap"); //Fields wrapper
    var add_button      = $(".add_field_button"); //Add button ID
    
    var x = 1; //initlal text box count
    $(add_button).click(function(e){ //on add input button click
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div><input type="text" name="fb-page-url[]" class="form-control fb-page-url" placeholder="Facebook Page URL" autocomplete="off" required><a href="#" class="remove_field">Remove</a></br></div>'); //add input box
        }
    });
    
    $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('div').remove(); x--;
    });
});
