(function (document, window) {
    document.addEventListener("DOMContentLoaded", function(event) {
        var getAllPostsButton = document.querySelector('#get-all-posts')
        var pageAccessTokenInput = document.querySelector('#page-access-token')
        var fbPageURLInput = document.querySelector('#fb-page-url')
        var loader = document.querySelector('.loader')

        getAllPostsButton.addEventListener('click', function () {
            if(pageAccessTokenInput.value !== "" && pageAccessTokenInput.value !== null){
                
                var values = []

                $('.fb-page-url').each(function (index) {
                    if (this.value != '') {
                        var params = {
                            page_access_token: pageAccessTokenInput.value,
                            fb_page_url: this.value
                        }

                        loader.style.display = 'block'

                        axios.get('/posts', {
                            params: params
                        }).then(function (res) {
                            if (!index){
                                var csvContent = "data:text/csv;charset=utf-8," + res.data
                                var encodedUri = encodeURI(csvContent)
    
                                var downloadLink = document.querySelector('#download-csv')
                                downloadLink.setAttribute("href", encodedUri)
                                downloadLink.setAttribute("download", "posts.csv")
                                downloadLink.style.display = "inline"
                                downloadLink.style.padding = "10px"
                                downloadLink.style.border = "1px solid #218838"   
                            } else {
                                var csvContent = "data:text/csv;charset=utf-8," + res.data
                                var encodedUri = encodeURI(csvContent)
                                var cus_id = '#download-csv' + (index + 1);
                                var downloadLink = document.querySelector(cus_id)
                                downloadLink.setAttribute("href", encodedUri)
                                downloadLink.setAttribute("download", "posts.csv")
                                downloadLink.style.display = "inline"
                                downloadLink.style.padding = "10px"
                                downloadLink.style.border = "1px solid #218838"   
                            }
                            $('#download-csv').click();

                            loader.style.display = 'none'
                        })
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
            var customElement = '<div class="row"><div class="col-md-6"><input type="text" name="fb-page-url[]" class="form-control fb-page-url" placeholder="Facebook Page URL" autocomplete="off" required></div><div class="col-md-3"><button type="button" class="btn btn-primary remove-row">Remove</button></div><div class="col-md-3"><a class="btn btn-success" id="sadasd" style="display:none">Download CSV</a></div></div><br>'
            $(wrapper).append(customElement); //add input box
        }
    });
    $(".remove-row").click(function(e){
        //e.preventDefault();
        console.log('ahsdjhasd');
        $(this).parents('.row')[0].remove();
        x--;
    })
    // $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
    //     e.preventDefault(); $(this).parent('div').remove(); x--;
    // });
    
});
