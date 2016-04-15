### MyInstants Sinusbot Player

This fork of HarpyWar's MyInstant Player, was created because I wanted to host it on my own webserver without the need of forwarding access to SinusBot's webinterface.

#### Server Configuration for Nginx
````
server {
        listen 80;

        root /usr/share/nginx/html/myinstants-player;
        index index.html index.htm;

        # Make site accessible from http://soundboard.example.com/
        server_name myinstants.example.com soundboard.example.com;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
                # Uncomment to enable naxsi on this location
                # include /etc/nginx/naxsi.rules
        }

        location /api/ {
                proxy_pass http://127.0.0.1:8087/api/; # You have to adjust the IP if SinusBot is running on another address.
        }
}
````

If you also want to make SinusBot accessible over port 80 you can add this to your Nginx config.

````
server {
        listen 80;
        server_name musicbot.example.com sinusbot.example.com;

        location / {
                proxy_pass http://127.0.0.1:8087/;  # You have to adjust the IP if SinusBot is running on another address.
        }
}
````

Sadly you can't make SinusBot available under other locations that / since it contains absolute paths and won't load if you change the location.

#### Apache Configuration

I don't use Apache but feel free to add a pull request.
