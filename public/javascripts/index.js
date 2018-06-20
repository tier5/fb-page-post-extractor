(function (document, window) {
    document.addEventListener("DOMContentLoaded", function(event) {
        var getAllPostsButton = document.querySelector('#get-all-posts')
        var pageAccessTokenInput = document.querySelector('#page-access-token')
        var fbPageURLInput = document.querySelector('#fb-page-url')
        var loader = document.querySelector('.loader')

        getAllPostsButton.addEventListener('click', function () {
            var params = {
                page_access_token: pageAccessTokenInput.value,
                fb_page_url: fbPageURLInput.value
            }
            loader.style.display = 'block'

            axios.get('/posts', {
                params: params
            }).then(function (res) {
                var csvContent = "data:text/csv;charset=utf-8," + res.data
                var encodedUri = encodeURI(csvContent)

                var downloadLink = document.querySelector('#download-csv')
                downloadLink.setAttribute("href", encodedUri)
                downloadLink.setAttribute("download", "posts.csv")
                downloadLink.style.display = "inline"
                downloadLink.style.padding = "10px"
                downloadLink.style.border = "1px solid #218838"

                loader.style.display = 'none'
            })
        })
    })
})(document, window)
