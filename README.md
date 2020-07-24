# burgerbird-source

# Added PWA functionality.

You can add another icons, if needed.
```
icons": [
    {
      "src": "/assets/images/logo-72x72.png",
      "type": "image/png", 
      "sizes": "72x72"
    },
    {
      "src": "/assets/images/logo-96x96.png",
      "type": "image/png",
      "sizes": "96x96"
    },
    {
      "src": "/assets/images/logo-128x128.png",
      "type": "image/png",
      "sizes": "128x128"
    },
    {
      "src": "/assets/images/logo-144x144.png",
      "type": "image/png",
      "sizes": "144x144"
    },
    {
      "src": "/assets/images/logo-152x152.png",
      "type": "image/png",
      "sizes": "152x152"
    },
    {
      "src": "/assets/images/logo-192x192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/assets/images/logo-384x384.png",
      "type": "image/png",
      "sizes": "384x384"
    }, 
    {
      "src": "/assets/images/logo-512x512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
    ```
    
   On desktop game can be 1000 x 560 max. If that not needed, replace
   # updateLayout(event)
   to
   
   ```
   function updateLayout(event)
	{
		TinyWings.cont.style.width = window.innerWidth + "px";
		TinyWings.cont.style.height = window.innerHeight + "px";
		TinyWings.cont.style.left = 0 + "px";
		TinyWings.cont.style.top = 0 + "px";

		if (pixi_app)
		{
			var game_cont_width = parseInt(TinyWings.cont.style.width, 10);
			var game_cont_height = parseInt(TinyWings.cont.style.height, 10);

			pixi_app.stage.scale.set(game_cont_width / 1000);
			pixi_app.stage.y = game_cont_height - 560 * pixi_app.stage.scale.x;

			night_overlay.clear();
			night_overlay.beginFill(0x1F1F60, 0.9);
			night_overlay.drawRect(0, 0, game_cont_width / pixi_app.stage.scale.x, game_cont_height / pixi_app.stage.scale.x);
			night_overlay.endFill();
			night_overlay.y = -pixi_app.stage.y / pixi_app.stage.scale.x;
		}
	}
  ```

