<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JS-Connect-Hub</title>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    <script>
        window.APP_URL = "{{ env('APP_URL') }}";
    </script>
</head>

<body>
    <div id="app"></div>
</body>

</html>
