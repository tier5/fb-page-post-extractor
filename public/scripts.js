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

            axios.get('/latest/posts', {
                params: params
            }).then(function (response) {
                var postDiv = document.querySelector('#show-posts')
                postDiv.style.display = 'inline'

                var table = document.getElementById('table');
                var tableRows = table.getElementsByTagName('tr');
                var rowCountDelete = tableRows.length;

                for (var x=rowCountDelete-1; x>0; x--) {
                    table.removeChild(tableRows[x]);
                }
                Object.keys(response.data).forEach(function (key) {
                    var rowCount = table.rows.length;
                    var row = table.insertRow(rowCount);

                    var cell1 = row.insertCell(0);
                    cell1.innerHTML = Number(key) + 1

                    var cell2 = row.insertCell(1);
                    cell2.innerHTML = response.data[key].message
                })
                var tbody = document.querySelector('#table-body');
                loader.style.display = 'none'
            })

            axios.get('/posts', {
                params: params
            }).then(function (res) {
                var csvContent = "data:text/csv;charset=utf-8," + res.data
                var encodedUri = encodeURI(csvContent)
                var downloadLink = document.querySelector('#download-csv')
                downloadLink.setAttribute("href", encodedUri)
                downloadLink.setAttribute("download", "posts.csv")
                downloadLink.style.display = 'inline'
                downloadLink.style.padding = "10px"
                downloadLink.style.border = "1px solid #218838"
            })
        })
    })
})(document, window)
